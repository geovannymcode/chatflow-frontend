import api from '@/lib/api';
import type { Chat, ChatDetail, PaginatedResponse } from '@/types';

export const chatService = {
  async getChats(page = 0, size = 20): Promise<PaginatedResponse<Chat>> {
    const response = await api.get<PaginatedResponse<Chat>>('/chats', {
      params: { page, size },
    });
    return response.data;
  },

  async getChat(chatId: string): Promise<ChatDetail> {
    const response = await api.get<ChatDetail>(`/chats/${chatId}`);
    return response.data;
  },

  async createDirectChat(otherUserId: string): Promise<Chat> {
    const response = await api.post<Chat>('/chats/direct', { otherUserId });
    return response.data;
  },

  async createGroupChat(name: string, participantIds: string[]): Promise<Chat> {
    const response = await api.post<Chat>('/chats/group', {
      name,
      participantIds,
    });
    return response.data;
  },

  async addParticipant(chatId: string, userId: string): Promise<Chat> {
    const response = await api.post<Chat>(`/chats/${chatId}/participants`, {
      userId,
    });
    return response.data;
  },

  async removeParticipant(chatId: string, participantId: string): Promise<void> {
    await api.delete(`/chats/${chatId}/participants/${participantId}`);
  },

  async leaveChat(chatId: string): Promise<void> {
    await api.post(`/chats/${chatId}/leave`);
  },

  async updateChat(chatId: string, name: string): Promise<Chat> {
    const response = await api.patch<Chat>(`/chats/${chatId}`, { name });
    return response.data;
  },
};