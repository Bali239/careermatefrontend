'use client'

import { Editor } from '@tinymce/tinymce-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Button, Card, Empty, Tag, Typography } from 'antd'
import {
  FolderOpenOutlined,
  MessageOutlined,
  RobotOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { useChatNavigation } from '../ChatNavigationContext'
import type { CV, ChatSession } from '../models'
import ChatMessageComposer from './ChatMessageComposer'
import CvSelectionModal from './CvSelectionModal'
import JobDescriptionComposer from './JobDescriptionComposer'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

function stripHtml(html: string) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  return (temp.textContent ?? temp.innerText ?? '').replace(/\s+/g, ' ').trim()
}

function toPlainText(html: string) {
  return stripHtml(html || '')
}

export default function ChatPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCvId, setSelectedCvId] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loadingCVs, setLoadingCVs] = useState(true)
  const [creatingChat, setCreatingChat] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { chatList, setChatList, activeChatId, setActiveChatId } = useChatNavigation()
  const [messageDraft, setMessageDraft] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [cvModalOpen, setCvModalOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const messagesViewport = useRef<HTMLDivElement>(null)

  const activeChat = useMemo(() => chatList.find((chat) => chat.id === activeChatId) ?? null, [activeChatId, chatList])
  const canChat = !activeChat || !activeChat.isEditing

  const loadCVs = useCallback(async () => {
    setLoadingCVs(true)
    try {
      const response = await api.get<{ data: CV[] }>('/cvs')
      const nextCvs = response.data.data
      setCvs(nextCvs)
      if (!selectedCvId && nextCvs[0]) setSelectedCvId(nextCvs[0].id)
      if (selectedCvId && !nextCvs.some((cv) => cv.id === selectedCvId)) setSelectedCvId(nextCvs[0]?.id ?? '')
    } catch {
      toast.error('Could not load your CVs.')
    } finally {
      setLoadingCVs(false)
    }
  }, [selectedCvId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCVs()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadCVs])

  useEffect(() => {
    setEditorHtml(activeChat?.draftHtml || activeChat?.analysis?.editableHtml || '')
  }, [activeChat?.id, activeChat?.draftHtml, activeChat?.analysis?.editableHtml])

  useEffect(() => {
    const viewport = messagesViewport.current
    if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [activeChat?.id, activeChat?.messages.length])

  const chooseFile = (selected: File | null) => {
    setUploadError('')
    if (!selected) return
    const ext = selected.name.toLowerCase().split('.').pop()
    if (!ACCEPTED.includes(selected.type) && !['pdf', 'doc', 'docx'].includes(ext ?? '')) {
      setUploadError('Choose a PDF, DOC, or DOCX file.')
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setUploadError('CV files must be 10 MB or smaller.')
      return
    }
    setUploadedFile(selected)
    if (!uploadName.trim()) setUploadName(selected.name.replace(/\.[^.]+$/, ''))
  }

  async function uploadInlineCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!uploadedFile) {
      setUploadError('Select a PDF or Word document first.')
      return
    }
    if (!uploadName.trim()) {
      setUploadError('Give this CV a name.')
      return
    }

    setUploadingCv(true)
    setUploadError('')
    try {
      await api.post('/cvs', uploadedFile, {
        headers: {
          'Content-Type': uploadedFile.type || (uploadedFile.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : uploadedFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword'),
          'X-File-Name': encodeURIComponent(uploadedFile.name),
          'X-CV-Name': encodeURIComponent(uploadName.trim()),
        },
        timeout: 60_000,
      })
      toast.success('Your CV was uploaded and saved in the CV library.')
      setUploadedFile(null)
      setUploadName('')
      if (fileInput.current) fileInput.current.value = ''
      await loadCVs()
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      setUploadError(responseMessage ?? 'Could not upload this CV. Please try again.')
    } finally {
      setUploadingCv(false)
    }
  }

  async function createNewChat() {
    if (!selectedCvId) {
      toast.error('Select a CV before analyzing it.')
      return
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      toast.error('Add a fuller job description before analyzing.')
      return
    }

    setCreatingChat(true)
    try {
      const response = await api.post<{ data: ChatSession }>('/chat', {
        cvId: selectedCvId,
        jobDescription: jobDescription.trim(),
        title: `Role fit: ${jobDescription.trim().slice(0, 48)}`,
      })
      setChatList((items) => [response.data.data, ...items])
      setActiveChatId(response.data.data.id)
      setMessageDraft('')
      toast.success('Your CV and job description are being analyzed.')
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not analyze this CV for the job description.')
    } finally {
      setCreatingChat(false)
    }
  }

  async function reAnalyzeCurrentChat() {
    if (!activeChat) return
    setCreatingChat(true)
    try {
      const response = await api.post<{ data: ChatSession }>('/chat', {
        cvId: activeChat.cvId,
        jobDescription: activeChat.jobDescription,
        title: activeChat.title,
      })
      setChatList((items) => [response.data.data, ...items.filter((chat) => chat.id !== activeChat.id)])
      setActiveChatId(response.data.data.id)
      toast.success('A refreshed ATS analysis has been generated.')
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not refresh the ATS analysis.')
    } finally {
      setCreatingChat(false)
    }
  }

  async function sendMessage() {
    if (!activeChat || !messageDraft.trim() || !canChat) return
    const text = messageDraft.trim()
    setMessageDraft('')
    setSendingMessage(true)
    try {
      const response = await api.post<{ data: ChatSession }>('/chat/' + activeChat.id + '/messages', { message: text })
      setChatList((items) => items.map((chat) => chat.id === activeChat.id ? response.data.data : chat))
      setActiveChatId(response.data.data.id)
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not send your message.')
    } finally {
      setSendingMessage(false)
    }
  }

  async function saveDraft() {
    if (!activeChat) return
    setSavingEdit(true)
    try {
      const response = await api.post<{ data: ChatSession }>('/chat/' + activeChat.id + '/edit', { draftHtml: editorHtml || '', isEditing: true })
      setChatList((items) => items.map((chat) => chat.id === activeChat.id ? response.data.data : chat))
      setActiveChatId(response.data.data.id)
      toast.success('Draft saved.')
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not save this draft.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function exitEditMode() {
    if (!activeChat) return
    try {
      const response = await api.post<{ data: ChatSession }>('/chat/' + activeChat.id + '/exit-edit')
      setChatList((items) => items.map((chat) => chat.id === activeChat.id ? response.data.data : chat))
      setActiveChatId(response.data.data.id)
      toast.success('Chat unlocked. You can continue talking.')
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not exit edit mode.')
    }
  }

  async function exportToPdf() {
    if (!activeChat) return
    const target = document.getElementById('cv-editor-export')
    if (!target) return
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imageRatio = canvas.width / canvas.height
    const renderedWidth = pageWidth
    const renderedHeight = renderedWidth / imageRatio
    const yOffset = Math.max((pageHeight - renderedHeight) / 2, 0)
    pdf.addImage(imgData, 'PNG', 0, yOffset, renderedWidth, renderedHeight)
    pdf.save(`${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  async function exportToDocx() {
    if (!activeChat) return
    const content = editorHtml || activeChat.analysis?.editableHtml || ''
    const normalized = toPlainText(content)
    const paragraphs = normalized
      ? normalized
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => new Paragraph({ children: [new TextRun({ text: line, break: 1 })] }))
      : [new Paragraph('No content to export.')]

    const doc = new Document({
      sections: [{ children: paragraphs }],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.docx`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const openCvModal = () => setCvModalOpen(true)
  const closeCvModal = () => setCvModalOpen(false)

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-white">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-[#ececf4] px-6 py-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c8ff1]">AI job-fit coach</div>
              <div className="mt-1 text-xl font-bold text-[#1f2333]">{activeChat ? activeChat.title : 'CV analysis workspace'}</div>
            </div>
          </div>

          <div ref={messagesViewport} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-[360px]">
              {!activeChat ? (
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
                      <Button type="default" size="large" icon={<FolderOpenOutlined />} onClick={openCvModal}>Select CV</Button>
                      <Button type="default" size="large" icon={<UploadOutlined />} onClick={openCvModal}>Upload CV</Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="mx-auto max-w-4xl space-y-5">
                  {activeChat.analysis && (
                    <Card className="rounded-[24px] border-[#ececf4] bg-[#f9f9ff]">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#dfe3ff] bg-[#eef0ff] p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5d4bc7]">ATS match</div>
                          <div className="mt-2 text-4xl font-bold text-[#2b2f73]">{activeChat.analysis.atsScore}%</div>
                        </div>
                        <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">Keywords</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeChat.analysis.keywords.length > 0 ? activeChat.analysis.keywords.map((keyword) => (
                              <Tag key={keyword} color="blue">{keyword}</Tag>
                            )) : <span className="text-sm text-[#7d8397]">No keywords extracted.</span>}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#edf1f5] bg-white p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8397]">Missing skills</div>
                          <div className="mt-3 space-y-1 text-sm text-[#3b4257]">
                            {activeChat.analysis.missingSkills.length > 0 ? activeChat.analysis.missingSkills.map((skill) => <div key={skill}>• {skill}</div>) : <div className="text-[#7d8397]">No major gaps detected.</div>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeChat.messages.length === 0 ? (
                    <Card className="mx-auto max-w-3xl rounded-[24px] border-[#ececf4] bg-white">
                      <Empty description="Start the conversation by asking for a rewrite, keyword match, or a stronger summary." />
                    </Card>
                  ) : (
                    <div className="mx-auto max-w-4xl space-y-4">
                      {activeChat.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`min-w-0 max-w-[85%] rounded-[22px] px-4 py-3 shadow-sm ${message.role === 'user' ? 'bg-[#1f2333] text-white' : 'bg-[#f3f5f9] text-[#1d2333]'}`}>
                            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">
                              {message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                              {message.role === 'user' ? 'You' : 'AI'}
                            </div>
                            <div className="whitespace-pre-wrap break-words text-[15px] leading-7">{message.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#ececf4] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:left-64">
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#e8eaf4] bg-[#f9faff] p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="default" icon={<FolderOpenOutlined />} onClick={openCvModal}>Select CV</Button>
            <Button type="default" icon={<UploadOutlined />} onClick={openCvModal}>Upload CV</Button>
            {activeChat && (
              <Button type="default" onClick={() => setEditorHtml(activeChat.draftHtml || activeChat.analysis?.editableHtml || '')}>
                Edit draft
              </Button>
            )}
          </div>

          {activeChat ? (
            <ChatMessageComposer
              message={messageDraft}
              onMessageChange={setMessageDraft}
              disabled={!canChat}
              sending={sendingMessage}
              onSend={() => void sendMessage()}
            />
          ) : (
            <JobDescriptionComposer
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              selectedCvLabel={selectedCvId ? cvs.find((cv) => cv.id === selectedCvId)?.name ?? 'Current CV' : null}
              creatingChat={creatingChat}
              onSend={() => void createNewChat()}
            />
          )}
        </div>
      </div>

      <CvSelectionModal
        open={cvModalOpen}
        onClose={closeCvModal}
        cvs={cvs}
        selectedCvId={selectedCvId}
        onSelectCv={setSelectedCvId}
        uploadName={uploadName}
        onUploadNameChange={setUploadName}
        uploadedFile={uploadedFile}
        onChooseFile={chooseFile}
        fileInputRef={fileInput}
        onUpload={uploadInlineCv}
        uploadingCv={uploadingCv}
        uploadError={uploadError}
      />
    </>
  )
}
