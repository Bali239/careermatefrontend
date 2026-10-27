export type CV = {
  id: string;
  name: string;
  fileName: string;
  contentType: string;
  size: number;
  extractionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  extractionError?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  cvId: string;
  jobDescription: string;
  analysis: {
    summary: string;
    atsScore: number;
    strengths: string[];
    gaps: string[];
    missingSkills: string[];
    recommendations: string[];
    keywords: string[];
    tailoredSummary: string;
    editableHtml: string;
    scoreBreakdown?: { label: string; score: number; note: string }[];
  } | null;
  draftHtml: string;
  isEditing: boolean;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  error: string;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
};
