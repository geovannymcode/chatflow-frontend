import { create } from 'zustand';

interface WsState {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useWsStore = create<WsState>()((set) => ({
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),
}));
