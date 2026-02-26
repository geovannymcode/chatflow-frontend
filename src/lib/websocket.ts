import { config } from '../config/env';
import { storage } from '../lib/storage';
import { useWsStore } from '../stores/wsStore';

type MessageHandler = (payload: any) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private _isConnected = false;
  private isConnecting = false;

  // type → list of { id, handler }
  private handlers: Map<string, Array<{ id: string; handler: MessageHandler }>> = new Map();

  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];

  // Simple exponential back-off reconnect
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  connect(): void {
    if (this._isConnected || this.isConnecting) return;

    const token = storage.getAccessToken();
    if (!token) {
      console.warn('[WS] No access token — skipping connection');
      return;
    }

    this.isConnecting = true;
    const url = `${config.wsUrl}/chat?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this._isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      this.onConnectHandlers.forEach((h) => h());
      useWsStore.getState().setConnected(true);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: { type: string; payload: any } = JSON.parse(event.data);
        const list = this.handlers.get(msg.type);
        if (list) {
          list.forEach(({ handler }) => handler(msg.payload));
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected');
      this._isConnected = false;
      this.isConnecting = false;
      this.onDisconnectHandlers.forEach((h) => h());
      useWsStore.getState().setConnected(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      this.isConnecting = false;
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2000;
    if (this.ws) {
      this.ws.onclose = null; // prevent scheduleReconnect from firing
      this.ws.close();
      this.ws = null;
    }
    const wasConnected = this._isConnected;
    this._isConnected = false;
    this.isConnecting = false;
    if (wasConnected) useWsStore.getState().setConnected(false);
  }

  /**
   * Subscribe to a message type (e.g. 'NEW_MESSAGE', 'MESSAGE_DELETED').
   * Returns a subscription ID that can be passed to unsubscribe().
   */
  subscribe(type: string, handler: MessageHandler): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push({ id, handler });
    return id;
  }

  unsubscribe(subscriptionId: string): void {
    this.handlers.forEach((list, type) => {
      const idx = list.findIndex((entry) => entry.id === subscriptionId);
      if (idx !== -1) {
        list.splice(idx, 1);
        if (list.length === 0) this.handlers.delete(type);
      }
    });
  }

  /**
   * Send a message to the server.
   * @param type  - message type string (e.g. 'NEW_MESSAGE')
   * @param payload - arbitrary payload object
   */
  send(type: string, payload: any): void {
    if (!this.ws || !this._isConnected) {
      console.warn('[WS] Not connected — cannot send message');
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  onConnect(handler: ConnectionHandler): void {
    this.onConnectHandlers.push(handler);
    if (this._isConnected) handler();
  }

  onDisconnect(handler: ConnectionHandler): void {
    this.onDisconnectHandlers.push(handler);
  }

  removeConnectHandler(handler: ConnectionHandler): void {
    this.onConnectHandlers = this.onConnectHandlers.filter((h) => h !== handler);
  }

  removeDisconnectHandler(handler: ConnectionHandler): void {
    this.onDisconnectHandlers = this.onDisconnectHandlers.filter((h) => h !== handler);
  }

  getIsConnected(): boolean {
    return this._isConnected;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    if (this.reconnectTimer) return; // already scheduled

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      console.log(`[WS] Reconnecting (attempt ${this.reconnectAttempts})…`);
      this.connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30_000);
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();