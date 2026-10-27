'use client';

import { Editor } from '@tinymce/tinymce-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { chatService } from '@/lib/services/chat.service';
import { cvService } from '@/lib/services/cv.service';
import { useChatNavigation } from '../ChatNavigationContext';
import type { CV, ChatSession } from '../models';
import NewAnalysisWorkspace from './NewAnalysisWorkspace';
import ChatComposer from './ChatComposer';
import ChatConversationPanel from './ChatConversationPanel';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function stripHtml(html: string) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return (temp.textContent ?? temp.innerText ?? '').replace(/\s+/g, ' ').trim();
}

function toPlainText(html: string) {
  return stripHtml(html || '');
}

export default function ChatPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { chatList, setChatList, activeChatId, selectChat } = useChatNavigation();
  const [messageDraft, setMessageDraft] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const messagesViewport = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => chatList.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chatList]
  );
  const canChat = !activeChat || !activeChat.isEditing;

  const loadCVs = useCallback(async () => {
    setLoadingCVs(true);
    try {
      const nextCvs = await cvService.list();
      setCvs(nextCvs);
    } catch {
      toast.error('Could not load your CVs.');
    } finally {
      setLoadingCVs(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCVs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCVs]);

  useEffect(() => {
    setEditorHtml(activeChat?.draftHtml || activeChat?.analysis?.editableHtml || '');
  }, [activeChat?.id, activeChat?.draftHtml, activeChat?.analysis?.editableHtml]);

  useEffect(() => {
    const viewport = messagesViewport.current;
    if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [activeChat?.id, activeChat?.messages.length]);

  const chooseFile = (selected: File | null) => {
    setUploadError('');
    setUploadedFile(null);
    if (!selected) {
      setUploadName('');
      return;
    }
    const ext = selected.name.toLowerCase().split('.').pop();
    if (!ACCEPTED.includes(selected.type) && !['pdf', 'doc', 'docx'].includes(ext ?? '')) {
      setUploadError('Choose a PDF, DOC, or DOCX file.');
      setUploadName('');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setUploadError('CV files must be 10 MB or smaller.');
      setUploadName('');
      return;
    }
    setUploadedFile(selected);
    setUploadName(selected.name.replace(/\.[^.]+$/, '').slice(0, 120));
  };

  async function uploadInlineCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadedFile) {
      setUploadError('Select a PDF or Word document first.');
      return;
    }
    setUploadingCv(true);
    setUploadError('');
    try {
      const cvName = uploadName.trim() || uploadedFile.name.replace(/\.[^.]+$/, '').slice(0, 120);
      const createdCv = await cvService.upload(uploadedFile, cvName);
      setCvs((items) => [createdCv, ...items.filter((cv) => cv.id !== createdCv.id)]);
      setSelectedCvId(createdCv.id);
      toast.success('Your CV was uploaded and saved in the CV library.');
      setUploadedFile(null);
      setUploadName('');
      if (fileInput.current) fileInput.current.value = '';
      await loadCVs();
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      setUploadError(responseMessage ?? 'Could not upload this CV. Please try again.');
    } finally {
      setUploadingCv(false);
    }
  }

  async function createNewChat() {
    if (creatingChat) return;
    if (!selectedCvId) {
      toast.error('Select a CV before analyzing it.');
      return;
    }
    const description = jobDescription.trim();
    if (description.length < 20 || description.length > 8000) {
      toast.error('Add a fuller job description before analyzing.');
      return;
    }

    setCreatingChat(true);
    try {
      const created = await chatService.create({
        cvId: selectedCvId,
        jobDescription: description,
        title: `Role fit: ${description.slice(0, 48)}`,
      });
      setChatList((items) => [created, ...items]);
      selectChat(created.id);
      setMessageDraft('');
      toast.success('Your CV and job description are being analyzed.');
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not analyze this CV for the job description.');
    } finally {
      setCreatingChat(false);
    }
  }

  async function sendMessage() {
    if (!activeChat || !messageDraft.trim() || !canChat) return;
    const text = messageDraft.trim();
    setMessageDraft('');
    setSendingMessage(true);
    try {
      const updated = await chatService.sendMessage(activeChat.id, text);
      setChatList((items) => items.map((chat) => (chat.id === activeChat.id ? updated : chat)));
      selectChat(updated.id);
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not send your message.');
    } finally {
      setSendingMessage(false);
    }
  }

  async function saveDraft() {
    if (!activeChat) return;
    setSavingEdit(true);
    try {
      const updated = await chatService.editDraft(activeChat.id, editorHtml || '', true);
      setChatList((items) => items.map((chat) => (chat.id === activeChat.id ? updated : chat)));
      selectChat(updated.id);
      toast.success('Draft saved.');
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not save this draft.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function exitEditMode() {
    if (!activeChat) return;
    try {
      const updated = await chatService.exitEditMode(activeChat.id);
      setChatList((items) => items.map((chat) => (chat.id === activeChat.id ? updated : chat)));
      selectChat(updated.id);
      toast.success('Chat unlocked. You can continue talking.');
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not exit edit mode.');
    }
  }

  const [rewritingChat, setRewritingChat] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'docx' | 'pdf' | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState('');

  async function rewriteCurrentCv() {
    if (!activeChat) return;
    setRewritingChat(true);
    try {
      const updated = await chatService.rewrite(activeChat.id);
      setChatList((items) => items.map((chat) => (chat.id === activeChat.id ? updated : chat)));
      selectChat(updated.id);
      toast.success('A tailored CV version is being generated for download.');
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not generate the rewritten CV.');
    } finally {
      setRewritingChat(false);
    }
  }

  async function downloadGeneratedVersion(versionId: string, format: 'docx' | 'pdf') {
    if (!activeChat) return;
    setDownloadingVersionId(versionId);
    setDownloadingFormat(format);
    try {
      const blob = await chatService.downloadGenerated(activeChat.id, versionId, format);
      const url = URL.createObjectURL(blob);
      const version = activeChat.generatedCvVersions?.find((entry) => entry.id === versionId);
      const downloadName =
        format === 'pdf'
          ? version?.pdfFileName || `${(activeChat.title || 'rewrite').replace(/\s+/g, '-').toLowerCase()}.pdf`
          : version?.docxFileName || `${(activeChat.title || 'rewrite').replace(/\s+/g, '-').toLowerCase()}.docx`;
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success(`Downloaded the ${format.toUpperCase()} version.`);
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not download the generated CV.');
    } finally {
      setDownloadingVersionId('');
      setDownloadingFormat(null);
    }
  }

  async function exportToPdf() {
    if (!activeChat) return;
    const target = document.getElementById('cv-editor-export');
    if (!target) return;
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageRatio = canvas.width / canvas.height;
    const renderedWidth = pageWidth;
    const renderedHeight = renderedWidth / imageRatio;
    const yOffset = Math.max((pageHeight - renderedHeight) / 2, 0);
    pdf.addImage(imgData, 'PNG', 0, yOffset, renderedWidth, renderedHeight);
    pdf.save(`${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }

  async function exportToDocx() {
    if (!activeChat) return;
    const content = editorHtml || activeChat.analysis?.editableHtml || '';
    const normalized = toPlainText(content);
    const paragraphs = normalized
      ? normalized
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => new Paragraph({ children: [new TextRun({ text: line, break: 1 })] }))
      : [new Paragraph('No content to export.')];

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeChat.title || 'cv-draft').replace(/\s+/g, '-').toLowerCase()}.docx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return (
    <>
      {activeChat ? (
        <>
          <ChatConversationPanel
            activeChat={activeChat}
            messagesViewport={messagesViewport}
            onRewrite={() => void rewriteCurrentCv()}
            onDownloadGenerated={(versionId, format) => void downloadGeneratedVersion(versionId, format)}
            rewriting={rewritingChat}
            downloadingVersionId={downloadingVersionId}
            downloadingFormat={downloadingFormat ?? undefined}
          />
          <div className="fixed inset-x-0 bottom-0 z-20 px-4 py-3 md:left-64">
            <div className="mx-auto max-w-4xl rounded-[20px] border border-[#e8eaf4] bg-[#f9faff] p-3">
            <ChatComposer
              mode="message"
              value={messageDraft}
              onChange={setMessageDraft}
              selectedCvLabel={cvs.find((cv) => cv.id === activeChat.cvId)?.name ?? 'Current CV'}
              disabled={!canChat}
              submitting={sendingMessage}
              onSubmit={() => void sendMessage()}
              onEditDraft={() =>
                setEditorHtml(activeChat.draftHtml || activeChat.analysis?.editableHtml || '')
              }
            />
            </div>
          </div>
        </>
      ) : (
        <NewAnalysisWorkspace
          cvs={cvs}
          loadingCVs={loadingCVs}
          selectedCvId={selectedCvId}
          onSelectCv={setSelectedCvId}
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          onCreateChat={() => void createNewChat()}
          creatingChat={creatingChat}
          uploadName={uploadName}
          onUploadNameChange={setUploadName}
          uploadedFile={uploadedFile}
          onChooseFile={chooseFile}
          fileInputRef={fileInput}
          onUpload={uploadInlineCv}
          uploadingCv={uploadingCv}
          uploadError={uploadError}
        />
      )}
    </>
  );
}
