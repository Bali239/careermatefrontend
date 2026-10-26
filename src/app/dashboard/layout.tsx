'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Dropdown, Input } from 'antd'
import { FileTextOutlined, MenuOutlined, MessageOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { ChatNavigationProvider } from './ChatNavigationContext'
import type { ChatSession } from './ChatNavigationContext'

const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: UserOutlined },
  { href: '/dashboard/cv', label: 'CV library', icon: FileTextOutlined },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageOutlined },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatList, setChatList] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const previousPath = useRef(pathname)

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

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      setMenuOpen(false)
    }
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const handleDeleteChat = async (id: string) => {
    try {
      await api.delete(`/chat/${id}`)
      setChatList((prev) => prev.filter((c) => c.id !== id))
      if (activeChatId === id) setActiveChatId(null)
    } catch {
      toast.error('Could not delete chat.')
    }
  }

  const handleRenameChat = async (id: string) => {
    const title = editTitle.trim()
    if (!title) { setEditingChatId(null); return }
    try {
      const res = await api.patch<{ data: ChatSession }>(`/chat/${id}`, { title })
      setChatList((prev) => prev.map((c) => (c.id === id ? res.data.data : c)))
    } catch {
      toast.error('Could not rename chat.')
    } finally {
      setEditingChatId(null)
    }
  }

  return (
    <ChatNavigationProvider value={{ chatList, setChatList, activeChatId, setActiveChatId, chatLoading }}>
      <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f8fc] text-[#20243b]">
        {menuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 border-0 bg-slate-950/45 md:hidden" />}
        <aside id="dashboard-sidebar" className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(290px,84vw)] flex-col overflow-x-hidden border-r border-[#ececf4] bg-white px-[14px] pb-[18px] pt-[25px] shadow-[14px_0_40px_#1e24401a] transition-transform duration-200 md:w-64 md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center gap-2.5 px-2.5 pb-[23px] text-[17px] font-extrabold tracking-[-.5px] text-[#252944]">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-base font-extrabold text-white">C</span>
            <span>CareerMate</span>
          </div>
          
          <nav aria-label="Dashboard navigation" className="flex flex-col gap-[3px] min-w-0">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
              const Icon = item.icon
              return (
                <div key={item.href}>
                  <Link href={item.href} aria-current={active ? 'page' : undefined} className={`relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-xs font-semibold transition-colors ${active ? 'bg-[#f1efff] text-[#5e4cc9]' : 'text-[#6f748a] hover:bg-[#f8f7ff] hover:text-[#5e4cc9]'}`}>
                    <Icon aria-hidden="true" className="w-[21px] text-base"/>
                    <span>{item.label}</span>
                    {active && <span aria-hidden="true" className="absolute right-0 h-5 w-[3px] rounded-l bg-[#6958d6]"/>}
                  </Link>

                  {/* ChatGPT-style Sub-navigation for Chat History */}
                  {item.href === '/dashboard/chat' && active && (
                    <div className="mt-2 flex flex-col gap-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => setActiveChatId(null)}
                        className="flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-3 text-left text-xs font-semibold text-[#6958d6] bg-[#f8f7ff] hover:bg-[#f1efff] transition-colors border border-[#e8e5fc]"
                      >
                        <PlusOutlined aria-hidden="true" className="shrink-0 text-xs" />
                        <span className="truncate">New chat</span>
                      </button>

                      <div className="mt-2 mb-1 px-3 text-[10px] font-extrabold tracking-[1px] text-[#a1a4b6]">RECENT CHATS</div>

                      {chatLoading ? (
                        <div className="px-3 py-2 text-xs text-[#9094a8]">Loading chats…</div>
                      ) : chatList.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-[#9094a8]">No saved chats yet</div>
                      ) : (
                        <div className="max-h-[calc(100dvh-290px)] min-w-0 space-y-[2px] overflow-y-auto overflow-x-hidden pr-1">
                          {chatList.map((chat) => {
                            const isSelected = chat.id === activeChatId
                            return (
                              <div 
                                key={chat.id} 
                                className={`group relative flex min-w-0 items-center rounded-lg transition-colors ${isSelected ? 'bg-[#f1efff] text-[#5e4cc9]' : 'text-[#6f748a] hover:bg-[#f8f7ff] hover:text-[#5e4cc9]'}`}
                              >
                                {editingChatId === chat.id ? (
                                  <div className="p-1 w-full">
                                    <Input
                                      size="small"
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      onPressEnter={() => handleRenameChat(chat.id)}
                                      onBlur={() => handleRenameChat(chat.id)}
                                      autoFocus
                                      className="w-full text-xs"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setActiveChatId(chat.id)}
                                      aria-current={isSelected ? 'page' : undefined}
                                      title={chat.title}
                                      className="min-w-0 flex-1 overflow-hidden py-2 pl-3 pr-8 text-left text-xs font-medium focus:outline-none"
                                    >
                                      <span className="block truncate">{chat.title}</span>
                                    </button>

                                    {/* ChatGPT-style gradient fade & absolute options button on hover/active */}
                                    <div className="absolute right-1.5 flex items-center opacity-100">
                                      <Dropdown
                                        trigger={['click']}
                                        placement="bottomRight"
                                        menu={{
                                          items: [
                                            { key: 'rename', icon: <EditOutlined />, label: 'Rename', onClick: () => { setEditingChatId(chat.id); setEditTitle(chat.title) } },
                                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => handleDeleteChat(chat.id) },
                                          ],
                                        }}
                                      >
                                        <button 
                                          type="button" 
                                          className={`grid size-6 shrink-0 place-items-center rounded hover:bg-black/5 ${isSelected ? 'text-[#5e4cc9]' : 'text-[#9094a8]'}`}
                                          aria-label="Chat options"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreOutlined className="text-xs" />
                                        </button>
                                      </Dropdown>
                                    </div>
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          
          <div className="mt-auto flex items-center gap-[9px] border-t border-[#f0eff6] px-[4px] pb-[3px] pt-[15px] text-[10px] text-[#9094a8]">
            <span className="size-[7px] rounded-full bg-[#62bf91] shadow-[0_0_0_3px_#e8f8f0]"/>
            <span>Workspace ready</span>
          </div>
        </aside>

        <div className="ml-0 flex h-dvh min-w-0 w-full flex-col md:ml-64 md:w-[calc(100%-16rem)]">
          <header className="z-10 flex h-[60px] shrink-0 items-center gap-2.5 border-b border-[#ececf4] bg-white px-[18px] text-sm font-extrabold text-[#252944] md:hidden">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-sm text-white">C</span>
            <span>CareerMate</span>
            <button type="button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(true)} className="ml-auto grid size-[38px] place-items-center rounded-lg bg-[#f5f4fa] text-[#565b74]">
              <MenuOutlined/>
            </button>
          </header>
          <main className="min-h-0 flex-1 overflow-auto overscroll-contain px-[18px] py-6 md:px-[clamp(22px,4vw,56px)] md:py-[34px]">{children}</main>
        </div>
      </div>
    </ChatNavigationProvider>
  )
}