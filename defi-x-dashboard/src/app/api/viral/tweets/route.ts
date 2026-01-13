import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// Tracked crypto accounts for viral tweet discovery
const TRACKED_ACCOUNTS = [
  // Founders & Leaders
  'VitalikButerin', 'brian_armstrong', 'StaniKulechov', 'CryptoHayes',
  // Protocols
  'Uniswap', 'AaveAave', 'MakerDAO', 'LidoFinance', 'eigenlayer',
  'arbitrum', 'Optimism', 'base', 'solana', 'cosmos',
  // VCs & Funds
  'paradigm', 'a16zcrypto',
  // Analysts & Influencers
  'DefiLlama', 'lookonchain', 'WuBlockchain', 'tier10k', 'Route2FI',
  'thedefiedge', 'DefiIgnas', 'MilesDeutscher',
  // News
  'TheBlock__', 'CoinDesk', 'Blockworks_',
];

// Minimum engagement thresholds for "viral" - kept low to ensure we get real data
const VIRAL_THRESHOLDS = {
  '1h': { likes: 10, retweets: 2 },
  '6h': { likes: 25, retweets: 5 },
  '24h': { likes: 50, retweets: 10 },
  '7d': { likes: 100, retweets: 20 },
  '30d': { likes: 200, retweets: 40 },
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
      return NextResponse.json(
        { error: 'Twitter API not configured. Add TWITTER_BEARER_TOKEN environment variable.' },
        { status: 503 }
      );
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

        // Include all tweets, sorted by engagement (no longer filtering by threshold)
        // This ensures we always return real data
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

    // Return real data - empty array if nothing found
    return NextResponse.json({
      tweets: viralTweets.slice(0, limit),
      total: viralTweets.length,
      timeframe,
      threshold,
      _note: viralTweets.length === 0 ? 'No tweets found matching criteria in this timeframe' : undefined,
    });
  } catch (error) {
    console.error('Viral tweets API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch viral tweets' },
      { status: 500 }
    );
  }
}

