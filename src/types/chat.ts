export type ChatType = 'DIRECT' | 'GROUP';

export interface Chat {
  id: string;
  name: string | null;
  type: ChatType;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  participantCount: number;
  createdAt: string;
  otherParticipant: ParticipantSummary | null;
  unreadCount?: number;
}

export interface ChatDetail extends Chat {
  creatorId: string;
  participants: Participant[];
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  nickname: string | null;
  isMuted: boolean;
}

export interface ParticipantSummary {
  userId: string;
  name: string | null;
}

export interface CreateDirectChatRequest {
  otherUserId: string;
}

export interface CreateGroupChatRequest {
  name: string;
  participantIds: string[];
}