import { NextResponse } from 'next/server';
import { getUserByHandle, getUserTweets, calculateEngagementRate } from '@/lib/twitter';

export async function GET() {
  try {
    const ownHandle = process.env.TWITTER_OWN_HANDLE || 'defiapp';

    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return mock analytics when API not configured
      return NextResponse.json({
        followers: {
          count: 47832,
          change: 1248,
          changePercent: 2.7,
        },
        engagement: {
          rate: 4.2,
          change: 0.3,
        },
        impressions: {
          total: 2450000,
          change: 350000,
          changePercent: 16.7,
        },
        posts: {
          count: 42,
          avgEngagement: 3.8,
        },
        _mock: true,
        _message: 'Connect Twitter API for real data',
      });
    }

    const user = await getUserByHandle(ownHandle);

    if (!user) {
      return NextResponse.json({ error: 'Could not fetch own account' }, { status: 500 });
    }

    const tweets = await getUserTweets(user.id, 50);
    const engagementRate = calculateEngagementRate(tweets, user.public_metrics?.followers_count || 0);

    // Calculate total impressions from recent tweets
    const totalImpressions = tweets.reduce((sum, t) => {
      return sum + (t.public_metrics?.impression_count || 0);
    }, 0);

    // Note: For accurate change metrics, we'd need historical data in database
    // These are placeholders that should be replaced with actual calculations
    return NextResponse.json({
      followers: {
        count: user.public_metrics?.followers_count || 0,
        change: 0, // Would need historical data
        changePercent: 0,
      },
      engagement: {
        rate: Math.round(engagementRate * 100) / 100,
        change: 0, // Would need historical data
      },
      impressions: {
        total: totalImpressions,
        change: 0,
        changePercent: 0,
      },
      posts: {
        count: tweets.length,
        avgEngagement: engagementRate,
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
