'use client';

import type { ChatMessage } from '@/app/dashboard/models';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

type ChatMessageProps = {
  message: ChatMessage;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`min-w-0 max-w-[85%] rounded-[22px] px-4 py-3 shadow-sm ${isUser ? 'bg-[#1f2333] text-white' : 'bg-[#f3f5f9] text-[#1d2333]'}`}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">
          {isUser ? <UserOutlined /> : <RobotOutlined />}
          {isUser ? 'You' : 'AI'}
        </div>
        <div className="whitespace-pre-wrap break-words text-[15px] leading-7">{message.text}</div>
      </div>
    </div>
  );
}
