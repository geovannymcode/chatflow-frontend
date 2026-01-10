import { useEffect, useCallback, useRef, useState } from 'react';
import { webSocketService } from '../lib/websocket';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { useChatStore } from '../stores/chatStore';
import { usePresenceStore } from '../stores/presenceStore';
import type { 
  ChatMessage, 
  TypingNotification, 
  PresenceNotification,
  MessageAck 
} from '../types';
import { generateTempId } from '../lib/utils';

export function useWebSocket() {
  const { isAuthenticated, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<string[]>([]);

  const { addMessage } = useMessageStore();
  const { updateChatPreview, incrementUnread, selectedChatId } = useChatStore();
  const { updatePresence, setTyping } = usePresenceStore();

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      webSocketService.connect();
    } else {
      webSocketService.disconnect();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated]);

  // Handle connection events
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    webSocketService.onConnect(handleConnect);
    webSocketService.onDisconnect(handleDisconnect);

    return () => {
      webSocketService.removeConnectHandler(handleConnect);
      webSocketService.removeDisconnectHandler(handleDisconnect);
    };
  }, []);

  // Subscribe to presence updates
  useEffect(() => {
    if (!isConnected) return;

    const subId = webSocketService.subscribe(
      '/topic/presence',
      (notification: PresenceNotification) => {
        updatePresence(notification);
      }
    );

    subscriptionsRef.current.push(subId);

    return () => {
      webSocketService.unsubscribe(subId);
      subscriptionsRef.current = subscriptionsRef.current.filter((id) => id !== subId);
    };
  }, [isConnected, updatePresence]);

  // Subscribe to user-specific queues
  useEffect(() => {
    if (!isConnected || !user) return;

    // Subscribe to message ACKs
    const ackSubId = webSocketService.subscribe(
      `/user/queue/acks`,
      (ack: MessageAck) => {
        console.log('Message ACK received:', ack);
        // Handle ACK if needed
      }
    );

    // Subscribe to typing notifications
    const typingSubId = webSocketService.subscribe(
      `/user/queue/typing`,
      (notification: TypingNotification) => {
        setTyping(notification);
      }
    );

    // Subscribe to errors
    const errorSubId = webSocketService.subscribe(
      `/user/queue/errors`,
      (error: any) => {
        console.error('WebSocket error:', error);
      }
    );

    subscriptionsRef.current.push(ackSubId, typingSubId, errorSubId);

    return () => {
      [ackSubId, typingSubId, errorSubId].forEach((id) => {
        webSocketService.unsubscribe(id);
      });
      subscriptionsRef.current = subscriptionsRef.current.filter(
        (id) => ![ackSubId, typingSubId, errorSubId].includes(id)
      );
    };
  }, [isConnected, user, setTyping]);

  return {
    isConnected,
    subscribe: webSocketService.subscribe.bind(webSocketService),
    unsubscribe: webSocketService.unsubscribe.bind(webSocketService),
    send: webSocketService.send.bind(webSocketService),
  };
}

// Hook for chat-specific subscriptions
export function useChatSubscription(chatId: string | null) {
  const { addMessage } = useMessageStore();
  const { updateChatPreview, incrementUnread, selectedChatId } = useChatStore();
  const { setTyping } = usePresenceStore();
  const { isConnected, subscribe, unsubscribe, send } = useWebSocket();

  // Subscribe to chat messages
  useEffect(() => {
    if (!isConnected || !chatId) return;

    const messageSubId = subscribe(
      `/topic/chat/${chatId}`,
      (message: ChatMessage) => {
        addMessage(message);
        updateChatPreview(chatId, message.content, message.createdAt);
        
        // Increment unread if not the selected chat
        if (selectedChatId !== chatId) {
          incrementUnread(chatId);
        }
      }
    );

    const readSubId = subscribe(
      `/topic/chat/${chatId}/read`,
      (notification: any) => {
        console.log('Read receipt:', notification);
      }
    );

    return () => {
      unsubscribe(messageSubId);
      unsubscribe(readSubId);
    };
  }, [isConnected, chatId, selectedChatId, addMessage, updateChatPreview, incrementUnread, subscribe, unsubscribe]);

  // Send message
  const sendMessage = useCallback(
    (content: string, type: string = 'TEXT', replyToId?: string) => {
      if (!chatId || !isConnected) return;

      const tempId = generateTempId();

      send(`/app/chat/${chatId}/send`, {
        content,
        type,
        replyToId,
        tempId,
      });

      return tempId;
    },
    [chatId, isConnected, send]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!chatId || !isConnected) return;

      send(`/app/chat/${chatId}/typing`, {
        isTyping,
      });
    },
    [chatId, isConnected, send]
  );

  // Mark as read
  const markAsRead = useCallback(
    (lastReadMessageId: string) => {
      if (!chatId || !isConnected) return;

      send(`/app/chat/${chatId}/read`, {
        lastReadMessageId,
      });
    },
    [chatId, isConnected, send]
  );

  return {
    isConnected,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}