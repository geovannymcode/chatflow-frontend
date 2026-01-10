import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useChatStore } from '@/stores/chatStore';
import { useMessageStore } from '@/stores/messageStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyState } from '@/components/chat/EmptyState';

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { isConnected } = useWebSocket();
  
  const { 
    selectedChatId, 
    selectedChat, 
    selectChat, 
    clearSelectedChat,
    fetchChats 
  } = useChatStore();
  
  const { fetchMessages } = useMessageStore();

  // Fetch chats on mount
  useEffect(() => {
    fetchChats(true);
  }, [fetchChats]);

  // Select chat from URL
  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
    } else {
      clearSelectedChat();
    }
  }, [chatId, selectChat, clearSelectedChat]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId, true);
    }
  }, [selectedChatId, fetchMessages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with chat list */}
      <Sidebar />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Reconnecting...
        </div>
      )}
    </div>
  );
}