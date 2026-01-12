import { NextRequest, NextResponse } from 'next/server';
import {
  getMultipleUsersByHandles,
  getUserTweets,
  calculateEngagementRate,
  getInfluencerTier,
} from '@/lib/twitter';

export async function POST(request: NextRequest) {
  try {
    const { handles } = await request.json();

    if (!Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json({ error: 'handles array required' }, { status: 400 });
    }

    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return mock data if not configured
      return NextResponse.json(
        handles.map((handle: string) => ({
          id: `mock-${handle}`,
          handle: `@${handle.replace('@', '')}`,
          name: handle.replace('@', ''),
          description: 'Twitter API not configured',
          followers: 0,
          following: 0,
          tweets: 0,
          engagementRate: 0,
          tier: 'nano',
          _mock: true,
        }))
      );
    }

    const users = await getMultipleUsersByHandles(handles);

    // Get engagement rates for each user (this is expensive, consider caching)
    const usersWithEngagement = await Promise.all(
      users.map(async (user) => {
        const tweets = await getUserTweets(user.id, 10);
        const engagementRate = calculateEngagementRate(
          tweets,
          user.public_metrics?.followers_count || 0
        );
        const followers = user.public_metrics?.followers_count || 0;

        return {
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
        };
      })
    );

    return NextResponse.json(usersWithEngagement);
  } catch (error) {
    console.error('Twitter API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data' },
      { status: 500 }
    );
  }
}
