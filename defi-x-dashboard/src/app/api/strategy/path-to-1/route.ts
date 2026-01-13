import { NextResponse } from 'next/server';
import { isClaudeConfigured, callClaude, parseClaudeJSON } from '@/lib/claude';

interface StrategyData {
  currentMetrics: {
    followers: number;
    engagementRate: number;
    tweetsPerWeek: number;
    avgLikes: number;
    avgRetweets: number;
  };
  ranking: {
    position: number;
    totalAccounts: number;
    gapTo1: number;
  };
  strategies: {
    category: string;
    recommendations: {
      action: string;
      impact: 'Very High' | 'High' | 'Medium' | 'Low';
      effort: 'High' | 'Medium' | 'Low';
      status: 'in_progress' | 'planned' | 'not_started' | 'completed';
      reasoning: string;
    }[];
  }[];
  weeklyPlan: {
    day: string;
    content: string;
    type: string;
    optimalTime: string;
  }[];
  viralPatterns: {
    pattern: string;
    effectiveness: number;
    example: string;
  }[];
  competitorInsights: {
    account: string;
    strength: string;
    weakness: string;
    opportunity: string;
  }[];
  _demo?: boolean;
}

// Generate demo strategy data
function getDemoStrategy(): StrategyData {
  return {
    currentMetrics: {
      followers: 89500,
      engagementRate: 4.2,
      tweetsPerWeek: 12,
      avgLikes: 892,
      avgRetweets: 234,
    },
    ranking: {
      position: 8,
      totalAccounts: 50,
      gapTo1: 1100000,
    },
    strategies: [
      {
        category: 'Content',
        recommendations: [
          {
            action: 'increase thread output to 4-5 per week',
            impact: 'Very High',
            effort: 'Medium',
            status: 'planned',
            reasoning: 'threads get 3x more engagement than single posts based on @defiapp data',
          },
          {
            action: 'create "defi fees exposed" viral series',
            impact: 'High',
            effort: 'Medium',
            status: 'not_started',
            reasoning: 'fee comparison content aligns with brand and has high share potential',
          },
          {
            action: 'post during peak hours: 10am, 2pm, 6pm EST',
            impact: 'Medium',
            effort: 'Low',
            status: 'in_progress',
            reasoning: 'CT engagement peaks at these times based on historical data',
          },
        ],
      },
      {
        category: 'Engagement',
        recommendations: [
          {
            action: 'QT every viral defi post within 30 mins',
            impact: 'High',
            effort: 'Low',
            status: 'in_progress',
            reasoning: 'early QTs on viral content get 5x more visibility',
          },
          {
            action: 'reply to @vitalikbuterin, @sassal0x, @defiignas within first hour',
            impact: 'Very High',
            effort: 'Medium',
            status: 'planned',
            reasoning: 'association with mega accounts drives follower growth',
          },
          {
            action: 'start weekly "defi app office hours" spaces',
            impact: 'Medium',
            effort: 'High',
            status: 'not_started',
            reasoning: 'spaces create community and recurring engagement',
          },
        ],
      },
      {
        category: 'Viral Campaigns',
        recommendations: [
          {
            action: 'launch "stop paying fees" campaign with real savings data',
            impact: 'Very High',
            effort: 'Medium',
            status: 'planned',
            reasoning: 'data-backed campaigns get shared by data accounts',
          },
          {
            action: 'controversial takes on competitor fee structures',
            impact: 'High',
            effort: 'Low',
            status: 'not_started',
            reasoning: 'controversy drives engagement but stay factual',
          },
          {
            action: 'user savings testimonial campaign',
            impact: 'Medium',
            effort: 'Low',
            status: 'planned',
            reasoning: 'social proof + UGC amplifies reach',
          },
        ],
      },
      {
        category: 'Partnerships',
        recommendations: [
          {
            action: 'collab with @thedefiedge on educational content',
            impact: 'High',
            effort: 'Medium',
            status: 'planned',
            reasoning: 'complementary audiences, high engagement creator',
          },
          {
            action: 'sponsor @lookonchain thread mentions',
            impact: 'Medium',
            effort: 'Low',
            status: 'not_started',
            reasoning: 'on-chain data credibility + large audience',
          },
          {
            action: 'cross-promote with non-competing protocols',
            impact: 'Medium',
            effort: 'Low',
            status: 'not_started',
            reasoning: 'mutual growth without brand dilution',
          },
        ],
      },
    ],
    weeklyPlan: [
      { day: 'Monday', content: 'thread: weekend recap + alpha', type: 'educational', optimalTime: '10:00 AM EST' },
      { day: 'Tuesday', content: 'product tip + savings example', type: 'product', optimalTime: '2:00 PM EST' },
      { day: 'Wednesday', content: 'hot take on trending topic', type: 'engagement', optimalTime: '12:00 PM EST' },
      { day: 'Thursday', content: 'thread: deep dive tutorial', type: 'educational', optimalTime: '10:00 AM EST' },
      { day: 'Friday', content: 'engagement post + community shoutout', type: 'community', optimalTime: '6:00 PM EST' },
      { day: 'Saturday', content: 'meme or light content', type: 'viral', optimalTime: '11:00 AM EST' },
      { day: 'Sunday', content: 'week preview + alpha hints', type: 'teaser', optimalTime: '7:00 PM EST' },
    ],
    viralPatterns: [
      { pattern: 'Rhetorical questions', effectiveness: 85, example: 'why are you still paying 2% fees?' },
      { pattern: 'Data-backed claims', effectiveness: 82, example: 'users saved $2.1M last month' },
      { pattern: 'Controversial takes', effectiveness: 78, example: 'hot take: most defi protocols are middlemen' },
      { pattern: 'Thread openers', effectiveness: 75, example: 'thread: the complete breakdown of...' },
      { pattern: 'Short punchy statements', effectiveness: 72, example: 'we ship. you save. simple.' },
    ],
    competitorInsights: [
      {
        account: '@1inch',
        strength: 'Technical credibility, large audience',
        weakness: 'Generic content, low engagement rate',
        opportunity: 'Out-engage with spicier content',
      },
      {
        account: '@paraswap',
        strength: 'Strong DeFi community',
        weakness: 'Inconsistent posting',
        opportunity: 'Fill content gaps with better consistency',
      },
      {
        account: '@CoWSwap',
        strength: 'Unique MEV protection angle',
        weakness: 'Niche audience',
        opportunity: 'Broader educational content',
      },
    ],
    _demo: true,
  };
}

export async function GET() {
  try {
    // In production, this would:
    // 1. Fetch current account metrics from Twitter API
    // 2. Analyze competitor accounts
    // 3. Generate AI-powered strategies

    // For now, return demo data (or AI-generated if Claude is configured)
    if (isClaudeConfigured()) {
      try {
        const systemPrompt = `You are a social media growth strategist specializing in Crypto Twitter. Generate actionable, specific strategies for @defiapp to grow their account.

Context about @defiapp:
- DeFi aggregator product
- Voice: casual, lowercase, direct, slightly confrontational
- Current focus: fee savings, best rates, multi-chain

Provide strategies that:
1. Are specific and actionable
2. Match their brand voice
3. Focus on realistic growth tactics
4. Include timing and measurement`;

        const userPrompt = `Generate a comprehensive Path to #1 strategy for @defiapp. Include:
1. 4 strategy categories with 3 recommendations each
2. A 7-day content plan
3. 5 viral content patterns that work for them
4. 3 competitor insights

Return as JSON matching this structure:
{
  "strategies": [...],
  "weeklyPlan": [...],
  "viralPatterns": [...],
  "competitorInsights": [...]
}`;

        const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 3000 });
        const aiStrategy = parseClaudeJSON<Partial<StrategyData>>(response);

        // Merge AI suggestions with current metrics
        const demoData = getDemoStrategy();
        return NextResponse.json({
          ...demoData,
          ...aiStrategy,
          _demo: false,
        });
      } catch (aiError) {
        console.error('AI strategy generation failed:', aiError);
        // Fall through to demo data
      }
    }

    return NextResponse.json(getDemoStrategy());
  } catch (error) {
    console.error('Strategy API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy' },
      { status: 500 }
    );
  }
}
