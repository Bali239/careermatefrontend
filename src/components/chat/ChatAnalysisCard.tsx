'use client';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  RobotOutlined,
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
  const strokeDash = 283; // circumference of r=45 circle
  const offset = strokeDash - (pct / 100) * strokeDash;
  const color = pct >= 70 ? '#16a34a' : pct >= 50 ? '#eab308' : '#ef4444';
  return (
    <svg
      className="w-24 h-24 -rotate-90"
      viewBox="0 0 100 100"
      aria-label={`Job match rating ${pct} out of 10`}
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
        className="text-slate-200"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={strokeDash}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-700 ease-out"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fill="#111827"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        {Math.round(pct / 10)}
      </text>
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fill="#6b7280"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        / 10
      </text>
    </svg>
  );
}

function metricCard(label: string, value: number | string, sub?: string) {
  const num = typeof value === 'number' ? Math.round(value) : value;
  const pct = typeof value === 'number' ? value : 0;
  const color =
    pct >= 70
      ? 'text-[#16a34a] border-[#dcfce7] bg-[#ecfdf5]'
      : pct >= 50
        ? 'text-[#ca8a04] border-[#fef3c7] bg-[#fffbeb]'
        : 'text-[#dc2626] border-[#fee2e2] bg-[#fef2f2]';
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${color}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em]">{label}</div>
      <div className="text-2xl font-bold">{num}</div>
      {sub && <div className="text-xs text-[#6b7280]">{sub}</div>}
    </div>
  );
}

function skillTag(
  skill: string,
  status?: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear'
) {
  const config: Record<string, { color: 'blue' | 'purple' | 'orange' | 'red'; label?: string }> = {
    matched: { color: 'blue', label: 'Matched' },
    'partially matched': { color: 'orange', label: 'Partial' },
    'not demonstrated': { color: 'red', label: 'Missing' },
    unclear: { color: 'purple', label: 'Unclear' },
  };
  const cfg = config[status ?? 'unclear'] ?? config['unclear'];
  return (
    <Tag key={skill} color={cfg.color} className="!text-xs !font-medium !px-2.5 !py-1">
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
    <Card className="rounded-[32px] border-[#ececf4] bg-[#fdfdff] shadow-[0_4px_24px_rgba(39,35,75,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#ececf4] bg-[#f7f8fc]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5d4bc7]">
              <RobotOutlined className="w-3 h-3" />
              CV Job Match Analysis
            </div>
            <div className="mt-1 text-xl font-bold text-[#20243b]">
              {analysis.summary?.slice(0, 120)}…
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {ratingCircle(atsScore)}
            <div className="text-sm font-semibold text-[#111827]">{atsScore}/10 Job Fit</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Match Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {metricCard('Job Match', overallMatch.score ?? atsScore * 10, '% fit')}
          {metricCard('Technical', overallMatch.technicalSkills ?? atsScore * 10, '% match')}
          {metricCard('Experience', overallMatch.experienceRelevance ?? atsScore * 10, '% match')}
          {metricCard('Keywords', overallMatch.keywordCoverage ?? atsScore * 10, '% coverage')}
          {metricCard('Evidence', overallMatch.evidenceQuality ?? atsScore * 10, '% quality')}
        </div>

        {/* Skills Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
              <h3 className="text-sm font-bold text-[#20243b]">Skills Comparison</h3>
            </div>
            <div className="rounded-2xl border border-[#ececf4] bg-white p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#4f46e5]">CV Mentioned</div>
                  <div className="flex flex-wrap gap-2">
                    {cvSkills.matchedReq.length > 0 ? (
                      cvSkills.matchedReq.map((s) => skillTag(s, 'matched'))
                    ) : (
                      <span className="text-xs text-[#9ca3af]">None matched</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#ca8a04]">
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
                <div className="mb-3 p-3 rounded-xl border border-[#fef3c7] bg-[#fffbeb]">
                  <div className="text-[10px] font-bold uppercase text-[#ca8a04]">
                    Partially Matched
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-[#92400e]">
                    {cvSkills.partialReq.map((s) => skillTag(s, 'partially matched'))}
                  </div>
                </div>
              )}
              {cvSkills.notMatchedReq.length > 0 && (
                <div className="p-3 rounded-xl border border-[#fee2e2] bg-[#fef2f2]">
                  <div className="text-[10px] font-bold uppercase text-[#dc2626]">
                    Not Demonstrated
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-[#991b1b]">
                    {cvSkills.notMatchedReq.map((s) => skillTag(s, 'not demonstrated'))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
              <h3 className="text-sm font-bold text-[#20243b]">Missing Skills</h3>
            </div>
            <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4">
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => skillTag(skill, 'not demonstrated'))}
                </div>
              ) : (
                <div className="text-sm text-[#6b7280]">No major missing skills detected.</div>
              )}
            </div>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-[#dbeafe] bg-[#f8fafc] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <h3 className="text-sm font-bold text-[#1e3a8a]">Strengths</h3>
            </div>
            <div className="space-y-2">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((s) => (
                  <div key={s} className="flex items-start gap-2 text-sm text-[#1e3a8a]">
                    <CheckCircleFilled className="w-3 h-3 shrink-0 text-[#16a34a] mt-[2px]" />
                    {s}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">No strengths identified.</div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
              <h3 className="text-sm font-bold text-[#991b1b]">Gaps to Improve</h3>
            </div>
            <div className="space-y-2">
              {analysis.gaps.length > 0 ? (
                analysis.gaps.map((g) => (
                  <div key={g} className="flex items-start gap-2 text-sm text-[#991b1b]">
                    <CloseCircleFilled className="w-3 h-3 shrink-0 text-[#ef4444] mt-[2px]" />
                    {g}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6b7280]">No major gaps identified.</div>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        {scoreBreakdown.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
              <h3 className="text-sm font-bold text-[#20243b]">Score Breakdown</h3>
            </div>
            <div className="space-y-3">
              {scoreBreakdown.map((item) => {
                const pct = Math.max(0, Math.min(100, item.score));
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#374151]">{item.label}</span>
                      <span className="font-bold text-[#20243b]">{Math.round(pct)}/10</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed]"
                        style={{ width: `${pct * 10}%` }}
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#059669]" />
              <h3 className="text-sm font-bold text-[#20243b]">Experience Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceInsights.map((insight) => {
                const color =
                  insight.relevance === 'high'
                    ? 'text-[#16a34a] border-[#dcfce7] bg-[#ecfdf5]'
                    : insight.relevance === 'medium'
                      ? 'text-[#ca8a04] border-[#fef3c7] bg-[#fffbeb]'
                      : 'text-[#dc2626] border-[#fee2e2] bg-[#fef2f2]';
                return (
                  <div key={insight.title} className={`rounded-xl border p-4 ${color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-[#111827]">{insight.title}</h4>
                      <Tag
                        color={
                          insight.relevance === 'high'
                            ? 'green'
                            : insight.relevance === 'medium'
                              ? 'orange'
                              : 'red'
                        }
                      >
                        {insight.relevance}
                      </Tag>
                    </div>
                    {insight.skillsDemonstrated.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase text-[#374151]">
                          Skills Shown
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {insight.skillsDemonstrated.map((s) => (
                            <Tag key={s} color="blue" className="!text-[10px]">
                              {s}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    {insight.weaknesses.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase text-[#374151]">
                          Weaknesses
                        </div>
                        <div className="mt-1 text-sm text-[#6b7280]">
                          {insight.weaknesses.join(', ')}
                        </div>
                      </div>
                    )}
                    {insight.priorities.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-[#374151]">
                          Priorities
                        </div>
                        <div className="mt-1 text-sm text-[#111827]">
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
              <h3 className="text-sm font-bold text-[#20243b]">ATS Readiness</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Keyword Coverage', val: atsReadiness.keywordCoverage },
                { label: 'Standard Headings', val: atsReadiness.standardHeadings },
                { label: 'Contact Info', val: atsReadiness.contactInformation },
                { label: 'Chronology', val: atsReadiness.chronology },
                { label: 'Readability', val: atsReadiness.readability },
                { label: 'Quantified Achievements', val: atsReadiness.quantifiedAchievements },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#ececf4] bg-white p-3">
                  <div className="text-[10px] font-bold uppercase text-[#6b7280]">{item.label}</div>
                  <div className="mt-1 text-sm text-[#374151]">{item.val ?? 'N/A'}</div>
                </div>
              ))}
              {atsReadiness.technicalDocumentChecks &&
                atsReadiness.technicalDocumentChecks.length > 0 && (
                  <div className="md:col-span-2 rounded-xl border border-[#ececf4] bg-white p-3">
                    <div className="text-[10px] font-bold uppercase text-[#6b7280]">
                      Technical Checks
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {atsReadiness.technicalDocumentChecks.map((c) => (
                        <Tag key={c} color="green" className="!text-[10px]">
                          {c}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              {atsReadiness.aiRecommendations && atsReadiness.aiRecommendations.length > 0 && (
                <div className="md:col-span-2 rounded-xl border border-[#ececf4] bg-white p-3 mt-2">
                  <div className="text-[10px] font-bold uppercase text-[#6b7280]">
                    AI Recommendations
                  </div>
                  <ul className="mt-1 space-y-1 text-sm text-[#374151] list-disc pl-4">
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
              <h3 className="text-sm font-bold text-[#20243b]">Improvement Recommendations</h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="rounded-xl border border-[#ececf4] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#20243b]">
                        {rec.issue || `Recommendation ${i + 1}`}
                      </div>
                      {rec.whyItMatters && (
                        <div className="mt-1 text-sm text-[#6b7280] leading-relaxed">
                          {rec.whyItMatters}
                        </div>
                      )}
                      {rec.suggestedImprovement && (
                        <div className="mt-2 p-3 rounded-lg border border-[#dfe3ff] bg-[#f8fafc]">
                          <div className="text-[10px] font-bold uppercase text-[#4f46e5]">
                            Suggested Improvement
                          </div>
                          <div className="mt-1 text-sm text-[#374151]">
                            {rec.suggestedImprovement}
                          </div>
                        </div>
                      )}
                      {rec.relevantSection && (
                        <div className="mt-2 inline-block text-xs font-medium text-[#4f46e5]">
                          Section: {rec.relevantSection}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold bg-[#4f46e5] text-white px-2 py-1 rounded-full">
                      #{i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Job Match Details */}
        {overallMatch.explanation && (
          <div className="rounded-xl border border-[#dfe3ff] bg-[#eef0ff] p-4 mb-6">
            <div className="text-[10px] font-bold uppercase text-[#4f46e5] mb-1">
              Overall Assessment
            </div>
            <div className="text-sm text-[#1e3a8a]">{overallMatch.explanation}</div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-5 border-t border-[#ececf4] bg-[#f7f8fc] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {onRewrite && (
          <Button
            type="primary"
            onClick={onRewrite}
            loading={rewriting}
            disabled={rewriteDisabled}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-[#4f46e5] disabled:bg-[#c9c4dd] hover:bg-[#4338ca]"
          >
            {rewriting
              ? 'Generating…'
              : rewriteDisabled
                ? `Rewrite Limit Reached (${maxRewrites})`
                : `Rewrite My CV (${rewritesRemaining} left)`}
          </Button>
        )}
        {latestVersion && latestVersion.status === 'completed' && onDownloadGenerated && (
          <div className="flex gap-2">
            <Button
              size="small"
              variant="outlined"
              loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'docx'}
              onClick={() => onDownloadGenerated(latestVersion.id, 'docx')}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              icon={<FileWordOutlined />}
            >
              Download DOCX
            </Button>
            <Button
              size="small"
              variant="outlined"
              loading={downloadingVersionId === latestVersion.id && downloadingFormat === 'pdf'}
              onClick={() => onDownloadGenerated(latestVersion.id, 'pdf')}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              icon={<FilePdfOutlined />}
            >
              Download PDF
            </Button>
          </div>
        )}
        <Tooltip title="Rewrite your CV to better match this job description (max 3 versions)">
          <EyeOutlined className="text-[#6b7280] w-4 h-4" />
        </Tooltip>
      </div>
    </Card>
  );
}
