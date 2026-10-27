'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Input } from 'antd';
import {
  FileTextOutlined,
  MenuOutlined,
  MessageOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ChatListItem from '@/components/chat/ChatListItem';
import type { ChatSession } from '@/app/dashboard/models';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: UserOutlined },
  { href: '/dashboard/cv', label: 'CV library', icon: FileTextOutlined },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageOutlined },
];

type SidebarProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  chatList: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  chatLoading: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (chat: ChatSession) => void;
  chatToDelete: ChatSession | null;
  setChatToDelete: (chat: ChatSession | null) => void;
  deletingChat: boolean;
  handleDeleteChat: (id: string) => void;
  setLogoutOpen: (open: boolean) => void;
};

export default function Sidebar({
  menuOpen,
  setMenuOpen,
  chatList,
  activeChatId,
  setActiveChatId,
  chatLoading,
  onNewChat,
  onSelectChat,
  onRename,
  onDelete,
  chatToDelete,
  setChatToDelete,
  deletingChat,
  handleDeleteChat,
  setLogoutOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const { user } = useAuth();
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setMenuOpen(false);
    }
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen, setMenuOpen]);

  const handleRename = (id: string, title: string) => {
    onRename(id, title);
  };

  const onProfileMenuClick = ({ key }: { key: React.Key }) => {
    if (key === 'logout') setLogoutOpen(true);
  };

  return (
    <aside
      id="dashboard-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(290px,84vw)] flex-col overflow-x-hidden border-r border-[#ececf4] bg-white px-[14px] pb-[18px] pt-[25px] shadow-[14px_0_40px_#1e24401a] transition-transform duration-200 md:w-64 md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-center gap-2.5 px-2.5 pb-[23px] text-[17px] font-extrabold tracking-[-.5px] text-[#252944]">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-base font-extrabold text-white">
          C
        </span>
        <span>CareerMate</span>
      </div>

      <nav aria-label="Dashboard navigation" className="flex flex-col gap-[3px] min-w-0">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-xs font-semibold transition-colors ${active ? 'bg-[#f1efff] text-[#5e4cc9]' : 'text-[#6f748a] hover:bg-[#f8f7ff] hover:text-[#5e4cc9]'}`}
              >
                <Icon aria-hidden="true" className="w-[21px] text-base" />
                <span>{item.label}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 h-5 w-[3px] rounded-l bg-[#6958d6]"
                  />
                )}
              </Link>

              {item.href === '/dashboard/chat' && active && (
                <div className="mt-2 flex flex-col gap-1 min-w-0">
                  <button
                    type="button"
                    onClick={onNewChat}
                    className="flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-3 text-left text-xs font-semibold text-[#6958d6] bg-[#f8f7ff] hover:bg-[#f1efff] transition-colors border border-[#e8e5fc]"
                  >
                    <PlusOutlined aria-hidden="true" className="shrink-0 text-xs" />
                    <span className="truncate">New chat</span>
                  </button>

                  <div className="mt-2 mb-1 px-3 text-[10px] font-extrabold tracking-[1px] text-[#a1a4b6]">
                    RECENT CHATS
                  </div>

                  {chatLoading ? (
                    <div className="px-3 py-2 text-xs text-[#9094a8]">Loading chats…</div>
                  ) : chatList.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-[#9094a8]">No saved chats yet</div>
                  ) : (
                    <div className="max-h-[calc(100dvh-290px)] min-w-0 space-y-[2px] overflow-y-auto overflow-x-hidden pr-1">
                      {chatList.map((chat) => (
                        <ChatListItem
                          key={chat.id}
                          chat={chat}
                          isSelected={chat.id === activeChatId}
                          onSelect={onSelectChat}
                          onRename={handleRename}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-[4px] pb-[8px]">
        {user && (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [{ key: 'logout', label: 'Logout', icon: <LogoutOutlined /> }],
              selectable: false,
              onClick: onProfileMenuClick,
            }}
          >
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-[#f8f7ff]"
            >
              {user.avatarUrl && !avatarFailed ? (
                <Image
                  src={user.avatarUrl}
                  alt="avatar"
                  className="size-7 shrink-0 rounded-full"
                  width={28}
                  height={28}
                  onError={() => setAvatarFailed(true)}
                  priority
                />
              ) : (
                <span className="size-7 shrink-0 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-[10px] font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              )}
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="truncate font-semibold text-[#252944]">{user.name ?? 'User'}</div>
                <div className="truncate text-[9px] text-[#9094a8]">{user.email ?? ''}</div>
              </div>
            </button>
          </Dropdown>
        )}
      </div>

      <ConfirmModal
        open={chatToDelete !== null}
        title="Delete chat?"
        description={
          chatToDelete
            ? `Are you sure you want to delete "${chatToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete chat"
        destructive
        loading={deletingChat}
        onCancel={() => setChatToDelete(null)}
        onConfirm={() => (chatToDelete ? handleDeleteChat(chatToDelete.id) : undefined)}
      />
    </aside>
  );
}
