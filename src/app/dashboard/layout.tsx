'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { MenuOutlined } from '@ant-design/icons'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { ChatNavigationProvider } from './ChatNavigationContext'
import type { ChatSession } from './models'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatList, setChatList] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (!pathname.startsWith('/dashboard/chat')) return

    let cancelled = false
    setChatLoading(true)
    api.get<{ data: ChatSession[] }>('/chat')
      .then((response) => {
        if (cancelled) return
        const chats = response.data.data
        setChatList(chats)
        setActiveChatId((current) => current ?? chats[0]?.id ?? null)
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your chat history.')
      })
      .finally(() => {
        if (!cancelled) setChatLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  const handleNewChat = () => setActiveChatId(null)

  const handleDeleteChat = async (id: string) => {
    try {
      await api.delete(`/chat/${id}`)
      setChatList((prev) => prev.filter((c) => c.id !== id))
      if (activeChatId === id) setActiveChatId(null)
    } catch {
      toast.error('Could not delete chat.')
    }
  }

  const handleRenameChat = async (id: string, title: string) => {
    try {
      const res = await api.patch<{ data: ChatSession }>(`/chat/${id}`, { title })
      setChatList((prev) => prev.map((c) => (c.id === id ? res.data.data : c)))
    } catch {
      toast.error('Could not rename chat.')
    }
  }

  return (
    <ChatNavigationProvider value={{ chatList, setChatList, activeChatId, setActiveChatId, chatLoading }}>
      <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f8fc] text-[#20243b]">
        {menuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 border-0 bg-slate-950/45 md:hidden" />}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          chatList={chatList}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          chatLoading={chatLoading}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
          onRename={handleRenameChat}
          onDelete={(chat) => handleDeleteChat(chat.id)}
          chatToDelete={null}
          setChatToDelete={() => {}}
          deletingChat={false}
          handleDeleteChat={handleDeleteChat}
        />
        <div className="ml-0 flex h-dvh min-w-0 w-full flex-col md:ml-64 md:w-[calc(100%-16rem)]">
          <header className="z-10 flex h-[60px] shrink-0 items-center gap-2.5 border-b border-[#ececf4] bg-white px-[18px] text-sm font-extrabold text-[#252944] md:hidden">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-sm text-white">C</span>
            <span>CareerMate</span>
            <button type="button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(true)} className="ml-auto grid size-[38px] place-items-center rounded-lg bg-[#f5f4fa] text-[#565b74]">
              <MenuOutlined/>
            </button>
          </header>
          <main className={`min-h-0 flex-1 ${pathname.startsWith('/dashboard/chat') ? 'overflow-hidden' : 'overflow-auto overscroll-contain px-[18px] py-6 md:px-[clamp(22px,4vw,56px)] md:py-[34px]'}`}>{children}</main>
        </div>
      </div>
    </ChatNavigationProvider>
  )
}
