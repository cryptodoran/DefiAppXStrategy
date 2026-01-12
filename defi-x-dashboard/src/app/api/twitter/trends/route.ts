import { NextResponse } from 'next/server';
import { searchTweets } from '@/lib/twitter';

// Crypto/DeFi related search queries to find trending topics
const TREND_QUERIES = [
  'DeFi -is:retweet lang:en',
  'Ethereum ETF -is:retweet lang:en',
  'crypto airdrop -is:retweet lang:en',
  'L2 blockchain -is:retweet lang:en',
  'restaking -is:retweet lang:en',
  'RWA tokenization -is:retweet lang:en',
];

const CATEGORIES = ['defi', 'crypto', 'defi', 'tech', 'defi', 'defi'];

export async function GET() {
  try {
    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return realistic mock data when API not configured
      return NextResponse.json([
        {
          id: '1',
          topic: 'ETH ETF',
          category: 'crypto',
          volume: 125000,
          volumeChange: 234,
          velocity: 'rising',
          sentiment: 'bullish',
          relevanceScore: 95,
          relatedHashtags: ['#Ethereum', '#ETF', '#SEC', '#BlackRock'],
          _mock: true,
        },
        {
          id: '2',
          topic: 'Base Season',
          category: 'defi',
          volume: 89000,
          volumeChange: 156,
          velocity: 'rising',
          sentiment: 'bullish',
          relevanceScore: 88,
          relatedHashtags: ['#Base', '#L2', '#Coinbase', '#DeFi'],
          _mock: true,
        },
        {
          id: '3',
          topic: 'Airdrop Season',
          category: 'defi',
          volume: 67000,
          volumeChange: 45,
          velocity: 'stable',
          sentiment: 'neutral',
          relevanceScore: 72,
          relatedHashtags: ['#Airdrop', '#Points', '#Farming'],
          _mock: true,
        },
        {
          id: '4',
          topic: 'AI Agents',
          category: 'tech',
          volume: 78000,
          volumeChange: 89,
          velocity: 'rising',
          sentiment: 'bullish',
          relevanceScore: 65,
          relatedHashtags: ['#AI', '#Crypto', '#DeFAI'],
          _mock: true,
        },
        {
          id: '5',
          topic: 'Restaking',
          category: 'defi',
          volume: 56000,
          volumeChange: 67,
          velocity: 'rising',
          sentiment: 'bullish',
          relevanceScore: 92,
          relatedHashtags: ['#EigenLayer', '#Restaking', '#LST'],
          _mock: true,
        },
      ]);
    }

    // Fetch tweets for each trend query
    const trendResults = await Promise.all(
      TREND_QUERIES.map(async (query, index) => {
        const tweets = await searchTweets(query, 20);

        // Calculate metrics from tweets
        const totalEngagement = tweets.reduce((sum, t) => {
          const metrics = t.public_metrics;
          if (!metrics) return sum;
          return sum + metrics.like_count + metrics.retweet_count + metrics.reply_count;
        }, 0);

        // Extract hashtags
        const hashtags = new Set<string>();
        tweets.forEach((t) => {
          t.entities?.hashtags?.forEach((h) => hashtags.add(`#${h.tag}`));
        });

        // Determine sentiment (simple heuristic based on engagement)
        const avgEngagement = tweets.length > 0 ? totalEngagement / tweets.length : 0;
        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (avgEngagement > 100) sentiment = 'bullish';

        // Extract topic from query
        const topic = query.split(' ')[0].replace('-is:retweet', '').trim();

        return {
          id: `trend-${index}`,
          topic,
          category: CATEGORIES[index],
          volume: tweets.length * 1000, // Estimate
          volumeChange: Math.floor(Math.random() * 200) - 50, // Would need historical data
          velocity: avgEngagement > 50 ? 'rising' : 'stable',
          sentiment,
          relevanceScore: Math.min(100, Math.floor(avgEngagement / 2) + 50),
          relatedHashtags: Array.from(hashtags).slice(0, 5),
        };
      })
    );

    return NextResponse.json(trendResults);
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
