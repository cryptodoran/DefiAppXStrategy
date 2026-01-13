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
      // Sample influencer data for demo mode
      const sampleInfluencers: Record<string, {
        name: string;
        followers: number;
        engagementRate: number;
        description: string;
      }> = {
        defiignas: { name: 'Ignas | DeFi', followers: 385000, engagementRate: 3.2, description: 'DeFi degen sharing alpha. 100x finder. Not financial advice.' },
        sassal0x: { name: 'sassal.eth', followers: 165000, engagementRate: 4.5, description: 'The Daily Gwei. ETH advocate.' },
        milesdeutscher: { name: 'Miles Deutscher', followers: 512000, engagementRate: 2.8, description: 'Crypto Content Creator | Trading | Analysis' },
        route2fi: { name: 'Route 2 FI', followers: 425000, engagementRate: 3.5, description: 'Financial freedom through crypto. DeFi strategies.' },
        cryptovince_: { name: 'Crypto Vince', followers: 78000, engagementRate: 4.1, description: 'Crypto analysis & trading. Building wealth.' },
        thedefiedge: { name: 'The DeFi Edge', followers: 390000, engagementRate: 3.8, description: 'Breaking down DeFi protocols. Threads & education.' },
        pentosh1: { name: 'Pentoshi', followers: 720000, engagementRate: 2.1, description: 'Charts. Trading. Alpha.' },
        cryptokaduna: { name: 'Crypto Kaduna', followers: 145000, engagementRate: 3.9, description: 'DeFi alpha hunter. Airdrop specialist.' },
      };

      const getTier = (followers: number) => {
        if (followers >= 1000000) return 'mega';
        if (followers >= 100000) return 'macro';
        if (followers >= 10000) return 'micro';
        return 'nano';
      };

      return NextResponse.json(
        handles.map((handle: string) => {
          const cleanHandle = handle.replace('@', '').toLowerCase();
          const sample = sampleInfluencers[cleanHandle];

          if (sample) {
            return {
              id: `demo-${cleanHandle}`,
              handle: `@${handle.replace('@', '')}`,
              name: sample.name,
              description: sample.description,
              followers: sample.followers,
              following: Math.floor(sample.followers * 0.2),
              tweets: Math.floor(sample.followers * 0.1),
              engagementRate: sample.engagementRate,
              tier: getTier(sample.followers),
              _mock: true,
            };
          }

          // For unknown handles, generate reasonable defaults
          const randomFollowers = Math.floor(Math.random() * 200000) + 5000;
          return {
            id: `demo-${cleanHandle}`,
            handle: `@${handle.replace('@', '')}`,
            name: handle.replace('@', ''),
            description: 'Crypto enthusiast. Not financial advice.',
            followers: randomFollowers,
            following: Math.floor(randomFollowers * 0.15),
            tweets: Math.floor(randomFollowers * 0.08),
            engagementRate: Math.round((Math.random() * 4 + 1) * 10) / 10,
            tier: getTier(randomFollowers),
            _mock: true,
          };
        })
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
