const STORAGE_KEYS = {
  ACCESS_TOKEN: 'chatflow_access_token',
  REFRESH_TOKEN: 'chatflow_refresh_token',
  USER: 'chatflow_user',
  API_KEY: 'chatflow_api_key',
} as const;

export const storage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getUser: <T>(): T | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setUser: <T>(user: T): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  },

  setApiKey: (key: string): void => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },

  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('auth-storage');
  },

  clear: (): void => {
    localStorage.clear();
  },
};