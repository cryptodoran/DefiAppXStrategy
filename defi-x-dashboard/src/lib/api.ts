// API client for Defi App X Strategy Dashboard

const API_BASE = '/api';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardAPI = {
  getSummary: () => fetchAPI<DashboardSummaryResponse>('/dashboard/summary'),
  getMetrics: (range: string) =>
    fetchAPI<MetricsResponse>(`/dashboard/metrics?range=${range}`),
};

// Posts API
export const postsAPI = {
  getAll: (params?: PostsParams) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchAPI<PostsResponse>(`/posts${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => fetchAPI<PostResponse>(`/posts/${id}`),
  create: (data: CreatePostData) =>
    fetchAPI<PostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<CreatePostData>) =>
    fetchAPI<PostResponse>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/posts/${id}`, { method: 'DELETE' }),
  schedule: (id: string, scheduledAt: Date) =>
    fetchAPI<PostResponse>(`/posts/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt }),
    }),
};

// Content Generation API
export const contentAPI = {
  generate: (data: GenerateContentData) =>
    fetchAPI<GenerateContentResponse>('/content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  analyzeQuality: (content: string) =>
    fetchAPI<QualityAnalysisResponse>('/content/analyze', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  generateThread: (data: GenerateThreadData) =>
    fetchAPI<GenerateThreadResponse>('/content/thread', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateQT: (tweetUrl: string) =>
    fetchAPI<GenerateQTResponse>('/content/qt', {
      method: 'POST',
      body: JSON.stringify({ tweetUrl }),
    }),
};

// Suggestions API
export const suggestionsAPI = {
  getDaily: () => fetchAPI<SuggestionsResponse>('/suggestions/daily'),
  getTrending: () => fetchAPI<TrendingResponse>('/suggestions/trending'),
  updateStatus: (id: string, status: string) =>
    fetchAPI<void>(`/suggestions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Research API
export const researchAPI = {
  getAlgorithmInsights: () =>
    fetchAPI<AlgorithmInsightsResponse>('/research/algorithm'),
  getCompetitors: () => fetchAPI<CompetitorsResponse>('/research/competitors'),
  getInfluencers: (tier?: string) =>
    fetchAPI<InfluencersResponse>(
      `/research/influencers${tier ? `?tier=${tier}` : ''}`
    ),
  getNarratives: () => fetchAPI<NarrativesResponse>('/research/narratives'),
  getPathTo1: () => fetchAPI<PathTo1Response>('/research/path-to-1'),
};

// Analytics API
export const analyticsAPI = {
  getPostPerformance: (postId: string) =>
    fetchAPI<PostPerformanceResponse>(`/analytics/posts/${postId}`),
  getFollowerAnalytics: () =>
    fetchAPI<FollowerAnalyticsResponse>('/analytics/followers'),
  getExposureBudget: () =>
    fetchAPI<ExposureBudgetResponse>('/analytics/exposure'),
};

// Type definitions for API responses
interface DashboardSummaryResponse {
  currentMetrics: {
    followerCount: number;
    totalImpressions: number;
    engagementRate: number;
    exposureBudget: number;
    algorithmHealth: number;
    viralPostCount: number;
  };
  previousMetrics: {
    followerCount: number;
    totalImpressions: number;
    engagementRate: number;
  } | null;
  recentPosts: Array<{
    id: string;
    content: string;
    impressions: number;
    engagements: number;
    publishedAt: string;
  }>;
  pendingSuggestions: number;
}

interface MetricsResponse {
  metrics: Array<{
    date: string;
    followerCount: number;
    impressions: number;
    engagementRate: number;
  }>;
}

interface PostsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

interface PostsResponse {
  posts: Array<{
    id: string;
    content: string;
    type: string;
    status: string;
    impressions: number;
    engagements: number;
    qualityScore: number;
    publishedAt: string | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

interface PostResponse {
  post: {
    id: string;
    content: string;
    type: string;
    status: string;
    metrics: {
      impressions: number;
      engagements: number;
      likes: number;
      retweets: number;
      replies: number;
    };
    scores: {
      qualityScore: number;
      viralScore: number;
      spiceLevel: number;
    };
  };
}

interface CreatePostData {
  content: string;
  type: string;
  scheduledAt?: string;
  topics?: string[];
}

interface GenerateContentData {
  topic: string;
  tone?: string;
  goal?: string;
  spiceLevel?: number;
  keyPoints?: string[];
}

interface GenerateContentResponse {
  variations: Array<{
    content: string;
    predictedScore: number;
    viralElements: string[];
    hookRating: number;
  }>;
}

interface QualityAnalysisResponse {
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
}

interface GenerateThreadData {
  topic: string;
  keyPoints: string[];
  targetLength: number;
}

interface GenerateThreadResponse {
  thread: Array<{
    position: number;
    content: string;
    engagementHook: boolean;
  }>;
}

interface GenerateQTResponse {
  options: Array<{
    type: string;
    content: string;
    predictedEngagement: number;
  }>;
}

interface SuggestionsResponse {
  suggestions: Array<{
    id: string;
    content: string;
    type: string;
    predictedPerformance: number;
    optimalTime: string;
    source: string;
  }>;
}

interface TrendingResponse {
  topics: Array<{
    topic: string;
    volume: number;
    lifecycle: string;
    relevance: number;
    suggestedAngles: string[];
  }>;
}

interface AlgorithmInsightsResponse {
  insights: Array<{
    id: string;
    factorName: string;
    understanding: string;
    confidence: number;
    category: string;
    impact: number;
  }>;
  lastUpdated: string;
}

interface CompetitorsResponse {
  competitors: Array<{
    id: string;
    handle: string;
    name: string;
    followers: number;
    engagement: number;
    growth: number;
  }>;
}

interface InfluencersResponse {
  influencers: Array<{
    id: string;
    handle: string;
    name: string;
    followers: number;
    tier: string;
    sentiment: number;
  }>;
}

interface NarrativesResponse {
  narratives: Array<{
    id: string;
    name: string;
    lifecycle: string;
    fit: string;
    keyAccounts: string[];
  }>;
}

interface PathTo1Response {
  currentRank: number;
  targetDate: string;
  requiredGrowthRate: number;
  gap: {
    followers: number;
    engagement: number;
  };
  recommendations: Array<{
    category: string;
    action: string;
    impact: string;
  }>;
}

interface PostPerformanceResponse {
  metrics: {
    impressions: number;
    engagements: number;
    likes: number;
    retweets: number;
    replies: number;
  };
  trajectory: Array<{
    time: string;
    impressions: number;
  }>;
  benchmarks: {
    accountAverage: number;
    ctDeFiAverage: number;
  };
}

interface FollowerAnalyticsResponse {
  demographics: {
    locations: Record<string, number>;
    languages: Record<string, number>;
  };
  quality: {
    average: number;
    distribution: Record<string, number>;
  };
  growth: {
    total: number;
    organic: number;
    viral: number;
  };
  notableFollowers: Array<{
    handle: string;
    followers: number;
    engagement: number;
  }>;
}

interface ExposureBudgetResponse {
  daily: {
    total: number;
    used: number;
    remaining: number;
  };
  breakdown: {
    mainPosts: number;
    replies: number;
    quotes: number;
  };
  recommendations: string[];
}
