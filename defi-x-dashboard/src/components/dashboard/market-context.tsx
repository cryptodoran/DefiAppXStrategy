'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { MarketMoodBadge, TrendBadge } from '@/components/ui/premium-badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Clock,
  ChevronRight,
  Newspaper,
  Calendar,
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
  timestamp: string;
  isBreaking?: boolean;
}

interface EconomicEvent {
  date: string;
  name: string;
  importance: 'high' | 'medium' | 'low';
}

// Mock data
const mockCryptos: CryptoPrice[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 97842,
    change24h: 2.34,
    sparkline: [94000, 95200, 94800, 96100, 97200, 96800, 97842],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456,
    change24h: -0.87,
    sparkline: [3520, 3480, 3510, 3450, 3420, 3470, 3456],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 198.45,
    change24h: 5.62,
    sparkline: [185, 188, 192, 195, 193, 196, 198.45],
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 42.18,
    change24h: -2.15,
    sparkline: [44, 43.5, 43, 42.8, 42.5, 42.3, 42.18],
  },
];

const mockTradFi: TradFiIndex[] = [
  { name: 'S&P 500', value: 5234.56, change: 0.45, isOpen: true },
  { name: 'NASDAQ', value: 16432.12, change: 0.78, isOpen: true },
  { name: 'DXY', value: 103.42, change: -0.12, isOpen: true },
  { name: 'VIX', value: 14.32, change: -2.34, isOpen: true },
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Major L2 Protocol Announces Token Launch',
    source: 'The Block',
    timestamp: '15m ago',
    isBreaking: true,
  },
  {
    id: '2',
    title: 'Fed Minutes Suggest Continued Rate Pause',
    source: 'Bloomberg',
    timestamp: '1h ago',
  },
  {
    id: '3',
    title: 'DeFi TVL Reaches New ATH at $180B',
    source: 'DeFiLlama',
    timestamp: '2h ago',
  },
];

const mockEvents: EconomicEvent[] = [
  { date: 'Jan 15', name: 'CPI Data Release', importance: 'high' },
  { date: 'Jan 22', name: 'FOMC Meeting', importance: 'high' },
  { date: 'Jan 25', name: 'GDP Report', importance: 'medium' },
];

export function MarketContextPanel() {
  const [currentMood] = React.useState<MarketMood>('bullish');
  const [fearGreedIndex] = React.useState(72);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h2 className="font-semibold text-primary">Market Context</h2>
        <p className="text-xs text-tertiary mt-1">Real-time market intelligence</p>
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
              <span className="text-xs text-tertiary">Greed</span>
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
            <button className="text-xs text-violet-400 hover:text-violet-300">View all</button>
          </div>
          <div className="space-y-3">
            {mockCryptos.map((crypto) => (
              <CryptoRow key={crypto.symbol} crypto={crypto} />
            ))}
          </div>
        </section>

        {/* TradFi */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">TradFi Markets</span>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Markets Open
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mockTradFi.map((index) => (
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
            <button className="text-xs text-violet-400 hover:text-violet-300">More</button>
          </div>
          <div className="space-y-2">
            {mockNews.map((news) => (
              <NewsRow key={news.id} news={news} />
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
            {mockEvents.map((event) => (
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
  return (
    <button className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-elevated transition-colors text-left group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {news.isBreaking && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">
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
          {news.timestamp}
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
