'use client';

import { Card, Empty } from 'antd';
import type { ChatSession } from '@/app/dashboard/models';
import ChatAnalysisCard from '@/components/chat/ChatAnalysisCard';
import ChatEmpty from '@/components/chat/ChatEmpty';

type ChatConversationPanelProps = {
  activeChat: ChatSession | null;
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
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
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

              {rewriteCount >= (maxRewrites ?? 3) && (
                <Card className="mx-auto max-w-3xl rounded-[24px] border-[#ececf4] bg-white">
                  <Empty
                    description={
                      'You have reached the maximum of 3 rewritten CV versions. Download your preferred version below.'
                    }
                  />
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
