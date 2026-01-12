/**
 * Suggestion Engine Service
 * V2-018: Context Assembly Pipeline
 * V2-019: Premium Suggestion Engine
 * V2-020: Anti-Slop Detection System
 * V2-021: Brand Voice Enforcement
 */

import { MarketDataService, MarketMoodAnalysis } from './market-data';
import { TwitterIntelligenceService, TrendingTopic, ViralPost } from './twitter-intelligence';

// Types
export interface ContextBlock {
  market: MarketContext;
  twitter: TwitterContext;
  competitor: CompetitorContext;
  brand: BrandContext;
  timestamp: Date;
}

export interface MarketContext {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
  mood: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
  upcomingEvents: string[];
  summary: string;
}

export interface TwitterContext {
  topTrends: { name: string; relevance: number }[];
  viralPosts: { author: string; topic: string; qtScore: number }[];
  ctSentiment: string;
  dominantNarratives: string[];
  summary: string;
}

export interface CompetitorContext {
  recentActivity: { competitor: string; action: string; time: string }[];
  contentGaps: string[];
  summary: string;
}

export interface BrandContext {
  recentPosts: { content: string; performance: string }[];
  topicCoverage: string[];
  exposureBudget: number;
  summary: string;
}

export interface ContentSuggestion {
  id: string;
  type: 'post' | 'thread' | 'qt' | 'reply';
  trigger: 'reactive' | 'proactive';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  content: string;
  alternateVersions?: string[];
  hook: string;
  angle: string;
  why: string;
  timingWindow: string;
  predictedPerformance: {
    engagementScore: number;
    viralityChance: number;
    confidence: number;
  };
  qualityScore: QualityScore;
  contextReferences: string[];
  targetTrend?: string;
  targetPost?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface QualityScore {
  overall: number;
  breakdown: {
    hook: number;
    value: number;
    originality: number;
    voice: number;
    specificity: number;
    antiSlop: number;
  };
  issues: QualityIssue[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface QualityIssue {
  type: 'slop' | 'generic' | 'emoji-overload' | 'hollow-enthusiasm' | 'no-value' | 'off-brand' | 'competitor-mention';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion: string;
  location?: { start: number; end: number };
}

// Anti-Slop Detection Patterns (V2-020)
const SLOP_PATTERNS = {
  genericPhrases: [
    /\b(game.?changer|revolutionary|innovative solution|cutting.?edge|next.?level)\b/gi,
    /\b(unlock(?:ing)? the (?:power|potential|future))\b/gi,
    /\b(exciting times|exciting news|big news coming)\b/gi,
    /\b(stay tuned|watch this space|more to come)\b/gi,
    /\b(let's? go|LFG|we're? (just )?getting started)\b/gi,
    /\b(the future (?:is|of) (?:here|now))\b/gi,
    /\b(join (?:us|the) (?:on this )?journey)\b/gi,
  ],
  hollowEnthusiasm: [
    /^(?:Wow|Amazing|Incredible|Unbelievable)!?\s/i,
    /!{2,}/g,
    /\b(absolutely|literally|honestly|seriously)\s+(love|amazing|incredible)\b/gi,
  ],
  emojiPatterns: [
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu,
  ],
  noValue: [
    /^(gm|gn|good morning|good night)\.?$/i,
    /^(this|this is it|so true|facts)\.?$/i,
    /^.{0,15}$/,
  ],
};

// Brand Voice Configuration (V2-021)
export interface BrandVoiceConfig {
  tone: string[];
  vocabulary: {
    preferred: string[];
    avoid: string[];
  };
  topics: {
    core: string[];
    adjacent: string[];
    blacklist: string[];
  };
  style: {
    maxEmojis: number;
    allowHashtags: boolean;
    threadStyle: string;
  };
  competitors: string[];
}

const DEFAULT_BRAND_VOICE: BrandVoiceConfig = {
  tone: ['authoritative', 'witty', 'data-driven', 'accessible'],
  vocabulary: {
    preferred: ['protocol', 'composable', 'permissionless', 'alpha', 'edge'],
    avoid: ['moon', 'diamond hands', 'WAGMI', 'NFA', 'DYOR'],
  },
  topics: {
    core: ['DeFi', 'yield strategies', 'protocol analysis', 'market structure'],
    adjacent: ['Ethereum', 'L2s', 'MEV', 'governance', 'tokenomics'],
    blacklist: ['gambling', 'pump and dump', 'insider trading'],
  },
  style: {
    maxEmojis: 2,
    allowHashtags: false,
    threadStyle: 'educational with data',
  },
  competitors: ['competitor_protocol', 'rival_defi', 'other_app'],
};

// Context Assembly (V2-018)
export async function assembleContext(): Promise<ContextBlock> {
  const startTime = Date.now();

  const [marketMood, twitterIntel] = await Promise.all([
    MarketDataService.analyzeMarketMood(),
    TwitterIntelligenceService.fetchTwitterIntelligence(),
  ]);

  const context: ContextBlock = {
    market: {
      btcPrice: 97842,
      btcChange24h: 2.34,
      ethPrice: 3456,
      ethChange24h: -0.87,
      mood: marketMood.mood,
      fearGreedIndex: 72,
      fearGreedLabel: 'Greed',
      upcomingEvents: ['CPI Data Jan 15', 'FOMC Meeting Jan 22'],
      summary: `Market is ${marketMood.mood.toLowerCase()}. BTC at $97.8K (+2.34%), ETH at $3.4K (-0.87%). Fear & Greed at 72 (Greed).`,
    },
    twitter: {
      topTrends: twitterIntel.trendingTopics.slice(0, 5).map((t) => ({
        name: t.name,
        relevance: t.relevanceScore,
      })),
      viralPosts: twitterIntel.viralPosts.slice(0, 3).map((p) => ({
        author: p.authorUsername,
        topic: p.category,
        qtScore: p.qtOpportunityScore,
      })),
      ctSentiment: twitterIntel.ctSentiment.overall,
      dominantNarratives: twitterIntel.ctSentiment.dominantNarratives,
      summary: `CT sentiment is ${twitterIntel.ctSentiment.overall}. Top trends: ${twitterIntel.trendingTopics.slice(0, 3).map((t) => t.name).join(', ')}.`,
    },
    competitor: {
      recentActivity: [
        { competitor: 'Competitor Protocol', action: 'Posted V3 update thread', time: '2h ago' },
      ],
      contentGaps: ['Cross-chain bridging', 'Real-time analytics'],
      summary: 'Competitors focused on product updates. Opportunity in educational content.',
    },
    brand: {
      recentPosts: [
        { content: 'Thread on yield optimization...', performance: 'above-average' },
      ],
      topicCoverage: ['DeFi basics', 'Protocol analysis'],
      exposureBudget: 67,
      summary: 'Strong performance on educational content. 67% exposure budget remaining.',
    },
    timestamp: new Date(),
  };

  const assemblyTime = Date.now() - startTime;
  if (assemblyTime > 500) {
    console.warn(`Context assembly took ${assemblyTime}ms (target: <500ms)`);
  }

  return context;
}

// Anti-Slop Detection (V2-020)
export function detectSlop(content: string): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check for generic AI phrases
  for (const pattern of SLOP_PATTERNS.genericPhrases) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'generic',
        severity: 'critical',
        description: `Generic phrase detected: "${matches[0]}"`,
        suggestion: 'Replace with specific, concrete language',
      });
    }
  }

  // Check for hollow enthusiasm
  for (const pattern of SLOP_PATTERNS.hollowEnthusiasm) {
    if (pattern.test(content)) {
      issues.push({
        type: 'hollow-enthusiasm',
        severity: 'warning',
        description: 'Content starts with hollow enthusiasm',
        suggestion: 'Lead with value or a specific insight instead',
      });
    }
  }

  // Check emoji count
  const emojiMatches = content.match(SLOP_PATTERNS.emojiPatterns[0]) || [];
  if (emojiMatches.length > 2) {
    issues.push({
      type: 'emoji-overload',
      severity: 'warning',
      description: `Too many emojis (${emojiMatches.length}). Max recommended: 2`,
      suggestion: 'Remove excess emojis. Quality content speaks for itself.',
    });
  }

  // Check for no-value content
  for (const pattern of SLOP_PATTERNS.noValue) {
    if (pattern.test(content)) {
      issues.push({
        type: 'no-value',
        severity: 'critical',
        description: 'Content provides no value to the reader',
        suggestion: 'Add specific insights, data, or actionable information',
      });
    }
  }

  return issues;
}

// Brand Voice Validation (V2-021)
export function validateBrandVoice(
  content: string,
  config: BrandVoiceConfig = DEFAULT_BRAND_VOICE
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const lowerContent = content.toLowerCase();

  // Check for competitor mentions
  for (const competitor of config.competitors) {
    if (lowerContent.includes(competitor.toLowerCase())) {
      issues.push({
        type: 'competitor-mention',
        severity: 'critical',
        description: `Competitor "${competitor}" mentioned in content`,
        suggestion: 'Focus on your own value proposition instead',
      });
    }
  }

  // Check for blacklisted topics
  for (const topic of config.topics.blacklist) {
    if (lowerContent.includes(topic.toLowerCase())) {
      issues.push({
        type: 'off-brand',
        severity: 'critical',
        description: `Blacklisted topic "${topic}" detected`,
        suggestion: 'Remove reference to this topic',
      });
    }
  }

  // Check for vocabulary to avoid
  for (const word of config.vocabulary.avoid) {
    if (lowerContent.includes(word.toLowerCase())) {
      issues.push({
        type: 'off-brand',
        severity: 'warning',
        description: `Vocabulary to avoid: "${word}"`,
        suggestion: `Use preferred alternatives from brand voice guide`,
      });
    }
  }

  return issues;
}

// Calculate Quality Score (V2-019)
export function calculateQualityScore(
  content: string,
  context?: ContextBlock
): QualityScore {
  const slopIssues = detectSlop(content);
  const brandIssues = validateBrandVoice(content);
  const allIssues = [...slopIssues, ...brandIssues];

  // Base scores
  let hookScore = 70;
  let valueScore = 70;
  let originalityScore = 70;
  let voiceScore = 80;
  let specificityScore = 70;
  let antiSlopScore = 100;

  // Deduct for issues
  for (const issue of allIssues) {
    if (issue.severity === 'critical') {
      antiSlopScore -= 30;
      if (issue.type === 'generic' || issue.type === 'hollow-enthusiasm') {
        hookScore -= 20;
        originalityScore -= 25;
      }
      if (issue.type === 'no-value') {
        valueScore -= 40;
      }
      if (issue.type === 'off-brand' || issue.type === 'competitor-mention') {
        voiceScore -= 30;
      }
    } else if (issue.severity === 'warning') {
      antiSlopScore -= 15;
      if (issue.type === 'emoji-overload') {
        voiceScore -= 10;
      }
    }
  }

  // Boost for good patterns
  if (content.includes('data') || content.includes('analysis') || /\d+%|\$[\d,]+/.test(content)) {
    specificityScore += 15;
    valueScore += 10;
  }

  if (content.length > 100 && content.length < 280) {
    hookScore += 5;
  }

  // Check context references
  if (context) {
    const hasContextRef =
      content.toLowerCase().includes('btc') ||
      content.toLowerCase().includes('eth') ||
      context.twitter.topTrends.some((t) => content.toLowerCase().includes(t.name.toLowerCase()));
    if (hasContextRef) {
      specificityScore += 10;
    }
  }

  // Clamp scores
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  hookScore = clamp(hookScore);
  valueScore = clamp(valueScore);
  originalityScore = clamp(originalityScore);
  voiceScore = clamp(voiceScore);
  specificityScore = clamp(specificityScore);
  antiSlopScore = clamp(antiSlopScore);

  // Calculate overall
  const overall = Math.round(
    hookScore * 0.2 +
    valueScore * 0.25 +
    originalityScore * 0.15 +
    voiceScore * 0.15 +
    specificityScore * 0.1 +
    antiSlopScore * 0.15
  );

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall,
    breakdown: {
      hook: hookScore,
      value: valueScore,
      originality: originalityScore,
      voice: voiceScore,
      specificity: specificityScore,
      antiSlop: antiSlopScore,
    },
    issues: allIssues,
    grade,
  };
}

// Generate Suggestions (V2-019)
export async function generateSuggestions(limit = 5): Promise<ContentSuggestion[]> {
  const context = await assembleContext();
  const twitterIntel = await TwitterIntelligenceService.fetchTwitterIntelligence();

  const suggestions: ContentSuggestion[] = [];

  // Reactive suggestions from trends
  for (const trend of twitterIntel.trendingTopics.slice(0, 2)) {
    if (trend.relevanceScore > 70) {
      const suggestion: ContentSuggestion = {
        id: `trend-${trend.id}`,
        type: 'post',
        trigger: 'reactive',
        priority: trend.lifecycle === 'BREAKING' ? 'urgent' : 'high',
        content: trend.suggestedAngles[0]?.hook || `Hot take on ${trend.name}...`,
        hook: trend.suggestedAngles[0]?.hook || '',
        angle: trend.suggestedAngles[0]?.type || 'hot-take',
        why: `${trend.name} is ${trend.lifecycle.toLowerCase()} with ${trend.viralityPotential}% virality potential`,
        timingWindow: trend.lifecycle === 'BREAKING' ? 'Next 30 mins' : 'Next 2 hours',
        predictedPerformance: {
          engagementScore: trend.viralityPotential,
          viralityChance: trend.viralityPotential * 0.8,
          confidence: 0.75,
        },
        qualityScore: calculateQualityScore(trend.suggestedAngles[0]?.hook || '', context),
        contextReferences: [trend.name],
        targetTrend: trend.name,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (trend.lifecycle === 'BREAKING' ? 60 : 120) * 60 * 1000),
      };
      suggestions.push(suggestion);
    }
  }

  // Reactive suggestions from viral posts (QT opportunities)
  for (const post of twitterIntel.viralPosts.slice(0, 2)) {
    if (post.qtOpportunityScore > 80) {
      const qt = post.suggestedQTs[0];
      if (qt) {
        const suggestion: ContentSuggestion = {
          id: `qt-${post.id}`,
          type: 'qt',
          trigger: 'reactive',
          priority: 'high',
          content: qt.content,
          hook: qt.content.split('.')[0] + '.',
          angle: qt.angle,
          why: qt.reasoning,
          timingWindow: 'Next 1 hour',
          predictedPerformance: {
            engagementScore: qt.predictedEngagement,
            viralityChance: qt.predictedEngagement * 0.7,
            confidence: 0.8,
          },
          qualityScore: calculateQualityScore(qt.content, context),
          contextReferences: [`@${post.authorUsername}'s post`],
          targetPost: post.id,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        };
        suggestions.push(suggestion);
      }
    }
  }

  // Proactive suggestion based on content strategy
  const proactiveSuggestion: ContentSuggestion = {
    id: 'proactive-1',
    type: 'thread',
    trigger: 'proactive',
    priority: 'medium',
    content: `Thread: The complete breakdown of ${context.twitter.dominantNarratives[0] || 'DeFi trends'} and what it means for your portfolio...`,
    alternateVersions: [
      `Most people don't understand ${context.twitter.dominantNarratives[0] || 'DeFi'}. Here's what the data actually shows...`,
      `I analyzed the top protocols and found surprising patterns. Thread on what actually matters...`,
    ],
    hook: `Thread: The complete breakdown of ${context.twitter.dominantNarratives[0] || 'DeFi trends'}...`,
    angle: 'educational',
    why: 'Educational threads perform 3.2x better than single posts. Aligns with current narrative.',
    timingWindow: 'Optimal: Today 2:30 PM EST',
    predictedPerformance: {
      engagementScore: 82,
      viralityChance: 45,
      confidence: 0.7,
    },
    qualityScore: calculateQualityScore('Thread: The complete breakdown...', context),
    contextReferences: context.twitter.dominantNarratives,
    createdAt: new Date(),
  };
  suggestions.push(proactiveSuggestion);

  // Filter out suggestions with grade D or F (zero tolerance for low quality)
  return suggestions
    .filter((s) => s.qualityScore.grade !== 'D' && s.qualityScore.grade !== 'F')
    .slice(0, limit);
}

// Export service
export const SuggestionEngine = {
  assembleContext,
  detectSlop,
  validateBrandVoice,
  calculateQualityScore,
  generateSuggestions,
};
