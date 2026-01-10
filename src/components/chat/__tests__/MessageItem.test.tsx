import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageItem } from '../MessageItem';
import type { Message } from '@/types';

const mockMessage: Message = {
  id: '1',
  chatId: 'chat-1',
  senderId: 'user-1',
  senderName: 'John Doe',
  content: 'Hello, World!',
  type: 'TEXT',
  replyToId: null,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  isDeleted: false,
  isEdited: false,
};

describe('MessageItem', () => {
  it('renders message content', () => {
    render(<MessageItem message={mockMessage} isOwn={false} />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('shows sender name for other users', () => {
    render(<MessageItem message={mockMessage} isOwn={false} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('applies own message styles', () => {
    const { container } = render(
      <MessageItem message={mockMessage} isOwn={true} />
    );
    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('shows deleted message placeholder', () => {
    render(
      <MessageItem
        message={{ ...mockMessage, isDeleted: true }}
        isOwn={false}
      />
    );
    expect(screen.getByText(/deleted/i)).toBeInTheDocument();
  });
});