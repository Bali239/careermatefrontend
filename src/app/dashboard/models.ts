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
    overallScore?: number | null;
    strengths: string[];
    gaps: string[];
    missingSkills: string[];
    recommendations: Array<{
      issue?: string;
      whyItMatters?: string;
      suggestedImprovement?: string;
      relevantSection?: string;
      requiresAdditionalInfo?: boolean;
    }>;
    keywords: string[];
    tailoredSummary: string;
    editableHtml: string;
    scoreBreakdown?: { label: string; score: number; note: string }[];
    overallJobMatch?: {
      score: number;
      technicalSkills?: number;
      experienceRelevance?: number;
      educationAlignment?: number;
      keywordCoverage?: number;
      evidenceQuality?: number;
      explanation?: string;
      strongestAreas?: string[];
      biggestGaps?: string[];
    };
    skillsComparison?: Array<{
      requirement: string;
      status: 'matched' | 'partially matched' | 'not demonstrated' | 'unclear';
      importance: 'required' | 'preferred' | 'optional';
      evidence: string[];
      explanation: string;
      nextAction: string;
    }>;
    atsReadiness?: {
      keywordCoverage: string;
      standardHeadings: string;
      contactInformation: string;
      chronology: string;
      readability: string;
      quantifiedAchievements: string;
      technicalDocumentChecks: string[];
      aiRecommendations: string[];
    };
    experienceInsights?: Array<{
      title: string;
      relevance: 'high' | 'medium' | 'low';
      evidence: string[];
      skillsDemonstrated: string[];
      weaknesses: string[];
      priorities: string[];
    }>;
    jobDescriptionBreakdown?: {
      title?: string;
      seniority?: string;
      responsibilities: string[];
      requiredSkills: string[];
      preferredSkills: string[];
      education: string[];
      certifications: string[];
      experienceRequirements: string[];
      technologies: string[];
      softSkills: string[];
      keywords: string[];
      majorExpectations: string[];
    };
  } | null;
  analysisStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  analysisError?: string;
  draftHtml: string;
  isEditing: boolean;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  error: string;
  sourceCvName?: string;
  sourceCvFileName?: string;
  generatedCvVersions?: Array<{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    filename: string;
    docxFileName?: string;
    pdfFileName?: string;
    docxRef?: string;
    pdfRef?: string;
    summary?: string;
    createdAt?: string;
    error?: string;
  }>;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
};
