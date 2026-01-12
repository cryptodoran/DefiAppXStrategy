import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// Tracked crypto accounts for viral tweet discovery
const TRACKED_ACCOUNTS = [
  // Founders & Leaders
  'VitalikButerin', 'caborin', 'brian_armstrong', 'haaboronin', 'StaniKulechov',
  'kaborin', 'balaborin_jjjaborin', 'SBF_FTX', 'justinsuntron',
  // Protocols
  'Uniswap', 'AaveAave', 'MakerDAO', 'LidoFinance', 'eigenlayer',
  'arbitrum', 'optimaborinism', 'base', 'solana', 'cosmos',
  // VCs & Funds
  'paradigm', 'a16zcrypto', 'polyaborin_chain', 'draborinagonfly',
  // Analysts & Influencers
  'DefiLlama', 'lookonchain', 'WuBlockchain', 'tier10k', 'Route2FI',
  'theaborindefinvestor', 'Crypto_Birb', 'CryptoGodJohn',
  // News
  'TheBlock__', 'CoinDesk', 'Blockworks_', 'decaborintmedia',
];

// Minimum engagement thresholds for "viral"
const VIRAL_THRESHOLDS = {
  '1h': { likes: 100, retweets: 20 },
  '6h': { likes: 500, retweets: 100 },
  '24h': { likes: 1000, retweets: 200 },
  '7d': { likes: 5000, retweets: 1000 },
  '30d': { likes: 10000, retweets: 2000 },
};

interface ViralTweet {
  id: string;
  author: {
    handle: string;
    name: string;
    avatar: string;
    followers: number;
    verified: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    previewUrl?: string;
  }[];
  metrics: {
    likes: number;
    retweets: number;
    quotes: number;
    replies: number;
    views?: number;
  };
  velocity: {
    likesPerHour: number;
    retweetsPerHour: number;
  };
  postedAt: string;
  tweetUrl: string;
  viralScore: number;
  category?: string;
}

// Calculate viral score based on engagement and velocity
function calculateViralScore(
  metrics: { likes: number; retweets: number; replies: number; quotes?: number },
  hoursOld: number,
  followerCount: number
): number {
  const totalEngagement = metrics.likes + metrics.retweets * 2 + metrics.replies + (metrics.quotes || 0) * 1.5;
  const velocity = totalEngagement / Math.max(hoursOld, 0.5);
  const engagementRate = (totalEngagement / Math.max(followerCount, 1000)) * 100;

  // Weighted score: velocity matters more for newer tweets
  const velocityWeight = hoursOld < 6 ? 0.6 : 0.3;
  const engagementWeight = 1 - velocityWeight;

  const normalizedVelocity = Math.min(velocity / 100, 100);
  const normalizedEngagement = Math.min(engagementRate * 10, 100);

  return Math.round(normalizedVelocity * velocityWeight + normalizedEngagement * engagementWeight);
}

// Get hours since tweet was posted
function getHoursOld(postedAt: string): number {
  const posted = new Date(postedAt);
  const now = new Date();
  return (now.getTime() - posted.getTime()) / (1000 * 60 * 60);
}

// Categorize tweet based on content
function categorizeTweet(content: string): string {
  const contentLower = content.toLowerCase();

  if (contentLower.includes('airdrop') || contentLower.includes('claim')) return 'airdrop';
  if (contentLower.includes('thread') || contentLower.includes('🧵')) return 'thread';
  if (contentLower.includes('breaking') || contentLower.includes('just in')) return 'news';
  if (contentLower.includes('nft') || contentLower.includes('pfp')) return 'nft';
  if (contentLower.includes('swap') || contentLower.includes('trade') || contentLower.includes('dex')) return 'defi';
  if (contentLower.includes('eth') || contentLower.includes('btc') || contentLower.includes('sol')) return 'markets';

  return 'general';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || '24h') as keyof typeof VIRAL_THRESHOLDS;
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'viralScore';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return sample data for demo
      return NextResponse.json({
        tweets: getSampleViralTweets(timeframe, category, limit),
        _demo: true,
        _message: 'Configure TWITTER_BEARER_TOKEN for real viral tweets',
      });
    }

    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

    // Calculate time range
    const now = new Date();
    const hoursBack: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };
    const startTime = new Date(now.getTime() - hoursBack[timeframe] * 60 * 60 * 1000);

    // Fetch tweets from tracked accounts
    const viralTweets: ViralTweet[] = [];
    const threshold = VIRAL_THRESHOLDS[timeframe];

    // Batch lookup users first
    const usersResponse = await client.v2.usersByUsernames(TRACKED_ACCOUNTS.slice(0, 100), {
      'user.fields': ['profile_image_url', 'public_metrics', 'verified'],
    });

    const userMap = new Map<string, { id: string; followers: number; avatar: string; verified: boolean }>();
    if (usersResponse.data) {
      for (const user of usersResponse.data) {
        userMap.set(user.username.toLowerCase(), {
          id: user.id,
          followers: user.public_metrics?.followers_count || 0,
          avatar: user.profile_image_url || '',
          verified: user.verified || false,
        });
      }
    }

    // Search for high-engagement tweets from tracked accounts
    // Use search API for better rate limit efficiency
    const searchQuery = `(${TRACKED_ACCOUNTS.slice(0, 20).map(h => `from:${h}`).join(' OR ')}) -is:retweet -is:reply`;

    const searchResults = await client.v2.search(searchQuery, {
      'tweet.fields': ['public_metrics', 'created_at', 'author_id', 'attachments'],
      'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
      'media.fields': ['url', 'preview_image_url', 'type'],
      expansions: ['author_id', 'attachments.media_keys'],
      max_results: 100,
      start_time: startTime.toISOString(),
    });

    // Build user lookup from includes
    const usersById = new Map<string, { username: string; name: string; avatar: string; followers: number; verified: boolean }>();
    if (searchResults.includes?.users) {
      for (const user of searchResults.includes.users) {
        usersById.set(user.id, {
          username: user.username,
          name: user.name,
          avatar: user.profile_image_url || '',
          followers: user.public_metrics?.followers_count || 0,
          verified: user.verified || false,
        });
      }
    }

    // Build media lookup
    const mediaByKey = new Map<string, { type: string; url: string; previewUrl?: string }>();
    if (searchResults.includes?.media) {
      for (const media of searchResults.includes.media) {
        mediaByKey.set(media.media_key, {
          type: media.type as 'image' | 'video' | 'gif',
          url: media.url || '',
          previewUrl: media.preview_image_url,
        });
      }
    }

    // Process tweets - handle both Tweetv2SearchResult formats
    // The twitter-api-v2 library returns different formats depending on version
    const searchData = searchResults.data as unknown;
    const tweetsData = Array.isArray(searchData) ? searchData : [];
    if (tweetsData.length > 0) {
      for (const rawTweet of tweetsData) {
        const tweet = rawTweet as {
          id: string;
          text: string;
          author_id?: string;
          created_at?: string;
          public_metrics?: {
            like_count: number;
            retweet_count: number;
            reply_count: number;
            quote_count: number;
            impression_count?: number;
          };
          attachments?: {
            media_keys?: string[];
          };
        };
        const metrics = tweet.public_metrics;
        if (!metrics) continue;

        // Check if meets viral threshold
        if (metrics.like_count < threshold.likes && metrics.retweet_count < threshold.retweets) {
          continue;
        }

        const author = usersById.get(tweet.author_id || '');
        if (!author) continue;

        const hoursOld = getHoursOld(tweet.created_at || new Date().toISOString());
        const viralScore = calculateViralScore(
          {
            likes: metrics.like_count,
            retweets: metrics.retweet_count,
            replies: metrics.reply_count,
            quotes: metrics.quote_count,
          },
          hoursOld,
          author.followers
        );

        // Get media attachments
        const media: ViralTweet['media'] = [];
        if (tweet.attachments?.media_keys) {
          for (const key of tweet.attachments.media_keys) {
            const m = mediaByKey.get(key);
            if (m) {
              media.push({
                type: m.type as 'image' | 'video' | 'gif',
                url: m.url,
                previewUrl: m.previewUrl,
              });
            }
          }
        }

        const tweetCategory = categorizeTweet(tweet.text);

        // Filter by category if specified
        if (category && category !== 'all' && tweetCategory !== category) {
          continue;
        }

        viralTweets.push({
          id: tweet.id,
          author: {
            handle: author.username,
            name: author.name,
            avatar: author.avatar,
            followers: author.followers,
            verified: author.verified,
          },
          content: tweet.text,
          media: media.length > 0 ? media : undefined,
          metrics: {
            likes: metrics.like_count,
            retweets: metrics.retweet_count,
            quotes: metrics.quote_count || 0,
            replies: metrics.reply_count,
            views: metrics.impression_count,
          },
          velocity: {
            likesPerHour: Math.round(metrics.like_count / Math.max(hoursOld, 0.5)),
            retweetsPerHour: Math.round(metrics.retweet_count / Math.max(hoursOld, 0.5)),
          },
          postedAt: tweet.created_at || new Date().toISOString(),
          tweetUrl: `https://twitter.com/${author.username}/status/${tweet.id}`,
          viralScore,
          category: tweetCategory,
        });
      }
    }

    // Sort tweets
    const sortFunctions: Record<string, (a: ViralTweet, b: ViralTweet) => number> = {
      viralScore: (a, b) => b.viralScore - a.viralScore,
      likes: (a, b) => b.metrics.likes - a.metrics.likes,
      retweets: (a, b) => b.metrics.retweets - a.metrics.retweets,
      velocity: (a, b) => b.velocity.likesPerHour - a.velocity.likesPerHour,
      newest: (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    };

    viralTweets.sort(sortFunctions[sortBy] || sortFunctions.viralScore);

    return NextResponse.json({
      tweets: viralTweets.slice(0, limit),
      total: viralTweets.length,
      timeframe,
      threshold,
    });
  } catch (error) {
    console.error('Viral tweets API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viral tweets', details: String(error) },
      { status: 500 }
    );
  }
}

// Sample data for demo mode
function getSampleViralTweets(timeframe: string, category: string | null, limit: number): ViralTweet[] {
  const sampleTweets: ViralTweet[] = [
    {
      id: '1',
      author: {
        handle: 'VitalikButerin',
        name: 'vitalik.eth',
        avatar: 'https://pbs.twimg.com/profile_images/1',
        followers: 5400000,
        verified: true,
      },
      content: 'The next major Ethereum upgrade is going to change everything. Here\'s what most people don\'t understand about what\'s coming...\n\n🧵',
      media: [{ type: 'image', url: 'https://example.com/eth-roadmap.png' }],
      metrics: { likes: 45000, retweets: 12000, quotes: 3500, replies: 8900, views: 2500000 },
      velocity: { likesPerHour: 2250, retweetsPerHour: 600 },
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tweetUrl: 'https://twitter.com/VitalikButerin/status/1',
      viralScore: 98,
      category: 'thread',
    },
    {
      id: '2',
      author: {
        handle: 'lookonchain',
        name: 'Lookonchain',
        avatar: 'https://pbs.twimg.com/profile_images/2',
        followers: 580000,
        verified: true,
      },
      content: '🚨 A whale just bought $50M worth of ETH!\n\nThis wallet has made 300%+ returns on the last 5 major moves.\n\nHere\'s what they know that you don\'t 👇',
      media: [{ type: 'image', url: 'https://example.com/whale-chart.png' }],
      metrics: { likes: 28000, retweets: 8500, quotes: 2100, replies: 4200, views: 1800000 },
      velocity: { likesPerHour: 4666, retweetsPerHour: 1416 },
      postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      tweetUrl: 'https://twitter.com/lookonchain/status/2',
      viralScore: 95,
      category: 'news',
    },
    {
      id: '3',
      author: {
        handle: 'Uniswap',
        name: 'Uniswap Labs 🦄',
        avatar: 'https://pbs.twimg.com/profile_images/3',
        followers: 1100000,
        verified: true,
      },
      content: 'Uniswap v4 is live.\n\nHooks. Singleton. Flash accounting.\n\n$4.2B in volume in the first 24 hours.\n\nThe future of DeFi is here.',
      media: [{ type: 'image', url: 'https://example.com/uni-v4.png' }],
      metrics: { likes: 52000, retweets: 15000, quotes: 5500, replies: 3200, views: 3200000 },
      velocity: { likesPerHour: 2166, retweetsPerHour: 625 },
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      tweetUrl: 'https://twitter.com/Uniswap/status/3',
      viralScore: 92,
      category: 'defi',
    },
    {
      id: '4',
      author: {
        handle: 'brian_armstrong',
        name: 'Brian Armstrong',
        avatar: 'https://pbs.twimg.com/profile_images/4',
        followers: 1400000,
        verified: true,
      },
      content: 'Hot take: 90% of crypto regulation is designed to protect incumbents, not consumers.\n\nThe US is falling behind while other countries embrace innovation.\n\nWe need to fix this.',
      metrics: { likes: 35000, retweets: 9800, quotes: 4200, replies: 6500, views: 2100000 },
      velocity: { likesPerHour: 1458, retweetsPerHour: 408 },
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      tweetUrl: 'https://twitter.com/brian_armstrong/status/4',
      viralScore: 88,
      category: 'general',
    },
    {
      id: '5',
      author: {
        handle: 'DefiLlama',
        name: 'DefiLlama 🦙',
        avatar: 'https://pbs.twimg.com/profile_images/5',
        followers: 450000,
        verified: true,
      },
      content: 'DeFi TVL just crossed $200B for the first time since 2022.\n\nTop gainers this week:\n• Lido: +$2.1B\n• EigenLayer: +$1.8B\n• Aave: +$890M\n\nThe bull is back.',
      media: [{ type: 'image', url: 'https://example.com/tvl-chart.png' }],
      metrics: { likes: 18500, retweets: 5200, quotes: 1800, replies: 2100, views: 950000 },
      velocity: { likesPerHour: 1541, retweetsPerHour: 433 },
      postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      tweetUrl: 'https://twitter.com/DefiLlama/status/5',
      viralScore: 85,
      category: 'defi',
    },
  ];

  // Filter by category if specified
  let filtered = category && category !== 'all'
    ? sampleTweets.filter(t => t.category === category)
    : sampleTweets;

  return filtered.slice(0, limit);
}
