'use client'

import type { FormEventHandler } from 'react'
import { Button, Input, Modal, Tag } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { CV } from '../models'

type CvSelectionModalProps = {
  open: boolean
  onClose: () => void
  cvs: CV[]
  selectedCvId: string
  onSelectCv: (id: string) => void
  uploadName: string
  onUploadNameChange: (value: string) => void
  uploadedFile: File | null
  onChooseFile: (file: File | null) => void
  fileInputRef: { current: HTMLInputElement | null }
  onUpload: FormEventHandler<HTMLFormElement>
  uploadingCv: boolean
  uploadError: string
}

export default function CvSelectionModal({
  open,
  onClose,
  cvs,
  selectedCvId,
  onSelectCv,
  uploadName,
  onUploadNameChange,
  uploadedFile,
  onChooseFile,
  fileInputRef,
  onUpload,
  uploadingCv,
  uploadError,
}: CvSelectionModalProps) {
  return (
    <Modal
      title="Choose or upload your CV"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-3 text-sm font-semibold text-[#2c3147]">Saved CVs</div>
          {cvs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e5e7ef] bg-[#f8f9ff] p-4 text-sm text-[#6a7289]">No CV files yet.</div>
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <button
                  key={cv.id}
                  type="button"
                  onClick={() => {
                    onSelectCv(cv.id)
                    onClose()
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left ${selectedCvId === cv.id ? 'border-[#cfc8ff] bg-[#f1efff]' : 'border-[#eef0f5] bg-white hover:border-[#dfe3ff]'}`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#1f2333]">{cv.name}</div>
                    <div className="truncate text-xs text-[#6a7289]">{cv.fileName}</div>
                  </div>
                  <Tag color="processing">{cv.contentType.split('/').pop()}</Tag>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={onUpload} className="rounded-[20px] border border-dashed border-[#dfe3ff] bg-[#f8f9ff] p-4">
          <div className="mb-3 text-sm font-semibold text-[#2c3147]">Upload a new CV</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input value={uploadName} onChange={(event) => onUploadNameChange(event.target.value)} placeholder="CV name" />
            <Button type="default" icon={<UploadOutlined />} block onClick={() => fileInputRef.current?.click()}>
              {uploadedFile?.name ?? 'Choose PDF / DOC / DOCX'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => onChooseFile(event.target.files?.[0] ?? null)}
            />
            <Button type="primary" htmlType="submit" block loading={uploadingCv}>
              Save CV
            </Button>
            {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}
          </div>
        </form>
      </div>
    </Modal>
  )
}