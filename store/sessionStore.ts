import { create } from "zustand";

export interface Message {
  messageId: string;
  role: "user" | "persona";
  text: string;
  mediaReady: boolean;
}

interface SessionState {
  sessionId: string | null;
  messages: Message[];
  setSessionId: (id: string) => void;
  addMessage: (message: Message) => void;
  setMediaReady: (messageId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  messages: [],
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMediaReady: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.messageId === messageId ? { ...m, mediaReady: true } : m,
      ),
    })),
  clearSession: () => set({ sessionId: null, messages: [] }),
}));
