'use client'

import { SendOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'

type ChatMessageComposerProps = {
  message: string
  onMessageChange: (value: string) => void
  disabled: boolean
  sending: boolean
  onSend: () => void
}

export default function ChatMessageComposer({
  message,
  onMessageChange,
  disabled,
  sending,
  onSend,
}: ChatMessageComposerProps) {
  const canSend = message.trim().length > 0 && !disabled && !sending

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
      className="flex items-end gap-2"
    >
      <Input.TextArea
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        onPressEnter={(event) => {
          if (!event.shiftKey) {
            event.preventDefault()
            if (canSend) onSend()
          }
        }}
        autoSize={{ minRows: 1, maxRows: 5 }}
        disabled={disabled || sending}
        placeholder={disabled ? 'Exit edit mode to continue chatting' : 'Message CareerMate...'}
        aria-label="Chat message"
        className="!rounded-[18px] border-[#e5e7ef] bg-white !px-4 !py-3"
      />
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        icon={<SendOutlined />}
        loading={sending}
        disabled={!canSend}
        aria-label="Send message"
      >
        Send
      </Button>
    </form>
  )
}