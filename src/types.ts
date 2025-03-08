export interface Resume {
  id: string;
  name: string;
  content: string;
  file: File;
  uploadDate: string;
}

export interface JobDesc {
  id: string;
  title: string;
  company?: string;
  content: string;
  source: 'manual' | 'url';
  url?: string;
  saveDate: string;
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobDescId: string;
  timestamp: string;
  overallScore: number;
  categories: {
    keywordMatch: {
      score: number;
      matches: string[];
      missing: string[];
    };
    repetition: {
      score: number;
      overusedWords: string[];
    };
    jobFit: {
      score: number;
      feedback: string;
    };
    fillerWords: {
      score: number;
      words: string[];
    };
    growthSignals: {
      score: number;
      feedback: string;
    };
    spelling: {
      score: number;
      errors: string[];
    };
    buzzwords: {
      score: number;
      appropriate: string[];
      excessive: string[];
    };
    unnecessarySections: {
      score: number;
      sections: string[];
    };
  };
  recommendations: string[];
}

export interface ScoreCategory {
  name: string;
  score: number;
  icon: React.ReactNode;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limits: {
    resumeUploads: number;
    savedJobDescriptions: number;
    analysisHistory: number;
    aiRewrites: boolean;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}