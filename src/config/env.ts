// src/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws',
  appName: import.meta.env.VITE_APP_NAME || 'ChatFlow',
} as const;