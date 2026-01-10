import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatMessageTime } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { Check, CheckCheck, Clock, MoreVertical } from 'lucide-react';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message & { isPending?: boolean };
  isOwn: boolean;
  showAvatar?: boolean;
  isPending?: boolean;
}

export function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  isPending = false,
}: MessageItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          'flex items-end gap-2',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-500 italic text-sm">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-end gap-2 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar (for other users) */}
      {!isOwn && showAvatar && (
        <Avatar name={message.senderName} size="sm" />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message bubble */}
      <div className="relative max-w-[70%]">
        {/* Sender name (for group chats) */}
        {!isOwn && showAvatar && message.senderName && (
          <p className="text-xs text-gray-500 mb-1 ml-3">
            {message.senderName}
          </p>
        )}

        <div
          className={cn(
            'px-4 py-2 rounded-2xl',
            isOwn
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md',
            isPending && 'opacity-70'
          )}
        >
          {/* Content */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Time and status */}
          <div
            className={cn(
              'flex items-center justify-end gap-1 mt-1',
              isOwn ? 'text-primary-200' : 'text-gray-400'
            )}
          >
            <span className="text-[10px]">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-[10px]">edited</span>
            )}
            {isOwn && (
              isPending ? (
                <Clock className="w-3 h-3" />
              ) : (
                <CheckCheck className="w-3 h-3" />
              )
            )}
          </div>
        </div>

        {/* Context menu button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-1 rounded-full',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-gray-200',
            isOwn ? '-left-8' : '-right-8'
          )}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {/* Context menu */}
        {showMenu && (
          <div
            className={cn(
              'absolute top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
              Reply
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
              Copy
            </button>
            {isOwn && (
              <>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                  Edit
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600">
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}