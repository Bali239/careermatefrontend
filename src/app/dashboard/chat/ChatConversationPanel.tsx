'use client'

import type { RefObject } from 'react'
import { Card, Empty } from 'antd'
import type { ChatSession } from '@/app/dashboard/models'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatAnalysisCard from '@/components/chat/ChatAnalysisCard'
import ChatEmpty from '@/components/chat/ChatEmpty'

type ChatConversationPanelProps = {
  activeChat: ChatSession | null
  messagesViewport: RefObject<HTMLDivElement | null>
}

export default function ChatConversationPanel({ activeChat, messagesViewport }: ChatConversationPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-[#ececf4] px-6 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c8ff1]">AI job-fit coach</div>
            <div className="mt-1 text-xl font-bold text-[#1f2333]">{activeChat ? activeChat.title : 'CV analysis workspace'}</div>
          </div>
        </div>

        <div ref={messagesViewport} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-[360px]">
          {!activeChat ? (
            <ChatEmpty />
          ) : (
            <div className="mx-auto max-w-4xl space-y-5">
              <ChatAnalysisCard analysis={activeChat.analysis} />

              {activeChat.messages.length === 0 ? (
                <Card className="mx-auto max-w-3xl rounded-[24px] border-[#ececf4] bg-white">
                  <Empty description="Start the conversation by asking for a rewrite, keyword match, or a stronger summary." />
                </Card>
              ) : (
                <div className="mx-auto max-w-4xl space-y-4">
                  {activeChat.messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
