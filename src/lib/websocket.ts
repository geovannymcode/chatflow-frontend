import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { config } from '../config/env';
import { storage } from '../lib/storage';

type MessageHandler = (message: any) => void;
type ConnectionHandler = () => void;

interface Subscription {
  destination: string;
  handler: MessageHandler;
  subscription?: StompSubscription;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];

  connect(): void {
    if (this.client?.connected || this.isConnecting) {
      return;
    }

    const token = storage.getAccessToken();
    if (!token) {
      console.warn('No access token available for WebSocket connection');
      return;
    }

    this.isConnecting = true;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${config.wsUrl}?token=${token}`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 25000,
      heartbeatOutgoing: 25000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Resubscribe to all destinations
        this.resubscribeAll();
        
        // Notify handlers
        this.onConnectHandlers.forEach((handler) => handler());
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        
        // Notify handlers
        this.onDisconnectHandlers.forEach((handler) => handler());
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message);
        this.isConnecting = false;
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.isConnecting = false;
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscriptions.clear();
  }

  subscribe(destination: string, handler: MessageHandler): string {
    const subscriptionId = `${destination}_${Date.now()}`;
    
    const subscription: Subscription = {
      destination,
      handler,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // If connected, subscribe immediately
    if (this.client?.connected) {
      subscription.subscription = this.client.subscribe(
        destination,
        (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            handler(body);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      );
    }

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription?.subscription) {
      subscription.subscription.unsubscribe();
    }
    
    this.subscriptions.delete(subscriptionId);
  }

  send(destination: string, body: any): void {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  onConnect(handler: ConnectionHandler): void {
    this.onConnectHandlers.push(handler);
    
    // If already connected, call immediately
    if (this.client?.connected) {
      handler();
    }
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

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  private resubscribeAll(): void {
    if (!this.client?.connected) return;

    this.subscriptions.forEach((subscription, id) => {
      if (!subscription.subscription) {
        subscription.subscription = this.client!.subscribe(
          subscription.destination,
          (message: IMessage) => {
            try {
              const body = JSON.parse(message.body);
              subscription.handler(body);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          }
        );
      }
    });
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();