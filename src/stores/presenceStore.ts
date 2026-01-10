import { create } from 'zustand';
import type { PresenceNotification, TypingNotification } from '@/types';

type PresenceStatus = 'ONLINE' | 'AWAY' | 'OFFLINE';

interface UserPresence {
  status: PresenceStatus;
  lastSeenAt: string | null;
}

interface PresenceState {
  presence: Record<string, UserPresence>; // userId -> presence
  typingUsers: Record<string, string[]>; // chatId -> userIds who are typing
}

interface PresenceActions {
  updatePresence: (notification: PresenceNotification) => void;
  setTyping: (notification: TypingNotification) => void;
  getPresence: (userId: string) => UserPresence;
  isOnline: (userId: string) => boolean;
  getTypingUsers: (chatId: string) => string[];
}

type PresenceStore = PresenceState & PresenceActions;

export const usePresenceStore = create<PresenceStore>()((set, get) => ({
  // State
  presence: {},
  typingUsers: {},

  // Actions
  updatePresence: (notification) => {
    set({
      presence: {
        ...get().presence,
        [notification.userId]: {
          status: notification.status,
          lastSeenAt: notification.lastSeenAt,
        },
      },
    });
  },

  setTyping: (notification) => {
    const { chatId, userId, isTyping } = notification;
    const currentTyping = get().typingUsers[chatId] || [];

    let updatedTyping: string[];
    
    if (isTyping) {
      // Add user if not already typing
      updatedTyping = currentTyping.includes(userId)
        ? currentTyping
        : [...currentTyping, userId];
    } else {
      // Remove user
      updatedTyping = currentTyping.filter((id) => id !== userId);
    }

    set({
      typingUsers: {
        ...get().typingUsers,
        [chatId]: updatedTyping,
      },
    });

    // Auto-remove after 5 seconds (in case stop typing message is lost)
    if (isTyping) {
      setTimeout(() => {
        const current = get().typingUsers[chatId] || [];
        if (current.includes(userId)) {
          set({
            typingUsers: {
              ...get().typingUsers,
              [chatId]: current.filter((id) => id !== userId),
            },
          });
        }
      }, 5000);
    }
  },

  getPresence: (userId) => {
    return get().presence[userId] || { status: 'OFFLINE', lastSeenAt: null };
  },

  isOnline: (userId) => {
    return get().presence[userId]?.status === 'ONLINE';
  },

  getTypingUsers: (chatId) => {
    return get().typingUsers[chatId] || [];
  },
}));