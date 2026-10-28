'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChatNavigationProvider } from './ChatNavigationContext';
import type { ChatSession } from './models';
import Sidebar from '@/components/layout/Sidebar';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const routeChatId = pathname.match(/^\/dashboard\/chat\/([^/]+)$/)?.[1] ?? null;

  const selectChat = (id: string | null) => {
    const nextPath = id ? `/dashboard/chat/${encodeURIComponent(id)}` : '/dashboard/chat';
    if (pathname !== nextPath) router.push(nextPath);
  };

  useEffect(() => {
    if (ready && !user) {
      router.replace('/auth/login');
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!pathname.startsWith('/dashboard/chat')) return;

    let cancelled = false;
    setChatLoading(true);
    api
      .get<{ data: ChatSession[] }>('/chat')
      .then((response) => {
        if (cancelled) return;
        const chats = response.data.data;
        const uniqueChats = chats.filter(
          (chat, index, allChats) => allChats.findIndex((item) => item.id === chat.id) === index
        );
        setChatList(uniqueChats);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your chat history.');
      })
      .finally(() => {
        if (!cancelled) setChatLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, routeChatId]);

  const handleNewChat = () => selectChat(null);

  const handleDeleteChat = async (id: string) => {
    try {
      setDeletingChat(true);
      await api.delete(`/chat/${id}`);
      setChatList((prev) => prev.filter((c) => c.id !== id));
      setChatToDelete(null);
      if (routeChatId === id) selectChat(null);
    } catch {
      toast.error('Could not delete chat.');
    } finally {
      setDeletingChat(false);
    }
  };

  const handleRenameChat = async (id: string, title: string) => {
    try {
      const res = await api.patch<{ data: ChatSession }>(`/chat/${id}`, { title });
      setChatList((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
    } catch {
      toast.error('Could not rename chat.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  if (!ready) {
    return (
      <main
        className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500"
        aria-live="polite"
      >
        Checking your session…
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ChatNavigationProvider
      value={{ chatList, setChatList, activeChatId: routeChatId, selectChat, chatLoading }}
    >
      <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f8fc] text-[#20243b]">
        {menuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 border-0 bg-slate-950/45 md:hidden"
          />
        )}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          chatList={chatList}
          activeChatId={routeChatId}
          chatLoading={chatLoading}
          onNewChat={handleNewChat}
          onSelectChat={(id) => selectChat(id)}
          onRename={handleRenameChat}
          onDelete={(chat) => setChatToDelete(chat)}
          chatToDelete={chatToDelete}
          setChatToDelete={setChatToDelete}
          deletingChat={deletingChat}
          handleDeleteChat={handleDeleteChat}
          setLogoutOpen={setLogoutOpen}
        />
        <div className="ml-0 flex h-dvh min-w-0 w-full flex-col md:ml-64 md:w-[calc(100%-16rem)]">
          <header className="z-10 flex h-[60px] shrink-0 items-center gap-2.5 border-b border-[#ececf4] bg-white px-[18px] text-sm font-extrabold text-[#252944] md:hidden">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-sm text-white">
              C
            </span>
            <span>CareerMate</span>
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-controls="dashboard-sidebar"
              onClick={() => setMenuOpen(true)}
              className="ml-auto grid size-[38px] place-items-center rounded-lg bg-[#f5f4fa] text-[#565b74]"
            >
              <MenuOutlined />
            </button>
          </header>
          <main
            className={`min-h-0 flex-1 ${pathname.startsWith('/dashboard/chat') ? 'overflow-hidden' : 'overflow-auto overscroll-contain px-[18px] py-6 md:px-[clamp(22px,4vw,56px)] md:py-[34px]'}`}
          >
            {children}
          </main>
        </div>
        <ConfirmModal
          open={logoutOpen}
          title="Logout?"
          description="Are you sure you want to logout?"
          confirmLabel="Logout"
          destructive
          loading={false}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      </div>
    </ChatNavigationProvider>
  );
}
