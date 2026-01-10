import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Users,
  Settings,
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar, Button, Modal } from '@/components/ui';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatLastSeen } from '@/lib/utils';
import type { ChatDetail } from '@/types';

interface ChatHeaderProps {
  chat: ChatDetail;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { getPresence } = usePresenceStore();

  // Para chats directos, obtener info del otro participante
  const otherParticipant = chat.type === 'DIRECT'
    ? chat.participants.find((p) => p.userId !== chat.creatorId)
    : null;

  const displayName = chat.type === 'GROUP'
    ? chat.name
    : 'User'; // TODO: Obtener nombre real

  const presence = otherParticipant 
    ? getPresence(otherParticipant.userId)
    : null;

  const statusText = chat.type === 'GROUP'
    ? `${chat.participants.length} participants`
    : presence?.status === 'ONLINE'
      ? 'Online'
      : presence?.lastSeenAt
        ? `Last seen ${formatLastSeen(presence.lastSeenAt)}`
        : 'Offline';

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b bg-white">
      {/* Back button (mobile) */}
      <button
        onClick={() => navigate('/chat')}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 lg:hidden"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <Avatar
        name={displayName}
        size="md"
        isOnline={presence?.status === 'ONLINE'}
      />

      {/* Chat Info */}
      <button
        onClick={() => setShowInfo(true)}
        className="flex-1 text-left min-w-0"
      >
        <h2 className="font-semibold text-gray-900 truncate">
          {displayName}
        </h2>
        <p className={cn(
          'text-sm truncate',
          presence?.status === 'ONLINE' ? 'text-green-600' : 'text-gray-500'
        )}>
          {statusText}
        </p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Video className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
              <button
                onClick={() => {
                  setShowInfo(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Chat info
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              {chat.type === 'GROUP' && (
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Leave group
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Info Modal */}
      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="Chat Info"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center py-4">
            <Avatar name={displayName} size="xl" />
            <h3 className="mt-3 text-lg font-semibold">{displayName}</h3>
            <p className="text-gray-500">{statusText}</p>
          </div>

          {chat.type === 'GROUP' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Participants ({chat.participants.length})
              </h4>
              <div className="space-y-2">
                {chat.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <Avatar
                      name={participant.nickname || 'User'}
                      size="sm"
                      isOnline={getPresence(participant.userId).status === 'ONLINE'}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {participant.nickname || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.role === 'ADMIN' ? 'Admin' : 'Member'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </header>
  );
}