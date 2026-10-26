'use client'

import { SendOutlined } from '@ant-design/icons'
import { Button, Input, Tag } from 'antd'

type JobDescriptionComposerProps = {
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
  selectedCvLabel: string | null
  creatingChat: boolean
  onSend: () => void
}

export default function JobDescriptionComposer({
  jobDescription,
  onJobDescriptionChange,
  selectedCvLabel,
  creatingChat,
  onSend,
}: JobDescriptionComposerProps) {
  return (
    <div className="space-y-3">
      <Input.TextArea
        value={jobDescription}
        onChange={(event) => onJobDescriptionChange(event.target.value)}
        placeholder="Paste the job description here..."
        autoSize={{ minRows: 2, maxRows: 5 }}
        className="!rounded-[18px] border-[#e5e7ef] bg-white !px-4 !py-3"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {selectedCvLabel ? (
            <Tag color="geekblue">Selected CV: {selectedCvLabel}</Tag>
          ) : (
            <Tag color="default">No CV selected</Tag>
          )}
          {jobDescription.trim().length > 0 && <Tag color="purple">{jobDescription.trim().length} chars</Tag>}
        </div>

        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          loading={creatingChat}
          onClick={onSend}
          disabled={!selectedCvLabel || !jobDescription.trim() || creatingChat}
        >
          Send
        </Button>
      </div>
    </div>
  )
}