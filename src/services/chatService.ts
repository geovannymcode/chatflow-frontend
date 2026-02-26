import api from '@/lib/api';
import { storage } from '@/lib/storage';
import type { Chat, ChatDetail } from '@/types';

interface WrappedList<T> {
  content: T[];
  last: boolean;
}

// Backend ChatDto → frontend Chat
function mapBackendChat(raw: any): Chat {
  const currentUser = storage.getUser<{ id: string }>() ;
  const currentUserId = currentUser?.id;
  const participants: any[] = raw.participants || [];
  const isGroup = participants.length > 2;
  const other = participants.find((p: any) => p.userId !== currentUserId) || participants[0];

  return {
    id: raw.id,
    name: isGroup ? participants.map((p: any) => p.username).join(', ') : null,
    type: isGroup ? 'GROUP' : 'DIRECT',
    lastMessageAt: null,
    lastMessagePreview: null,
    participantCount: participants.length,
    createdAt: raw.createdAt,
    otherParticipant: other
      ? { userId: other.userId, name: other.username }
      : null,
    unreadCount: 0,
  };
}

// Backend ChatDto → frontend ChatDetail
function mapBackendChatDetail(raw: any): ChatDetail {
  const base = mapBackendChat(raw);
  return {
    ...base,
    creatorId: raw.creator?.userId || '',
    participants: (raw.participants || []).map((p: any) => ({
      id: p.userId,
      userId: p.userId,
      role: raw.creator?.userId === p.userId ? 'ADMIN' as const : 'MEMBER' as const,
      joinedAt: raw.createdAt,
      nickname: null,
      isMuted: false,
    })),
    updatedAt: raw.createdAt,
  };
}

export const chatService = {
  // GET /api/chat  → List<ChatDto>
  async getChats(_page = 0, _size = 20): Promise<WrappedList<Chat>> {
    const response = await api.get<any[]>('/chat');
    return { content: response.data.map(mapBackendChat), last: true };
  },

  // GET /api/chat/{chatId}
  async getChat(chatId: string): Promise<ChatDetail> {
    const response = await api.get<any>(`/chat/${chatId}`);
    return mapBackendChatDetail(response.data);
  },

  // POST /api/chat  { participantIds: [otherUserId] }
  async createDirectChat(otherUserId: string): Promise<Chat> {
    const response = await api.post<any>('/chat', {
      participantIds: [otherUserId],
    });
    return mapBackendChat(response.data);
  },

  // POST /api/chat  { participantIds }
  async createGroupChat(_name: string, participantIds: string[]): Promise<Chat> {
    const response = await api.post<any>('/chat', { participantIds });
    return mapBackendChat(response.data);
  },

  // POST /api/chat/{chatId}/add  { participantIds: [userId] }
  async addParticipant(chatId: string, userId: string): Promise<Chat> {
    const response = await api.post<any>(`/chat/${chatId}/add`, {
      participantIds: [userId],
    });
    return mapBackendChat(response.data);
  },

  // DELETE /api/chat/{chatId}/leave
  async leaveChat(chatId: string): Promise<void> {
    await api.delete(`/chat/${chatId}/leave`);
  },

  // PATCH /api/chat/{chatId}  { name }
  async updateChat(chatId: string, name: string): Promise<Chat> {
    const response = await api.patch<any>(`/chat/${chatId}`, { name });
    return mapBackendChat(response.data);
  },
};
