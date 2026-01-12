// Core type definitions for DeFi App X Strategy Dashboard

// Post types
export type PostType = 'SINGLE' | 'THREAD' | 'QT' | 'ARTICLE' | 'MEME' | 'ANNOUNCEMENT';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface PostMetrics {
  impressions: number;
  engagements: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  linkClicks: number;
  profileVisits: number;
}

export interface PostScores {
  qualityScore: number | null;
  viralScore: number | null;
  spiceLevel: number | null;
  brandAlignment: number | null;
  slopScore: number | null;
}

export interface Post extends PostMetrics, PostScores {
  id: string;
  xPostId: string | null;
  content: string;
  type: PostType;
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  contentType: string | null;
  topics: string[];
  campaignId: string | null;
}

// Account metrics
export interface AccountMetrics {
  id: string;
  date: Date;
  followerCount: number;
  followingCount: number;
  totalImpressions: number;
  engagementRate: number;
  exposureBudget: number | null;
  algorithmHealth: number | null;
  viralPostCount: number;
}

// Dashboard summary
export interface DashboardSummary {
  currentMetrics: AccountMetrics;
  previousMetrics: AccountMetrics | null;
  recentPosts: Post[];
  viralPosts: Post[];
  algorithmInsights: AlgorithmInsight[];
  pendingSuggestions: ContentSuggestion[];
}

// Algorithm insights
export type AlgorithmCategory =
  | 'EXPOSURE_ALLOCATION'
  | 'CONTENT_QUALITY'
  | 'ENGAGEMENT_WEIGHTING'
  | 'REPLY_DYNAMICS'
  | 'QT_VS_RT'
  | 'THREAD_BOOST'
  | 'PENALTY_TRIGGERS'
  | 'OTHER';

export interface AlgorithmInsight {
  id: string;
  factorName: string;
  currentUnderstanding: string;
  confidenceLevel: number;
  source: string | null;
  discoveredAt: Date;
  verifiedBy: string | null;
  impactRating: number | null;
  category: AlgorithmCategory;
  isActive: boolean;
}

// Content suggestions
export type SuggestionType =
  | 'TRENDING'
  | 'PRODUCT_UPDATE'
  | 'HISTORICAL_PATTERN'
  | 'COMPETITOR_GAP'
  | 'CALENDAR_EVENT'
  | 'AI_GENERATED';

export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'DISMISSED' | 'USED' | 'SAVED';

export interface ContentSuggestion {
  id: string;
  content: string;
  suggestionType: SuggestionType;
  sourceTrend: string | null;
  predictedPerformance: number | null;
  optimalTime: Date | null;
  status: SuggestionStatus;
  spiceLevel: number | null;
  createdAt: Date;
}

// Competitor
export type CompetitorType = 'BRAND' | 'INFLUENCER' | 'KOL';

export interface Competitor {
  id: string;
  xHandle: string;
  name: string;
  type: CompetitorType;
  followerCount: number;
  followingCount: number;
  avgEngagement: number;
  growthRate: number;
  postingFrequency: number;
  priorityLevel: number;
  lastAnalyzed: Date | null;
  topPosts: unknown;
  contentMix: unknown;
}

// Influencer
export type InfluencerTier = 'NANO' | 'MICRO' | 'MACRO' | 'MEGA';

export interface Influencer {
  id: string;
  xHandle: string;
  name: string;
  followerCount: number;
  qualityScore: number | null;
  engagementRate: number | null;
  contentFocus: string[];
  tier: InfluencerTier;
  pastCollabs: unknown;
  defiAppSentiment: number | null;
  contactInfo: string | null;
  engagementHistory: unknown;
}

// Narratives
export type NarrativeLifecycle = 'EMERGING' | 'GROWING' | 'DOMINANT' | 'FADING' | 'DEAD';

export interface Narrative {
  id: string;
  name: string;
  description: string | null;
  lifecycle: NarrativeLifecycle;
  keyAccounts: string[];
  defiAppFit: string | null;
  suggestedContent: unknown;
}

// Brand voice
export interface BrandVoice {
  id: string;
  name: string;
  tone: string[];
  vocabulary: string[];
  blacklist: string[];
  whitelist: string[];
  graylist: string[];
  isActive: boolean;
}

// Content generation
export interface ContentGenerationRequest {
  topic: string;
  tone?: 'professional' | 'casual' | 'edgy' | 'educational' | 'humorous';
  goal?: 'engagement' | 'growth' | 'awareness';
  spiceLevel?: number; // 1-10
  contentType?: PostType;
  keyPoints?: string[];
  targetLength?: number;
}

export interface GeneratedContent {
  content: string;
  predictedScore: number;
  viralElements: string[];
  hookAnalysis: {
    rating: number;
    feedback: string;
  };
  brandAlignmentScore: number;
  suggestions: string[];
}

// Quality analysis
export interface QualityAnalysis {
  overallScore: number;
  breakdown: {
    originality: number;
    valueDensity: number;
    engagementHooks: number;
    clarity: number;
    brandVoice: number;
  };
  warnings: string[];
  improvements: string[];
  slopIndicators: string[];
}

// Trending topic
export interface TrendingTopic {
  id: string;
  topic: string;
  volume: number;
  lifecycle: 'emerging' | 'peaking' | 'declining';
  relevanceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedAngles: string[];
}

// Research report
export type ReportType =
  | 'ALGORITHM_UPDATE'
  | 'COMPETITOR_ANALYSIS'
  | 'TREND_REPORT'
  | 'PERFORMANCE_REVIEW'
  | 'STRATEGY_RECOMMENDATION'
  | 'NARRATIVE_ANALYSIS';

export interface ResearchReport {
  id: string;
  reportType: ReportType;
  title: string;
  content: string;
  generatedAt: Date;
  insights: unknown;
  actionItems: unknown;
  relatedPosts: string[];
}

// UI State
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  children?: NavigationItem[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
