import { NextResponse } from 'next/server';
import { getUserByHandle, getUserTweets } from '@/lib/twitter';

// Real Defi App competitors to monitor
const COMPETITOR_HANDLES = [
  'zeraborated', // Zerion
  'zapperfi', // Zapper
  'DeBankDeFi', // DeBank
  'rainbowdotme', // Rainbow
  'Instadapp', // Instadapp
  'MetaMask', // MetaMask
];

interface CompetitorAlert {
  id: string;
  competitor: {
    handle: string;
    name: string;
    profileImage?: string;
  };
  tweetId: string;
  tweetUrl: string;
  content: string;
  likes: number;
  retweets: number;
  createdAt: string;
  category: 'product' | 'announcement' | 'engagement' | 'general';
  urgency: 'high' | 'medium' | 'low';
}

// Determine alert category based on content
function categorizeAlert(content: string): CompetitorAlert['category'] {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('launch') || lowerContent.includes('release') || lowerContent.includes('new feature') || lowerContent.includes('now live')) {
    return 'product';
  }
  if (lowerContent.includes('announcement') || lowerContent.includes('breaking') || lowerContent.includes('introducing')) {
    return 'announcement';
  }
  if (lowerContent.includes('giveaway') || lowerContent.includes('airdrop') || lowerContent.includes('campaign')) {
    return 'engagement';
  }
  return 'general';
}

// Determine urgency based on engagement
function getUrgency(likes: number, retweets: number): CompetitorAlert['urgency'] {
  const total = likes + retweets;
  if (total > 1000) return 'high';
  if (total > 200) return 'medium';
  return 'low';
}

export async function GET() {
  try {
    // Check if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      // Return realistic mock alerts with actual tweet URLs
      const mockAlerts: CompetitorAlert[] = [
        {
          id: 'mock-1',
          competitor: { handle: 'zeraborated', name: 'Zerion' },
          tweetId: '1876543210987654321',
          tweetUrl: 'https://twitter.com/zeraborated',
          content: 'Zerion Wallet now supports 15+ chains with unified balance view. Multi-chain just got easier.',
          likes: 1247,
          retweets: 342,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          category: 'product',
          urgency: 'high',
        },
        {
          id: 'mock-2',
          competitor: { handle: 'rainbowdotme', name: 'Rainbow' },
          tweetId: '1876543210987654322',
          tweetUrl: 'https://twitter.com/rainbowdotme',
          content: 'Big mobile update just dropped. Native ENS support and gas estimation improvements.',
          likes: 892,
          retweets: 178,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          category: 'product',
          urgency: 'medium',
        },
        {
          id: 'mock-3',
          competitor: { handle: 'DeBankDeFi', name: 'DeBank' },
          tweetId: '1876543210987654323',
          tweetUrl: 'https://twitter.com/DeBankDeFi',
          content: 'New social features: Follow wallets and get alerts when they make moves. Portfolio tracking evolved.',
          likes: 567,
          retweets: 123,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          category: 'announcement',
          urgency: 'medium',
        },
      ];

      return NextResponse.json({
        alerts: mockAlerts,
        _mock: true,
        _message: 'Demo mode - configure TWITTER_BEARER_TOKEN for live competitor alerts',
      });
    }

    // Fetch real tweets from competitors
    const alerts: CompetitorAlert[] = [];

    for (const handle of COMPETITOR_HANDLES.slice(0, 4)) { // Limit to avoid rate limits
      try {
        const user = await getUserByHandle(handle);
        if (!user) continue;

        const tweets = await getUserTweets(user.id, 3);

        for (const tweet of tweets) {
          const alert: CompetitorAlert = {
            id: tweet.id,
            competitor: {
              handle: user.username,
              name: user.name,
              profileImage: user.profile_image_url,
            },
            tweetId: tweet.id,
            tweetUrl: `https://twitter.com/${user.username}/status/${tweet.id}`,
            content: tweet.text,
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            createdAt: tweet.created_at || new Date().toISOString(),
            category: categorizeAlert(tweet.text),
            urgency: getUrgency(
              tweet.public_metrics?.like_count || 0,
              tweet.public_metrics?.retweet_count || 0
            ),
          };
          alerts.push(alert);
        }
      } catch (error) {
        console.error(`Failed to fetch tweets for ${handle}:`, error);
      }
    }

    // Sort by urgency and recency
    alerts.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      alerts: alerts.slice(0, 10),
      count: alerts.length,
    });
  } catch (error) {
    console.error('Competitor alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitor alerts' },
      { status: 500 }
    );
  }
}
