'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/axios'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { toast } from 'sonner'

type CV = { id: string; name: string; fileName: string; contentType: string; size: number; extractionStatus?: 'pending' | 'processing' | 'completed' | 'failed'; extractionError?: string; createdAt: string }
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const sizeLabel = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`

export default function CVPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [previewCV, setPreviewCV] = useState<CV | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [cvToDelete, setCVToDelete] = useState<CV | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const loadCVs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<{ data: CV[] }>('/cvs', { params: search.trim() ? { search: search.trim() } : {} })
      setCvs(response.data.data)
      setError('')
    } catch {
      setError('Could not load your CVs. Please try again.')
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { const timer = window.setTimeout(() => { void loadCVs() }, 250); return () => window.clearTimeout(timer) }, [loadCVs])
  useEffect(() => {
    if (!cvs.some((cv) => cv.extractionStatus === 'pending' || cv.extractionStatus === 'processing')) return
    const timer = window.setInterval(() => { void loadCVs() }, 3000)
    return () => window.clearInterval(timer)
  }, [cvs, loadCVs])

  const chooseFile = (selected: File | null) => {
    setError(''); setFile(null)
    if (!selected) return
    const ext = selected.name.toLowerCase().split('.').pop()
    if (!ACCEPTED.includes(selected.type) && !['pdf', 'doc', 'docx'].includes(ext ?? '')) { setError('Choose a PDF, DOC, or DOCX file.'); return }
    if (selected.size > MAX_FILE_SIZE) { setError('CV files must be 10 MB or smaller.'); return }
    setFile(selected)
    if (!name.trim()) setName(selected.name.replace(/\.[^.]+$/, ''))
  }

  async function uploadCV(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) { setError('Select a PDF or Word document first.'); return }
    if (!name.trim()) { setError('Give this CV a name.'); return }
    setUploading(true); setError('')
    try {
      await api.post('/cvs', file, { headers: { 'Content-Type': file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword'), 'X-File-Name': encodeURIComponent(file.name), 'X-CV-Name': encodeURIComponent(name.trim()) }, timeout: 60_000 })
      toast.success('Your CV was uploaded. Profile details are being extracted.')
      setFile(null); setName('')
      if (fileInput.current) fileInput.current.value = ''
      await loadCVs()
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(responseMessage ?? 'Could not upload this CV. Please try again.')
    } finally { setUploading(false) }
  }

  async function deleteCV(cv: CV) {
    setBusyId(cv.id); setError('')
    try { await api.delete(`/cvs/${cv.id}`); setCvs((items) => items.filter((item) => item.id !== cv.id)); toast.success('CV deleted.'); setCVToDelete(null) }
    catch { setError('Could not delete this CV. Please try again.') }
    finally { setBusyId(null) }
  }

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  async function openCV(cv: CV) {
    setError(''); setPreviewCV(cv)
    if (cv.contentType !== 'application/pdf') {
      setPreviewUrl(null)
      return
    }
    setPreviewLoading(true); setPreviewUrl(null)
    try {
      const response = await api.get(`/cvs/${cv.id}/file`, { responseType: 'blob' })
      setPreviewUrl(URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })))
    } catch { setError('Could not open this CV. Please try again.') }
    finally { setPreviewLoading(false) }
  }

  async function downloadCV(cv: CV) {
    setBusyId(cv.id); setError('')
    try {
      const response = await api.get(`/cvs/${cv.id}/file`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: cv.contentType }))
      const link = document.createElement('a'); link.href = url; link.download = cv.fileName; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch { setError('Could not download this CV. Please try again.') }
    finally { setBusyId(null) }
  }

  const countLabel = useMemo(() => `${cvs.length} ${cvs.length === 1 ? 'CV' : 'CVs'}`, [cvs.length])

  return <div className="mx-auto max-w-5xl space-y-8 pb-10 text-slate-900">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Your documents</p><h1 className="mt-2 text-3xl font-bold tracking-tight">CV library</h1><p className="mt-2 text-slate-600">Store and manage the CVs linked to your account.</p></div>
      <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">{countLabel}</span>
    </header>

    <form onSubmit={uploadCV} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5"><h2 className="text-lg font-semibold">Upload a CV</h2><p className="mt-1 text-sm text-slate-500">PDF or Word document, up to 10 MB.</p></div>
      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <label className="block text-sm font-medium text-slate-700">CV name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="e.g. Product Designer CV" className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
        <div><span className="block text-sm font-medium text-slate-700">Document</span><button type="button" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0] ?? null) }} className="mt-2 flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50/40"><span className="truncate text-sm text-slate-600">{file?.name ?? 'Choose a file or drop it here'}</span><span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm">Browse</span></button><input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-slate-500">The document name will be used when no CV name is entered.</p><button disabled={uploading} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{uploading ? 'Uploading…' : 'Upload CV'}</button></div>
    </form>

    {error && <p role="status" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Saved CVs</h2><p className="mt-1 text-sm text-slate-500">Search by CV or document name.</p></div><label className="relative w-full sm:w-72"><span className="sr-only">Search CVs</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your CVs" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></label></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading your CVs…</div> : cvs.length ? <ul className="divide-y divide-slate-100">{cvs.map((cv) => <li key={cv.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex min-w-0 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold uppercase text-indigo-700">{cv.fileName.split('.').pop()}</div><div className="min-w-0"><h3 className="truncate font-semibold">{cv.name}</h3><p className="mt-1 truncate text-sm text-slate-500">{cv.fileName} <span className="px-1">·</span>{sizeLabel(cv.size)} <span className="px-1">·</span>{new Date(cv.createdAt).toLocaleDateString()}</p><p className={`mt-1 text-xs font-medium ${cv.extractionStatus === 'failed' ? 'text-rose-600' : cv.extractionStatus === 'completed' ? 'text-emerald-700' : 'text-indigo-600'}`}>{cv.extractionStatus === 'completed' ? 'Profile details extracted' : cv.extractionStatus === 'failed' ? 'Profile extraction failed — open Profile to retry' : 'AI is reading this CV…'}</p></div></div><div className="flex shrink-0 gap-2"><button onClick={() => void openCV(cv)} className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50">Open</button><button onClick={() => void downloadCV(cv)} disabled={busyId === cv.id} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Download</button><button onClick={() => setCVToDelete(cv)} disabled={busyId === cv.id} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">Delete</button></div></li>)}</ul> : <div className="p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M9 14h6m-6 3h6"/></svg></div><h3 className="mt-4 font-semibold">{search ? 'No matching CVs' : 'No CVs uploaded yet'}</h3><p className="mt-1 text-sm text-slate-500">{search ? 'Try a different search.' : 'Upload a CV above to get started.'}</p></div>}
      </div>
    </section>
    {previewCV && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="cv-preview-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewCV(null) }}>
      <div className="flex h-[min(92dvh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div className="min-w-0"><h2 id="cv-preview-title" className="truncate font-semibold">{previewCV.name}</h2><p className="truncate text-xs text-slate-500">{previewCV.fileName}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => void downloadCV(previewCV)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Download</button><button onClick={() => setPreviewCV(null)} aria-label="Close preview" className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-500 hover:bg-slate-100">×</button></div></div>
        <div className="min-h-0 flex-1 bg-slate-100">{previewCV.contentType === 'application/pdf' ? previewLoading ? <div className="grid h-full place-items-center text-sm text-slate-500">Loading preview…</div> : previewUrl ? <iframe title={`Preview of ${previewCV.name}`} src={previewUrl} className="h-full w-full border-0" /> : <div className="grid h-full place-items-center text-sm text-rose-700">Could not load this CV preview.</div> : <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center px-6 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-sm font-bold uppercase text-indigo-700">{previewCV.fileName.split('.').pop()}</div><h3 className="mt-5 text-lg font-semibold">Word preview isn’t available here</h3><p className="mt-2 text-sm leading-6 text-slate-600">This document is stored safely, but Word files need a document viewer or conversion before they can display in the app. Download it to open it with a compatible app.</p><button onClick={() => void downloadCV(previewCV)} disabled={busyId === previewCV.id} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{busyId === previewCV.id ? 'Preparing…' : 'Download document'}</button></div>}</div>
      </div>
    </div>}
    <ConfirmModal open={Boolean(cvToDelete)} title="Delete this CV?" description={cvToDelete ? `“${cvToDelete.name}” and its uploaded file will be permanently removed.` : ''} confirmLabel="Delete CV" destructive loading={Boolean(cvToDelete && busyId === cvToDelete.id)} onCancel={() => setCVToDelete(null)} onConfirm={() => cvToDelete ? deleteCV(cvToDelete) : undefined} />
  </div>
}
