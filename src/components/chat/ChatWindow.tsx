import { useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '../../stores/authStore';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { usePresenceStore } from '../../stores/presenceStore';
import type { ChatDetail } from '../../types';

interface ChatWindowProps {
  chat: ChatDetail;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    pendingMessages,
    isLoading,
    isSending,
    isConnected,
    hasMoreMessages,
    sendMessage,
    sendTyping,
    markAsRead,
    loadMoreMessages,
  } = useChat(chat.id);

  const { getTypingUsers } = usePresenceStore();
  const typingUsers = getTypingUsers(chat.id);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, pendingMessages.length]);

  // Mark as read when viewing messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[0];
      if (lastMessage.senderId !== user?.id) {
        markAsRead(lastMessage.id);
      }
    }
  }, [messages, user?.id, markAsRead]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
  };

  // Combinar mensajes confirmados y pendientes
  const allMessages = [
    ...pendingMessages.map((m) => ({ ...m, isPending: true })),
    ...messages.map((m) => ({ ...m, isPending: false })),
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader chat={chat} />

      {/* Messages */}
      <MessageList
        messages={allMessages}
        currentUserId={user?.id || ''}
        isLoading={isLoading}
        hasMore={hasMoreMessages}
        onLoadMore={loadMoreMessages}
      />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator userIds={typingUsers} />
      )}

      {/* Ref for scrolling */}
      <div ref={messagesEndRef} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={() => sendTyping(true)}
        onStopTyping={() => sendTyping(false)}
        disabled={!isConnected}
        isSending={isSending}
      />
    </div>
  );
}