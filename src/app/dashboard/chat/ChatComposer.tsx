'use client'

import { EditOutlined, FolderOpenOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Input, Tag, Tooltip } from 'antd'

type SharedComposerProps = {
  value: string
  onChange: (value: string) => void
  submitting: boolean
  onSubmit: () => void
}

type AnalysisComposerProps = SharedComposerProps & {
  mode: 'analysis'
  selectedCvLabel: string | null
  onSelectCv: () => void
}

type MessageComposerProps = SharedComposerProps & {
  mode: 'message'
  selectedCvLabel: string
  disabled: boolean
  onEditDraft: () => void
}

type ChatComposerProps = AnalysisComposerProps | MessageComposerProps

export default function ChatComposer(props: ChatComposerProps) {
  const isMessageMode = props.mode === 'message'
  const disabled = props.submitting || (isMessageMode ? props.disabled : !props.selectedCvLabel)
  const canSubmit = props.value.trim().length > 0 && !disabled

  const submit = () => {
    if (canSubmit) props.onSubmit()
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex min-w-0 items-center gap-2 rounded-[20px] border  bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(31,35,51,0.03)] transition-colors focus-within:border-[#b9b0f3]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Input.TextArea
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          onPressEnter={(event) => {
            if (isMessageMode && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          autoSize={{ minRows: 1, maxRows: isMessageMode ? 4 : 6 }}
          disabled={disabled}
          placeholder={isMessageMode ? (props.disabled ? 'Exit edit mode to continue' : 'Message CareerMate...') : 'Paste job description...'}
          aria-label={isMessageMode ? 'Chat message' : 'Job description'}
          className="!my-0.5 !resize-none !rounded-none !border-0 !bg-transparent !px-0 !py-1 !shadow-none focus:!shadow-none"
        />

        <div className="flex shrink-0 items-center gap-1.5">
          {isMessageMode ? (
            <>
              <Tag color="geekblue" className="!m-0 max-w-[140px] truncate">{props.selectedCvLabel}</Tag>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={props.onEditDraft} className="!h-7 !px-1.5 text-xs">
                Edit
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Select CV">
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<FolderOpenOutlined />}
                  aria-label="Select CV"
                  onClick={props.onSelectCv}
                  className="!h-7 !w-7"
                />
              </Tooltip>
              <span className="max-w-[120px] truncate text-xs text-[#6f748a] sm:max-w-[180px]">
                {props.selectedCvLabel ?? 'Select CV'}
              </span>
              {props.value.trim().length > 0 && (
                <span className="hidden text-[10px] text-[#9094a8] sm:inline">{props.value.trim().length}c</span>
              )}
            </>
          )}
        </div>
      </div>

      <Tooltip title={isMessageMode ? 'Send message' : 'Analyze CV'}>
        <Button
          type="primary"
          shape="circle"
          size="middle"
          htmlType="submit"
          icon={<SendOutlined />}
          loading={props.submitting}
          disabled={!canSubmit}
          aria-label={isMessageMode ? 'Send message' : 'Analyze CV'}
          className="!flex !h-8 !w-8 shrink-0 items-center justify-center"
        />
      </Tooltip>
    </form>
  )
}