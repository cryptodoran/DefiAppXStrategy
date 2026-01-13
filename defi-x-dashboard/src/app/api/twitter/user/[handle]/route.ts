import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import {
  getUserTweets,
  calculateEngagementRate,
  getInfluencerTier,
} from '@/lib/twitter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return realistic sample data for demo mode
      const now = Date.now();
      const sampleTweets = [
        {
          id: 'sample-1',
          content: 'DeFi is about financial freedom and accessibility. Building products that actually matter.',
          likes: 1247,
          retweets: 389,
          replies: 156,
          impressions: 89500,
          createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-2',
          content: 'Best yields in DeFi, no cap. Check the rates yourself.',
          likes: 892,
          retweets: 234,
          replies: 98,
          impressions: 67200,
          createdAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-3',
          content: 'New chain integration dropping this week. Multi-chain aggregation just got better.',
          likes: 2156,
          retweets: 567,
          replies: 234,
          impressions: 145000,
          createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-4',
          content: 'Why are people still paying 2% fees when you can get 0.1%? Make it make sense.',
          likes: 1567,
          retweets: 445,
          replies: 189,
          impressions: 112000,
          createdAt: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-5',
          content: 'Thread on the state of DeFi yields in 2026. Spoiler: They\'re actually good now.',
          likes: 3245,
          retweets: 823,
          replies: 312,
          impressions: 198000,
          createdAt: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return NextResponse.json({
        id: 'demo-defiapp',
        handle: `@${handle}`,
        name: 'defi app',
        description: 'best rates or something idk. Configure TWITTER_BEARER_TOKEN for real data.',
        followers: 89500,
        following: 342,
        tweets: 1847,
        engagementRate: 4.2,
        tier: 'macro',
        recentTweets: sampleTweets,
        _mock: true,
        _message: 'Demo mode - configure TWITTER_BEARER_TOKEN for live data',
      });
    }

    // Directly fetch to get better error messages
    const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    const cleanHandle = handle.replace('@', '');

    const userResult = await client.v2.userByUsername(cleanHandle, {
      'user.fields': ['description', 'profile_image_url', 'public_metrics', 'created_at'],
    });

    if (!userResult.data) {
      return NextResponse.json({
        error: 'User not found',
        handle: cleanHandle,
        twitterErrors: userResult.errors,
      }, { status: 404 });
    }

    const user = userResult.data;

    // Get recent tweets for engagement calculation
    const tweets = await getUserTweets(user.id, 20);
    const engagementRate = calculateEngagementRate(
      tweets,
      user.public_metrics?.followers_count || 0
    );

    const followers = user.public_metrics?.followers_count || 0;

    return NextResponse.json({
      id: user.id,
      handle: `@${user.username}`,
      name: user.name,
      description: user.description,
      profileImage: user.profile_image_url,
      followers,
      following: user.public_metrics?.following_count || 0,
      tweets: user.public_metrics?.tweet_count || 0,
      engagementRate: Math.round(engagementRate * 100) / 100,
      tier: getInfluencerTier(followers),
      recentTweets: tweets.slice(0, 5).map((tweet) => ({
        id: tweet.id,
        content: tweet.text,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        impressions: tweet.public_metrics?.impression_count,
        createdAt: tweet.created_at,
      })),
    });
  } catch (error: unknown) {
    console.error('Twitter API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch Twitter data',
        details: errorMessage,
        code: (error as { code?: number })?.code,
      },
      { status: 500 }
    );
  }
}
