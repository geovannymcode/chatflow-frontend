import { cn } from '@/lib/cn';

interface TypingIndicatorProps {
  userIds: string[];
  className?: string;
}

export function TypingIndicator({ userIds, className }: TypingIndicatorProps) {
  if (userIds.length === 0) return null;

  const text = userIds.length === 1
    ? 'Someone is typing'
    : userIds.length === 2
      ? '2 people are typing'
      : 'Several people are typing';

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="flex items-center gap-2 text-sm text-surface-300">
        {/* Animated dots */}
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
        </div>
        <span>{text}...</span>
      </div>
    </div>
  );
}