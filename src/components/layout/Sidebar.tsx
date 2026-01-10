import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Settings, 
  LogOut,
  Users 
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/authStore';
import { ChatList } from '@/components/chat/ChatList';
import { Avatar, Button, Modal, Input } from '@/components/ui';
import { config } from '@/config/env';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-80 flex flex-col border-r bg-white h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">{config.appName}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="New chat"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <ChatList />

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        title="New Chat"
        size="md"
      >
        <div className="space-y-4">
          <button
            className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 border"
            onClick={() => {
              setShowNewChat(false);
              // TODO: Open user search
            }}
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">New direct message</p>
              <p className="text-sm text-gray-500">
                Start a conversation with someone
              </p>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 border"
            onClick={() => {
              setShowNewChat(false);
              // TODO: Open group creation
            }}
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">New group chat</p>
              <p className="text-sm text-gray-500">
                Create a group with multiple people
              </p>
            </div>
          </button>
        </div>
      </Modal>
    </aside>
  );
}