'use client';

import {
  CheckCircleFilled,
  ClearOutlined,
  FileTextOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Input, Spin, Tag, Tooltip } from 'antd';
import type { CV } from '../models';

type NewAnalysisWorkspaceProps = {
  cvs: CV[];
  loadingCVs: boolean;
  selectedCvId: string;
  onSelectCv: (id: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onCreateChat: () => void;
  creatingChat: boolean;
  analysisProgress: number;
  analysisStage: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toUpperCase() ?? 'FILE';
}

function Step({ number, label, complete }: { number: number; label: string; complete?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center text-[10px] font-medium text-[#686b7d] sm:flex-row sm:gap-2 sm:text-left sm:text-sm">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full border ${
          complete
            ? 'border-[#7c6de2] bg-[#7c6de2] text-white'
            : 'border-[#dedbea] bg-white text-[#77748d]'
        }`}
      >
        {complete ? <CheckCircleFilled /> : number}
      </span>
      <span className="max-w-19 leading-4 sm:max-w-none">{label}</span>
    </div>
  );
}

export default function NewAnalysisWorkspace({
  cvs,
  loadingCVs,
  selectedCvId,
  onSelectCv,
  jobDescription,
  onJobDescriptionChange,
  onCreateChat,
  creatingChat,
  analysisProgress,
  analysisStage,
}: NewAnalysisWorkspaceProps) {
  const selectedCv = cvs.find((cv) => cv.id === selectedCvId) ?? null;
  const descriptionLength = jobDescription.trim().length;
  const descriptionValid = descriptionLength >= 20 && descriptionLength <= 8000;
  const canScan = Boolean(selectedCv) && descriptionValid && !creatingChat;

  return (
    <div className="relative h-full min-h-0 overflow-y-auto bg-[#f7f7fb] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-290 pb-8">
        <header className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 grid size-11 place-items-center rounded-2xl border border-[#e4dff8] bg-white text-[#7565d7] shadow-sm">
            <RobotOutlined className="text-lg" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a6bd6]">
            AI job scan
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-[#25243a] sm:text-3xl">
            Ready to find your next opportunity?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#737184] sm:text-base">
            Match your CV with a job description and discover how well you fit the role.
          </p>
        </header>

        <nav aria-label="Analysis steps" className="mx-auto my-7 flex w-full max-w-2xl items-center justify-center gap-1 sm:gap-7">
          <Step number={1} label="Add job description" complete={descriptionValid} />
          <span aria-hidden="true" className="hidden h-px w-5 shrink-0 bg-[#ddd9e8] sm:block sm:w-10" />
          <Step number={2} label="Select CV" complete={Boolean(selectedCv)} />
          <span aria-hidden="true" className="hidden h-px w-5 shrink-0 bg-[#ddd9e8] sm:block sm:w-10" />
          <Step number={3} label="Analyze match" />
        </nav>

        <div className="grid items-stretch gap-5 md:grid-cols-2">
          <section className="flex min-h-127.5 min-w-0 flex-col rounded-2xl border border-[#e8e6ef] bg-white p-5 shadow-[0_8px_24px_rgba(39,35,75,0.04)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#29283b]">Job Description</h2>
                <p className="mt-1 text-sm text-[#858294]">Paste the job posting you want to target.</p>
              </div>
              {jobDescription.length > 0 && (
                <Tooltip title="Clear job description">
                  <Button
                    type="text"
                    icon={<ClearOutlined />}
                    aria-label="Clear job description"
                    onClick={() => onJobDescriptionChange('')}
                    className="text-[#77748d]! hover:bg-[#f5f3fb]!"
                  />
                </Tooltip>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#e5e2ed] bg-[#fdfcff] transition-colors focus-within:border-[#b8adeb]">
              <Input.TextArea
                value={jobDescription}
                onChange={(event) => onJobDescriptionChange(event.target.value)}
                maxLength={8000}
                placeholder="Senior Product Designer\n\nWe're looking for a thoughtful product designer to shape intuitive experiences across our web platform. You'll partner with product and engineering, use research to guide decisions, and bring complex workflows to life.\n\nRequirements: 4+ years of product design experience, strong Figma skills, and a portfolio demonstrating end-to-end product work."
                aria-label="Job description"
                className="min-h-75! flex-1! resize-y! border-0! bg-transparent! px-4! py-4! text-sm! leading-6! text-[#39374a]! shadow-none! placeholder:text-[#aaa7b5]! focus:shadow-none! sm:min-h-85!"
              />
              <div className="flex items-center justify-between gap-3 border-t border-[#efedf4] px-4 py-2.5 text-xs text-[#8b8898]">
                <span>
                  {descriptionLength === 0
                    ? 'Paste a job posting to get started'
                    : descriptionLength < 20
                      ? 'Add a few more details to continue'
                      : 'Job description'}
                </span>
                <span className={descriptionLength > 8000 ? 'text-red-600' : ''}>
                  {descriptionLength.toLocaleString()} / 8,000
                </span>
              </div>
            </div>
          </section>

          <section className="flex min-h-127.5 min-w-0 flex-col rounded-2xl border border-[#e8e6ef] bg-white p-5 shadow-[0_8px_24px_rgba(39,35,75,0.04)] sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#29283b]">Your CV</h2>
              <p className="mt-1 text-sm text-[#858294]">Choose the resume you want to analyze.</p>
            </div>

            {selectedCv ? (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#cfc7f1] bg-[#f7f5ff] p-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-[#7667d2] shadow-sm">
                  <FileTextOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#353148]">{selectedCv.name}</p>
                  <p className="truncate text-xs text-[#817d91]">
                    {selectedCv.fileName} | {getExtension(selectedCv.fileName)} | {formatFileSize(selectedCv.size)}
                  </p>
                </div>
                <Tag color="purple" className="mr-0!">Selected</Tag>
                <Button
                  type="text"
                  size="small"
                  aria-label="Remove selected CV"
                  onClick={() => onSelectCv('')}
                  className="text-[#77748d]!"
                >
                  Replace
                </Button>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed border-[#dcd8e8] bg-[#fbfaff] px-4 py-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#8983a4]">
                  <FileTextOutlined />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4c4a5a]">No CV selected</p>
                  <p className="mt-0.5 text-xs text-[#898696]">Choose one from your CV library.</p>
                </div>
              </div>
            )}

            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#444253]">Saved CVs</h3>
              {loadingCVs && <Spin size="small" />}
            </div>

            <div className="mb-4 max-h-40 min-h-16 space-y-2 overflow-y-auto pr-1">
              {cvs.length > 0 ? (
                cvs.map((cv) => {
                  const isSelected = cv.id === selectedCvId;
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelectCv(cv.id)}
                      className={`flex w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8272dc] ${
                        isSelected
                          ? 'border-[#c9c0f1] bg-[#f8f6ff]'
                          : 'border-[#eeecf2] bg-white hover:border-[#d7d1ee] hover:bg-[#fcfbff]'
                      }`}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f2effb] text-[10px] font-bold text-[#7667d2]">
                        {getExtension(cv.fileName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#393747]">{cv.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-[#8a8796]">
                          {cv.fileName} | {formatFileSize(cv.size)}
                        </span>
                      </span>
                      {isSelected && <CheckCircleFilled className="shrink-0 text-[#7667d2]" />}
                    </button>
                  );
                })
              ) : loadingCVs ? (
                <div className="py-3 text-center text-xs text-[#8a8796]">Loading your CV library...</div>
              ) : (
                <div className="rounded-lg bg-[#faf9fc] px-3 py-3 text-center text-xs text-[#8a8796]">
                  Your saved CVs will appear here.
                </div>
              )}
            </div>

            <p className="mt-auto rounded-xl border border-dashed border-[#d9d4e9] bg-[#fbfaff] px-3.5 py-3 text-center text-xs leading-5 text-[#898696]">
              Need to add a new CV? Upload it from your CV library first, then return here to select it.
            </p>
          </section>
        </div>

        <div className="mx-auto mt-6 max-w-2xl text-center">
          {creatingChat ? (
            <div className="rounded-xl border border-[#ded9f4] bg-white px-5 py-3.5 text-left shadow-[0_6px_16px_rgba(118,102,214,0.08)]" role="status" aria-live="polite">
              <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#6f6b83]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-[#7666d6]" />
                  <span className="truncate">{analysisStage}</span>
                </span>
                <span className="shrink-0 text-[#7666d6]">{analysisProgress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eeecf7]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#9b8df1] via-[#7666d6] to-[#5541c7] transition-[width] duration-500 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              disabled={!canScan}
              onClick={onCreateChat}
              className="h-12! w-full! rounded-xl! border-0! bg-[#7666d6]! text-sm! font-semibold! shadow-[0_6px_16px_rgba(118,102,214,0.2)]! hover:bg-[#6656c7]! disabled:bg-[#c9c4dd]!"
            >
              Scan My CV
            </Button>
          )}
          <p className="mt-3 text-xs leading-5 text-[#898696] sm:text-sm">
            Get insights into your skills match, missing qualifications, and opportunities to improve your CV.
          </p>
        </div>
      </div>
    </div>
  );
}
