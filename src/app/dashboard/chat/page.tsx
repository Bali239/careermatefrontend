'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { chatService } from '@/lib/services/chat.service';
import { cvService } from '@/lib/services/cv.service';
import { useChatNavigation } from '../ChatNavigationContext';
import type { CV, ChatSession } from '../models';
import NewAnalysisWorkspace from './NewAnalysisWorkspace';
import ChatConversationPanel from './ChatConversationPanel';

export default function ChatPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const { chatList, setChatList, activeChatId, selectChat } = useChatNavigation();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('Preparing your CV');

  useEffect(() => {
    if (!creatingChat) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1500) {
        setAnalysisProgress(12);
        setAnalysisStage('Preparing your CV');
      } else if (elapsed < 5000) {
        setAnalysisProgress(30);
        setAnalysisStage('Reading your experience');
      } else if (elapsed < 11000) {
        setAnalysisProgress(55);
        setAnalysisStage('Matching skills to the role');
      } else if (elapsed < 18000) {
        setAnalysisProgress(74);
        setAnalysisStage('Evaluating fit and ATS readiness');
      } else {
        setAnalysisProgress((current) => Math.min(92, current + 1));
        setAnalysisStage('Finishing your analysis');
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [creatingChat]);

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
    const hasPendingExtraction = cvs.some(
      (cv) => cv.extractionStatus === 'pending' || cv.extractionStatus === 'processing'
    );
    if (!hasPendingExtraction) return;
    const timer = window.setInterval(() => {
      void loadCVs();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [cvs, loadCVs]);

  async function createNewChat() {
    if (creatingChat) return;
    if (!selectedCvId) {
      toast.info('Select a CV from your library before starting the analysis.');
      return;
    }
    const selectedCv = cvs.find((cv) => cv.id === selectedCvId);
    if (selectedCv?.extractionStatus !== 'completed') {
      toast.info('Your CV is still being prepared. Please wait until extraction is complete.');
      void loadCVs();
      return;
    }
    const description = jobDescription.trim();
    if (description.length < 20 || description.length > 8000) {
      toast.info('Please add at least 20 characters to the job description before scanning.');
      return;
    }

    setCreatingChat(true);
    setAnalysisProgress(8);
    setAnalysisStage('Preparing your CV');
    try {
      const created = await chatService.create({
        cvId: selectedCvId,
        jobDescription: description,
        title: `Role fit: ${description.slice(0, 48)}`,
      });
      setChatList((items) => [created, ...items.filter((chat) => chat.id !== created.id)]);
      setAnalysisProgress(100);
      selectChat(created.id);
      toast.success('Analysis complete — your Gemini-powered CV match is ready.');
    } catch (reason: unknown) {
      setAnalysisProgress(0);
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
      const blob = await chatService.download(activeChat.id, versionId, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      link.click();
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
          analysisProgress={analysisProgress}
          analysisStage={analysisStage}
        />
      )}
    </>
  );
}
