import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import { authService } from '@/services/authService';

vi.mock('@/services/authService');

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
      user: { id: '1', email: 'test@example.com', name: 'Test' },
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

    await useAuthStore.getState().login({
      email: 'test@example.com',
      password: 'password',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-token');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('should handle login error', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    await expect(
      useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'wrong',
      })
    ).rejects.toBeTruthy();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('should logout correctly', () => {
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com' } as any,
      accessToken: 'token',
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});