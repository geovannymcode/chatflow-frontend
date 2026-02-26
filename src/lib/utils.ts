import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return 'Ayer ' + format(date, 'HH:mm');
  }
  
  return format(date, 'dd/MM/yyyy HH:mm');
}

export function formatLastSeen(dateString: string | null): string {
  if (!dateString) return 'Nunca';
  
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: es,
  });
}

export function formatChatTime(dateString: string | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return 'Ayer';
  }
  
  return format(date, 'dd/MM');
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateTempId(): string {
  return crypto.randomUUID();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}