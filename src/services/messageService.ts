import api from '@/lib/api';
import type { Message, PaginatedResponse, SendMessageRequest } from '@/types';

export const messageService = {
  async getMessages(
    chatId: string,
    page = 0,
    size = 50
  ): Promise<PaginatedResponse<Message>> {
    const response = await api.get<PaginatedResponse<Message>>(
      `/chats/${chatId}/messages`,
      { params: { page, size } }
    );
    return response.data;
  },

  async getMessagesBefore(
    chatId: string,
    before: string,
    size = 50
  ): Promise<Message[]> {
    const response = await api.get<Message[]>(
      `/chats/${chatId}/messages/before`,
      { params: { before, size } }
    );
    return response.data;
  },

  async sendMessage(
    chatId: string,
    request: SendMessageRequest
  ): Promise<Message> {
    const response = await api.post<Message>(
      `/chats/${chatId}/messages`,
      request
    );
    return response.data;
  },

  async editMessage(
    chatId: string,
    messageId: string,
    content: string
  ): Promise<Message> {
    const response = await api.patch<Message>(
      `/chats/${chatId}/messages/${messageId}`,
      { content }
    );
    return response.data;
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await api.delete(`/chats/${chatId}/messages/${messageId}`);
  },

  async markAsRead(chatId: string, lastReadMessageId: string): Promise<void> {
    await api.post(`/chats/${chatId}/messages/read`, { lastReadMessageId });
  },
};