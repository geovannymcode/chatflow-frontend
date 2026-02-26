import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { formatChatTime, truncate } from '../../lib/utils';
import { Avatar } from '../ui';
import { usePresenceStore } from '../../stores/presenceStore';
import type { Chat } from '../../types';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  currentUserId: string;
}

export function ChatListItem({ chat, isSelected, currentUserId }: ChatListItemProps) {
  const navigate = useNavigate();
  const { isOnline } = usePresenceStore();

  // Para chats directos, mostrar info del otro participante
  const otherUser = chat.otherParticipant;
  const displayName = chat.type === 'GROUP' 
    ? chat.name 
    : otherUser?.name || 'Unknown User';
  
  const isOtherUserOnline = otherUser ? isOnline(otherUser.userId) : false;

  return (
    <button
      onClick={() => navigate(`/chat/${chat.id}`)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-surface-700 focus:outline-none focus:bg-surface-700',
        isSelected && 'bg-surface-700 hover:bg-surface-700'
      )}
    >
      {/* Avatar */}
      <Avatar
        name={displayName}
        size="md"
        isOnline={chat.type === 'DIRECT' ? isOtherUserOnline : undefined}
      />

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'font-medium text-gray-100 truncate',
            chat.unreadCount && chat.unreadCount > 0 && 'font-semibold'
          )}>
            {displayName}
          </span>
          {chat.lastMessageAt && (
            <span className="text-xs text-surface-300 flex-shrink-0">
              {formatChatTime(chat.lastMessageAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            'text-sm truncate',
            chat.unreadCount && chat.unreadCount > 0
              ? 'text-gray-200 font-medium'
              : 'text-surface-300'
          )}>
            {chat.lastMessagePreview || 'No messages yet'}
          </p>
          
          {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}