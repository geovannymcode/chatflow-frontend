import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Mic } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  isSending = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { handleTyping, stopTyping } = useTypingIndicator({
    onTypingStart: onTyping,
    onTypingStop: onStopTyping,
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || disabled || isSending) return;

    onSendMessage(message.trim());
    setMessage('');
    stopTyping();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 border-t border-surface-700 bg-surface-800"
    >
      {/* Attachment button */}
      <button
        type="button"
        className="p-2 rounded-full hover:bg-surface-600 text-surface-300"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Input container */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full px-4 py-2 pr-10 rounded-2xl border border-surface-600 bg-surface-700',
            'text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'resize-none outline-none transition-colors',
            'placeholder:text-surface-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Emoji button */}
        <button
          type="button"
          className="absolute right-3 bottom-2 p-1 rounded-full hover:bg-surface-600 text-surface-300"
        >
          <Smile className="w-5 h-5" />
        </button>
      </div>

      {/* Send or voice button */}
      {message.trim() ? (
        <button
          type="submit"
          disabled={disabled || isSending}
          className={cn(
            'px-5 py-2 rounded-xl bg-surface-600 text-gray-200 font-medium',
            'hover:bg-surface-500 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Send
        </button>
      ) : (
        <button
          type="button"
          className="p-2 rounded-full hover:bg-surface-600 text-surface-300"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </form>
  );
}