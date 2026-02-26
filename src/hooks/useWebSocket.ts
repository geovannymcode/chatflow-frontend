import { useEffect, useCallback } from 'react';
import { webSocketService } from '../lib/websocket';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { useChatStore } from '../stores/chatStore';
import { useWsStore } from '../stores/wsStore';
import { generateTempId } from '../lib/utils';

// ---------------------------------------------------------------------------
// useWebSocket — manages connection lifecycle
// ---------------------------------------------------------------------------
export function useWebSocket() {
  const { isAuthenticated } = useAuthStore();
  const isConnected = useWsStore((s) => s.isConnected);

  // Connect / disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      webSocketService.connect();
    } else {
      webSocketService.disconnect();
    }
  }, [isAuthenticated]);

  return {
    isConnected,
    subscribe: webSocketService.subscribe.bind(webSocketService),
    unsubscribe: webSocketService.unsubscribe.bind(webSocketService),
    send: webSocketService.send.bind(webSocketService),
  };
}

// ---------------------------------------------------------------------------
// useChatSubscription — handles messages for a specific chat window
// ---------------------------------------------------------------------------
export function useChatSubscription(chatId: string | null) {
  const { addMessage } = useMessageStore();
  const { updateChatPreview, incrementUnread, selectedChatId } = useChatStore();
  const { isConnected, subscribe, unsubscribe, send } = useWebSocket();

  // Subscribe to NEW_MESSAGE and MESSAGE_DELETED events from the server
  useEffect(() => {
    if (!isConnected || !chatId) return;

    const newMsgId = subscribe('NEW_MESSAGE', (raw: any) => {
      // The server broadcasts to all sessions; filter by chatId
      if (String(raw.chatId) !== String(chatId)) return;

      // Map backend ChatMessage (sender object) → frontend ChatMessage (flat fields)
      const message = {
        id: raw.id,
        chatId: raw.chatId,
        senderId: raw.sender?.userId ?? raw.senderId,
        senderName: raw.sender?.username ?? raw.senderName ?? null,
        content: raw.content,
        type: raw.type ?? 'TEXT',
        replyToId: raw.replyToId ?? null,
        replyToPreview: raw.replyToPreview ?? null,
        createdAt: raw.createdAt,
        isEdited: raw.isEdited ?? false,
        tempId: raw.tempId,
      };

      addMessage(message);
      updateChatPreview(chatId, message.content, message.createdAt);
      if (selectedChatId !== chatId) {
        incrementUnread(chatId);
      }
    });

    const delMsgId = subscribe('MESSAGE_DELETED', (payload: any) => {
      if (String(payload.chatId) !== String(chatId)) return;
      console.log('[WS] MESSAGE_DELETED', payload);
    });

    return () => {
      unsubscribe(newMsgId);
      unsubscribe(delMsgId);
    };
  }, [isConnected, chatId, selectedChatId, addMessage, updateChatPreview, incrementUnread, subscribe, unsubscribe]);

  // Send a new message via WebSocket
  const sendMessage = useCallback(
    (content: string) => {
      if (!chatId) return;
      const tempId = generateTempId();
      send('NEW_MESSAGE', { chatId, content });
      return tempId;
    },
    [chatId, send]
  );

  // Typing indicator — not implemented on the backend yet; kept as a no-op
  const sendTyping = useCallback(
    (_isTyping: boolean) => {
      // TODO: backend does not support typing events
    },
    []
  );

  // Mark as read — not implemented on the backend yet; kept as a no-op
  const markAsRead = useCallback(
    (_lastReadMessageId: string) => {
      // TODO: backend does not support read receipts
    },
    []
  );

  return {
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}
