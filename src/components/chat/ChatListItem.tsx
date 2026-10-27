'use client'

import { Dropdown, Input } from 'antd'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { ChatSession } from '@/app/dashboard/models'

type ChatListItemProps = {
  chat: ChatSession
  isSelected: boolean
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (chat: ChatSession) => void
}

export default function ChatListItem({ chat, isSelected, onSelect, onRename, onDelete }: ChatListItemProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)

  return (
    <div className="group relative flex min-w-0 items-center rounded-lg transition-colors" key={chat.id}>
      {editing ? (
        <div className="p-1 w-full">
          <Input
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onPressEnter={() => {
              onRename(chat.id, editTitle)
              setEditing(false)
            }}
            onBlur={() => {
              onRename(chat.id, editTitle)
              setEditing(false)
            }}
            autoFocus
            className="w-full text-xs"
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onSelect(chat.id)}
            aria-current={isSelected ? 'page' : undefined}
            title={chat.title}
            className="min-w-0 flex-1 overflow-hidden py-2 pl-3 pr-8 text-left text-xs font-medium focus:outline-none"
          >
            <span className="block truncate">{chat.title}</span>
          </button>

          <div className="absolute right-1.5 flex items-center opacity-100">
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  { key: 'rename', icon: <EditOutlined />, label: 'Rename', onClick: () => { setEditTitle(chat.title); setEditing(true) } },
                  { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => onDelete(chat) },
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
}
