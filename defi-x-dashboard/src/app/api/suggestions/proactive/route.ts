import { NextResponse } from 'next/server';
import {
  callClaude,
  parseClaudeJSON,
  isClaudeConfigured,
  DEFAULT_DEFI_APP_VOICE,
} from '@/lib/claude';

export interface ProactiveSuggestion {
  id: string;
  content: string;
  relevanceReason: string;
  basedOn?: {
    type: 'viral_tweet' | 'trending_topic' | 'market_move' | 'news';
    source: string;
    link?: string;
  };
  imageSuggestion: {
    type: 'meme' | 'chart' | 'infographic' | 'screenshot' | 'custom';
    description: string;
    prompt: string;
  };
  predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
  voiceMatchScore: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '5');

    // Fetch context from various sources
    const [viralContext, marketContext] = await Promise.all([
      fetchViralContext(),
      fetchMarketContext(),
    ]);

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      return NextResponse.json({
        _demo: true,
        suggestions: getDemoSuggestions(count),
        context: { viral: viralContext, market: marketContext },
      });
    }

    // Generate suggestions using Claude
    const suggestions = await generateProactiveSuggestions(
      viralContext,
      marketContext,
      count
    );

    return NextResponse.json({
      suggestions,
      context: { viral: viralContext, market: marketContext },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Proactive suggestions API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: String(error) },
      { status: 500 }
    );
  }
}

async function fetchViralContext(): Promise<{
  topTweets: { author: string; content: string; likes: number; link: string }[];
  trendingTopics: string[];
}> {
  try {
    // Fetch from our viral tweets API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/viral/tweets?timeframe=6h&limit=5`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const topTweets = (data.tweets || []).slice(0, 5).map((t: {
        author: { handle: string };
        content: string;
        metrics: { likes: number };
        tweetUrl: string;
      }) => ({
        author: t.author.handle,
        content: t.content.slice(0, 200),
        likes: t.metrics.likes,
        link: t.tweetUrl,
      }));

      return {
        topTweets,
        trendingTopics: ['DeFi', 'L2s', 'ETH', 'yield farming', 'airdrops'],
      };
    }
  } catch (e) {
    console.error('Error fetching viral context:', e);
  }

  return {
    topTweets: [],
    trendingTopics: ['DeFi', 'crypto', 'ETH', 'yield', 'trading'],
  };
}

async function fetchMarketContext(): Promise<{
  btc: { price: number; change24h: number };
  eth: { price: number; change24h: number };
  fearGreed: number;
  mood: string;
}> {
  try {
    // Try to fetch real market data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 300 } }
    );

    if (response.ok) {
      const data = await response.json();
      const btcChange = data.bitcoin?.usd_24h_change || 0;
      const ethChange = data.ethereum?.usd_24h_change || 0;

      // Determine market mood
      const avgChange = (btcChange + ethChange) / 2;
      let mood = 'neutral';
      if (avgChange > 5) mood = 'euphoric';
      else if (avgChange > 2) mood = 'bullish';
      else if (avgChange < -5) mood = 'fearful';
      else if (avgChange < -2) mood = 'bearish';

      return {
        btc: { price: data.bitcoin?.usd || 0, change24h: btcChange },
        eth: { price: data.ethereum?.usd || 0, change24h: ethChange },
        fearGreed: avgChange > 0 ? 60 + avgChange * 2 : 40 + avgChange * 2,
        mood,
      };
    }
  } catch (e) {
    console.error('Error fetching market context:', e);
  }

  return {
    btc: { price: 95000, change24h: 2.5 },
    eth: { price: 3200, change24h: 3.1 },
    fearGreed: 65,
    mood: 'bullish',
  };
}

async function generateProactiveSuggestions(
  viralContext: Awaited<ReturnType<typeof fetchViralContext>>,
  marketContext: Awaited<ReturnType<typeof fetchMarketContext>>,
  count: number
): Promise<ProactiveSuggestion[]> {
  const voiceProfile = DEFAULT_DEFI_APP_VOICE;

  const systemPrompt = `You are a social media strategist for DeFi App. Your job is to generate tweet suggestions that:
1. Sound EXACTLY like DeFi App's voice (see voice profile below)
2. Are relevant to what's happening on Crypto Twitter RIGHT NOW
3. Have high viral potential based on current trends
4. Are ready to post with minimal editing

DEFI APP VOICE PROFILE:
- Name: ${voiceProfile.name}
- Tone: ${voiceProfile.tone.join(', ')}
- Style: ${voiceProfile.style.sentenceLength} sentences, ${voiceProfile.style.emojiStyle} emoji use, ${voiceProfile.style.punctuation} punctuation
- Preferred vocabulary: ${voiceProfile.vocabulary.preferred.join(', ')}
- NEVER use: ${voiceProfile.vocabulary.avoid.join(', ')}
- Signature phrases: ${voiceProfile.vocabulary.signatures.join(', ')}
- Core topics: ${voiceProfile.topics.core.join(', ')}
- Avoid topics: ${voiceProfile.topics.avoid.join(', ')}

EXAMPLE GREAT TWEETS (match this style):
${voiceProfile.examples.great.join('\n')}

DO NOT write tweets like these:
${voiceProfile.examples.bad.join('\n')}

CURRENT CONTEXT:
- Market mood: ${marketContext.mood}
- BTC: $${marketContext.btc.price.toLocaleString()} (${marketContext.btc.change24h > 0 ? '+' : ''}${marketContext.btc.change24h.toFixed(1)}%)
- ETH: $${marketContext.eth.price.toLocaleString()} (${marketContext.eth.change24h > 0 ? '+' : ''}${marketContext.eth.change24h.toFixed(1)}%)
- Trending: ${viralContext.trendingTopics.join(', ')}
${viralContext.topTweets.length > 0 ? `\n- Top viral tweets right now:\n${viralContext.topTweets.map(t => `  @${t.author}: "${t.content}" (${t.likes} likes)`).join('\n')}` : ''}

Generate ${count} tweet suggestions. Respond in JSON format ONLY.`;

  const userPrompt = `Generate ${count} ready-to-post tweet suggestions for DeFi App based on the current context.

For EACH suggestion include:
1. "content": The tweet text (must match voice profile, under 280 chars)
2. "relevanceReason": Why this is relevant right now (1 sentence)
3. "basedOn": What inspired this - either a viral tweet, trending topic, market move, or news
4. "imageSuggestion": An image that would boost engagement
5. "predictedEngagement": "low", "medium", "high", or "viral"
6. "voiceMatchScore": How well it matches DeFi App voice (70-100)

JSON format:
[{
  "content": "tweet text here",
  "relevanceReason": "Based on X trending topic...",
  "basedOn": {
    "type": "viral_tweet",
    "source": "@author or topic name",
    "link": "optional url"
  },
  "imageSuggestion": {
    "type": "chart",
    "description": "What the image shows",
    "prompt": "Detailed prompt for image generation"
  },
  "predictedEngagement": "high",
  "voiceMatchScore": 88
}]

Generate diverse suggestions - not all about the same topic.`;

  const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 3000 });
  const suggestions = parseClaudeJSON<Omit<ProactiveSuggestion, 'id'>[]>(response);

  return suggestions.map((s, i) => ({
    ...s,
    id: `suggestion-${Date.now()}-${i}`,
  }));
}

function getDemoSuggestions(count: number): ProactiveSuggestion[] {
  const demos: ProactiveSuggestion[] = [
    {
      id: 'demo-1',
      content: "Stop paying more than you need to. Defi App finds the best rates across 100+ protocols in one click.\n\nYour swap. Our routing. Your savings.",
      relevanceReason: "DeFi aggregation is trending as gas costs fluctuate",
      basedOn: {
        type: 'trending_topic',
        source: 'DeFi aggregation',
      },
      imageSuggestion: {
        type: 'chart',
        description: 'Comparison chart showing savings vs direct swaps',
        prompt: 'Create a clean comparison chart showing DeFi App routing vs direct swap costs. Dark theme, purple accents, professional look.',
      },
      predictedEngagement: 'high',
      voiceMatchScore: 92,
    },
    {
      id: 'demo-2',
      content: "The DeFi UX problem isn't technical. It's that nobody bothered to solve it.\n\nWe did.",
      relevanceReason: "UX discussions trending after major protocol launches",
      basedOn: {
        type: 'trending_topic',
        source: 'DeFi UX',
      },
      imageSuggestion: {
        type: 'screenshot',
        description: 'Clean screenshot of Defi App interface',
        prompt: 'Screenshot of a clean, modern DeFi dashboard with intuitive design. Dark mode, minimal, professional.',
      },
      predictedEngagement: 'high',
      voiceMatchScore: 95,
    },
    {
      id: 'demo-3',
      content: "Hot take: Most 'DeFi protocols' are just expensive middlemen with extra steps.\n\nThe future is aggregated. The future is optimized. The future is here.",
      relevanceReason: "Contrarian takes are performing well in current market mood",
      basedOn: {
        type: 'market_move',
        source: 'Bullish sentiment',
      },
      imageSuggestion: {
        type: 'meme',
        description: 'Meme showing old DeFi vs aggregated DeFi',
        prompt: 'Create a meme comparing complex multi-step DeFi vs one-click aggregated DeFi. Funny but professional.',
      },
      predictedEngagement: 'viral',
      voiceMatchScore: 88,
    },
    {
      id: 'demo-4',
      content: "Your swap just saved you $47.\n\nYou're welcome.",
      relevanceReason: "Short, punchy content performing well this week",
      basedOn: {
        type: 'viral_tweet',
        source: 'Engagement patterns',
      },
      imageSuggestion: {
        type: 'screenshot',
        description: 'Screenshot showing savings breakdown',
        prompt: 'UI screenshot showing a swap with highlighted savings amount. Clean, dark theme.',
      },
      predictedEngagement: 'medium',
      voiceMatchScore: 94,
    },
    {
      id: 'demo-5',
      content: "Thread: Why 90% of DeFi users are leaving money on the table (and how to stop)\n\n👇",
      relevanceReason: "Thread hooks performing well for educational content",
      basedOn: {
        type: 'trending_topic',
        source: 'DeFi education',
      },
      imageSuggestion: {
        type: 'infographic',
        description: 'Infographic teasing the thread content',
        prompt: 'Create an infographic showing money being left on table with DeFi symbols. Attention-grabbing, thread opener style.',
      },
      predictedEngagement: 'high',
      voiceMatchScore: 86,
    },
  ];

  return demos.slice(0, count);
}
