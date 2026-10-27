'use client'

import { Card, Tag } from 'antd'
import type { ChatSession } from '@/app/dashboard/models'

type ChatAnalysisCardProps = {
  analysis: ChatSession['analysis']
}

export default function ChatAnalysisCard({ analysis }: ChatAnalysisCardProps) {
  if (!analysis) return null
  return (
    <Card className="rounded-[24px] border-[#ececf4] bg-[#f9f9ff]">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#dfe3ff] bg-[#eef0ff] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5d4bc7]">ATS match</div>
          <div className="mt-2 text-4xl font-bold text-[#2b2f73]">{analysis.atsScore}%</div>
        </div>
        <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">Keywords</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.keywords.length > 0 ? analysis.keywords.map((keyword) => <Tag key={keyword} color="blue">{keyword}</Tag>) : <span className="text-sm text-[#7d8397]">No keywords extracted.</span>}
          </div>
        </div>
        <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">Missing skills</div>
          <div className="mt-3 space-y-1 text-sm text-[#3b4257]">
            {analysis.missingSkills.length > 0 ? analysis.missingSkills.map((skill) => <div key={skill}>• {skill}</div>) : <div className="text-[#7d8397]">No major gaps detected.</div>}
          </div>
        </div>
      </div>
    </Card>
  )
}
