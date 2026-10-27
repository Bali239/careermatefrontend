'use client';

import { Button, Card, Tag } from 'antd';
import type { ChatSession } from '@/app/dashboard/models';

type ChatAnalysisCardProps = {
  analysis: ChatSession['analysis'];
  generatedCvVersions?: ChatSession['generatedCvVersions'];
  onRewrite?: () => void;
  onDownloadGenerated?: (versionId: string, format: 'docx' | 'pdf') => void;
  rewriting?: boolean;
  downloadingVersionId?: string;
  downloadingFormat?: 'docx' | 'pdf';
};

export default function ChatAnalysisCard({
  analysis,
  generatedCvVersions = [],
  onRewrite,
  onDownloadGenerated,
  rewriting = false,
  downloadingVersionId,
  downloadingFormat,
}: ChatAnalysisCardProps) {
  if (!analysis) return null;

  const latestVersion = [...(generatedCvVersions ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )[0];

  return (
    <Card className="rounded-[24px] border-[#ececf4] bg-[#f9f9ff]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-4 md:grid-cols-3 md:flex-1">
          <div className="rounded-2xl border border-[#dfe3ff] bg-[#eef0ff] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5d4bc7]">
              ATS match
            </div>
            <div className="mt-2 text-4xl font-bold text-[#2b2f73]">{analysis.atsScore}%</div>
          </div>
          <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">
              Keywords
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.keywords.length > 0 ? (
                analysis.keywords.map((keyword) => (
                  <Tag key={keyword} color="blue">
                    {keyword}
                  </Tag>
                ))
              ) : (
                <span className="text-sm text-[#7d8397]">No keywords extracted.</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">
              Missing skills
            </div>
            <div className="mt-3 space-y-1 text-sm text-[#3b4257]">
              {analysis.missingSkills.length > 0 ? (
                analysis.missingSkills.map((skill) => <div key={skill}>• {skill}</div>)
              ) : (
                <div className="text-[#7d8397]">No major gaps detected.</div>
              )}
            </div>
          </div>
        </div>

        {onRewrite && (
          <div className="flex flex-col gap-2 md:items-end">
            <Button
              type="primary"
              onClick={onRewrite}
              loading={rewriting}
              className="rounded-full bg-[#4f46e5]"
            >
              {rewriting ? 'Generating...' : 'Rewrite my CV'}
            </Button>

            {latestVersion && latestVersion.status === 'completed' && onDownloadGenerated && (
              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'docx'}
                  onClick={() => onDownloadGenerated(latestVersion.id, 'docx')}
                >
                  Download DOCX
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'pdf'}
                  onClick={() => onDownloadGenerated(latestVersion.id, 'pdf')}
                >
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
