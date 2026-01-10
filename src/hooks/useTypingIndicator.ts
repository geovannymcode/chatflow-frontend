import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTypingIndicatorOptions {
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  timeout?: number;
}

export function useTypingIndicator({
  onTypingStart,
  onTypingStop,
  timeout = 2000,
}: UseTypingIndicatorOptions = {}) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<number>(0);

  const handleTyping = useCallback(() => {
    const now = Date.now();

    // Only send typing start if not already typing or enough time has passed
    if (!isTyping || now - lastSentRef.current > timeout) {
      setIsTyping(true);
      onTypingStart?.();
      lastSentRef.current = now;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
    }, timeout);
  }, [isTyping, timeout, onTypingStart, onTypingStop]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsTyping(false);
    onTypingStop?.();
  }, [onTypingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isTyping, handleTyping, stopTyping };
}