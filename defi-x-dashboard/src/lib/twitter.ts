import { TwitterApi } from 'twitter-api-v2';

// Twitter API client singleton
let twitterClient: TwitterApi | null = null;

export function getTwitterClient(): TwitterApi {
  if (!twitterClient) {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      throw new Error('TWITTER_BEARER_TOKEN is not configured');
    }

    twitterClient = new TwitterApi(bearerToken);
  }

  return twitterClient;
}

// Twitter API with OAuth 1.0a for user context (posting, etc.)
export function getTwitterUserClient(): TwitterApi {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('Twitter OAuth credentials not configured');
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessSecret,
  });
}

// Types for Twitter data
export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  profile_image_url?: string;
  public_metrics?: {
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
    listed_count?: number;
  };
  created_at?: string;
}

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  entities?: {
    hashtags?: { tag: string }[];
    mentions?: { username: string }[];
  };
}

// Helper functions
export async function getUserByHandle(handle: string): Promise<TwitterUser | null> {
  try {
    const client = getTwitterClient();
    const cleanHandle = handle.replace('@', '');

    const user = await client.v2.userByUsername(cleanHandle, {
      'user.fields': ['description', 'profile_image_url', 'public_metrics', 'created_at'],
    });

    if (!user.data) return null;

    return {
      id: user.data.id,
      username: user.data.username,
      name: user.data.name,
      description: user.data.description,
      profile_image_url: user.data.profile_image_url,
      public_metrics: user.data.public_metrics,
      created_at: user.data.created_at,
    };
  } catch (error) {
    console.error('Error fetching Twitter user:', error);
    return null;
  }
}

export async function getUserTweets(userId: string, maxResults = 10): Promise<Tweet[]> {
  try {
    const client = getTwitterClient();

    const tweets = await client.v2.userTimeline(userId, {
      max_results: maxResults,
      'tweet.fields': ['created_at', 'public_metrics', 'entities'],
    });

    return tweets.data.data?.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id || userId,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
      entities: tweet.entities,
    })) || [];
  } catch (error) {
    console.error('Error fetching user tweets:', error);
    return [];
  }
}

export async function searchTweets(query: string, maxResults = 10): Promise<Tweet[]> {
  try {
    const client = getTwitterClient();

    const tweets = await client.v2.search(query, {
      max_results: maxResults,
      'tweet.fields': ['created_at', 'public_metrics', 'entities', 'author_id'],
    });

    return tweets.data.data?.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id || '',
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
      entities: tweet.entities,
    })) || [];
  } catch (error) {
    console.error('Error searching tweets:', error);
    return [];
  }
}

export async function getMultipleUsersByHandles(handles: string[]): Promise<TwitterUser[]> {
  try {
    const client = getTwitterClient();
    const cleanHandles = handles.map(h => h.replace('@', ''));

    const users = await client.v2.usersByUsernames(cleanHandles, {
      'user.fields': ['description', 'profile_image_url', 'public_metrics', 'created_at'],
    });

    return users.data?.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      description: user.description,
      profile_image_url: user.profile_image_url,
      public_metrics: user.public_metrics,
      created_at: user.created_at,
    })) || [];
  } catch (error) {
    console.error('Error fetching multiple users:', error);
    return [];
  }
}

// Calculate engagement rate from user metrics and recent tweets
export function calculateEngagementRate(
  tweets: Tweet[],
  followerCount: number
): number {
  if (tweets.length === 0 || followerCount === 0) return 0;

  const totalEngagements = tweets.reduce((sum, tweet) => {
    const metrics = tweet.public_metrics;
    if (!metrics) return sum;
    return sum + metrics.like_count + metrics.retweet_count + metrics.reply_count;
  }, 0);

  const avgEngagements = totalEngagements / tweets.length;
  return (avgEngagements / followerCount) * 100;
}

// Determine influencer tier based on followers
export function getInfluencerTier(followers: number): 'nano' | 'micro' | 'macro' | 'mega' {
  if (followers >= 1000000) return 'mega';
  if (followers >= 100000) return 'macro';
  if (followers >= 10000) return 'micro';
  return 'nano';
}
