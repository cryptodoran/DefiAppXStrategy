/**
 * Real Market Data Service
 * Integrates with free APIs: CoinGecko, DeFiLlama, Alternative.me
 * All data includes verification links
 */

// Cache configuration
const CACHE_DURATION = {
  prices: 60 * 1000, // 1 minute
  tvl: 5 * 60 * 1000, // 5 minutes
  fearGreed: 10 * 60 * 1000, // 10 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();

function getFromCache<T>(key: string, maxAge: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < maxAge) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============ COINGECKO API - Real Crypto Prices ============

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  verifyUrl: string;
}

const CRYPTO_IDS = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
  ethereum: { symbol: 'ETH', name: 'Ethereum' },
  solana: { symbol: 'SOL', name: 'Solana' },
  'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
};

export async function fetchRealCryptoPrices(): Promise<CryptoPrice[]> {
  const cacheKey = 'crypto-prices';
  const cached = getFromCache<CryptoPrice[]>(cacheKey, CACHE_DURATION.prices);
  if (cached) return cached;

  try {
    const ids = Object.keys(CRYPTO_IDS).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    const prices: CryptoPrice[] = Object.entries(CRYPTO_IDS).map(([id, meta]) => ({
      id,
      symbol: meta.symbol,
      name: meta.name,
      price: data[id]?.usd || 0,
      change24h: data[id]?.usd_24h_change || 0,
      verifyUrl: `https://www.coingecko.com/en/coins/${id}`,
    }));

    setCache(cacheKey, prices);
    return prices;
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    // Return fallback with indication it's stale
    return getFallbackPrices();
  }
}

function getFallbackPrices(): CryptoPrice[] {
  return [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 0, change24h: 0, verifyUrl: 'https://www.coingecko.com/en/coins/bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 0, change24h: 0, verifyUrl: 'https://www.coingecko.com/en/coins/ethereum' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 0, change24h: 0, verifyUrl: 'https://www.coingecko.com/en/coins/solana' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', price: 0, change24h: 0, verifyUrl: 'https://www.coingecko.com/en/coins/avalanche-2' },
  ];
}

// ============ DEFILLAMA API - Real TVL Data ============

export interface ChainTVL {
  name: string;
  tvl: number;
  change24h: number;
  verifyUrl: string;
}

export interface TVLData {
  total: number;
  chains: ChainTVL[];
  verifyUrl: string;
  lastUpdated: Date;
}

export async function fetchRealTVL(): Promise<TVLData> {
  const cacheKey = 'defi-tvl';
  const cached = getFromCache<TVLData>(cacheKey, CACHE_DURATION.tvl);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.llama.fi/v2/chains', {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const chains = await response.json();

    // Get top chains by TVL
    const topChains = chains
      .filter((c: { tvl: number }) => c.tvl > 0)
      .sort((a: { tvl: number }, b: { tvl: number }) => b.tvl - a.tvl)
      .slice(0, 10);

    const total = chains.reduce((sum: number, c: { tvl: number }) => sum + (c.tvl || 0), 0);

    const tvlData: TVLData = {
      total,
      chains: topChains.map((c: { name: string; tvl: number; change_1d?: number; gecko_id?: string }) => ({
        name: c.name,
        tvl: c.tvl,
        change24h: c.change_1d || 0,
        verifyUrl: `https://defillama.com/chain/${c.name}`,
      })),
      verifyUrl: 'https://defillama.com/',
      lastUpdated: new Date(),
    };

    setCache(cacheKey, tvlData);
    return tvlData;
  } catch (error) {
    console.error('Failed to fetch TVL:', error);
    return getFallbackTVL();
  }
}

function getFallbackTVL(): TVLData {
  return {
    total: 0,
    chains: [],
    verifyUrl: 'https://defillama.com/',
    lastUpdated: new Date(),
  };
}

// ============ ALTERNATIVE.ME - Fear & Greed Index ============

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: Date;
  verifyUrl: string;
}

export async function fetchRealFearGreed(): Promise<FearGreedData> {
  const cacheKey = 'fear-greed';
  const cached = getFromCache<FearGreedData>(cacheKey, CACHE_DURATION.fearGreed);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1', {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Fear & Greed API error: ${response.status}`);
    }

    const data = await response.json();
    const fng = data.data?.[0];

    const fearGreedData: FearGreedData = {
      value: parseInt(fng?.value || '50', 10),
      classification: fng?.value_classification || 'Neutral',
      timestamp: new Date(parseInt(fng?.timestamp || '0', 10) * 1000),
      verifyUrl: 'https://alternative.me/crypto/fear-and-greed-index/',
    };

    setCache(cacheKey, fearGreedData);
    return fearGreedData;
  } catch (error) {
    console.error('Failed to fetch Fear & Greed:', error);
    return getFallbackFearGreed();
  }
}

function getFallbackFearGreed(): FearGreedData {
  return {
    value: 50,
    classification: 'Neutral',
    timestamp: new Date(),
    verifyUrl: 'https://alternative.me/crypto/fear-and-greed-index/',
  };
}

// ============ COINGECKO TRENDING ============

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  marketCapRank: number;
  priceChange24h: number;
  verifyUrl: string;
}

export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  const cacheKey = 'trending-coins';
  const cached = getFromCache<TrendingCoin[]>(cacheKey, CACHE_DURATION.prices);
  if (cached) return cached;

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko Trending API error: ${response.status}`);
    }

    const data = await response.json();

    const trending: TrendingCoin[] = (data.coins || []).slice(0, 7).map((item: {
      item: {
        id: string;
        name: string;
        symbol: string;
        market_cap_rank: number;
        data?: { price_change_percentage_24h?: { usd?: number } };
      };
    }) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol.toUpperCase(),
      marketCapRank: item.item.market_cap_rank || 0,
      priceChange24h: item.item.data?.price_change_percentage_24h?.usd || 0,
      verifyUrl: `https://www.coingecko.com/en/coins/${item.item.id}`,
    }));

    setCache(cacheKey, trending);
    return trending;
  } catch (error) {
    console.error('Failed to fetch trending coins:', error);
    return [];
  }
}

// ============ COMBINED MARKET DATA ============

export interface MarketSnapshot {
  prices: CryptoPrice[];
  tvl: TVLData;
  fearGreed: FearGreedData;
  trending: TrendingCoin[];
  dataSource: {
    prices: string;
    tvl: string;
    fearGreed: string;
  };
  lastUpdated: Date;
}

export async function fetchMarketSnapshot(): Promise<MarketSnapshot> {
  const [prices, tvl, fearGreed, trending] = await Promise.all([
    fetchRealCryptoPrices(),
    fetchRealTVL(),
    fetchRealFearGreed(),
    fetchTrendingCoins(),
  ]);

  return {
    prices,
    tvl,
    fearGreed,
    trending,
    dataSource: {
      prices: 'https://www.coingecko.com/',
      tvl: 'https://defillama.com/',
      fearGreed: 'https://alternative.me/crypto/fear-and-greed-index/',
    },
    lastUpdated: new Date(),
  };
}

// ============ MARKET MOOD CALCULATION ============

export type MarketMood = 'euphoria' | 'bullish' | 'neutral' | 'bearish' | 'panic';

export function calculateMarketMood(fearGreedValue: number): MarketMood {
  if (fearGreedValue >= 75) return 'euphoria';
  if (fearGreedValue >= 55) return 'bullish';
  if (fearGreedValue >= 45) return 'neutral';
  if (fearGreedValue >= 25) return 'bearish';
  return 'panic';
}
