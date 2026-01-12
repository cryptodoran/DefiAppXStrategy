/**
 * Twitter Intelligence Service
 * V2-013: X/Twitter Trending Topic Tracker
 * V2-014: Viral Post Detection System
 * V2-015: Competitor Real-Time Monitoring
 */

// Types
export type TrendLifecycle = 'BREAKING' | 'HOT' | 'RISING' | 'FADING' | 'DEAD';

export interface TrendingTopic {
  id: string;
  name: string;
  hashtag?: string;
  tweetCount: number;
  velocity: number; // tweets per hour
  lifecycle: TrendLifecycle;
  relevanceScore: number; // 0-100 for Defi App
  viralityPotential: number; // 0-100
  startedAt: Date;
  peakAt?: Date;
  category: 'crypto' | 'defi' | 'nft' | 'macro' | 'meme' | 'other';
  suggestedAngles: ContentAngle[];
}

export interface ContentAngle {
  type: 'agree' | 'add-context' | 'contrarian' | 'humor' | 'thread' | 'hot-take';
  hook: string;
  description: string;
  predictedEngagement: number;
}

export interface ViralPost {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorFollowers: number;
  content: string;
  publishedAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  impressions?: number;
  engagementVelocity: number; // engagement per minute
  category: 'meme' | 'news' | 'thread' | 'hot-take' | 'announcement' | 'alpha';
  qtOpportunityScore: number;
  hookPattern?: string;
  suggestedQTs: SuggestedQT[];
}

export interface SuggestedQT {
  angle: 'agree' | 'add-context' | 'contrarian' | 'humor';
  content: string;
  predictedEngagement: number;
  reasoning: string;
}

export interface CompetitorAccount {
  id: string;
  username: string;
  displayName: string;
  followers: number;
  following: number;
  avgEngagement: number;
  recentPosts: CompetitorPost[];
  topPerformers: CompetitorPost[];
  contentGaps: ContentGap[];
  postingFrequency: number; // posts per day
  lastActive: Date;
}

export interface CompetitorPost {
  id: string;
  content: string;
  publishedAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  category: string;
  performance: 'viral' | 'above-average' | 'average' | 'below-average';
}

export interface ContentGap {
  topic: string;
  description: string;
  opportunity: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface TwitterIntelligenceData {
  trendingTopics: TrendingTopic[];
  viralPosts: ViralPost[];
  competitorActivity: CompetitorAccount[];
  ctSentiment: CTSentiment;
  lastUpdated: Date;
}

export interface CTSentiment {
  overall: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  confidence: number;
  dominantNarratives: string[];
  emergingTopics: string[];
}

// Lifecycle duration thresholds (in hours)
const LIFECYCLE_THRESHOLDS = {
  BREAKING: 1,
  HOT: 4,
  RISING: 12,
  FADING: 24,
};

// Mock data generators
function generateMockTrendingTopics(): TrendingTopic[] {
  return [
    {
      id: '1',
      name: 'ETH 100K',
      hashtag: '#ETH100K',
      tweetCount: 45000,
      velocity: 2500,
      lifecycle: 'HOT',
      relevanceScore: 95,
      viralityPotential: 88,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'crypto',
      suggestedAngles: [
        {
          type: 'thread',
          hook: 'Here\'s why ETH hitting $100K is not just meme magic...',
          description: 'Data-driven analysis of ETH\'s path to $100K',
          predictedEngagement: 85,
        },
        {
          type: 'contrarian',
          hook: 'Unpopular opinion: ETH won\'t hit $100K this cycle...',
          description: 'Balanced take with reasoning',
          predictedEngagement: 92,
        },
      ],
    },
    {
      id: '2',
      name: 'DeFi Summer 2.0',
      tweetCount: 28000,
      velocity: 1800,
      lifecycle: 'RISING',
      relevanceScore: 100,
      viralityPotential: 82,
      startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      category: 'defi',
      suggestedAngles: [
        {
          type: 'thread',
          hook: 'DeFi Summer 2.0 is here. Here\'s what\'s different this time...',
          description: 'Compare and contrast with 2020',
          predictedEngagement: 78,
        },
      ],
    },
    {
      id: '3',
      name: 'Vitalik AMA',
      tweetCount: 15000,
      velocity: 5000,
      lifecycle: 'BREAKING',
      relevanceScore: 85,
      viralityPotential: 95,
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      category: 'crypto',
      suggestedAngles: [
        {
          type: 'hot-take',
          hook: 'The most important thing Vitalik just said...',
          description: 'Quick summary of key points',
          predictedEngagement: 90,
        },
      ],
    },
  ];
}

function generateMockViralPosts(): ViralPost[] {
  return [
    {
      id: '1',
      authorUsername: 'vitalikbuterin',
      authorDisplayName: 'vitalik.eth',
      authorFollowers: 5200000,
      content: 'Announcing a major update to Ethereum\'s roadmap. Thread on the implications...',
      publishedAt: new Date(Date.now() - 15 * 60 * 1000),
      likes: 12500,
      retweets: 4200,
      replies: 890,
      quotes: 1200,
      impressions: 2500000,
      engagementVelocity: 1250,
      category: 'announcement',
      qtOpportunityScore: 95,
      hookPattern: 'Announcement + Thread',
      suggestedQTs: [
        {
          angle: 'add-context',
          content: 'This is huge for DeFi. Here\'s what it means for protocols like Defi App...',
          predictedEngagement: 88,
          reasoning: 'Adding specific context for DeFi users increases relevance',
        },
        {
          angle: 'agree',
          content: 'The future of Ethereum is looking brighter than ever. Here\'s why this matters...',
          predictedEngagement: 72,
          reasoning: 'Agreeing and expanding shows alignment with ecosystem',
        },
      ],
    },
    {
      id: '2',
      authorUsername: 'defi_chad',
      authorDisplayName: 'DeFi Chad 🦍',
      authorFollowers: 89000,
      content: 'Just realized most "DeFi" protocols are just yield farms with extra steps. Real DeFi is permissionless, composable, and transparent. The rest is just noise.',
      publishedAt: new Date(Date.now() - 45 * 60 * 1000),
      likes: 4500,
      retweets: 1890,
      replies: 567,
      quotes: 890,
      engagementVelocity: 156,
      category: 'hot-take',
      qtOpportunityScore: 88,
      hookPattern: 'Contrarian hot take',
      suggestedQTs: [
        {
          angle: 'agree',
          content: 'This is exactly why we built Defi App differently. Here\'s our approach...',
          predictedEngagement: 85,
          reasoning: 'Aligning with popular sentiment while showcasing differentiation',
        },
        {
          angle: 'contrarian',
          content: 'Actually, the "extra steps" in modern DeFi serve a purpose. Here\'s why...',
          predictedEngagement: 90,
          reasoning: 'Contrarian takes on hot takes perform exceptionally well',
        },
      ],
    },
  ];
}

function generateMockCompetitors(): CompetitorAccount[] {
  return [
    {
      id: '1',
      username: 'competitor_protocol',
      displayName: 'Competitor Protocol',
      followers: 125000,
      following: 890,
      avgEngagement: 2.8,
      recentPosts: [
        {
          id: 'p1',
          content: 'Just shipped our V3 update. Here\'s what changed...',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: 1200,
          retweets: 340,
          replies: 89,
          category: 'announcement',
          performance: 'above-average',
        },
      ],
      topPerformers: [],
      contentGaps: [
        {
          topic: 'Cross-chain bridging',
          description: 'Competitor hasn\'t covered their bridging strategy',
          opportunity: 'Create content highlighting your superior bridging',
          urgency: 'medium',
        },
      ],
      postingFrequency: 3.5,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];
}

// Service functions
export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  // In production, this would call the Twitter API
  return generateMockTrendingTopics();
}

export async function fetchViralPosts(minEngagement = 1000): Promise<ViralPost[]> {
  // In production, this would use Twitter API with engagement filters
  return generateMockViralPosts().filter(
    (post) => post.likes + post.retweets > minEngagement
  );
}

export async function fetchCompetitorActivity(
  competitorUsernames: string[]
): Promise<CompetitorAccount[]> {
  // In production, this would fetch real competitor data
  return generateMockCompetitors();
}

export async function getCTSentiment(): Promise<CTSentiment> {
  return {
    overall: 'bullish',
    confidence: 0.78,
    dominantNarratives: ['ETH to 100K', 'DeFi summer 2.0', 'L2 season'],
    emergingTopics: ['Real-world assets', 'Intent-based trading'],
  };
}

export async function fetchTwitterIntelligence(): Promise<TwitterIntelligenceData> {
  const [trendingTopics, viralPosts, competitorActivity, ctSentiment] =
    await Promise.all([
      fetchTrendingTopics(),
      fetchViralPosts(),
      fetchCompetitorActivity([]),
      getCTSentiment(),
    ]);

  return {
    trendingTopics,
    viralPosts,
    competitorActivity,
    ctSentiment,
    lastUpdated: new Date(),
  };
}

// Analyze a specific trend for content opportunities
export function analyzeTrendOpportunity(trend: TrendingTopic): {
  shouldEngage: boolean;
  urgency: 'immediate' | 'soon' | 'optional';
  bestApproach: ContentAngle | null;
  reasoning: string;
} {
  const { lifecycle, relevanceScore, viralityPotential } = trend;

  // Don't engage with dead or low-relevance trends
  if (lifecycle === 'DEAD' || relevanceScore < 30) {
    return {
      shouldEngage: false,
      urgency: 'optional',
      bestApproach: null,
      reasoning: 'Trend is either dead or not relevant to Defi App',
    };
  }

  // High-priority for breaking + high relevance
  if (lifecycle === 'BREAKING' && relevanceScore > 70) {
    return {
      shouldEngage: true,
      urgency: 'immediate',
      bestApproach: trend.suggestedAngles[0] || null,
      reasoning: 'Breaking trend with high relevance - first-mover advantage',
    };
  }

  // Good opportunity for hot trends
  if (lifecycle === 'HOT' && viralityPotential > 70) {
    return {
      shouldEngage: true,
      urgency: 'soon',
      bestApproach: trend.suggestedAngles[0] || null,
      reasoning: 'Hot trend with strong virality potential',
    };
  }

  // Optional for rising trends
  return {
    shouldEngage: relevanceScore > 60,
    urgency: 'optional',
    bestApproach: trend.suggestedAngles[0] || null,
    reasoning: 'Rising trend - engage if aligned with content strategy',
  };
}

// Generate QT suggestions for a viral post
export function generateQTSuggestions(post: ViralPost): SuggestedQT[] {
  // In production, this would use AI to generate contextual suggestions
  return post.suggestedQTs;
}

// Export service
export const TwitterIntelligenceService = {
  fetchTrendingTopics,
  fetchViralPosts,
  fetchCompetitorActivity,
  getCTSentiment,
  fetchTwitterIntelligence,
  analyzeTrendOpportunity,
  generateQTSuggestions,
};
