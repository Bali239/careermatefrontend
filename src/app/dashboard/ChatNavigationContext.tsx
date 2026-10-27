'use client';

import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import type { ChatSession } from './models';

type ChatNavigationContextValue = {
  chatList: ChatSession[];
  setChatList: Dispatch<SetStateAction<ChatSession[]>>;
  activeChatId: string | null;
  selectChat: (id: string | null) => void;
  chatLoading: boolean;
};

const ChatNavigationContext = createContext<ChatNavigationContextValue | null>(null);

export const ChatNavigationProvider = ChatNavigationContext.Provider;

export function useChatNavigation() {
  const context = useContext(ChatNavigationContext);
  if (!context) throw new Error('useChatNavigation must be used within ChatNavigationProvider');
  return context;
}
