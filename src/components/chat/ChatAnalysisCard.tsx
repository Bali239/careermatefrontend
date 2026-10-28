'use client';

import { Fragment, useState, useMemo } from 'react';
import { Button, Card, Empty, Tabs, Tag, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  DownOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  RobotOutlined,
  StarOutlined,
} from '@ant-design/icons';
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

/* ── helpers ──────────────────────────────────────────────────── */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ratingCircle(value: number | null, max: number = 10) {
  if (value === null) {
    return (
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg
          className="w-28 h-28 -rotate-90"
          viewBox="0 0 100 100"
          aria-label="Job match rating not assessed"
        >
          <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#9ca3af"
            strokeWidth="4"
            strokeDasharray="4,4"
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-[#9ca3af] leading-none">—</span>
          <span className="text-[10px] font-semibold text-[#6B7280] leading-none mt-1">/ 10</span>
        </div>
      </div>
    );
  }
  const pct = clamp((value / max) * 100, 0, 100);
  const strokeDash = 283;
  const offset = strokeDash - (pct / 100) * strokeDash;
  const color = pct >= 70 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg
        className="w-28 h-28 -rotate-90"
        viewBox="0 0 100 100"
        aria-label={`Job match rating ${pct} out of 10`}
      >
        <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
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
        <span className="text-3xl font-bold text-[#111827] leading-none">
          {Math.round(pct / 10)}
        </span>
        <span className="text-[10px] font-semibold text-[#6B7280] leading-none mt-1">/ 10</span>
      </div>
    </div>
  );
}

function metricCard(label: string, value: number | undefined, sub?: string, primary?: boolean) {
  const hasValue = typeof value === 'number' && !Number.isNaN(value);
  const pct = hasValue ? clamp(value as number, 0, 100) : 0;
  const color =
    pct >= 70
      ? 'text-[#16a34a] bg-[#ecfdf5] border-[#dcfce7]'
      : pct >= 50
        ? 'text-[#d97706] bg-[#fffbeb] border-[#fef3c7]'
        : 'text-[#dc2626] bg-[#fef2f2] border-[#fee2e2]';
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-2.5 transition-all duration-200 hover:shadow-sm ${
        primary
          ? 'border-[#6554C0] bg-[#f8f7ff]'
          : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </div>
      <div className="text-3xl font-bold text-[#111827]">
        {hasValue ? `${Math.round(pct / 10)}/10` : '—'}
      </div>
      {hasValue ? (
        <div className="h-1.5 w-full rounded-full bg-[#f3f4f6] overflow-hidden">
          <div
            className={`h-full rounded-full ${primary ? 'bg-[#6554C0]' : 'bg-[#9ca3af]'}`}
            style={{ width: `${pct}%`, transition: 'width 800ms ease-out' }}
          />
        </div>
      ) : (
        <div className="text-xs text-[#9ca3af] italic">Not assessed</div>
      )}
      {sub && <div className="text-xs text-[#6B7280]">{sub}</div>}
    </div>
  );
}

function skillTag(
  skill: string,
  status?: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear'
) {
  const config: Record<string, { color: string; label: string }> = {
    matched: { color: 'green', label: 'Matched' },
    'partially matched': { color: 'orange', label: 'Partial' },
    'not demonstrated': { color: 'red', label: 'Missing' },
    unclear: { color: 'purple', label: 'Unclear' },
  };
  const cfg = config[status ?? 'unclear'] ?? config['unclear'];
  return (
    <Tag
      color={cfg.color as any}
      className="!text-xs !font-medium !px-2.5 !py-1 !rounded-full"
    >
      {skill}
    </Tag>
  );
}

function statusIcon(status?: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear') {
  if (status === 'matched') return <span className="text-[#16a34a]">✓</span>;
  if (status === 'partially matched') return <span className="text-[#d97706]">~</span>;
  if (status === 'not demonstrated') return <span className="text-[#dc2626]">✗</span>;
  return <span className="text-[#8b5cf6]">?</span>;
}

function statusLabel(status?: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear') {
  if (status === 'matched') return 'Matched';
  if (status === 'partially matched') return 'Partial';
  if (status === 'not demonstrated') return 'Missing';
  return 'Unclear';
}

/* ── component ────────────────────────────────────────────────── */

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

  const [activeTab, setActiveTab] = useState('skills');
  const [skillFilter, setSkillFilter] = useState<'all' | 'matched' | 'partial' | 'missing'>('all');
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const latestVersion = useMemo(
    () =>
      [...(generatedCvVersions ?? [])].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0],
    [generatedCvVersions]
  );

  const rewritesRemaining = Math.max(0, (maxRewrites ?? 3) - (rewriteCount ?? 0));
  const rewriteDisabled = rewritesRemaining === 0;

  const atsScore = typeof analysis.atsScore === 'number' ? clamp(analysis.atsScore, 0, 100) : null;
  const overallScore =
    typeof analysis.overallScore === 'number' && analysis.overallJobMatch
      ? clamp(analysis.overallScore, 0, 100)
      : null;
  const hasRealScore = overallScore !== null;
  const overallMatch = (analysis.overallJobMatch ?? {}) as {
    score?: number;
    technicalSkills?: number;
    experienceRelevance?: number;
    educationAlignment?: number;
    keywordCoverage?: number;
    evidenceQuality?: number;
    explanation?: string;
    strongestAreas?: string[];
    biggestGaps?: string[];
  };
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const gaps = Array.isArray(analysis.gaps) ? analysis.gaps : [];
  const missingSkills = Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [];
  const skillsComparison = Array.isArray(analysis.skillsComparison) ? analysis.skillsComparison : [];
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

  /* ── derived data ── */
  const cvSkills = useMemo(() => {
    const required = jdBreakdown.requiredSkills ?? [];
    const matched = skillsComparison.filter((s) => s.status === 'matched');
    const partial = skillsComparison.filter((s) => s.status === 'partially matched');
    const missing = skillsComparison.filter((s) => s.status === 'not demonstrated');
    const unclear = skillsComparison.filter((s) => s.status === 'unclear');
    return { required, matched, partial, missing, unclear };
  }, [skillsComparison, jdBreakdown]);

  const filteredSkills = useMemo(() => {
    if (skillFilter === 'all') return skillsComparison;
    if (skillFilter === 'matched') return cvSkills.matched;
    if (skillFilter === 'partial') return cvSkills.partial;
    if (skillFilter === 'missing') return cvSkills.missing;
    return skillsComparison;
  }, [skillFilter, skillsComparison, cvSkills]);

  const recommendations = (Array.isArray(analysis.recommendations) ? analysis.recommendations : [])
    .filter((recommendation) => recommendation.issue?.trim());
  const topRecs = recommendations.slice(0, 3);
  const visibleRecs = showAllRecs ? recommendations : topRecs;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  /* ── interpretation ── */
  const interpretation = hasRealScore
    ? overallScore! >= 80
      ? 'Strong match — your CV aligns well with this role. Minor refinements can strengthen it further.'
      : overallScore! >= 60
        ? 'Moderate match — several skills align, but key gaps should be addressed to improve your chances.'
        : overallScore! >= 40
          ? 'Partial match — significant gaps exist. Tailoring your CV to highlight relevant experience is recommended.'
          : 'Low match — major alignment gaps. Consider whether this role fits your current profile or if significant updates are needed.'
    : 'Overall score not assessed — Gemini did not return skill/experience/keyword/evidence sub-metrics for this analysis.';

  return (
    <Card className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-[#f3f4f6]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6554C0]">
              <RobotOutlined className="text-sm" />
              CV Job Match Analysis
            </div>
            <div className="mt-1.5 text-lg font-semibold text-[#111827] leading-snug line-clamp-2">
              {analysis.summary || 'No summary was returned for this CV analysis.'}
            </div>
            <div className="mt-1 text-xs text-[#6B7280]">{'Analysis complete'}</div>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            {ratingCircle(overallScore)}
            <div className="text-xs font-medium text-[#6B7280]">{interpretation.slice(0, 60)}…</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ── Match Metrics ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {metricCard(
            'Job Match',
            overallMatch.score,
            'Overall fit',
            true
          )}
          {metricCard('Technical Skills', overallMatch.technicalSkills, 'Skills alignment')}
          {metricCard('Experience', overallMatch.experienceRelevance, 'Relevance')}
          {metricCard('Keywords', overallMatch.keywordCoverage, 'Coverage')}
          {metricCard('Evidence', overallMatch.evidenceQuality, 'Quality')}
        </div>

        {/* ── Key Findings ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Strengths */}
          <div className="rounded-xl border border-[#dcfce7] bg-[#f0fdf4] p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleFilled className="text-[#16a34a] text-sm" />
              <h3 className="text-sm font-semibold text-[#166534]">Key Strengths</h3>
            </div>
            <div className="space-y-2">
              {strengths.length > 0 ? (
                strengths.map((s, i) => (
                  <div
                    key={`str-${i}`}
                    className="text-sm text-[#166534] leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-[#16a34a] shrink-0">•</span>
                    {s}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6B7280]">No strengths identified.</div>
              )}
            </div>
          </div>

          {/* Skills to Address (Missing) */}
          <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] p-4">
            <div className="flex items-center gap-2 mb-3">
              <CloseCircleFilled className="text-[#dc2626] text-sm" />
              <h3 className="text-sm font-semibold text-[#991b1b]">Skills to Address</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill, i) => (
                  <Fragment key={`missing-${i}`}>
                    {skillTag(skill, 'not demonstrated')}
                  </Fragment>
                ))
              ) : (
                <div className="text-sm text-[#6B7280]">No major missing skills detected.</div>
              )}
            </div>
          </div>

          {/* Areas for Improvement (Gaps) */}
          <div className="rounded-xl border border-[#fef3c7] bg-[#fffbeb] p-4">
            <div className="flex items-center gap-2 mb-3">
              <StarOutlined className="text-[#d97706] text-sm" />
              <h3 className="text-sm font-semibold text-[#92400e]">Areas for Improvement</h3>
            </div>
            <div className="space-y-2">
              {gaps.length > 0 ? (
                gaps.map((g, i) => (
                  <div
                    key={`gap-${i}`}
                    className="text-sm text-[#92400e] leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-[#d97706] shrink-0">•</span>
                    {g}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6B7280]">No major gaps identified.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Recommendations (top 3 + expand) ── */}
        {recommendations.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-3">Priority Recommendations</h3>
            <div className="space-y-3">
              {visibleRecs.map((rec, i) => (
                <div
                  key={`${rec.issue}-${i}`}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-4 hover:border-[#d1d5db] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#111827]">
                        {rec.issue}
                      </div>
                      {rec.whyItMatters && (
                        <div className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">
                          {rec.whyItMatters}
                        </div>
                      )}
                      {rec.suggestedImprovement && (
                        <div className="mt-2.5 p-3 rounded-lg border border-[#e0e7ff] bg-[#f8faff]">
                          <div className="text-[10px] font-bold uppercase text-[#6554C0] mb-1">
                            Suggested Improvement
                          </div>
                          <div className="text-sm text-[#374151] leading-relaxed">
                            {rec.suggestedImprovement}
                          </div>
                        </div>
                      )}
                      {rec.relevantSection && (
                        <div className="mt-2 inline-block text-xs font-medium text-[#6554C0] bg-[#f0edff] px-2 py-0.5 rounded-full">
                          Section: {rec.relevantSection}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6554C0] text-white text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {rec.suggestedImprovement && (
                        <Tooltip title={copiedIndex === i ? 'Copied!' : 'Copy suggestion'}>
                          <button
                            type="button"
                            onClick={() => handleCopy(rec.suggestedImprovement!, i)}
                            className="text-[#6B7280] hover:text-[#6554C0] transition-colors"
                            aria-label="Copy suggestion"
                          >
                            <CopyOutlined className="text-sm" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recommendations.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllRecs(!showAllRecs)}
                className="mt-3 text-sm font-medium text-[#6554C0] hover:text-[#5a4ab5] transition-colors flex items-center gap-1"
              >
                {showAllRecs
                  ? 'Show less'
                  : `Show ${recommendations.length - 3} more recommendations`}
                <DownOutlined
                  className={`text-xs transition-transform ${showAllRecs ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-5 text-center">
            <div className="text-sm text-[#6B7280]">
              No recommendations available. The analysis did not generate specific improvement
              suggestions.
            </div>
          </div>
        )}

        {/* ── Detailed Analysis (Tabs) ── */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-6"
          items={[
            {
              key: 'skills',
              label: 'Skills',
              children: (
                <div className="space-y-4">
                  {/* Filter buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['all', 'matched', 'partial', 'missing'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSkillFilter(f)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          skillFilter === f
                            ? 'bg-[#6554C0] text-white border-[#6554C0]'
                            : 'bg-white text-[#6B7280] border-[#e5e7eb] hover:border-[#6554C0] hover:text-[#6554C0]'
                        }`}
                      >
                        {f === 'all'
                          ? 'All'
                          : f === 'matched'
                            ? 'Matched'
                            : f === 'partial'
                              ? 'Partial'
                              : 'Missing'}
                        <span className="ml-1.5 text-[10px] opacity-70">
                          {f === 'all'
                            ? skillsComparison.length
                            : f === 'matched'
                              ? cvSkills.matched.length
                              : f === 'partial'
                                ? cvSkills.partial.length
                                : cvSkills.missing.length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Skills list */}
                  {filteredSkills.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredSkills.map((item, i) => (
                        <div
                  key={`${item.requirement}-${i}`}
                          className="flex items-start gap-3 p-3 rounded-lg border border-[#f3f4f6] bg-[#fafafa] hover:bg-white transition-colors"
                        >
                          <span className="shrink-0 mt-0.5">{statusIcon(item.status)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-[#111827]">
                                {item.requirement}
                              </span>
                              <span className="text-[10px] font-medium text-[#6B7280] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                                {statusLabel(item.status)}
                              </span>
                              <span className="text-[10px] font-medium text-[#9ca3af]">
                                {item.importance}
                              </span>
                            </div>
                            {item.evidence?.length ? (
                              <div className="mt-1 text-xs text-[#4b5563] leading-relaxed">
                                Evidence from CV: {item.evidence.join(' · ')}
                              </div>
                            ) : (
                              <div className="mt-1 text-xs text-[#9ca3af] italic">
                                No direct CV evidence was returned for this requirement.
                              </div>
                            )}
                            {item.explanation && (
                              <div className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                                {item.explanation}
                              </div>
                            )}
                            {item.nextAction && (
                              <div className="mt-1.5 text-xs text-[#6554C0] font-medium">
                                → {item.nextAction}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[#6B7280] py-8 text-center">
                      No skills comparison data available. The analysis could not extract skill
                      matches from your CV for this filter.
                    </div>
                  )}

                  {/* JD Breakdown */}
                  {jdBreakdown.requiredSkills && jdBreakdown.requiredSkills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
                      <div className="text-xs font-semibold text-[#6B7280] mb-2">
                        Required Skills (from JD)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jdBreakdown.requiredSkills.map((s, i) => (
                          <Fragment key={`required-skill-${s}-${i}`}>{skillTag(s)}</Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                  {jdBreakdown.preferredSkills && jdBreakdown.preferredSkills.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-[#6B7280] mb-2">
                        Preferred Skills (from JD)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jdBreakdown.preferredSkills.map((s, i) => (
                          <Fragment key={`preferred-skill-${s}-${i}`}>{skillTag(s)}</Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'experience',
              label: 'Experience',
              children: (
                <div className="space-y-4">
                  {experienceInsights.length > 0 ? (
                    experienceInsights.map((insight, i) => {
                      const color =
                        insight.relevance === 'high'
                          ? 'border-[#dcfce7] bg-[#f0fdf4]'
                          : insight.relevance === 'medium'
                            ? 'border-[#fef3c7] bg-[#fffbeb]'
                            : 'border-[#fee2e2] bg-[#fef2f2]';
                      return (
                        <div key={`${insight.title}-${i}`} className={`rounded-xl border p-4 ${color}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-[#111827]">{insight.title}</h4>
                            <Tag
                              color={
                                insight.relevance === 'high'
                                  ? 'green'
                                  : insight.relevance === 'medium'
                                    ? 'orange'
                                    : 'red'
                              }
                              className="!text-[10px]"
                            >
                              {insight.relevance}
                            </Tag>
                          </div>
                          {insight.evidence.length > 0 ? (
                            <div className="mb-2">
                              <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-1">
                                CV Evidence
                              </div>
                              <div className="text-sm text-[#374151] leading-relaxed">
                                {insight.evidence.join(' · ')}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2 text-xs text-[#9ca3af] italic">
                              No supporting CV evidence was returned for this insight.
                            </div>
                          )}
                          {insight.skillsDemonstrated.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-1">
                                Skills Shown
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {insight.skillsDemonstrated.map((s, i) => (
                                  <Tag
                                    key={`${s}-${i}`}
                                    color="blue"
                                    className="!text-[10px] !px-1.5 !py-0.5"
                                  >
                                    {s}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )}
                          {insight.weaknesses.length > 0 && (
                            <div className="mb-2">
                              <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-1">
                                Weaknesses
                              </div>
                              <div className="text-sm text-[#374151] leading-relaxed">
                                {insight.weaknesses.join(', ')}
                              </div>
                            </div>
                          )}
                          {insight.priorities.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-1">
                                Priorities
                              </div>
                              <div className="text-sm text-[#111827] leading-relaxed">
                                {insight.priorities.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-[#6B7280] py-8 text-center">
                      No experience insights available. Upload a more detailed CV to get
                      experience-based recommendations.
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'scores',
              label: 'Score Breakdown',
              children: (
                <div className="space-y-4">
                  {scoreBreakdown.length > 0 ? (
                    scoreBreakdown.map((item, i) => {
                      const pct = clamp(item.score, 0, 100);
                      return (
                        <div key={`${item.label}-${i}`} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#374151]">{item.label}</span>
                            <span className="font-bold text-[#111827]">{Math.round(pct)}/100</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                            <div
                              className="h-full bg-[#6554C0] rounded-full"
                              style={{ width: `${pct}%`, transition: 'width 800ms ease-out' }}
                            />
                          </div>
                          <div className="text-[10px] text-[#6B7280] leading-relaxed">
                            {item.note}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-[#6B7280] py-8 text-center">
                      No score breakdown available. The analysis did not provide detailed scoring.
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'ats',
              label: 'ATS Readiness',
              children: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Keyword Coverage', val: atsReadiness.keywordCoverage },
                      { label: 'Standard Headings', val: atsReadiness.standardHeadings },
                      { label: 'Contact Information', val: atsReadiness.contactInformation },
                      { label: 'Chronology', val: atsReadiness.chronology },
                      { label: 'Readability', val: atsReadiness.readability },
                      {
                        label: 'Quantified Achievements',
                        val: atsReadiness.quantifiedAchievements,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-3.5"
                      >
                        <div className="text-[10px] font-bold uppercase text-[#6B7280]">
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm text-[#374151] leading-relaxed">
                          {item.val ?? 'Not assessed'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {atsReadiness.technicalDocumentChecks &&
                    atsReadiness.technicalDocumentChecks.length > 0 && (
                      <div className="rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-3.5">
                        <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-2">
                          Technical Document Checks
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {atsReadiness.technicalDocumentChecks.map((c, i) => (
                            <Tag key={`${c}-${i}`} color="green" className="!text-[10px]">
                              {c}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  {atsReadiness.aiRecommendations && atsReadiness.aiRecommendations.length > 0 && (
                    <div className="rounded-xl border border-[#f3f4f6] bg-[#fafafa] p-3.5">
                      <div className="text-[10px] font-bold uppercase text-[#6B7280] mb-2">
                        AI Recommendations
                      </div>
                      <ul className="space-y-1 text-sm text-[#374151] list-disc pl-5">
                        {atsReadiness.aiRecommendations.map((c, i) => (
                          <li key={`${c}-${i}`}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-[#9ca3af] italic mt-2">
                    Note: These are AI-generated estimates, not actual scores from an employer's
                    applicant tracking system.
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* ── Overall Assessment ── */}
        {overallMatch.explanation && (
          <div className="rounded-xl border border-[#e0e7ff] bg-[#f8faff] p-5 mb-6">
            <div className="text-[10px] font-bold uppercase text-[#6554C0] mb-2">
              Overall Assessment
            </div>
            <div className="text-sm text-[#374151] leading-relaxed">{overallMatch.explanation}</div>
          </div>
        )}

        {/* ── Footer Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#f3f4f6]">
          <div className="flex items-center gap-2">
            {onRewrite && (
              <Button
                type="primary"
                onClick={onRewrite}
                loading={rewriting}
                disabled={rewriteDisabled}
                className="rounded-lg px-5 py-2 text-sm font-semibold bg-[#6554C0] disabled:bg-[#d1d5db] disabled:text-[#6b7280] hover:bg-[#5a4ab5]"
              >
                {rewriting
                  ? 'Generating…'
                  : rewriteDisabled
                    ? `Rewrite Limit Reached (${maxRewrites})`
                    : `Rewrite My CV (${rewritesRemaining} left)`}
              </Button>
            )}
          </div>
          {latestVersion && latestVersion.status === 'completed' && onDownloadGenerated && (
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'docx'}
                onClick={() => onDownloadGenerated(latestVersion.id, 'docx')}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                icon={<FileWordOutlined />}
              >
                DOCX
              </Button>
              <Button
                size="small"
                variant="outlined"
                loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'pdf'}
                onClick={() => onDownloadGenerated(latestVersion.id, 'pdf')}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                icon={<FilePdfOutlined />}
              >
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
