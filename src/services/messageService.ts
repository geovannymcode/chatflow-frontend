import api from '@/lib/api';
import type { Message } from '@/types';

// Backend returns plain List<ChatMessageDto>, not a paginated Spring Page.
// We wrap in a PaginatedResponse-shaped object so messageStore keeps working.
interface WrappedList<T> {
  content: T[];
  last: boolean;
}

// Backend ChatMessageDto has sender as nested object; frontend Message uses flat fields
function mapBackendMessage(raw: any): Message {
  return {
    id: raw.id,
    chatId: raw.chatId,
    senderId: raw.sender?.userId ?? raw.senderId,
    senderName: raw.sender?.username ?? raw.senderName ?? null,
    content: raw.content,
    type: raw.type ?? 'TEXT',
    replyToId: raw.replyToId ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? null,
    isDeleted: raw.isDeleted ?? false,
    isEdited: raw.isEdited ?? false,
  };
}

export const messageService = {
  // GET /api/chat/{chatId}/messages?before=<ISO>&pageSize=<n>
  // Returns List<ChatMessageDto> (plain array)
  async getMessages(
    chatId: string,
    _page = 0,
    pageSize = 50
  ): Promise<WrappedList<Message>> {
    const response = await api.get<any[]>(`/chat/${chatId}/messages`, {
      params: { pageSize },
    });
    const data = response.data.map(mapBackendMessage);
    return {
      content: data,
      last: data.length < pageSize,
    };
  },

  // Load messages before a given timestamp (cursor-based paging)
  async getMessagesBefore(
    chatId: string,
    before: string,
    size = 50
  ): Promise<Message[]> {
    const response = await api.get<any[]>(`/chat/${chatId}/messages`, {
      params: { before, pageSize: size },
    });
    return response.data.map(mapBackendMessage);
  },

  // Messages are sent via WebSocket (useChatSubscription.sendMessage).
  // This REST fallback should not be used in normal flow.
  async sendMessage(
    _chatId: string,
    _request: { content: string }
  ): Promise<Message> {
    throw new Error(
      'Use the WebSocket hook (useChatSubscription) to send messages.'
    );
  },

  // DELETE /api/messages/{messageId}
  async deleteMessage(_chatId: string, messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  },

  // Not supported by backend — stub
  async editMessage(
    _chatId: string,
    _messageId: string,
    _content: string
  ): Promise<Message> {
    throw new Error('Edit message is not supported by the backend.');
  },

  // Not supported by backend — no-op
  async markAsRead(_chatId: string, _lastReadMessageId: string): Promise<void> {
    // TODO: not implemented on the backend
  },
};
