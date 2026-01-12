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
      // Return mock data if not configured
      return NextResponse.json({
        id: 'mock-id',
        handle: `@${handle}`,
        name: handle,
        description: 'Twitter API not configured - showing placeholder data',
        followers: 0,
        following: 0,
        tweets: 0,
        engagementRate: 0,
        tier: 'nano',
        recentTweets: [],
        _mock: true,
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
