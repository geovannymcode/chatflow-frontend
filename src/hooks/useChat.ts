import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { useMessageStore } from '@/stores/messageStore';
import { useChatSubscription } from '@/hooks/useWebSocket';

export function useChat(chatId: string | null) {
  const navigate = useNavigate();
  
  const {
    selectedChat,
    isLoadingChat,
    selectChat,
    createDirectChat,
    createGroupChat,
  } = useChatStore();

  const {
    messages,
    pendingMessages,
    isLoading: isLoadingMessages,
    isSending,
    hasMore,
    fetchMessages,
    fetchMoreMessages,
  } = useMessageStore();

  const { isConnected, sendMessage, sendTyping, markAsRead } = useChatSubscription(chatId);

  // Get messages for current chat
  const chatMessages = chatId ? messages[chatId] || [] : [];
  const chatPendingMessages = chatId ? pendingMessages[chatId] || [] : [];
  const hasMoreMessages = chatId ? hasMore[chatId] ?? true : false;

  // Create a new direct chat and navigate to it
  const startDirectChat = useCallback(
    async (otherUserId: string) => {
      const chat = await createDirectChat(otherUserId);
      navigate(`/chat/${chat.id}`);
      return chat;
    },
    [createDirectChat, navigate]
  );

  // Create a new group chat and navigate to it
  const startGroupChat = useCallback(
    async (name: string, participantIds: string[]) => {
      const chat = await createGroupChat(name, participantIds);
      navigate(`/chat/${chat.id}`);
      return chat;
    },
    [createGroupChat, navigate]
  );

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(() => {
    if (chatId && hasMoreMessages) {
      fetchMoreMessages(chatId);
    }
  }, [chatId, hasMoreMessages, fetchMoreMessages]);

  return {
    chat: selectedChat,
    messages: chatMessages,
    pendingMessages: chatPendingMessages,
    isLoading: isLoadingChat || isLoadingMessages,
    isSending,
    isConnected,
    hasMoreMessages,
    sendMessage,
    sendTyping,
    markAsRead,
    loadMoreMessages,
    startDirectChat,
    startGroupChat,
  };
}