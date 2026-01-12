/**
 * Market Data Service
 * V2-009: CoinGecko API Integration
 * V2-010: DeFiLlama API Integration
 * V2-011: Fear & Greed Index Integration
 * V2-016: TradFi Data Integration
 */

// Types
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  sparkline_7d: number[];
  last_updated: Date;
}

export interface DeFiTVL {
  totalTVL: number;
  change24h: number;
  tvlByChain: ChainTVL[];
  tvlByProtocol: ProtocolTVL[];
  lastUpdated: Date;
}

export interface ChainTVL {
  chain: string;
  tvl: number;
  change24h: number;
}

export interface ProtocolTVL {
  name: string;
  symbol: string;
  tvl: number;
  change24h: number;
  chain: string;
}

export interface FearGreedIndex {
  value: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  trend: 'up' | 'down' | 'stable';
  previousValue: number;
  timestamp: Date;
}

export interface TradFiData {
  sp500: IndexData;
  nasdaq: IndexData;
  dxy: IndexData;
  vix: IndexData;
  gold: IndexData;
  marketHours: MarketHoursStatus;
}

export interface IndexData {
  value: number;
  change: number;
  changePercent: number;
  isOpen: boolean;
}

export interface MarketHoursStatus {
  nyse: 'pre-market' | 'open' | 'after-hours' | 'closed';
  nextOpen?: Date;
  nextClose?: Date;
}

export interface EconomicEvent {
  id: string;
  date: Date;
  name: string;
  importance: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
}

// Market Mood Detection (V2-012)
export type MarketMood = 'EUPHORIA' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'PANIC' | 'CHAOS';

export interface MarketMoodAnalysis {
  mood: MarketMood;
  confidence: number;
  factors: MoodFactor[];
  contentRecommendation: ContentToneRecommendation;
  timestamp: Date;
}

export interface MoodFactor {
  name: string;
  value: number;
  contribution: number;
  description: string;
}

export interface ContentToneRecommendation {
  tone: string;
  topics: string[];
  avoidTopics: string[];
  hookStyles: string[];
}

// Cache configuration
const CACHE_TTL = {
  prices: 30 * 1000, // 30 seconds
  tvl: 15 * 60 * 1000, // 15 minutes
  fearGreed: 15 * 60 * 1000, // 15 minutes
  tradFi: 60 * 1000, // 1 minute
  events: 60 * 60 * 1000, // 1 hour
};

// In-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown, ttl: number): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

// CoinGecko Service
export async function fetchCryptoPrices(limit = 20): Promise<CryptoPrice[]> {
  const cacheKey = `crypto_prices_${limit}`;
  const cached = getCached<CryptoPrice[]>(cacheKey);
  if (cached) return cached;

  // In production, this would call the real CoinGecko API
  // For now, return mock data
  const mockData: CryptoPrice[] = [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      current_price: 97842,
      price_change_24h: 2234.56,
      price_change_percentage_24h: 2.34,
      market_cap: 1920000000000,
      volume_24h: 45000000000,
      sparkline_7d: [94000, 95200, 94800, 96100, 97200, 96800, 97842],
      last_updated: new Date(),
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      current_price: 3456,
      price_change_24h: -30.12,
      price_change_percentage_24h: -0.87,
      market_cap: 415000000000,
      volume_24h: 18000000000,
      sparkline_7d: [3520, 3480, 3510, 3450, 3420, 3470, 3456],
      last_updated: new Date(),
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      current_price: 198.45,
      price_change_24h: 10.54,
      price_change_percentage_24h: 5.62,
      market_cap: 86000000000,
      volume_24h: 4500000000,
      sparkline_7d: [185, 188, 192, 195, 193, 196, 198.45],
      last_updated: new Date(),
    },
  ];

  setCache(cacheKey, mockData, CACHE_TTL.prices);
  return mockData;
}

// DeFiLlama Service
export async function fetchDeFiTVL(): Promise<DeFiTVL> {
  const cacheKey = 'defi_tvl';
  const cached = getCached<DeFiTVL>(cacheKey);
  if (cached) return cached;

  const mockData: DeFiTVL = {
    totalTVL: 180500000000,
    change24h: 2.34,
    tvlByChain: [
      { chain: 'Ethereum', tvl: 95000000000, change24h: 1.2 },
      { chain: 'BSC', tvl: 12000000000, change24h: -0.5 },
      { chain: 'Arbitrum', tvl: 8500000000, change24h: 3.4 },
      { chain: 'Solana', tvl: 7200000000, change24h: 5.2 },
    ],
    tvlByProtocol: [
      { name: 'Lido', symbol: 'LDO', tvl: 35000000000, change24h: 0.8, chain: 'Ethereum' },
      { name: 'Aave', symbol: 'AAVE', tvl: 22000000000, change24h: 1.5, chain: 'Ethereum' },
      { name: 'Maker', symbol: 'MKR', tvl: 18000000000, change24h: -0.3, chain: 'Ethereum' },
    ],
    lastUpdated: new Date(),
  };

  setCache(cacheKey, mockData, CACHE_TTL.tvl);
  return mockData;
}

// Fear & Greed Index
export async function fetchFearGreedIndex(): Promise<FearGreedIndex> {
  const cacheKey = 'fear_greed';
  const cached = getCached<FearGreedIndex>(cacheKey);
  if (cached) return cached;

  const mockData: FearGreedIndex = {
    value: 72,
    classification: 'Greed',
    trend: 'up',
    previousValue: 68,
    timestamp: new Date(),
  };

  setCache(cacheKey, mockData, CACHE_TTL.fearGreed);
  return mockData;
}

// TradFi Data
export async function fetchTradFiData(): Promise<TradFiData> {
  const cacheKey = 'tradfi';
  const cached = getCached<TradFiData>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const hour = now.getUTCHours();
  const isMarketOpen = hour >= 14 && hour < 21; // Rough NYSE hours in UTC

  const mockData: TradFiData = {
    sp500: { value: 5234.56, change: 23.45, changePercent: 0.45, isOpen: isMarketOpen },
    nasdaq: { value: 16432.12, change: 127.89, changePercent: 0.78, isOpen: isMarketOpen },
    dxy: { value: 103.42, change: -0.12, changePercent: -0.12, isOpen: true },
    vix: { value: 14.32, change: -0.34, changePercent: -2.34, isOpen: isMarketOpen },
    gold: { value: 2045.30, change: 12.50, changePercent: 0.61, isOpen: true },
    marketHours: {
      nyse: isMarketOpen ? 'open' : 'closed',
      nextOpen: isMarketOpen ? undefined : new Date(now.getTime() + 12 * 60 * 60 * 1000),
    },
  };

  setCache(cacheKey, mockData, CACHE_TTL.tradFi);
  return mockData;
}

// Economic Calendar
export async function fetchEconomicEvents(days = 7): Promise<EconomicEvent[]> {
  const cacheKey = `events_${days}`;
  const cached = getCached<EconomicEvent[]>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const mockData: EconomicEvent[] = [
    {
      id: '1',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      name: 'CPI Data Release',
      importance: 'high',
      forecast: '3.2%',
      previous: '3.4%',
    },
    {
      id: '2',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      name: 'FOMC Meeting',
      importance: 'high',
    },
    {
      id: '3',
      date: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
      name: 'GDP Report',
      importance: 'medium',
      forecast: '2.8%',
      previous: '2.5%',
    },
  ];

  setCache(cacheKey, mockData, CACHE_TTL.events);
  return mockData;
}

// Market Mood Detection (V2-012)
export async function analyzeMarketMood(): Promise<MarketMoodAnalysis> {
  const [prices, fearGreed, tradFi] = await Promise.all([
    fetchCryptoPrices(2),
    fetchFearGreedIndex(),
    fetchTradFiData(),
  ]);

  const btc = prices.find((p) => p.symbol === 'BTC');
  const btcChange = btc?.price_change_percentage_24h || 0;
  const fgValue = fearGreed.value;
  const vix = tradFi.vix.value;

  // Determine mood based on factors
  let mood: MarketMood = 'NEUTRAL';
  let confidence = 0.7;

  if (btcChange > 10 && fgValue > 75) {
    mood = 'EUPHORIA';
    confidence = 0.9;
  } else if (btcChange > 3 && fgValue > 55) {
    mood = 'BULLISH';
    confidence = 0.85;
  } else if (btcChange < -10 && fgValue < 25) {
    mood = 'PANIC';
    confidence = 0.9;
  } else if (btcChange < -3 && fgValue < 45) {
    mood = 'BEARISH';
    confidence = 0.85;
  } else if (vix > 30) {
    mood = 'CHAOS';
    confidence = 0.8;
  }

  const contentRecommendations: Record<MarketMood, ContentToneRecommendation> = {
    EUPHORIA: {
      tone: 'Celebratory but cautious',
      topics: ['Bull market strategies', 'Taking profits', 'Risk management'],
      avoidTopics: ['Bearish takes', 'Doom predictions'],
      hookStyles: ['Hot take', 'Contrarian warning', 'Data-driven'],
    },
    BULLISH: {
      tone: 'Optimistic and educational',
      topics: ['Market analysis', 'Protocol deep dives', 'Opportunity spotting'],
      avoidTopics: ['FUD', 'Overly bearish content'],
      hookStyles: ['Educational thread', 'Alpha leak', 'Trend analysis'],
    },
    NEUTRAL: {
      tone: 'Balanced and analytical',
      topics: ['Technical analysis', 'Market structure', 'Building during quiet times'],
      avoidTopics: ['Extreme predictions either way'],
      hookStyles: ['Thread', 'Hot take', 'Educational'],
    },
    BEARISH: {
      tone: 'Measured and supportive',
      topics: ['Survival strategies', 'Quality projects', 'Dollar-cost averaging'],
      avoidTopics: ['Excessive doom', 'Panic selling'],
      hookStyles: ['Supportive', 'Educational', 'Long-term perspective'],
    },
    PANIC: {
      tone: 'Calm and reassuring',
      topics: ['Historical perspective', 'Opportunities in fear', 'Risk assessment'],
      avoidTopics: ['Adding to panic', 'Schadenfreude'],
      hookStyles: ['Calming', 'Historical comparison', 'Opportunity framing'],
    },
    CHAOS: {
      tone: 'Breaking news, factual',
      topics: ['Event coverage', 'Real-time analysis', 'Safety reminders'],
      avoidTopics: ['Speculation without facts', 'Blame without evidence'],
      hookStyles: ['Breaking news', 'Live updates', 'Factual reporting'],
    },
  };

  return {
    mood,
    confidence,
    factors: [
      { name: 'BTC 24h Change', value: btcChange, contribution: 0.3, description: `BTC is ${btcChange >= 0 ? 'up' : 'down'} ${Math.abs(btcChange).toFixed(2)}% today` },
      { name: 'Fear & Greed', value: fgValue, contribution: 0.35, description: fearGreed.classification },
      { name: 'VIX', value: vix, contribution: 0.2, description: vix > 20 ? 'Elevated volatility' : 'Low volatility' },
      { name: 'Market Trend', value: fearGreed.trend === 'up' ? 1 : -1, contribution: 0.15, description: `Trend is ${fearGreed.trend}` },
    ],
    contentRecommendation: contentRecommendations[mood],
    timestamp: new Date(),
  };
}

// Export all services
export const MarketDataService = {
  fetchCryptoPrices,
  fetchDeFiTVL,
  fetchFearGreedIndex,
  fetchTradFiData,
  fetchEconomicEvents,
  analyzeMarketMood,
};
