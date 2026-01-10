import { useRef, useCallback } from 'react';
import { MessageItem } from './MessageItem';
import { Spinner } from '@/components/ui';
import type { Message } from '@/types';

interface ExtendedMessage extends Message {
  isPending?: boolean;
}

interface MessageListProps {
  messages: ExtendedMessage[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading || !hasMore) return;

    const { scrollTop } = listRef.current;
    
    // Load more when scrolled near the top (for reverse chronological order)
    if (scrollTop < 100) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Agrupar mensajes por fecha
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col-reverse scrollbar-thin"
    >
      {/* Loading indicator at top */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {/* Messages in reverse order (newest at bottom) */}
      {Object.entries(groupedMessages)
        .reverse()
        .map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                {date}
              </span>
            </div>

            {/* Messages for this date */}
            {dateMessages.reverse().map((message, index) => {
              const prevMessage = dateMessages[index - 1];
              const showAvatar = !prevMessage || 
                prevMessage.senderId !== message.senderId;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUserId}
                  showAvatar={showAvatar}
                  isPending={message.isPending}
                />
              );
            })}
          </div>
        ))}
    </div>
  );
}

// Helper function to group messages by date
function groupMessagesByDate(messages: ExtendedMessage[]): Record<string, ExtendedMessage[]> {
  const groups: Record<string, ExtendedMessage[]> = {};

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const dateKey = formatDateKey(date);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}

function formatDateKey(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}