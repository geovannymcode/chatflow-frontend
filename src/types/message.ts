export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  type: MessageType;
  replyToId: string | null;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  isEdited: boolean;
}

export interface SendMessageRequest {
  content: string;
  type?: MessageType;
  replyToId?: string;
  tempId?: string;
}

// WebSocket message types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  type: MessageType;
  replyToId: string | null;
  replyToPreview: string | null;
  createdAt: string;
  isEdited: boolean;
  tempId?: string;
}

export interface TypingNotification {
  chatId: string;
  userId: string;
  userName: string | null;
  isTyping: boolean;
}

export interface ReadReceiptNotification {
  chatId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: string;
}

export interface PresenceNotification {
  userId: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeenAt: string | null;
}

export interface MessageAck {
  tempId: string;
  messageId: string;
  createdAt: string;
  status: 'SENT' | 'DELIVERED' | 'ERROR';
}