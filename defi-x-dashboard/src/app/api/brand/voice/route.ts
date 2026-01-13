import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { callClaude, parseClaudeJSON, isClaudeConfigured, BrandVoiceProfile } from '@/lib/claude';

// Sample tweets from @defiapp for demo mode (realistic examples of their voice)
const SAMPLE_DEFIAPP_TWEETS = [
  {
    content: 'best rates or something idk',
    metrics: { likes: 1245, retweets: 312 },
  },
  {
    content: 'DeFi is about financial freedom and accessibility. Building products that actually matter.',
    metrics: { likes: 2456, retweets: 567 },
  },
  {
    content: 'Why are you still paying 2% fees when you can get 0.1%?',
    metrics: { likes: 3124, retweets: 823 },
  },
  {
    content: 'New chain integration. More routes. Better rates. Same app.',
    metrics: { likes: 1867, retweets: 445 },
  },
  {
    content: 'Thread: How we saved users $2M in swap fees last month 🧵',
    metrics: { likes: 4521, retweets: 1234 },
  },
  {
    content: 'stop paying more than you need to',
    metrics: { likes: 987, retweets: 234 },
  },
  {
    content: 'your favorite aggregator just got better',
    metrics: { likes: 1543, retweets: 389 },
  },
  {
    content: 'Multi-chain? Covered. Cross-chain? Covered. Your portfolio? Now covered.',
    metrics: { likes: 2134, retweets: 512 },
  },
  {
    content: 'Hot take: Most DeFi protocols are just expensive middlemen with extra steps.',
    metrics: { likes: 5678, retweets: 1567 },
  },
  {
    content: 'we ship. you save. simple.',
    metrics: { likes: 1234, retweets: 345 },
  },
];

// Analyze tweets to extract brand voice profile
async function analyzeBrandVoice(tweets: { content: string; metrics?: { likes: number; retweets: number } }[]): Promise<BrandVoiceProfile> {
  // If Claude is not configured, return a derived static profile
  if (!isClaudeConfigured()) {
    return getStaticBrandVoice(tweets);
  }

  const tweetExamples = tweets
    .sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0))
    .slice(0, 15)
    .map(t => `"${t.content}" (${t.metrics?.likes || 0} likes)`)
    .join('\n');

  const systemPrompt = `You are a brand voice analyst. Analyze these tweets from @defiapp and extract a detailed brand voice profile.

Focus on:
1. Tone patterns (confident? casual? edgy? technical?)
2. Vocabulary preferences (what words they use vs avoid)
3. Style elements (sentence length, punctuation, emoji usage)
4. Signature phrases or patterns
5. Topics they talk about vs avoid

Be specific and actionable. This profile will be used to generate content that matches their voice exactly.

Respond in JSON format only.`;

  const userPrompt = `Analyze these @defiapp tweets and extract their brand voice:

${tweetExamples}

Create a brand voice profile in this JSON format:
{
  "id": "defiapp-learned",
  "name": "defi app",
  "tone": ["list of tone descriptors"],
  "vocabulary": {
    "preferred": ["words they frequently use"],
    "avoid": ["words they never use"],
    "signatures": ["signature phrases or patterns"]
  },
  "style": {
    "useEmojis": true/false,
    "emojiStyle": "minimal" | "moderate" | "heavy",
    "sentenceLength": "short" | "medium" | "varied",
    "punctuation": "formal" | "casual" | "dramatic"
  },
  "examples": {
    "great": ["their best 5 tweets"],
    "bad": ["examples of what NOT to write like"]
  },
  "topics": {
    "core": ["topics they talk about"],
    "avoid": ["topics they never mention"]
  }
}`;

  try {
    const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 2000 });
    return parseClaudeJSON<BrandVoiceProfile>(response);
  } catch (error) {
    console.error('Failed to analyze brand voice with Claude:', error);
    return getStaticBrandVoice(tweets);
  }
}

// Static brand voice derived from analyzing patterns
function getStaticBrandVoice(tweets: { content: string; metrics?: { likes: number; retweets: number } }[]): BrandVoiceProfile {
  // Sort by engagement to find top performers
  const topTweets = tweets
    .sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0))
    .slice(0, 5)
    .map(t => t.content);

  return {
    id: 'defiapp-learned',
    name: 'defi app',
    tone: [
      'casual',
      'confident',
      'direct',
      'slightly-irreverent',
      'lowercase-aesthetic',
      'no-bs',
    ],
    vocabulary: {
      preferred: [
        'rates', 'save', 'aggregator', 'chains', 'routes',
        'portfolio', 'swap', 'defi', 'fees', 'yield',
      ],
      avoid: [
        'revolutionary', 'game-changing', 'excited to announce',
        'gm', 'wagmi', 'ngmi', 'ser', 'fren', 'wen',
        'probably nothing', 'lfg', 'huge news',
      ],
      signatures: [
        'best rates or something idk',
        'we ship. you save. simple.',
        'stop paying more than you need to',
        'your favorite aggregator',
      ],
    },
    style: {
      useEmojis: true,
      emojiStyle: 'minimal',
      sentenceLength: 'short',
      punctuation: 'casual',
    },
    examples: {
      great: topTweets,
      bad: [
        'GM frens! Exciting news coming soon! Stay tuned! 🚀🚀🚀',
        'We are pleased to announce our revolutionary new feature!',
        'HUGE announcement! This is going to be game-changing!',
        'Wen token? Probably nothing 👀',
      ],
    },
    topics: {
      core: [
        'swap aggregation',
        'fee savings',
        'multi-chain',
        'cross-chain',
        'defi rates',
        'portfolio management',
        'yield optimization',
      ],
      avoid: [
        'price predictions',
        'financial advice',
        'token speculation',
        'competitor attacks',
        'politics',
        'controversial figures',
      ],
    },
  };
}

export async function GET() {
  try {
    let tweets: { content: string; metrics?: { likes: number; retweets: number } }[] = SAMPLE_DEFIAPP_TWEETS;
    let isLive = false;

    // Try to fetch real tweets if Twitter API is configured
    if (process.env.TWITTER_BEARER_TOKEN) {
      try {
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        const handle = process.env.NEXT_PUBLIC_TWITTER_OWN_HANDLE || 'defiapp';

        const userResult = await client.v2.userByUsername(handle.replace('@', ''));
        if (userResult.data) {
          const userTweets = await client.v2.userTimeline(userResult.data.id, {
            max_results: 50,
            'tweet.fields': ['public_metrics', 'created_at'],
            exclude: ['retweets', 'replies'],
          });

          if (userTweets.data?.data && userTweets.data.data.length > 0) {
            tweets = userTweets.data.data.map(t => ({
              content: t.text,
              metrics: t.public_metrics ? {
                likes: t.public_metrics.like_count,
                retweets: t.public_metrics.retweet_count,
              } : undefined,
            }));
            isLive = true;
          }
        }
      } catch (twitterError) {
        console.error('Failed to fetch real tweets for brand voice:', twitterError);
        // Fall through to sample data
      }
    }

    // Analyze tweets to create brand voice profile
    const brandVoice = await analyzeBrandVoice(tweets);

    return NextResponse.json({
      profile: brandVoice,
      analyzedTweets: tweets.length,
      _live: isLive,
      _message: isLive
        ? 'Brand voice learned from live @defiapp tweets'
        : 'Brand voice derived from sample tweets (configure TWITTER_BEARER_TOKEN for live learning)',
    });
  } catch (error) {
    console.error('Brand voice API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze brand voice', details: String(error) },
      { status: 500 }
    );
  }
}

// POST endpoint to refresh/retrain the brand voice
export async function POST() {
  // Trigger a refresh of the brand voice by re-fetching and re-analyzing
  return GET();
}
