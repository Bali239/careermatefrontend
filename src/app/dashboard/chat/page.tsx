'use client'

import { Editor } from '@tinymce/tinymce-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { api } from '@/lib/axios'

type CV = { id: string; name: string; fileName: string; contentType: string; size: number; extractionStatus?: 'pending' | 'processing' | 'completed' | 'failed'; extractionError?: string; createdAt: string }
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; createdAt?: string }
type ChatSession = { id: string; title: string; cvId: string; jobDescription: string; analysis: { summary: string; atsScore: number; strengths: string[]; gaps: string[]; missingSkills: string[]; recommendations: string[]; keywords: string[]; tailoredSummary: string; editableHtml: string } | null; draftHtml: string; isEditing: boolean; status: 'idle' | 'analyzing' | 'done' | 'error'; error: string; messages: ChatMessage[]; createdAt?: string; updatedAt?: string }

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
  const [chatList, setChatList] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

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

  const loadChats = useCallback(async () => {
    setChatLoading(true)
    try {
      const response = await api.get<{ data: ChatSession[] }>('/chat')
      setChatList(response.data.data)
      if (!activeChatId && response.data.data[0]) setActiveChatId(response.data.data[0].id)
    } catch {
      toast.error('Could not load your chat history.')
    } finally {
      setChatLoading(false)
    }
  }, [activeChatId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCVs()
      void loadChats()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadCVs, loadChats])

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

  async function sendMessage() {
    if (!activeChat || !messageDraft.trim() || !canChat) return
    const text = messageDraft.trim()
    setMessageDraft('')
    try {
      const response = await api.post<{ data: ChatSession }>('/chat/' + activeChat.id + '/messages', { message: text })
      setChatList((items) => items.map((chat) => chat.id === activeChat.id ? response.data.data : chat))
      setActiveChatId(response.data.data.id)
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(responseMessage ?? 'Could not send your message.')
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
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff' })
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  async function exportToDocx() {
    if (!activeChat) return
    const text = toPlainText(editorHtml || activeChat.analysis?.editableHtml || '')
    const doc = new Document({
      sections: [{
        children: text ? text.split(/\n|\.|\!|\?/).filter(Boolean).map((line) => new Paragraph({ children: [new TextRun({ text: line.trim(), break: 1 })] })) : [new Paragraph('No content to export.')],
      }],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.docx`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10 text-slate-900">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">AI job-fit coach</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">CV chat</h1>
          <p className="mt-2 text-slate-600">Choose a CV, paste the job description, and let Gemini highlight what to improve.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">1. Pick a CV</h2>
            {loadingCVs ? <div className="mt-3 text-sm text-slate-500">Loading CVs…</div> : (
              <div className="mt-3 space-y-2">
                {cvs.length ? cvs.map((cv) => (
                  <button key={cv.id} type="button" onClick={() => setSelectedCvId(cv.id)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${selectedCvId === cv.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
                    <span className="min-w-0"><span className="block truncate font-medium">{cv.name}</span><span className="block truncate text-xs text-slate-500">{cv.fileName}</span></span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{cv.contentType.split('/').pop()}</span>
                  </button>
                )) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No CVs yet. Upload one below.</p>}
              </div>
            )}
          </div>

          <form onSubmit={uploadInlineCv} className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Upload new CV</h3>
            <input value={uploadName} onChange={(event) => setUploadName(event.target.value)} placeholder="CV name" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-600">
              <span className="truncate">{uploadedFile?.name ?? 'Choose PDF/DOC/DOCX'}</span>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Browse</span>
            </button>
            <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
            <button type="submit" disabled={uploadingCv} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{uploadingCv ? 'Uploading…' : 'Save CV to library'}</button>
            {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
          </form>
        </aside>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700">2. Job description</label>
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={8} placeholder="Paste the job description here..." className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500">{activeChat ? `Current conversation: ${activeChat.title}` : 'Start a new chat on the selected CV'}</div>
            <button type="button" onClick={() => void createNewChat()} disabled={creatingChat || !selectedCvId || !jobDescription.trim()} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{creatingChat ? 'Analyzing…' : 'Analyze my CV'}</button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat history</h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{chatList.length} saved</span>
            </div>
            <div className="max-h-56 space-y-2 overflow-auto pr-1">
              {chatLoading ? <div className="text-sm text-slate-500">Loading conversations…</div> : chatList.length ? chatList.map((chat) => (
                <button key={chat.id} type="button" onClick={() => {
                  setActiveChatId(chat.id)
                  setEditorHtml(chat.draftHtml || chat.analysis?.editableHtml || '')
                }} className={`w-full rounded-xl border px-3 py-2 text-left transition ${chat.id === activeChatId ? 'border-indigo-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{chat.title}</span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">{chat.status}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">{chat.analysis?.summary ?? chat.jobDescription}</div>
                </button>
              )) : <p className="text-sm text-slate-500">No saved conversations yet.</p>}
            </div>
          </div>

          {activeChat && (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-semibold">{activeChat.title}</h3>
                  <p className="text-xs text-slate-500">ATS road map for your chosen CV</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeChat.isEditing ? <button type="button" onClick={() => void exitEditMode()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Exit edit mode</button> : <button type="button" onClick={() => {
                    if (!activeChat) return
                    setEditorHtml(activeChat.draftHtml || activeChat.analysis?.editableHtml || '')
                    void api.post('/chat/' + activeChat.id + '/edit', { draftHtml: activeChat.draftHtml || activeChat.analysis?.editableHtml || '', isEditing: true })
                    setChatList((items) => items.map((chat) => chat.id === activeChat.id ? { ...chat, isEditing: true } : chat))
                  }} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Edit CV</button>}
                </div>
              </div>

              {activeChat.analysis && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">ATS match</p>
                    <div className="mt-2 text-3xl font-bold text-indigo-800">{activeChat.analysis.atsScore}%</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Keywords</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {activeChat.analysis.keywords.length ? activeChat.analysis.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{keyword}</span>) : <span className="text-slate-500">No keywords extracted.</span>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Missing skills</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      {activeChat.analysis.missingSkills.length ? activeChat.analysis.missingSkills.map((skill) => <div key={skill}>• {skill}</div>) : <div className="text-slate-500">None flagged.</div>}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {activeChat.messages.map((message) => (
                  <div key={message.id} className={`max-w-3xl rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <div className="whitespace-pre-wrap leading-6">{message.text}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">Send a follow-up</label>
                <textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} rows={4} disabled={!canChat} placeholder={canChat ? 'Ask the assistant to tailor wording, rewrite achievements, or suggest stronger keywords...' : 'Finish or exit edit mode before continuing the chat.'} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60" />
                <div className="flex justify-end"><button type="button" onClick={() => void sendMessage()} disabled={!canChat || !messageDraft.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">Send</button></div>
              </div>

              <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Edited CV draft</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void saveDraft()} disabled={savingEdit} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">{savingEdit ? 'Saving…' : 'Save draft'}</button>
                    <button type="button" onClick={() => void exportToPdf()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">PDF</button>
                    <button type="button" onClick={() => void exportToDocx()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">DOCX</button>
                  </div>
                </div>
                <Editor
                  value={editorHtml}
                  onEditorChange={(value) => setEditorHtml(value ?? '')}
                  disabled={!activeChat.isEditing}
                  apiKey="no-api-key"
                  init={{
                    height: 420,
                    menubar: false,
                    plugins: ['advlist','autolink','lists','link','image','charmap','preview','anchor','searchreplace','wordcount','table'],
                    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link',
                    content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; } h1,h2,h3 { color: #111827; }',
                    placeholder: 'Edit your CV content here...',
                    skin: 'oxide',
                    branding: false,
                  }}
                  onInit={() => setEditorHtml(activeChat.draftHtml || activeChat.analysis?.editableHtml || '')}
                />
                <div id="cv-editor-export" className="hidden" dangerouslySetInnerHTML={{ __html: editorHtml || activeChat.analysis?.editableHtml || '' }} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
