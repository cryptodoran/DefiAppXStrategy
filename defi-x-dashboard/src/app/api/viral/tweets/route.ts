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
  // More accounts for better coverage
  'MessariCrypto', 'Bankless', 'punk3700', 'dragonfly_xyz',
  'ychozn', 'dcfgod', 'tayvano_', 'bengalMoney',
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
      console.warn('Twitter API not configured. Add TWITTER_BEARER_TOKEN environment variable.');
      return NextResponse.json({
        tweets: [],
        total: 0,
        timeframe,
        error: 'Twitter API not configured. Add TWITTER_BEARER_TOKEN environment variable.',
        isDevelopment: true,
      });
    }

    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    const viralTweets: ViralTweet[] = [];
    const threshold = VIRAL_THRESHOLDS[timeframe];

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

    // Fetch tweets in smaller batches to avoid rate limits and improve reliability
    // Process accounts in groups of 12-15 for better API performance
    const accountBatches = [
      TRACKED_ACCOUNTS.slice(0, 15),
      TRACKED_ACCOUNTS.slice(15, 30),
      TRACKED_ACCOUNTS.slice(30, 45),
    ];

    for (const batch of accountBatches) {
      try {
        // Build query with OR logic - simple and reliable
        const searchQuery = `(${batch.map(h => `from:${h}`).join(' OR ')}) -is:retweet`;

        console.log(`[Twitter API] Searching batch of ${batch.length} accounts`);
        console.log(`[Twitter API] Query: ${searchQuery.slice(0, 100)}...`);
        console.log(`[Twitter API] Start time: ${startTime.toISOString()}`);

        const searchResults = await client.v2.search(searchQuery, {
          'tweet.fields': ['public_metrics', 'created_at', 'author_id', 'attachments'],
          'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
          'media.fields': ['url', 'preview_image_url', 'type'],
          expansions: ['author_id', 'attachments.media_keys'],
          max_results: 100,
          start_time: startTime.toISOString(),
        });

        console.log(`[Twitter API] Response received, data type: ${typeof searchResults.data}`);
        console.log(`[Twitter API] Has data: ${!!searchResults.data}, Is array: ${Array.isArray(searchResults.data)}`);
        if (searchResults.data) {
          console.log(`[Twitter API] Data length/keys: ${Array.isArray(searchResults.data) ? searchResults.data.length : Object.keys(searchResults.data).join(',')}`);
        }

        // Handle both array and single tweet response formats
        const tweetsData = Array.isArray(searchResults.data)
          ? searchResults.data
          : searchResults.data
            ? [searchResults.data]
            : [];

        if (tweetsData.length === 0) {
          console.log(`[Twitter API] No tweets found for batch of ${batch.length} accounts`);
          continue;
        }

        console.log(`[Twitter API] Found ${tweetsData.length} tweets in batch`);

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

        // Process tweets
        for (const tweet of tweetsData) {
          const metrics = tweet.public_metrics;
          if (!metrics) continue;

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

          // Check for duplicates
          const isDuplicate = viralTweets.some(t => t.id === tweet.id);
          if (isDuplicate) continue;

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
      } catch (batchError) {
        console.warn(`Error fetching batch: ${(batchError as Error).message}`);
        // Continue with next batch instead of failing entirely
        continue;
      }
    }

    // Sort tweets based on requested metric
    const sortFunctions: Record<string, (a: ViralTweet, b: ViralTweet) => number> = {
      viralScore: (a, b) => b.viralScore - a.viralScore,
      likes: (a, b) => b.metrics.likes - a.metrics.likes,
      retweets: (a, b) => b.metrics.retweets - a.metrics.retweets,
      velocity: (a, b) => b.velocity.likesPerHour - a.velocity.likesPerHour,
      newest: (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    };

    viralTweets.sort(sortFunctions[sortBy] || sortFunctions.viralScore);

    // Return data - empty array if nothing found (but graceful)
    return NextResponse.json({
      tweets: viralTweets.slice(0, limit),
      total: viralTweets.length,
      timeframe,
      threshold,
      sortBy,
      _debug: {
        queryTime: startTime.toISOString(),
        accountsQueried: TRACKED_ACCOUNTS.length,
        batchesProcessed: accountBatches.length,
      },
    });
  } catch (error) {
    console.error('Viral tweets API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch viral tweets',
        tweets: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
