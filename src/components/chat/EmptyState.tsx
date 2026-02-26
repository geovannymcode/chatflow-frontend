import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface-900 text-surface-300">
      <div className="w-24 h-24 rounded-full bg-surface-700 flex items-center justify-center mb-4">
        <MessageSquare className="w-12 h-12 text-primary-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-200 mb-2">
        Welcome to ChatFlow
      </h2>
      <p className="text-center max-w-md">
        Select a conversation from the sidebar or start a new chat to begin messaging.
      </p>
    </div>
  );
}