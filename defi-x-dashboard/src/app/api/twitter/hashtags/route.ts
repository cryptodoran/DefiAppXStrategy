import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

interface TrendingHashtag {
  tag: string;
  searchUrl: string;
  category: 'crypto' | 'defi' | 'nft' | 'general';
  volume?: number;
  change?: number;
}

// Curated crypto hashtags for different timeframes (used in demo mode)
const CRYPTO_HASHTAGS: Record<string, TrendingHashtag[]> = {
  '24h': [
    { tag: '#Bitcoin', searchUrl: 'https://x.com/search?q=%23Bitcoin&src=typed_query&f=live', category: 'crypto', volume: 245000, change: 12.5 },
    { tag: '#ETH', searchUrl: 'https://x.com/search?q=%23ETH&src=typed_query&f=live', category: 'crypto', volume: 189000, change: 8.2 },
    { tag: '#DeFi', searchUrl: 'https://x.com/search?q=%23DeFi&src=typed_query&f=live', category: 'defi', volume: 67000, change: 15.8 },
    { tag: '#Solana', searchUrl: 'https://x.com/search?q=%23Solana&src=typed_query&f=live', category: 'crypto', volume: 56000, change: 22.4 },
    { tag: '#Airdrop', searchUrl: 'https://x.com/search?q=%23Airdrop&src=typed_query&f=live', category: 'defi', volume: 43000, change: 35.7 },
    { tag: '#Layer2', searchUrl: 'https://x.com/search?q=%23Layer2&src=typed_query&f=live', category: 'defi', volume: 28000, change: 18.3 },
    { tag: '#NFT', searchUrl: 'https://x.com/search?q=%23NFT&src=typed_query&f=live', category: 'nft', volume: 25000, change: -5.2 },
    { tag: '#Web3', searchUrl: 'https://x.com/search?q=%23Web3&src=typed_query&f=live', category: 'general', volume: 21000, change: 6.8 },
    { tag: '#Crypto', searchUrl: 'https://x.com/search?q=%23Crypto&src=typed_query&f=live', category: 'crypto', volume: 312000, change: 4.1 },
    { tag: '#BTC', searchUrl: 'https://x.com/search?q=%23BTC&src=typed_query&f=live', category: 'crypto', volume: 198000, change: 9.7 },
  ],
  '7d': [
    { tag: '#Bitcoin', searchUrl: 'https://x.com/search?q=%23Bitcoin&src=typed_query&f=live', category: 'crypto', volume: 1680000, change: 8.3 },
    { tag: '#Ethereum', searchUrl: 'https://x.com/search?q=%23Ethereum&src=typed_query&f=live', category: 'crypto', volume: 1250000, change: 5.6 },
    { tag: '#DeFi', searchUrl: 'https://x.com/search?q=%23DeFi&src=typed_query&f=live', category: 'defi', volume: 456000, change: 12.1 },
    { tag: '#Crypto', searchUrl: 'https://x.com/search?q=%23Crypto&src=typed_query&f=live', category: 'crypto', volume: 2100000, change: 3.2 },
    { tag: '#Solana', searchUrl: 'https://x.com/search?q=%23Solana&src=typed_query&f=live', category: 'crypto', volume: 389000, change: 28.5 },
    { tag: '#Airdrop', searchUrl: 'https://x.com/search?q=%23Airdrop&src=typed_query&f=live', category: 'defi', volume: 287000, change: 42.3 },
    { tag: '#Staking', searchUrl: 'https://x.com/search?q=%23Staking&src=typed_query&f=live', category: 'defi', volume: 178000, change: 15.8 },
    { tag: '#NFT', searchUrl: 'https://x.com/search?q=%23NFT&src=typed_query&f=live', category: 'nft', volume: 167000, change: -8.4 },
    { tag: '#Web3', searchUrl: 'https://x.com/search?q=%23Web3&src=typed_query&f=live', category: 'general', volume: 145000, change: 4.2 },
    { tag: '#Altcoins', searchUrl: 'https://x.com/search?q=%23Altcoins&src=typed_query&f=live', category: 'crypto', volume: 134000, change: 18.9 },
  ],
  '30d': [
    { tag: '#Bitcoin', searchUrl: 'https://x.com/search?q=%23Bitcoin&src=typed_query&f=live', category: 'crypto', volume: 7200000, change: 5.2 },
    { tag: '#Crypto', searchUrl: 'https://x.com/search?q=%23Crypto&src=typed_query&f=live', category: 'crypto', volume: 8900000, change: 2.8 },
    { tag: '#Ethereum', searchUrl: 'https://x.com/search?q=%23Ethereum&src=typed_query&f=live', category: 'crypto', volume: 5400000, change: 4.1 },
    { tag: '#DeFi', searchUrl: 'https://x.com/search?q=%23DeFi&src=typed_query&f=live', category: 'defi', volume: 1980000, change: 9.7 },
    { tag: '#BTC', searchUrl: 'https://x.com/search?q=%23BTC&src=typed_query&f=live', category: 'crypto', volume: 4500000, change: 6.3 },
    { tag: '#Solana', searchUrl: 'https://x.com/search?q=%23Solana&src=typed_query&f=live', category: 'crypto', volume: 1670000, change: 35.2 },
    { tag: '#NFT', searchUrl: 'https://x.com/search?q=%23NFT&src=typed_query&f=live', category: 'nft', volume: 720000, change: -12.5 },
    { tag: '#Web3', searchUrl: 'https://x.com/search?q=%23Web3&src=typed_query&f=live', category: 'general', volume: 620000, change: 1.8 },
    { tag: '#Airdrop', searchUrl: 'https://x.com/search?q=%23Airdrop&src=typed_query&f=live', category: 'defi', volume: 1230000, change: 52.4 },
    { tag: '#Layer2', searchUrl: 'https://x.com/search?q=%23Layer2&src=typed_query&f=live', category: 'defi', volume: 540000, change: 22.1 },
  ],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    // Check if Twitter API is configured for real trends
    if (process.env.TWITTER_BEARER_TOKEN) {
      try {
        const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

        // Twitter trends API requires a WOEID (1 = worldwide)
        const worldwideTrends = await client.v1.trendsByPlace(1);

        if (worldwideTrends && worldwideTrends[0]?.trends) {
          const cryptoKeywords = ['bitcoin', 'btc', 'eth', 'crypto', 'defi', 'nft', 'web3', 'solana', 'airdrop', 'layer2'];

          const cryptoTrends = worldwideTrends[0].trends
            .filter(t => {
              const nameLower = t.name.toLowerCase();
              return cryptoKeywords.some(kw => nameLower.includes(kw)) || t.name.startsWith('#');
            })
            .slice(0, limit)
            .map(t => ({
              tag: t.name.startsWith('#') ? t.name : `#${t.name}`,
              searchUrl: t.url,
              category: categorizeHashtag(t.name),
              volume: t.tweet_volume || undefined,
            }));

          if (cryptoTrends.length > 0) {
            return NextResponse.json({
              hashtags: cryptoTrends,
              timeframe,
              _live: true,
              _disclaimer: 'Hashtags can cause algorithmic deboost on X. Use strategically as a signal, not a rule.',
            });
          }
        }
      } catch (twitterError) {
        console.error('Twitter trends API error:', twitterError);
        // Fall through to demo data
      }
    }

    // Demo mode - return curated hashtags
    let hashtags = CRYPTO_HASHTAGS[timeframe] || CRYPTO_HASHTAGS['24h'];

    // Filter by category if specified
    if (category && category !== 'all') {
      hashtags = hashtags.filter(h => h.category === category);
    }

    return NextResponse.json({
      hashtags: hashtags.slice(0, limit),
      timeframe,
      _demo: true,
      _disclaimer: 'Hashtags can cause algorithmic deboost on X. Use strategically as a signal, not a rule.',
    });
  } catch (error) {
    console.error('Hashtags API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending hashtags' },
      { status: 500 }
    );
  }
}

function categorizeHashtag(tag: string): 'crypto' | 'defi' | 'nft' | 'general' {
  const tagLower = tag.toLowerCase();

  if (tagLower.includes('nft') || tagLower.includes('pfp')) return 'nft';
  if (tagLower.includes('defi') || tagLower.includes('airdrop') || tagLower.includes('yield') ||
      tagLower.includes('stake') || tagLower.includes('layer2') || tagLower.includes('l2')) return 'defi';
  if (tagLower.includes('btc') || tagLower.includes('eth') || tagLower.includes('bitcoin') ||
      tagLower.includes('ethereum') || tagLower.includes('crypto') || tagLower.includes('solana') ||
      tagLower.includes('altcoin')) return 'crypto';

  return 'general';
}
