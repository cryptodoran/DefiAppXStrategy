import { NextRequest, NextResponse } from 'next/server';
import { searchTweets } from '@/lib/twitter';

export async function POST(request: NextRequest) {
  try {
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json({ error: 'Handle required' }, { status: 400 });
    }

    const cleanHandle = handle.replace('@', '');
    const ownHandle = process.env.NEXT_PUBLIC_TWITTER_OWN_HANDLE || 'defiapp';

    console.log(`Fetching sentiment for ${cleanHandle}, searching for mentions of @${ownHandle}`);

    // Search for tweets from this influencer mentioning us
    const mentionQuery = `from:${cleanHandle} @${ownHandle}`;
    console.log('Mention query:', mentionQuery);
    const mentions = await searchTweets(mentionQuery, 100);
    console.log(`Found ${mentions.length} mentions`);

    // Search for tweets from this influencer about us (without direct mention)
    const aboutQuery = `from:${cleanHandle} ${ownHandle}`;
    console.log('About query:', aboutQuery);
    const aboutTweets = await searchTweets(aboutQuery, 100);
    console.log(`Found ${aboutTweets.length} about tweets`);

    const allTweets = [...mentions, ...aboutTweets];
    console.log(`Total tweets analyzed: ${allTweets.length}`);

    // Analyze sentiment based on engagement and content
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    allTweets.forEach(tweet => {
      const text = tweet.text.toLowerCase();
      const metrics = tweet.public_metrics;

      // Simple sentiment analysis
      const positiveWords = ['great', 'love', 'best', 'amazing', 'excellent', 'impressive', 'solid', 'recommend', 'bullish'];
      const negativeWords = ['bad', 'worst', 'terrible', 'avoid', 'scam', 'rug', 'disappointed', 'bearish'];

      const hasPositive = positiveWords.some(word => text.includes(word));
      const hasNegative = negativeWords.some(word => text.includes(word));

      // High engagement usually indicates positive sentiment
      const highEngagement = metrics && (
        metrics.like_count > 100 ||
        metrics.retweet_count > 20
      );

      if (hasPositive || highEngagement) {
        positiveCount++;
      } else if (hasNegative) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });

    // Determine overall sentiment
    let sentiment: 'positive' | 'neutral' | 'negative' | 'unknown' = 'unknown';
    if (allTweets.length > 0) {
      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        sentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
      } else {
        sentiment = 'neutral';
      }
    }

    // Count collaborations (retweets, quote tweets, or mentions)
    const collaborations = allTweets.length;

    // Find most recent engagement
    const lastEngagement = allTweets.length > 0
      ? new Date(allTweets[0].created_at || Date.now())
      : null;

    return NextResponse.json({
      handle: cleanHandle,
      sentiment,
      collaborations,
      lastEngagement,
      tweets: allTweets.slice(0, 10).map(t => ({
        id: t.id,
        text: t.text,
        created_at: t.created_at,
        metrics: t.public_metrics,
      })),
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze sentiment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
