import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

// In-memory cache for viral tweets to avoid rate limits
// Twitter Basic tier only allows 60 search requests per 15 minutes
interface CacheEntry {
  data: ViralTweet[];
  timestamp: number;
  timeframe: string;
}

const tweetCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes - matches Twitter rate limit window

// Request deduplication - prevent multiple parallel requests from hitting API
const pendingRequests = new Map<string, Promise<ViralTweet[]>>();

// Track rate limit cooldown - only applied after hitting a 429 error
let rateLimitCooldownUntil = 0;

// Tracked crypto accounts for viral tweet discovery
// EXPANDED LIST - using broader crypto twitter coverage
// Twitter Basic tier allows 60 requests per 15 min, we use 1-2 batch requests
const TRACKED_ACCOUNTS = [
  // Major crypto personalities
  'VitalikButerin', 'brian_armstrong', 'caborneblack', 'CryptoHayes',
  'balaboris', 'saborid', 'sassal0x', 'iamDCinvestor',
  // DeFi protocols
  'Uniswap', 'AaveAave', 'eigenlayer', 'base', 'MakerDAO',
  'LidoFinance', 'CurveFinance', 'arbitrum', 'optimism',
  // Research & data
  'DefiLlama', 'lookonchain', 'tier10k', 'naboris',
  // Influencers & analysts
  'thedefiedge', 'DefiIgnas', 'MilesDeutscher', 'Pentosh1',
  'CryptoCobain', 'CryptoKaduna', 'Hsaka', 'cobie',
  'inversebrah', 'Route2FI', 'wassiecapital', 'DegenSpartan',
  // News & media
  'CoinDesk', 'Bankless', 'theaborntblock', 'WuBlockchain',
  'CoinTelegraph', 'Decrypt',
];

// Alternative: use crypto-related search terms for broader discovery
// This finds viral tweets about crypto regardless of who posted them
const CRYPTO_SEARCH_TERMS = [
  '$ETH', '$BTC', 'ethereum', 'bitcoin', 'DeFi', 'crypto',
  'airdrop', 'NFT', 'web3', 'blockchain', 'altcoin',
];

// Long-term cache for 30d+ historical data
// Since Twitter Basic only returns last 7 days, we cache everything
interface LongTermCache {
  tweets: Map<string, ViralTweet>; // keyed by tweet id
  lastUpdated: number;
}
const longTermCache: LongTermCache = {
  tweets: new Map(),
  lastUpdated: 0,
};

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
    const threshold = VIRAL_THRESHOLDS[timeframe];

    // Check cache first to avoid rate limits
    const cacheKey = `${timeframe}-${category || 'all'}`;
    const cached = tweetCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[Twitter API] Using cached data for ${cacheKey}`);

      // Apply sorting and limit to cached data
      const sortFunctions: Record<string, (a: ViralTweet, b: ViralTweet) => number> = {
        viralScore: (a, b) => b.viralScore - a.viralScore,
        likes: (a, b) => b.metrics.likes - a.metrics.likes,
        retweets: (a, b) => b.metrics.retweets - a.metrics.retweets,
        velocity: (a, b) => b.velocity.likesPerHour - a.velocity.likesPerHour,
        newest: (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      };

      const sortedTweets = [...cached.data].sort(sortFunctions[sortBy] || sortFunctions.viralScore);

      return NextResponse.json({
        tweets: sortedTweets.slice(0, limit),
        total: cached.data.length,
        timeframe,
        threshold,
        sortBy,
        _cached: true,
        _cacheAge: Math.round((Date.now() - cached.timestamp) / 1000),
      });
    }

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

    // Check if we're in rate limit cooldown (only happens after 429 error)
    const now = Date.now();
    if (now < rateLimitCooldownUntil) {
      console.log('[Twitter API] Rate limit cooldown active until', new Date(rateLimitCooldownUntil).toISOString());
      const staleCache = tweetCache.get(cacheKey);
      if (staleCache) {
        return NextResponse.json({
          tweets: staleCache.data.slice(0, limit),
          total: staleCache.data.length,
          timeframe,
          _cached: true,
          _stale: true,
          _cacheAge: Math.round((now - staleCache.timestamp) / 1000),
          _cooldown: true,
          _cooldownRemaining: Math.round((rateLimitCooldownUntil - now) / 1000) + 's',
        });
      }
      return NextResponse.json({
        tweets: [],
        total: 0,
        timeframe,
        _cooldown: true,
        _cooldownRemaining: Math.round((rateLimitCooldownUntil - now) / 1000) + 's',
      });
    }

    // Check for pending request (deduplication)
    const existingRequest = pendingRequests.get(cacheKey);
    if (existingRequest) {
      console.log('[Twitter API] Waiting for pending request');
      try {
        const tweets = await existingRequest;
        return NextResponse.json({
          tweets: tweets.slice(0, limit),
          total: tweets.length,
          timeframe,
          _deduplicated: true,
        });
      } catch {
        // Fall through to make new request
      }
    }

    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    const viralTweets: ViralTweet[] = [];

    // Calculate time range
    const currentTime = new Date();
    const hoursBack: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };
    const startTime = new Date(currentTime.getTime() - hoursBack[timeframe] * 60 * 60 * 1000);

    // For 30d timeframe, primarily use cached data since Twitter Basic only goes back 7 days
    const isLongTimeframe = timeframe === '30d' || timeframe === '7d';

    // Fetch tweets - use search terms for broader coverage or accounts for targeted results
    try {
      // For broader coverage, alternate between account-based and term-based searches
      // Account search for quality, term search for wider net
      const accountChunk1 = TRACKED_ACCOUNTS.slice(0, 25);
      const accountChunk2 = TRACKED_ACCOUNTS.slice(25);

      // Build query - include accounts and optionally search terms
      let searchQuery: string;
      if (category === 'all' || !category) {
        // Mix accounts and popular crypto terms for broader discovery
        searchQuery = `(${accountChunk1.map(h => `from:${h}`).join(' OR ')}) -is:retweet`;
      } else {
        // Category-specific search can use terms
        const categoryTerms: Record<string, string> = {
          'airdrop': 'airdrop OR "free tokens" OR claim',
          'defi': 'DeFi OR swap OR yield OR liquidity',
          'markets': '$BTC OR $ETH OR bitcoin OR ethereum',
          'nft': 'NFT OR PFP OR mint',
          'news': 'breaking OR "just announced" OR launched',
        };
        const terms = categoryTerms[category] || '';
        searchQuery = terms
          ? `(${terms}) (${accountChunk1.slice(0, 10).map(h => `from:${h}`).join(' OR ')}) -is:retweet`
          : `(${accountChunk1.map(h => `from:${h}`).join(' OR ')}) -is:retweet`;
      }

      console.log(`[Twitter API] Searching ${TRACKED_ACCOUNTS.length} accounts`);
      console.log(`[Twitter API] Start time: ${startTime.toISOString()}`);
      console.log(`[Twitter API] Query length: ${searchQuery.length} chars`);

      const searchResults = await client.v2.search(searchQuery, {
        'tweet.fields': ['public_metrics', 'created_at', 'author_id', 'attachments'],
        'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
        'media.fields': ['url', 'preview_image_url', 'type'],
        expansions: ['author_id', 'attachments.media_keys'],
        max_results: 100,
        start_time: startTime.toISOString(),
      });

      console.log(`[Twitter API] Response received, data exists: ${!!searchResults.data}, type: ${typeof searchResults.data}, isArray: ${Array.isArray(searchResults.data)}`);

      // Handle both array and single tweet response formats
      // Twitter API v2 returns data as an array, or undefined if no results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tweetsData: any[] = [];

      if (searchResults.data) {
        if (Array.isArray(searchResults.data)) {
          tweetsData = searchResults.data;
          console.log(`[Twitter API] Data is array with ${tweetsData.length} tweets`);
        } else if (typeof searchResults.data === 'object') {
          // Check if it's a single tweet object with an id property
          const dataObj = searchResults.data as Record<string, unknown>;
          console.log(`[Twitter API] Data object keys: ${Object.keys(dataObj).slice(0, 10).join(', ')}`);
          if (dataObj.id && dataObj.text) {
            // Single tweet object
            tweetsData = [searchResults.data];
            console.log(`[Twitter API] Data is single tweet object with id: ${dataObj.id}`);
          } else if (dataObj.data && Array.isArray(dataObj.data)) {
            // Nested data array (raw API response format)
            tweetsData = dataObj.data as typeof tweetsData;
            console.log(`[Twitter API] Data has nested array with ${tweetsData.length} tweets`);
          } else {
            // Log what we got for debugging
            console.log(`[Twitter API] Unexpected data format, first value sample: ${JSON.stringify(Object.entries(dataObj).slice(0, 2))}`);
          }
        }
      }

      console.log(`[Twitter API] Processing ${tweetsData.length} tweets, includes.users: ${searchResults.includes?.users?.length || 0}`);
      if (tweetsData.length === 0 && searchResults.meta) {
        console.log(`[Twitter API] Empty response - meta:`, JSON.stringify(searchResults.meta));
      }

      // Build user lookup from includes (may be empty on Basic tier)
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

      // Track author_id to username mapping from tweet text patterns
      // Twitter Basic tier may not return includes.users, so we need fallbacks
      const authorIdToUsername = new Map<string, string>();

      // If no user data from expansion, try to look up users by ID
      if (usersById.size === 0 && tweetsData.length > 0) {
        console.log('[Twitter API] No user data from expansion, attempting user lookup...');
        const authorIds = [...new Set(tweetsData.map(t => t.author_id).filter(Boolean))] as string[];

        if (authorIds.length > 0) {
          try {
            // Look up users by their IDs (separate API call)
            const usersLookup = await client.v2.users(authorIds.slice(0, 100), {
              'user.fields': ['username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
            });

            if (usersLookup.data) {
              const usersArray = Array.isArray(usersLookup.data) ? usersLookup.data : [usersLookup.data];
              for (const user of usersArray) {
                usersById.set(user.id, {
                  username: user.username,
                  name: user.name,
                  avatar: user.profile_image_url || '',
                  followers: user.public_metrics?.followers_count || 0,
                  verified: user.verified || false,
                });
                authorIdToUsername.set(user.id, user.username);
              }
              console.log(`[Twitter API] User lookup resolved ${usersArray.length} authors`);
            }
          } catch (userLookupError) {
            console.warn('[Twitter API] User lookup failed:', (userLookupError as Error).message);
            // Continue without user data - fallback will be used
          }
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

      // Process tweets - handle missing user data gracefully
      console.log(`[Twitter API] Processing ${tweetsData.length} tweets, users available: ${usersById.size}`);
      for (const tweet of tweetsData) {
        const metrics = tweet.public_metrics;
        if (!metrics) {
          console.log(`[Twitter API] Skipping tweet ${tweet.id} - no metrics`);
          continue;
        }

        // Get author from includes, or create fallback from tracked accounts
        let author = usersById.get(tweet.author_id || '');

        // If no author data from expansion, create fallback
        // Try to find which tracked account this tweet is from
        if (!author && tweet.author_id) {
          // Find a matching tracked account by checking if any account name appears in tweet URL patterns
          // For now, use a generic fallback that still allows the tweet to be displayed
          const fallbackUsername = authorIdToUsername.get(tweet.author_id) || `user_${tweet.author_id.slice(-8)}`;
          author = {
            username: fallbackUsername,
            name: fallbackUsername,
            avatar: '',
            followers: 10000, // Estimate for viral score calculation
            verified: false,
          };
          console.log(`[Twitter API] Using fallback author for tweet ${tweet.id}: ${fallbackUsername}`);
        }

        if (!author) {
          console.log(`[Twitter API] Skipping tweet ${tweet.id} - no author_id`);
          continue;
        }

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
        console.log(`[Twitter API] Added tweet from @${author.username}, score: ${viralScore}`);
      }
      console.log(`[Twitter API] Total processed: ${viralTweets.length} tweets`);
    } catch (apiError) {
      const errorMessage = (apiError as Error).message;
      console.warn(`[Twitter API] Error: ${errorMessage}`);

      // If rate limited (429), set cooldown for 5 minutes and return cached data
      if (errorMessage.includes('429')) {
        console.warn('[Twitter API] Rate limited (429) - setting 5 minute cooldown');
        rateLimitCooldownUntil = Date.now() + 5 * 60 * 1000; // 5 minute cooldown

        const staleCache = tweetCache.get(cacheKey);
        if (staleCache) {
          return NextResponse.json({
            tweets: staleCache.data.slice(0, limit),
            total: staleCache.data.length,
            timeframe,
            _cached: true,
            _stale: true,
            _rateLimited: true,
            _cooldownSet: '5 minutes',
          });
        }
        return NextResponse.json({
          tweets: [],
          total: 0,
          timeframe,
          _rateLimited: true,
          _cooldownSet: '5 minutes',
          _message: 'Twitter API rate limited. Will retry in 5 minutes.',
        });
      }
      // Re-throw to be caught by outer error handler
      throw apiError;
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

    // Diversity pass: limit max 3 tweets per author to avoid one account dominating
    const MAX_PER_AUTHOR = 3;
    const authorCounts = new Map<string, number>();
    const diversifiedTweets: ViralTweet[] = [];

    for (const tweet of viralTweets) {
      const handle = tweet.author.handle.toLowerCase();
      const count = authorCounts.get(handle) || 0;
      if (count < MAX_PER_AUTHOR) {
        diversifiedTweets.push(tweet);
        authorCounts.set(handle, count + 1);
      }
    }

    // Replace viralTweets with diversified version
    viralTweets.length = 0;
    viralTweets.push(...diversifiedTweets);

    // Cache the results to avoid rate limiting
    if (viralTweets.length > 0) {
      tweetCache.set(cacheKey, {
        data: viralTweets,
        timestamp: Date.now(),
        timeframe,
      });

      // Also add to long-term cache for 30d support
      for (const tweet of viralTweets) {
        longTermCache.tweets.set(tweet.id, tweet);
      }
      longTermCache.lastUpdated = Date.now();

      console.log(`[Twitter API] Cached ${viralTweets.length} tweets for ${cacheKey}`);
      console.log(`[Twitter API] Long-term cache now has ${longTermCache.tweets.size} tweets`);
    }

    // For 30d timeframe, combine fresh results with long-term cache
    let finalTweets = viralTweets;
    if (isLongTimeframe && longTermCache.tweets.size > 0) {
      const allCachedTweets = Array.from(longTermCache.tweets.values());
      const freshIds = new Set(viralTweets.map(t => t.id));

      // Add older tweets that aren't in fresh results
      const olderTweets = allCachedTweets.filter(t => {
        if (freshIds.has(t.id)) return false;
        const tweetAge = getHoursOld(t.postedAt);
        const maxAge = hoursBack[timeframe];
        return tweetAge <= maxAge;
      });

      finalTweets = [...viralTweets, ...olderTweets];

      // Re-sort combined results
      const sortFunctionsLocal: Record<string, (a: ViralTweet, b: ViralTweet) => number> = {
        viralScore: (a, b) => b.viralScore - a.viralScore,
        likes: (a, b) => b.metrics.likes - a.metrics.likes,
        retweets: (a, b) => b.metrics.retweets - a.metrics.retweets,
        velocity: (a, b) => b.velocity.likesPerHour - a.velocity.likesPerHour,
        newest: (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      };
      finalTweets.sort(sortFunctionsLocal[sortBy] || sortFunctionsLocal.viralScore);
    }

    // Return data - empty array if nothing found (but graceful)
    return NextResponse.json({
      tweets: finalTweets.slice(0, limit),
      total: finalTweets.length,
      timeframe,
      threshold,
      sortBy,
      _debug: {
        queryTime: startTime.toISOString(),
        accountsQueried: TRACKED_ACCOUNTS.length,
        searchTermsUsed: CRYPTO_SEARCH_TERMS.length,
        cacheExpiry: CACHE_DURATION_MS / 1000 / 60 + ' minutes',
        longTermCacheSize: longTermCache.tweets.size,
      },
    });
  } catch (error) {
    console.error('Viral tweets API error:', error);

    // Try to return stale cached data if available (better than nothing)
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const category = searchParams.get('category');
    const cacheKey = `${timeframe}-${category || 'all'}`;
    const staleCache = tweetCache.get(cacheKey);

    if (staleCache) {
      console.log('[Twitter API] Returning stale cached data due to error');
      return NextResponse.json({
        tweets: staleCache.data.slice(0, 20),
        total: staleCache.data.length,
        timeframe,
        _cached: true,
        _stale: true,
        _cacheAge: Math.round((Date.now() - staleCache.timestamp) / 1000),
        _error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

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
