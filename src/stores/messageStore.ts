import { create } from 'zustand';
import type { Message, ChatMessage } from '@/types';
import { messageService } from '@/services/messageService';
import { generateTempId } from '@/lib/utils';

interface MessageState {
  messages: Record<string, Message[]>; // chatId -> messages
  pendingMessages: Record<string, Message[]>; // chatId -> pending messages
  isLoading: boolean;
  isSending: boolean;
  hasMore: Record<string, boolean>;
  error: string | null;
}

interface MessageActions {
  fetchMessages: (chatId: string, reset?: boolean) => Promise<void>;
  fetchMoreMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  confirmMessage: (tempId: string, message: Message) => void;
  failMessage: (tempId: string) => void;
  clearMessages: (chatId: string) => void;
}

type MessageStore = MessageState & MessageActions;

export const useMessageStore = create<MessageStore>()((set, get) => ({
  // State
  messages: {},
  pendingMessages: {},
  isLoading: false,
  isSending: false,
  hasMore: {},
  error: null,

  // Actions
  fetchMessages: async (chatId, reset = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentMessages = get().messages[chatId] || [];
      const page = reset ? 0 : Math.floor(currentMessages.length / 50);
      
      const response = await messageService.getMessages(chatId, page);
      
      const newMessages = reset
        ? response.content
        : [...currentMessages, ...response.content];
      
      // Remove duplicates
      const uniqueMessages = newMessages.filter(
        (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
      );

      set({
        messages: {
          ...get().messages,
          [chatId]: uniqueMessages,
        },
        hasMore: {
          ...get().hasMore,
          [chatId]: !response.last,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch messages',
        isLoading: false,
      });
    }
  },

  fetchMoreMessages: async (chatId) => {
    if (get().isLoading || !get().hasMore[chatId]) return;
    
    const messages = get().messages[chatId] || [];
    if (messages.length === 0) return;
    
    const oldestMessage = messages[messages.length - 1];
    
    try {
      set({ isLoading: true });
      
      const olderMessages = await messageService.getMessagesBefore(
        chatId,
        oldestMessage.createdAt,
        50
      );
      
      set({
        messages: {
          ...get().messages,
          [chatId]: [...messages, ...olderMessages],
        },
        hasMore: {
          ...get().hasMore,
          [chatId]: olderMessages.length === 50,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  sendMessage: async (chatId, content, type = 'TEXT') => {
    const tempId = generateTempId();
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      chatId,
      senderId: '', // Will be filled by the server
      senderName: null,
      content,
      type: type as Message['type'],
      replyToId: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isDeleted: false,
      isEdited: false,
    };

    // Add to pending messages
    set({
      pendingMessages: {
        ...get().pendingMessages,
        [chatId]: [...(get().pendingMessages[chatId] || []), optimisticMessage],
      },
      isSending: true,
    });

    // Note: Actual sending is done via WebSocket in the chat hook
    // The confirmation will come through addMessage or confirmMessage
  },

  addMessage: (message) => {
    const chatId = message.chatId;
    const currentMessages = get().messages[chatId] || [];
    
    // Check if message already exists
    const exists = currentMessages.some((m) => m.id === message.id);
    if (exists) return;

    // Convert ChatMessage to Message format
    const newMessage: Message = {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      type: message.type,
      replyToId: message.replyToId,
      createdAt: message.createdAt,
      updatedAt: null,
      isDeleted: false,
      isEdited: message.isEdited,
    };

    set({
      messages: {
        ...get().messages,
        [chatId]: [newMessage, ...currentMessages],
      },
    });

    // Remove from pending if it was our message
    if (message.tempId) {
      const pending = get().pendingMessages[chatId] || [];
      set({
        pendingMessages: {
          ...get().pendingMessages,
          [chatId]: pending.filter((m) => m.id !== message.tempId),
        },
        isSending: false,
      });
    }
  },

  confirmMessage: (tempId, message) => {
    const chatId = message.chatId;
    const pending = get().pendingMessages[chatId] || [];
    
    // Remove from pending
    set({
      pendingMessages: {
        ...get().pendingMessages,
        [chatId]: pending.filter((m) => m.id !== tempId),
      },
      isSending: false,
    });

    // Add confirmed message
    const currentMessages = get().messages[chatId] || [];
    set({
      messages: {
        ...get().messages,
        [chatId]: [message, ...currentMessages],
      },
    });
  },

  failMessage: (tempId) => {
    // Find and mark the pending message as failed
    const allPending = get().pendingMessages;
    
    for (const chatId in allPending) {
      const pending = allPending[chatId];
      const failedIndex = pending.findIndex((m) => m.id === tempId);
      
      if (failedIndex !== -1) {
        const updated = [...pending];
        updated[failedIndex] = {
          ...updated[failedIndex],
          // Mark as failed somehow
        };
        
        set({
          pendingMessages: {
            ...get().pendingMessages,
            [chatId]: updated,
          },
          isSending: false,
        });
        break;
      }
    }
  },

  clearMessages: (chatId) => {
    const { [chatId]: _, ...rest } = get().messages;
    set({ messages: rest });
  },
}));