'use client'

import { Card, Typography } from 'antd'
import { RobotOutlined } from '@ant-design/icons'

export default function ChatEmpty() {
  return (
    <Card className="mx-auto max-w-3xl rounded-[24px] border-[#ececf4] bg-[#f9f9ff]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#eef0ff] text-[#5d4bc7]">
            <RobotOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <Typography.Title level={4} className="!mb-0">Choose your CV and job description</Typography.Title>
            <div className="text-sm text-[#6a7289]">Your insight will be tailored to the role you want to target.</div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50/40">
            <span className="truncate text-sm text-slate-600">Select CV</span>
          </button>
          <button type="button" className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50/40">
            <span className="truncate text-sm text-slate-600">Upload CV</span>
          </button>
        </div>
      </div>
    </Card>
  )
}
