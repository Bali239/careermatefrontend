'use client';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  RobotOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Card, Tag, Tooltip } from 'antd';
import { useMemo } from 'react';
import type { ChatSession } from '@/app/dashboard/models';

type ChatAnalysisCardProps = {
  analysis: ChatSession['analysis'];
  generatedCvVersions?: ChatSession['generatedCvVersions'];
  onRewrite?: () => void;
  onDownloadGenerated?: (versionId: string, format: 'docx' | 'pdf') => void;
  rewriting?: boolean;
  downloadingVersionId?: string;
  downloadingFormat?: 'docx' | 'pdf';
  rewriteCount?: number;
  maxRewrites?: number;
};

function ratingCircle(value: number) {
  const pct = Math.max(0, Math.min(100, value));
  const strokeDash = 283;
  const offset = strokeDash - (pct / 100) * strokeDash;
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg
        className="w-24 h-24 -rotate-90 overflow-visible"
        viewBox="0 0 100 100"
        aria-label={`Job match rating ${pct} out of 10`}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
          className="text-slate-200"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={strokeDash}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-[#111827] leading-none">
          {Math.round(pct / 10)}
        </span>
        <span className="text-[10px] font-semibold text-[#6b7280] leading-none">/ 10</span>
      </div>
    </div>
  );
}

function metricCard(label: string, value: number | string, sub?: string) {
  const num = typeof value === 'number' ? Math.round(value) : value;
  const pct = typeof value === 'number' ? value : 0;
  const isGood = pct >= 70;
  const isMed = pct >= 50 && pct < 70;
  return (
    <div
      className={`group relative rounded-2xl border p-5 flex flex-col gap-2.5 transition-all duration-300 hover:scale-[1.02] hover:border-[#7c6de2] hover:shadow-[0_8px_24px_rgba(124,109,217,0.12)]`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7280] group-hover:text-[#5d4bc7] transition-colors">
          {label}
        </div>
        <div className="w-2 h-2 rounded-full" />
      </div>
      <div className="text-3xl font-bold text-[#111827]">{num}</div>
      {sub && <div className="text-xs text-[#6b7280]">{sub}</div>}
      <div className="h-1 w-full rounded-full bg-[#f3f4f6] mt-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: isGood
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : isMed
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
          }}
        />
      </div>
    </div>
  );
}

function skillTag(
  skill: string,
  status?: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear'
) {
  const config: Record<string, { color: string; label?: string }> = {
    matched: { color: '#10b981', label: 'Matched' },
    'partially matched': { color: '#f59e0b', label: 'Partial' },
    'not demonstrated': { color: '#ef4444', label: 'Missing' },
    unclear: { color: '#8b5cf6', label: 'Unclear' },
  };
  const cfg = config[status ?? 'unclear'] ?? config['unclear'];
  return (
    <Tag
      key={skill}
      color={cfg.color as any}
      className="!text-xs !font-semibold !px-2 !py-1 !rounded-full border-0 transition-all hover:scale-105"
    >
      {skill}
    </Tag>
  );
}

export default function ChatAnalysisCard({
  analysis,
  generatedCvVersions = [],
  onRewrite,
  onDownloadGenerated,
  rewriting = false,
  downloadingVersionId,
  downloadingFormat,
  rewriteCount = 0,
  maxRewrites = 3,
}: ChatAnalysisCardProps) {
  if (!analysis) return null;

  const latestVersion = useMemo(
    () =>
      [...(generatedCvVersions ?? [])].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0],
    [generatedCvVersions]
  );

  const rewritesRemaining = Math.max(0, (maxRewrites ?? 3) - (rewriteCount ?? 0));
  const rewriteDisabled = rewritesRemaining === 0;

  const atsScore = Math.round((analysis.atsScore ?? 0) / 10);
  const overallMatch = (analysis.overallJobMatch ?? {}) as {
    score?: number;
    technicalSkills?: number;
    experienceRelevance?: number;
    keywordCoverage?: number;
    evidenceQuality?: number;
    explanation?: string;
    strongestAreas?: string[];
    biggestGaps?: string[];
  };
  const skillsComparison = analysis.skillsComparison ?? [];
  const jdBreakdown = (analysis.jobDescriptionBreakdown ?? {}) as {
    requiredSkills?: string[];
    preferredSkills?: string[];
  };
  const experienceInsights = analysis.experienceInsights ?? [];
  const scoreBreakdown = analysis.scoreBreakdown ?? [];
  const atsReadiness = (analysis.atsReadiness ?? {}) as {
    keywordCoverage?: string;
    standardHeadings?: string;
    contactInformation?: string;
    chronology?: string;
    readability?: string;
    quantifiedAchievements?: string;
    technicalDocumentChecks?: string[];
    aiRecommendations?: string[];
  };

  const cvSkills = useMemo(() => {
    const required = jdBreakdown.requiredSkills ?? [];
    const preferred = jdBreakdown.preferredSkills ?? [];
    const matchedReq = skillsComparison
      .filter((s) => s.status === 'matched')
      .map((s) => s.requirement);
    const partialReq = skillsComparison
      .filter((s) => s.status === 'partially matched')
      .map((s) => s.requirement);
    const notMatchedReq = skillsComparison
      .filter((s) => s.status === 'not demonstrated')
      .map((s) => s.requirement);
    return { required, preferred, matchedReq, partialReq, notMatchedReq };
  }, [skillsComparison, jdBreakdown]);

  return (
    <Card className="rounded-[32px] border-0 bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
      {/* Gradient header */}
      <div className="relative px-7 py-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c6de2] to-[#5d4bc7] opacity-90 rounded-[28px] overflow-hidden -translate-y-full transition-all duration-500 group-hover:translate-y-0" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <RobotOutlined className="w-3 h-3" />
              CV Job Match Analysis
            </div>
            <div className="mt-2 text-xl font-bold text-white leading-none">
              {analysis.summary?.slice(0, 100)}…
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            {ratingCircle(atsScore)}
            <div className="text-sm font-semibold text-white leading-none">
              {atsScore}/10 Job Fit
            </div>
          </div>
        </div>
      </div>

      <div className="p-7">
        {/* Match Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
          {metricCard('Job Match', overallMatch.score ?? atsScore * 10, '% fit')}
          {metricCard('Technical', overallMatch.technicalSkills ?? atsScore * 10, '% match')}
          {metricCard('Experience', overallMatch.experienceRelevance ?? atsScore * 10, '% match')}
          {metricCard('Keywords', overallMatch.keywordCoverage ?? atsScore * 10, '% coverage')}
          {metricCard('Evidence', overallMatch.evidenceQuality ?? atsScore * 10, '% quality')}
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#f3f4f6] bg-[#fafafa] p-6 transition-all duration-300 hover:border-[#dfe3ff] hover:bg-[#fdfdff]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#5d4bc7]" />
                <h3 className="text-sm font-bold text-[#111827]">Skills Comparison</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase text-[#5d4bc7]">CV Mentioned</div>
                  <div className="flex flex-wrap gap-2">
                    {cvSkills.matchedReq.length > 0 ? (
                      cvSkills.matchedReq.map((s) => skillTag(s, 'matched'))
                    ) : (
                      <span className="text-xs text-[#9ca3af]">None matched</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase text-[#f59e0b]">
                    Required by JD
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvSkills.required.length > 0 ? (
                      cvSkills.required.map((s) => {
                        const found = skillsComparison.find((sc) => sc.requirement === s);
                        return skillTag(s, found?.status);
                      })
                    ) : (
                      <span className="text-xs text-[#9ca3af]">None specified</span>
                    )}
                  </div>
                </div>
              </div>
              {cvSkills.partialReq.length > 0 && (
                <div className="mb-4 p-4 rounded-xl border border-[#fef3c7] bg-[#fffbeb]">
                  <div className="text-[10px] font-bold uppercase text-[#ca8a04] flex items-center gap-2">
                    <StarOutlined className="w-3 h-3" />
                    Partially Matched
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#92400e]">
                    {cvSkills.partialReq.map((s) => skillTag(s, 'partially matched'))}
                  </div>
                </div>
              )}
              {cvSkills.notMatchedReq.length > 0 && (
                <div className="p-4 rounded-xl border border-[#fee2e2] bg-[#fef2f2]">
                  <div className="text-[10px] font-bold uppercase text-[#ef4444] flex items-center gap-2">
                    <CloseCircleFilled className="w-3 h-3" />
                    Not Demonstrated
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#991b1b]">
                    {cvSkills.notMatchedReq.map((s) => skillTag(s, 'not demonstrated'))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-6 transition-all duration-300 hover:border-[#ef4444]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <h3 className="text-sm font-bold text-[#991b1b]">Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map((skill) => skillTag(skill, 'not demonstrated'))
                ) : (
                  <div className="text-sm text-[#6b7280]">No major missing skills detected.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-7">
          <div className="rounded-2xl border border-[#dbeafe] bg-[#f8fafc] p-6 transition-all duration-300 hover:border-[#2563eb]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <h3 className="text-sm font-bold text-[#1e3a8a]">Strengths</h3>
            </div>
            <div className="space-y-3">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((s) => (
                  <div
                    key={s}
                    className="flex items-start gap-3 text-sm text-[#1e3a8a] px-4 py-2 rounded-xl bg-white/50 transition-colors hover:bg-white"
                  >
                    <CheckCircleFilled className="w-3.5 h-3.5 shrink-0 text-[#10b981] mt-[2px]" />
                    {s}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">No strengths identified.</div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-6 transition-all duration-300 hover:border-[#ef4444]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <h3 className="text-sm font-bold text-[#991b1b]">Gaps to Improve</h3>
            </div>
            <div className="space-y-3">
              {analysis.gaps.length > 0 ? (
                analysis.gaps.map((g) => (
                  <div
                    key={g}
                    className="flex items-start gap-3 text-sm text-[#991b1b] px-4 py-2 rounded-xl bg-white/50 transition-colors hover:bg-white"
                  >
                    <CloseCircleFilled className="w-3.5 h-3.5 shrink-0 text-[#ef4444] mt-[2px]" />
                    {g}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">No major gaps identified.</div>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {scoreBreakdown.length > 0 && (
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
              <h3 className="text-sm font-bold text-[#111827]">Score Breakdown</h3>
            </div>
            <div className="space-y-4">
              {scoreBreakdown.map((item) => {
                const pct = Math.max(0, Math.min(100, item.score));
                return (
                  <div key={item.label} className="group flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#374151]">{item.label}</span>
                      <span className="font-bold text-[#111827]">{Math.round(pct)}/10</span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                        style={{
                          width: `${pct * 10}%`,
                          transition: 'width 1000ms ease-out',
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-[#6b7280]">{item.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience Insights */}
        {experienceInsights.length > 0 && (
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#059669]" />
              <h3 className="text-sm font-bold text-[#111827]">Experience Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceInsights.map((insight) => {
                const color =
                  insight.relevance === 'high'
                    ? 'border-[#10b981] bg-[#ecfdf5] text-[#166534]'
                    : insight.relevance === 'medium'
                      ? 'border-[#f59e0b] bg-[#fffbeb] text-[#92400e]'
                      : 'border-[#ef4444] bg-[#fef2f2] text-[#991b1b]';
                return (
                  <div
                    key={insight.title}
                    className={`rounded-2xl border p-5 ${color} transition-all duration-300 hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-[#111827]">{insight.title}</h4>
                      <Tag
                        color={
                          insight.relevance === 'high'
                            ? 'green'
                            : insight.relevance === 'medium'
                              ? 'yellow'
                              : 'red'
                        }
                      >
                        {insight.relevance}
                      </Tag>
                    </div>
                    {insight.skillsDemonstrated.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] font-bold uppercase text-[#6b7280] mb-1">
                          Skills Shown
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {insight.skillsDemonstrated.map((s) => (
                            <Tag key={s} color="blue" className="!text-[10px] !px-1.5 !py-0.5">
                              {s}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    {insight.weaknesses.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] font-bold uppercase text-[#6b7280] mb-1">
                          Weaknesses
                        </div>
                        <div className="mt-1 text-sm text-[#374151] leading-relaxed">
                          {insight.weaknesses.join(', ')}
                        </div>
                      </div>
                    )}
                    {insight.priorities.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-[#6b7280] mb-1">
                          Priorities
                        </div>
                        <div className="mt-1 text-sm text-[#111827] leading-relaxed">
                          {insight.priorities.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ATS Readiness */}
        {Object.keys(atsReadiness).length > 0 && (
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#5d4bc7]" />
              <h3 className="text-sm font-bold text-[#111827]">ATS Readiness</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Keyword Coverage', val: atsReadiness.keywordCoverage },
                { label: 'Standard Headings', val: atsReadiness.standardHeadings },
                { label: 'Contact Info', val: atsReadiness.contactInformation },
                { label: 'Chronology', val: atsReadiness.chronology },
                { label: 'Readability', val: atsReadiness.readability },
                { label: 'Quantified Achievements', val: atsReadiness.quantifiedAchievements },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#f3f4f6] bg-white p-3.5 transition-all duration-300 hover:border-[#dfe3ff] hover:shadow-sm"
                >
                  <div className="text-[10px] font-bold uppercase text-[#6b7280]">{item.label}</div>
                  <div className="mt-1 text-sm font-medium text-[#111827]">{item.val ?? 'N/A'}</div>
                </div>
              ))}
              {atsReadiness.technicalDocumentChecks &&
                atsReadiness.technicalDocumentChecks.length > 0 && (
                  <div className="md:col-span-3 rounded-xl border border-[#f3f4f6] bg-white p-3.5 transition-all duration-300 hover:border-[#dfe3ff] hover:shadow-sm">
                    <div className="text-[10px] font-bold uppercase text-[#6b7280] mb-2">
                      Technical Checks
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {atsReadiness.technicalDocumentChecks.map((c) => (
                        <Tag key={c} color="green" className="!text-[10px] !px-2 !py-1">
                          {c}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              {atsReadiness.aiRecommendations && atsReadiness.aiRecommendations.length > 0 && (
                <div className="md:col-span-3 rounded-xl border border-[#f3f4f6] bg-white p-3.5 transition-all duration-300 hover:border-[#dfe3ff] hover:shadow-sm mt-3">
                  <div className="text-[10px] font-bold uppercase text-[#6b7280] mb-2">
                    AI Recommendations
                  </div>
                  <ul className="mt-1 space-y-1 text-sm text-[#374151] list-disc pl-5">
                    {atsReadiness.aiRecommendations.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#5d4bc7]" />
              <h3 className="text-sm font-bold text-[#111827]">Improvement Recommendations</h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#f3f4f6] bg-white p-5 transition-all duration-300 hover:border-[#7c6de2] hover:shadow-[0_4px_12px_rgba(124,109,217,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#111827] leading-relaxed">
                        {rec.issue || `Recommendation ${i + 1}`}
                      </div>
                      {rec.whyItMatters && (
                        <div className="mt-2 text-sm text-[#6b7280] leading-relaxed">
                          {rec.whyItMatters}
                        </div>
                      )}
                      {rec.suggestedImprovement && (
                        <div className="mt-3 p-4 rounded-xl border border-[#dfe3ff] bg-[#f8fafc]">
                          <div className="text-[10px] font-bold uppercase text-[#5d4bc7]">
                            Suggested Improvement
                          </div>
                          <div className="mt-1 text-sm text-[#374151] leading-relaxed">
                            {rec.suggestedImprovement}
                          </div>
                        </div>
                      )}
                      {rec.relevantSection && (
                        <div className="mt-3 inline-block text-xs font-medium text-[#5d4bc7] bg-[#f0edff] px-2 py-1 rounded-full">
                          Section: {rec.relevantSection}
                        </div>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-[#5d4bc7] text-white text-[10px] font-bold">
                      #{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Assessment */}
        {overallMatch.explanation && (
          <div className="rounded-2xl border border-[#dfe3ff] bg-[#f8faff] p-5 mb-7">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#5d4bc7]" />
              <div className="text-[10px] font-bold uppercase text-[#5d4bc7]">
                Overall Assessment
              </div>
            </div>
            <div className="text-sm text-[#1e3a8a] leading-relaxed">{overallMatch.explanation}</div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-7 py-5 border-t border-[#f3f4f6] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {onRewrite && (
          <Button
            type="primary"
            onClick={onRewrite}
            loading={rewriting}
            disabled={rewriteDisabled}
            className="rounded-xl px-7 py-3 text-sm font-semibold bg-[#5d4bc7] disabled:bg-[#c9c4dd] disabled:text-[#6b7280] hover:bg-[#4c3cb2] transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(93,75,199,0.25)]"
          >
            {rewriting ? (
              <>Generating…</>
            ) : rewriteDisabled ? (
              `Rewrite Limit Reached (${maxRewrites})`
            ) : (
              `Rewrite My CV (${rewritesRemaining} left)`
            )}
          </Button>
        )}
        {latestVersion && latestVersion.status === 'completed' && onDownloadGenerated && (
          <div className="flex gap-3">
            <Button
              size="small"
              variant="outlined"
              loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'docx'}
              onClick={() => onDownloadGenerated(latestVersion.id, 'docx')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold border-0 bg-[#5d4bc7] text-white disabled:opacity-50 transition-all duration-300"
              icon={<FileWordOutlined />}
            >
              DOCX
            </Button>
            <Button
              size="small"
              variant="outlined"
              loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'pdf'}
              onClick={() => onDownloadGenerated(latestVersion.id, 'pdf')}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold border-0 bg-[#ef4444] text-white disabled:opacity-50 transition-all duration-300"
              icon={<FilePdfOutlined />}
            >
              PDF
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
