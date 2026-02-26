import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { formatMessageTime } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { Check, CheckCheck, Clock, MoreVertical } from 'lucide-react';
import type { Message } from '@/types';

const BUBBLE_COLORS = [
  'bg-bubble-green',
  'bg-bubble-pink',
  'bg-bubble-blue',
  'bg-bubble-yellow',
  'bg-bubble-purple',
];

function getSenderColor(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BUBBLE_COLORS[Math.abs(hash) % BUBBLE_COLORS.length];
}

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

  const bubbleColor = useMemo(
    () => (isOwn ? 'bg-bubble-own' : getSenderColor(message.senderId)),
    [isOwn, message.senderId]
  );

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          'flex items-end gap-2',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        <div className="px-4 py-2 rounded-2xl bg-surface-700 text-surface-300 italic text-sm">
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
        {/* Sender name and time header */}
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-xs font-semibold text-gray-300">
              {isOwn ? 'You' : message.senderName || 'Unknown'}
            </span>
            <span className="text-[10px] text-surface-300">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}

        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl',
            bubbleColor,
            isOwn ? 'rounded-br-md' : 'rounded-bl-md',
            isPending && 'opacity-70'
          )}
        >
          {/* Content */}
          <p className="text-sm whitespace-pre-wrap break-words text-gray-900">
            {message.content}
          </p>

          {/* Time and status (inline at bottom-right) */}
          <div className="flex items-center justify-end gap-1 mt-1">
            {!showAvatar && (
              <span className="text-[10px] text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
            )}
            {message.isEdited && (
              <span className="text-[10px] text-gray-500">edited</span>
            )}
            {isOwn && (
              isPending ? (
                <Clock className="w-3 h-3 text-gray-500" />
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <CheckCheck className="w-3 h-3" /> Sent
                </span>
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
            'hover:bg-surface-600',
            isOwn ? '-left-8' : '-right-8'
          )}
        >
          <MoreVertical className="w-4 h-4 text-surface-300" />
        </button>

        {/* Context menu */}
        {showMenu && (
          <div
            className={cn(
              'absolute top-full mt-1 bg-surface-700 rounded-lg shadow-lg border border-surface-600 py-1 z-10',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <button className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-surface-600">
              Reply
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-surface-600">
              Copy
            </button>
            {isOwn && (
              <>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-surface-600">
                  Edit
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-surface-600">
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