import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isOnline?: boolean;
}

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className,
  isOnline 
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={cn(
            'rounded-full object-cover bg-surface-600',
            sizes[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-primary-900 text-primary-300 font-medium',
            'flex items-center justify-center',
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-surface-800',
            isOnline ? 'bg-primary-400' : 'bg-surface-400',
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}
