'use client'

import { createContext, Dispatch, SetStateAction, useContext } from 'react'

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; createdAt?: string }
export type ChatSession = {
  id: string
  title: string
  cvId: string
  jobDescription: string
  analysis: {
    summary: string
    atsScore: number
    strengths: string[]
    gaps: string[]
    missingSkills: string[]
    recommendations: string[]
    keywords: string[]
    tailoredSummary: string
    editableHtml: string
    scoreBreakdown?: { label: string; score: number; note: string }[]
  } | null
  draftHtml: string
  isEditing: boolean
  status: 'idle' | 'analyzing' | 'done' | 'error'
  error: string
  messages: ChatMessage[]
  createdAt?: string
  updatedAt?: string
}

type ChatNavigationContextValue = {
  chatList: ChatSession[]
  setChatList: Dispatch<SetStateAction<ChatSession[]>>
  activeChatId: string | null
  setActiveChatId: Dispatch<SetStateAction<string | null>>
  chatLoading: boolean
}

const ChatNavigationContext = createContext<ChatNavigationContextValue | null>(null)

export const ChatNavigationProvider = ChatNavigationContext.Provider

export function useChatNavigation() {
  const context = useContext(ChatNavigationContext)
  if (!context) throw new Error('useChatNavigation must be used within ChatNavigationProvider')
  return context
}
