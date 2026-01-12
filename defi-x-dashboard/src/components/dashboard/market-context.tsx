'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { MarketMoodBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
import { getRelativeTime, minutesAgo, hoursAgo } from '@/lib/utils/time';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ChevronRight,
  Newspaper,
  Calendar,
  RefreshCw,
} from 'lucide-react';

// Types
type MarketMood = 'euphoria' | 'bullish' | 'neutral' | 'bearish' | 'panic' | 'chaos';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

interface TradFiIndex {
  name: string;
  value: number;
  change: number;
  isOpen: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  createdAt: Date;
  isBreaking?: boolean;
}

interface EconomicEvent {
  date: string;
  name: string;
  importance: 'high' | 'medium' | 'low';
}

// Simulated price fluctuation
function fluctuatePrice(basePrice: number, volatility: number = 0.002): number {
  const change = basePrice * volatility * (Math.random() - 0.5) * 2;
  return basePrice + change;
}

function generateSparkline(basePrice: number, points: number = 7): number[] {
  const sparkline: number[] = [];
  let price = basePrice * 0.98;
  for (let i = 0; i < points; i++) {
    price = fluctuatePrice(price, 0.01);
    sparkline.push(price);
  }
  sparkline[points - 1] = basePrice;
  return sparkline;
}

// Generate dynamic crypto data
function generateCryptoData(): CryptoPrice[] {
  const basePrices = [
    { symbol: 'BTC', name: 'Bitcoin', base: 97842 },
    { symbol: 'ETH', name: 'Ethereum', base: 3456 },
    { symbol: 'SOL', name: 'Solana', base: 198.45 },
    { symbol: 'AVAX', name: 'Avalanche', base: 42.18 },
  ];

  return basePrices.map(crypto => {
    const price = fluctuatePrice(crypto.base, 0.005);
    const change24h = ((price - crypto.base) / crypto.base) * 100 + (Math.random() - 0.5) * 5;
    return {
      symbol: crypto.symbol,
      name: crypto.name,
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      sparkline: generateSparkline(price),
    };
  });
}

// Generate dynamic TradFi data
function generateTradFiData(): TradFiIndex[] {
  const baseIndices = [
    { name: 'S&P 500', base: 5234.56 },
    { name: 'NASDAQ', base: 16432.12 },
    { name: 'DXY', base: 103.42 },
    { name: 'VIX', base: 14.32 },
  ];

  return baseIndices.map(index => ({
    name: index.name,
    value: Math.round(fluctuatePrice(index.base, 0.002) * 100) / 100,
    change: Math.round((Math.random() - 0.5) * 4 * 100) / 100,
    isOpen: true,
  }));
}

// Generate dynamic news
function generateNews(): NewsItem[] {
  const headlines = [
    { title: 'Major L2 Protocol Announces Token Launch', source: 'The Block', breaking: true },
    { title: 'Fed Minutes Suggest Continued Rate Pause', source: 'Bloomberg', breaking: false },
    { title: 'DeFi TVL Reaches New ATH at $180B', source: 'DeFiLlama', breaking: false },
    { title: 'Ethereum Foundation Announces New Grants', source: 'CoinDesk', breaking: false },
    { title: 'Bitcoin ETF Sees Record Inflows', source: 'Reuters', breaking: true },
    { title: 'Major Exchange Lists New DeFi Token', source: 'The Block', breaking: false },
  ];

  // Randomly select 3 headlines and assign random recent times
  const shuffled = headlines.sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map((item, index) => ({
    id: String(index + 1),
    title: item.title,
    source: item.source,
    createdAt: index === 0 ? minutesAgo(Math.floor(Math.random() * 20) + 5) : hoursAgo(Math.floor(Math.random() * 3) + 1),
    isBreaking: index === 0 && item.breaking,
  }));
}

const economicEvents: EconomicEvent[] = [
  { date: 'Jan 15', name: 'CPI Data Release', importance: 'high' },
  { date: 'Jan 22', name: 'FOMC Meeting', importance: 'high' },
  { date: 'Jan 25', name: 'GDP Report', importance: 'medium' },
];

export function MarketContextPanel() {
  const [cryptos, setCryptos] = React.useState<CryptoPrice[]>([]);
  const [tradFi, setTradFi] = React.useState<TradFiIndex[]>([]);
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [fearGreedIndex, setFearGreedIndex] = React.useState(72);
  const [currentMood, setCurrentMood] = React.useState<MarketMood>('bullish');
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Refresh all market data
  const refreshData = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCryptos(generateCryptoData());
      setTradFi(generateTradFiData());
      setNews(generateNews());

      // Fluctuate fear/greed
      const newFearGreed = Math.max(20, Math.min(90, fearGreedIndex + Math.floor((Math.random() - 0.5) * 10)));
      setFearGreedIndex(newFearGreed);

      // Update mood based on fear/greed
      if (newFearGreed > 75) setCurrentMood('euphoria');
      else if (newFearGreed > 55) setCurrentMood('bullish');
      else if (newFearGreed > 45) setCurrentMood('neutral');
      else if (newFearGreed > 25) setCurrentMood('bearish');
      else setCurrentMood('panic');

      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 300);
  }, [fearGreedIndex]);

  // Initial load
  React.useEffect(() => {
    refreshData();
  }, []);

  // Auto-refresh every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Force re-render for timestamps every 10 seconds
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-primary">Market Context</h2>
            <p className="text-xs text-tertiary mt-1">Live market intelligence</p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="text-tertiary hover:text-secondary disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
        <p className="text-[10px] text-tertiary mt-2">
          Updated {getRelativeTime(lastUpdate)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Market Mood */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">Market Mood</span>
            <MarketMoodBadge mood={currentMood} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-secondary">Fear & Greed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-mono font-semibold',
                fearGreedIndex > 60 ? 'text-green-400' :
                  fearGreedIndex > 40 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {fearGreedIndex}
              </span>
              <span className="text-xs text-tertiary">
                {fearGreedIndex > 60 ? 'Greed' : fearGreedIndex > 40 ? 'Neutral' : 'Fear'}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-elevated rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                fearGreedIndex > 75 ? 'bg-green-500' :
                  fearGreedIndex > 50 ? 'bg-lime-500' :
                    fearGreedIndex > 25 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${fearGreedIndex}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </section>

        {/* Crypto Prices */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">Top Cryptos</span>
            <Link href="/analytics/followers" className="text-xs text-violet-400 hover:text-violet-300">View all</Link>
          </div>
          <div className="space-y-3">
            {cryptos.map((crypto) => (
              <CryptoRow key={crypto.symbol} crypto={crypto} />
            ))}
          </div>
        </section>

        {/* TradFi */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">TradFi Markets</span>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tradFi.map((index) => (
              <TradFiCard key={index.name} index={index} />
            ))}
          </div>
        </section>

        {/* News */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">Latest News</span>
            </div>
            <Link href="/research" className="text-xs text-violet-400 hover:text-violet-300">More</Link>
          </div>
          <div className="space-y-2">
            {news.map((item) => (
              <NewsRow key={item.id} news={item} />
            ))}
          </div>
        </section>

        {/* Economic Calendar */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">Upcoming Events</span>
            </div>
          </div>
          <div className="space-y-2">
            {economicEvents.map((event) => (
              <EventRow key={event.name} event={event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Sub-components
function CryptoRow({ crypto }: { crypto: CryptoPrice }) {
  const isPositive = crypto.change24h >= 0;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated transition-colors">
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-xs font-semibold text-primary">
        {crypto.symbol}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-primary">{crypto.name}</span>
          <span className="font-mono text-sm font-semibold text-primary">
            ${crypto.price.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs font-medium',
            isPositive ? 'text-market-up' : 'text-market-down'
          )}>
            {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
          </span>
          <Sparkline data={crypto.sparkline} width={40} height={14} />
        </div>
      </div>
    </div>
  );
}

function TradFiCard({ index }: { index: TradFiIndex }) {
  const isPositive = index.change >= 0;

  return (
    <div className="p-2 rounded-lg bg-elevated">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-tertiary">{index.name}</span>
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-market-up" />
        ) : (
          <TrendingDown className="h-3 w-3 text-market-down" />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-sm font-semibold text-primary">
          {index.value.toLocaleString()}
        </span>
        <span className={cn(
          'text-[10px] font-medium',
          isPositive ? 'text-market-up' : 'text-market-down'
        )}>
          {isPositive ? '+' : ''}{index.change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function NewsRow({ news }: { news: NewsItem }) {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast({
      type: 'info',
      title: 'Opening article',
      description: news.title.slice(0, 50) + '...',
    });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-elevated transition-colors text-left group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {news.isBreaking && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 animate-pulse">
              BREAKING
            </span>
          )}
          <span className="text-xs text-tertiary">{news.source}</span>
        </div>
        <p className="text-sm text-secondary line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </p>
        <span className="text-xs text-tertiary mt-0.5 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {getRelativeTime(news.createdAt)}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
    </button>
  );
}

function EventRow({ event }: { event: EconomicEvent }) {
  const importanceColors = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    low: 'text-tertiary bg-elevated',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-tertiary w-12">{event.date}</span>
        <span className="text-sm text-secondary">{event.name}</span>
      </div>
      <span className={cn(
        'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
        importanceColors[event.importance]
      )}>
        {event.importance}
      </span>
    </div>
  );
}
