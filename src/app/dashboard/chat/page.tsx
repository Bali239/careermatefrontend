'use client';

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
  const { chatList, setChatList, activeChatId, selectChat } = useChatNavigation();
  const [editorHtml, setEditorHtml] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeChat = useMemo(
    () => chatList.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chatList]
  );

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
      toast.success('Your CV and job description are being analyzed.');
    } catch (reason: unknown) {
      const responseMessage = (reason as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(responseMessage ?? 'Could not analyze this CV for the job description.');
    } finally {
      setCreatingChat(false);
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
      const version = activeChat.generatedCvVersions?.find((entry) => entry.id === versionId);
      const baseName = (activeChat.title || 'tailored-cv')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .toLowerCase();
      const downloadName =
        format === 'pdf'
          ? version?.pdfFileName || `${baseName}.pdf`
          : version?.docxFileName || `${baseName}.docx`;
      const content = editorHtml || activeChat.draftHtml || activeChat.analysis?.editableHtml || '';

      if (format === 'pdf') {
        const printable = document.createElement('div');
        printable.innerHTML = content;
        Object.assign(printable.style, {
          position: 'fixed',
          left: '-10000px',
          top: '0',
          width: '794px',
          padding: '36px',
          background: '#ffffff',
          color: '#111827',
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: '1.5',
        });
        document.body.appendChild(printable);
        const canvas = await html2canvas(printable, { scale: 2, backgroundColor: '#ffffff' });
        printable.remove();

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const renderedHeight = (canvas.height * pageWidth) / canvas.width;
        const pageCount = Math.ceil(renderedHeight / pageHeight);
        const image = canvas.toDataURL('image/png');
        for (let page = 0; page < pageCount; page += 1) {
          if (page > 0) pdf.addPage();
          pdf.addImage(image, 'PNG', 0, -page * pageHeight, pageWidth, renderedHeight);
        }
        pdf.save(downloadName);
      } else {
        const plainText = toPlainText(content);
        const paragraphs = plainText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => new Paragraph({ children: [new TextRun({ text: line })] }));
        const blob = await Packer.toBlob(new Document({ sections: [{ children: paragraphs }] }));
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }

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

  return (
    <>
      {activeChat ? (
        <>
          <ChatConversationPanel
            activeChat={activeChat}
            onRewrite={() => void rewriteCurrentCv()}
            onDownloadGenerated={(versionId, format) =>
              void downloadGeneratedVersion(versionId, format)
            }
            rewriting={rewritingChat}
            downloadingVersionId={downloadingVersionId}
            downloadingFormat={downloadingFormat ?? undefined}
            rewriteCount={activeChat.generatedCvVersions?.length ?? 0}
            maxRewrites={3}
          />
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
