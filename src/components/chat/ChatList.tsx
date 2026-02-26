import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { ChatListItem } from './ChatListItem';
import { Spinner } from '../../components/ui';
import { MessageSquare } from 'lucide-react';

export function ChatList() {
  const { chats, isLoading, selectedChatId, fetchMoreChats, hasMore } = useChatStore();
  const { user } = useAuthStore();

  if (isLoading && chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-300 px-4">
        <MessageSquare className="w-12 h-12 mb-3 text-surface-400" />
        <p className="text-center">No conversations yet</p>
        <p className="text-sm text-center mt-1">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isSelected={chat.id === selectedChatId}
          currentUserId={user?.id || ''}
        />
      ))}
      
      {hasMore && (
        <button
          onClick={() => fetchMoreChats()}
          className="w-full py-3 text-sm text-primary-400 hover:bg-surface-700"
        >
          Load more
        </button>
      )}
    </div>
  );
}