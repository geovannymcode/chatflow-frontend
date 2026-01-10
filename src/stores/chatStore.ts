import { create } from 'zustand';
import type { Chat, ChatDetail } from '@/types';
import { chatService } from '@/services/chatService';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  selectedChat: ChatDetail | null;
  isLoading: boolean;
  isLoadingChat: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

interface ChatActions {
  fetchChats: (reset?: boolean) => Promise<void>;
  fetchMoreChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  clearSelectedChat: () => void;
  createDirectChat: (otherUserId: string) => Promise<Chat>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<Chat>;
  updateChatPreview: (chatId: string, preview: string, timestamp: string) => void;
  incrementUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
  addChat: (chat: Chat) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  // State
  chats: [],
  selectedChatId: null,
  selectedChat: null,
  isLoading: false,
  isLoadingChat: false,
  error: null,
  hasMore: true,
  page: 0,

  // Actions
  fetchChats: async (reset = false) => {
    const page = reset ? 0 : get().page;
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.getChats(page);
      
      set({
        chats: reset ? response.content : [...get().chats, ...response.content],
        hasMore: !response.last,
        page: page + 1,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chats',
        isLoading: false,
      });
    }
  },

  fetchMoreChats: async () => {
    if (get().isLoading || !get().hasMore) return;
    await get().fetchChats();
  },

  selectChat: async (chatId) => {
    if (get().selectedChatId === chatId) return;
    
    set({ selectedChatId: chatId, isLoadingChat: true });
    
    try {
      const chat = await chatService.getChat(chatId);
      set({ selectedChat: chat, isLoadingChat: false });
      
      // Clear unread count
      get().clearUnread(chatId);
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chat',
        isLoadingChat: false,
      });
    }
  },

  clearSelectedChat: () => {
    set({ selectedChatId: null, selectedChat: null });
  },

  createDirectChat: async (otherUserId) => {
    const chat = await chatService.createDirectChat(otherUserId);
    set({ chats: [chat, ...get().chats] });
    return chat;
  },

  createGroupChat: async (name, participantIds) => {
    const chat = await chatService.createGroupChat(name, participantIds);
    set({ chats: [chat, ...get().chats] });
    return chat;
  },

  updateChatPreview: (chatId, preview, timestamp) => {
    set({
      chats: get().chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessagePreview: preview, lastMessageAt: timestamp }
          : chat
      ).sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      }),
    });
  },

  incrementUnread: (chatId) => {
    if (get().selectedChatId === chatId) return;
    
    set({
      chats: get().chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
          : chat
      ),
    });
  },

  clearUnread: (chatId) => {
    set({
      chats: get().chats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    });
  },

  addChat: (chat) => {
    const exists = get().chats.some((c) => c.id === chat.id);
    if (!exists) {
      set({ chats: [chat, ...get().chats] });
    }
  },
}));