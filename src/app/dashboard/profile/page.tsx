'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, Spin, Tag } from 'antd';
import {
  DownloadOutlined,
  FileAddOutlined,
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import ConfirmModal from '@/components/ui/ConfirmModal';

const { TextArea } = Input;
type EntryValue = string | boolean | string[];
type Entry = Record<string, EntryValue>;
type ListKey = 'experience' | 'education' | 'certifications' | 'projects' | 'languages' | 'awards';
type CustomField = { label: string; value: string };
type CustomSection = { title: string; fields: CustomField[] };
type Profile = {
  contact: Record<string, string>;
  headline: string;
  summary: string;
  skills: string[];
  interests: string[];
  customSections: CustomSection[];
} & Record<ListKey, Entry[]>;
type Extraction = {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string;
  createdAt: string;
};
type APIProfile = { profile: Profile; extraction: Extraction[] };

const blank: Profile = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  },
  headline: '',
  summary: '',
  skills: [],
  interests: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  languages: [],
  awards: [],
  customSections: [],
};
const templates: Record<ListKey, Entry> = {
  experience: {
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
  },
  education: {
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    details: '',
  },
  certifications: { name: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: '' },
  projects: { name: '', role: '', description: '', url: '', technologies: [] },
  languages: { name: '', proficiency: '' },
  awards: { name: '', issuer: '', date: '', description: '' },
};
const sections: {
  key: ListKey;
  title: string;
  fields: { key: string; label: string; multiline?: boolean; list?: boolean }[];
}[] = [
  {
    key: 'experience',
    title: 'Work experience',
    fields: [
      { key: 'jobTitle', label: 'Job title' },
      { key: 'company', label: 'Company' },
      { key: 'location', label: 'Location' },
      { key: 'startDate', label: 'Start date' },
      { key: 'endDate', label: 'End date' },
      { key: 'current', label: 'I currently work here' },
      { key: 'description', label: 'Role description', multiline: true },
      { key: 'achievements', label: 'Achievements (one per line)', multiline: true, list: true },
    ],
  },
  {
    key: 'education',
    title: 'Education',
    fields: [
      { key: 'institution', label: 'Institution' },
      { key: 'degree', label: 'Degree' },
      { key: 'field', label: 'Field of study' },
      { key: 'location', label: 'Location' },
      { key: 'startDate', label: 'Start date' },
      { key: 'endDate', label: 'End date' },
      { key: 'details', label: 'Details', multiline: true },
    ],
  },
  {
    key: 'certifications',
    title: 'Certificates',
    fields: [
      { key: 'name', label: 'Certificate' },
      { key: 'issuer', label: 'Issuing organization' },
      { key: 'issueDate', label: 'Issue date' },
      { key: 'expirationDate', label: 'Expiration date' },
      { key: 'credentialUrl', label: 'Credential link' },
    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    fields: [
      { key: 'name', label: 'Project' },
      { key: 'role', label: 'Role' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'url', label: 'Project link' },
      { key: 'technologies', label: 'Technologies (one per line)', multiline: true, list: true },
    ],
  },
  {
    key: 'languages',
    title: 'Languages',
    fields: [
      { key: 'name', label: 'Language' },
      { key: 'proficiency', label: 'Proficiency' },
    ],
  },
  {
    key: 'awards',
    title: 'Awards',
    fields: [
      { key: 'name', label: 'Award' },
      { key: 'issuer', label: 'Issuing organization' },
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Details', multiline: true },
    ],
  },
];
const inputClass = 'rounded-xl border-slate-300';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(blank);
  const [extraction, setExtraction] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get<{ data: APIProfile }>('/profile');
      setProfile({
        ...blank,
        ...response.data.data.profile,
        contact: { ...blank.contact, ...response.data.data.profile.contact },
      });
      setExtraction(response.data.data.extraction);
      setError('');
    } catch {
      setError('Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);
  const processing = extraction.some(
    (item) => item.status === 'pending' || item.status === 'processing'
  );
  useEffect(() => {
    if (!processing) return;
    const timer = window.setInterval(() => {
      void loadProfile();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [processing, loadProfile]);

  function patchContact(key: string, value: string) {
    setProfile((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  }
  function updateList(key: ListKey, index: number, field: string, value: EntryValue) {
    setProfile((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  }
  function addEntry(key: ListKey) {
    setProfile((prev) => ({ ...prev, [key]: [...prev[key], { ...templates[key] }] }));
  }
  function removeEntry(key: ListKey, index: number) {
    setProfile((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  }
  function patchCustomSection(index: number, patch: Partial<CustomSection>) {
    setProfile((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section, i) =>
        i === index ? { ...section, ...patch } : section
      ),
    }));
  }
  function addCustomSection() {
    setProfile((prev) => ({
      ...prev,
      customSections: [...prev.customSections, { title: 'Additional information', fields: [] }],
    }));
  }
  function addCustomField(sectionIndex: number) {
    setProfile((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section, i) =>
        i === sectionIndex
          ? { ...section, fields: [...section.fields, { label: '', value: '' }] }
          : section
      ),
    }));
  }
  function patchCustomField(sectionIndex: number, fieldIndex: number, patch: Partial<CustomField>) {
    setProfile((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, j) =>
                j === fieldIndex ? { ...field, ...patch } : field
              ),
            }
          : section
      ),
    }));
  }
  function removeCustomField(sectionIndex: number, fieldIndex: number) {
    setProfile((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section, i) =>
        i === sectionIndex
          ? { ...section, fields: section.fields.filter((_, j) => j !== fieldIndex) }
          : section
      ),
    }));
  }
  function removeCustomSection(sectionIndex: number) {
    setProfile((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== sectionIndex),
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.put<{ data: Profile }>('/profile', profile);
      setProfile({
        ...blank,
        ...response.data.data,
        contact: { ...blank.contact, ...response.data.data.contact },
      });
      toast.success('Profile saved.');
    } catch (reason: unknown) {
      setError(
        (reason as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Could not save your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function clearProfile() {
    setClearing(true);
    try {
      await api.delete('/profile');
      setProfile(blank);
      toast.success('Profile details cleared. Your uploaded CV files are unchanged.');
      setConfirmClear(false);
    } catch {
      setError('Could not clear your profile.');
    } finally {
      setClearing(false);
    }
  }

  async function exportProfile(format: 'pdf' | 'docx') {
    setExporting(format);
    try {
      const response = await api.get(`/profile/export.${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Career_Profile.${format}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error('Save profile details before exporting.');
    } finally {
      setExporting(null);
    }
  }

  if (loading)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spin size="large" />
      </div>
    );

  const statusTag = (status: Extraction['status']) =>
    status === 'completed' ? (
      <Tag color="success">Details extracted</Tag>
    ) : status === 'failed' ? (
      <Tag color="error">Extraction failed</Tag>
    ) : (
      <Tag color="processing">Reading CV</Tag>
    );
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 text-slate-900">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Your professional details
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-slate-600">
            Upload a CV to fill this out automatically, or build your profile from scratch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<DownloadOutlined />}
            loading={exporting === 'pdf'}
            onClick={() => void exportProfile('pdf')}
          >
            Export PDF
          </Button>
          <Button
            icon={<DownloadOutlined />}
            loading={exporting === 'docx'}
            onClick={() => void exportProfile('docx')}
          >
            Export Word
          </Button>
        </div>
      </header>
      {error && <Alert type="error" showIcon title={error} />}
      {extraction
        .filter((item) => item.status !== 'completed')
        .slice(0, 5)
        .map((item) => (
          <Alert
            key={`${item.id}-${item.createdAt}`}
            showIcon
            type={item.status === 'failed' ? 'error' : 'info'}
            title={
              item.status === 'failed'
                ? `Could not read ${item.name}`
                : `Reading ${item.name} and filling your profile…`
            }
            description={
              item.status === 'failed' ? (
                <span>
                  {item.error || 'Check your Gemini API configuration.'}{' '}
                  <Button
                    type="link"
                    onClick={async () => {
                      try {
                        await api.post(`/cvs/${item.id}/extract`);
                        void loadProfile();
                      } catch {
                        setError('Could not start CV extraction. Please try again.');
                      }
                    }}
                  >
                    Try again
                  </Button>
                </span>
              ) : (
                'Your details will appear here as soon as processing finishes.'
              )
            }
          />
        ))}
      {extraction.filter((item) => item.status === 'completed').length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {extraction
            .filter((item) => item.status === 'completed')
            .slice(0, 3)
            .map((item) => (
              <span key={`${item.name}-${item.createdAt}`}>
                {statusTag(item.status)}
                <span className="text-xs text-slate-500">{item.name}</span>
              </span>
            ))}
        </div>
      )}

      <form onSubmit={save} className="space-y-5">
        <Card
          title="Contact and professional summary"
          className="rounded-2xl shadow-sm"
          extra={
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setConfirmClear(true)}
            >
              Clear profile
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'fullName', label: 'Full name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'location', label: 'Location' },
              { key: 'website', label: 'Website' },
              { key: 'linkedin', label: 'LinkedIn' },
              { key: 'github', label: 'GitHub' },
            ].map((field) => (
              <label key={field.key} className="grid gap-1.5 text-sm font-medium text-slate-700">
                {field.label}
                <Input
                  className={inputClass}
                  value={profile.contact[field.key] ?? ''}
                  onChange={(event) => patchContact(field.key, event.target.value)}
                />
              </label>
            ))}
          </div>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            Professional headline
            <Input
              className={inputClass}
              value={profile.headline}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, headline: event.target.value }))
              }
              placeholder="e.g. Product designer focused on accessible experiences"
            />
          </label>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            Summary
            <TextArea
              className={inputClass}
              rows={4}
              value={profile.summary}
              onChange={(event) => setProfile((prev) => ({ ...prev, summary: event.target.value }))}
            />
          </label>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            Skills{' '}
            <span className="text-xs font-normal text-slate-500">Separate skills with commas</span>
            <TextArea
              className={inputClass}
              rows={2}
              value={profile.skills.join(', ')}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  skills: event.target.value
                    .split(',')
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>
          <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
            Interests{' '}
            <span className="text-xs font-normal text-slate-500">
              Separate interests with commas
            </span>
            <TextArea
              className={inputClass}
              rows={2}
              value={profile.interests.join(', ')}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  interests: event.target.value
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>
        </Card>

        {sections.map(({ key, title, fields }) => (
          <Card
            key={key}
            title={title}
            className="rounded-2xl shadow-sm"
            extra={
              <Button icon={<PlusOutlined />} onClick={() => addEntry(key)}>
                Add
              </Button>
            }
          >
            {profile[key].length === 0 && (
              <p className="text-sm text-slate-500">No {title.toLowerCase()} added yet.</p>
            )}
            <div className="space-y-5">
              {profile[key].map((entry, index) => (
                <div key={`${key}-${index}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">
                      {title.slice(0, -1)} {index + 1}
                    </h3>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      aria-label={`Remove ${title} ${index + 1}`}
                      onClick={() => removeEntry(key, index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                      <label
                        key={field.key}
                        className={`grid gap-1.5 text-sm font-medium text-slate-700 ${field.multiline || field.key === 'current' ? 'sm:col-span-2' : ''}`}
                      >
                        {field.key === 'current' ? (
                          <Checkbox
                            checked={Boolean(entry.current)}
                            onChange={(event) =>
                              updateList(key, index, 'current', event.target.checked)
                            }
                          >
                            {field.label}
                          </Checkbox>
                        ) : (
                          <>
                            {field.label}
                            {field.multiline ? (
                              <TextArea
                                className={inputClass}
                                rows={
                                  field.key === 'description' || field.key === 'details' ? 3 : 2
                                }
                                value={
                                  Array.isArray(entry[field.key])
                                    ? (entry[field.key] as string[]).join('\n')
                                    : String(entry[field.key] ?? '')
                                }
                                onChange={(event) =>
                                  updateList(
                                    key,
                                    index,
                                    field.key,
                                    field.list
                                      ? event.target.value
                                          .split('\n')
                                          .map((x) => x.trim())
                                          .filter(Boolean)
                                      : event.target.value
                                  )
                                }
                              />
                            ) : (
                              <Input
                                className={inputClass}
                                value={String(entry[field.key] ?? '')}
                                onChange={(event) =>
                                  updateList(key, index, field.key, event.target.value)
                                }
                              />
                            )}
                          </>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card
          title="Additional sections"
          className="rounded-2xl shadow-sm"
          extra={
            <Button icon={<PlusOutlined />} onClick={addCustomSection}>
              Add section
            </Button>
          }
        >
          {profile.customSections.length === 0 && (
            <p className="text-sm text-slate-500">
              Details that do not fit the standard sections will appear here after CV extraction.
            </p>
          )}
          <div className="space-y-5">
            {profile.customSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Input
                    className={inputClass}
                    aria-label="Section title"
                    value={section.title}
                    onChange={(event) =>
                      patchCustomSection(sectionIndex, { title: event.target.value })
                    }
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeCustomSection(sectionIndex)}
                  >
                    Remove section
                  </Button>
                </div>
                <div className="space-y-3">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                      <Input
                        className={inputClass}
                        aria-label="Field label"
                        placeholder="Label"
                        value={field.label}
                        onChange={(event) =>
                          patchCustomField(sectionIndex, fieldIndex, { label: event.target.value })
                        }
                      />
                      <Input.TextArea
                        className={inputClass}
                        aria-label="Field value"
                        placeholder="Value"
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        value={field.value}
                        onChange={(event) =>
                          patchCustomField(sectionIndex, fieldIndex, { value: event.target.value })
                        }
                      />
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        aria-label="Remove field"
                        onClick={() => removeCustomField(sectionIndex, fieldIndex)}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-3"
                  icon={<PlusOutlined />}
                  onClick={() => addCustomField(sectionIndex)}
                >
                  Add field
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex justify-end rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Save profile
          </Button>
        </div>
      </form>
      
      <ConfirmModal
        open={confirmClear}
        title="Clear your profile?"
        description="This removes the profile details saved here. Your uploaded CV files will remain in your CV library."
        confirmLabel="Clear profile"
        destructive
        loading={clearing}
        onCancel={() => setConfirmClear(false)}
        onConfirm={clearProfile}
      />
    </div>
  );
}
