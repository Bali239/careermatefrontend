'use client';

import type { RefObject } from 'react';
import { Card, Empty } from 'antd';
import type { ChatSession } from '@/app/dashboard/models';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatAnalysisCard from '@/components/chat/ChatAnalysisCard';
import ChatEmpty from '@/components/chat/ChatEmpty';

type ChatConversationPanelProps = {
  activeChat: ChatSession | null;
  messagesViewport: RefObject<HTMLDivElement | null>;
  onRewrite?: () => void;
  onDownloadGenerated?: (versionId: string, format: 'docx' | 'pdf') => void;
  rewriting?: boolean;
  downloadingVersionId?: string;
  downloadingFormat?: 'docx' | 'pdf';
  rewriteCount?: number;
  maxRewrites?: number;
};

export default function ChatConversationPanel({
  activeChat,
  messagesViewport,
  onRewrite,
  onDownloadGenerated,
  rewriting,
  downloadingVersionId,
  downloadingFormat,
  rewriteCount = 0,
  maxRewrites = 3,
}: ChatConversationPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-[#ececf4] px-6 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c8ff1]">
              AI job-fit coach
            </div>
            <div className="mt-1 text-xl font-bold text-[#1f2333]">
              {activeChat ? activeChat.title : 'CV analysis workspace'}
            </div>
          </div>
        </div>

        <div ref={messagesViewport} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-[360px]">
          {!activeChat ? (
            <ChatEmpty />
          ) : (
            <div className="mx-auto max-w-4xl space-y-5">
              <ChatAnalysisCard
                analysis={activeChat.analysis}
                generatedCvVersions={activeChat.generatedCvVersions}
                onRewrite={onRewrite}
                onDownloadGenerated={onDownloadGenerated}
                rewriting={rewriting}
                downloadingVersionId={downloadingVersionId}
                downloadingFormat={downloadingFormat}
                rewriteCount={rewriteCount}
                maxRewrites={maxRewrites}
              />

              {activeChat.messages.length === 0 ? (
                <Card className="mx-auto max-w-3xl rounded-[24px] border-[#ececf4] bg-white">
                  <Empty
                    description={
                      rewriteCount >= (maxRewrites ?? 3)
                        ? 'You have reached the maximum of 3 rewritten CV versions. Download your preferred version below.'
                        : 'Use Rewrite my CV to generate a tailored version of your CV. You can create up to 3 rewritten versions.'
                    }
                  />
                </Card>
              ) : (
                <div className="mx-auto max-w-4xl space-y-4">
                  {activeChat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
