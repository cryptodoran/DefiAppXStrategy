'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { MarketMoodBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
import { getRelativeTime } from '@/lib/utils/time';
import {
  fetchRealCryptoPrices,
  fetchRealFearGreed,
  fetchRealTVL,
  calculateMarketMood,
  type CryptoPrice,
  type FearGreedData,
  type TVLData,
  type MarketMood,
} from '@/services/real-market-data';
import {
  getUpcomingEconomicEvents,
  type EconomicEvent,
} from '@/services/real-twitter-links';

// News headline type from API
interface NewsHeadline {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  _fallback?: boolean;
}

// Trending hashtag from API
interface TrendingHashtag {
  tag: string;
  searchUrl: string;
  category: 'crypto' | 'defi' | 'nft' | 'general';
  volume?: number;
  change?: number;
}

type TimeRange = '24h' | '7d' | '30d';
type NewsCategory = 'hot' | 'featured' | 'more';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ChevronRight,
  Newspaper,
  Calendar,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export function MarketContextPanel() {
  const [cryptos, setCryptos] = React.useState<CryptoPrice[]>([]);
  const [fearGreed, setFearGreed] = React.useState<FearGreedData | null>(null);
  const [tvl, setTvl] = React.useState<TVLData | null>(null);
  const [newsHeadlines, setNewsHeadlines] = React.useState<NewsHeadline[]>([]);
  const [trendingHashtags, setTrendingHashtags] = React.useState<TrendingHashtag[]>([]);
  const [hashtagDisclaimer, setHashtagDisclaimer] = React.useState<string>('');
  const [currentMood, setCurrentMood] = React.useState<MarketMood>('neutral');
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [economicEvents] = React.useState<EconomicEvent[]>(getUpcomingEconomicEvents());
  const [newsCategory, setNewsCategory] = React.useState<NewsCategory>('hot');
  const [hashtagTimeRange, setHashtagTimeRange] = React.useState<TimeRange>('24h');

  // Fetch news headlines by category (hot/featured/more)
  const fetchNewsHeadlines = async (category: NewsCategory): Promise<NewsHeadline[]> => {
    try {
      const response = await fetch(`/api/news/headlines?category=${category}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.headlines || data;
    } catch {
      return [];
    }
  };

  // Fetch trending hashtags with timeframe
  const fetchHashtags = async (timeframe: TimeRange): Promise<{ hashtags: TrendingHashtag[]; disclaimer?: string }> => {
    try {
      const response = await fetch(`/api/twitter/hashtags?timeframe=${timeframe}`);
      if (!response.ok) return { hashtags: [] };
      const data = await response.json();
      return { hashtags: data.hashtags || [], disclaimer: data._disclaimer };
    } catch {
      return { hashtags: [] };
    }
  };

  // Fetch real data
  const refreshData = React.useCallback(async () => {
    setIsRefreshing(true);
    setHasError(false);

    try {
      const [pricesData, fgData, tvlData, newsData, hashtagData] = await Promise.all([
        fetchRealCryptoPrices(),
        fetchRealFearGreed(),
        fetchRealTVL(),
        fetchNewsHeadlines(newsCategory),
        fetchHashtags(hashtagTimeRange),
      ]);

      setCryptos(pricesData);
      setFearGreed(fgData);
      setTvl(tvlData);
      setNewsHeadlines(newsData);
      setTrendingHashtags(hashtagData.hashtags);
      setHashtagDisclaimer(hashtagData.disclaimer || '');
      setCurrentMood(calculateMarketMood(fgData.value));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [newsCategory, hashtagTimeRange]);

  // Initial load
  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 60 seconds
  React.useEffect(() => {
    const interval = setInterval(refreshData, 60000);
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
            <p className="text-xs text-tertiary mt-1">Real-time data</p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="text-tertiary hover:text-secondary disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-[10px] text-tertiary">
            Updated {getRelativeTime(lastUpdate)}
          </p>
          {hasError && (
            <span className="flex items-center gap-1 text-[10px] text-yellow-400">
              <AlertCircle className="h-3 w-3" />
              Using cached data
            </span>
          )}
        </div>
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
                (fearGreed?.value || 50) > 60 ? 'text-green-400' :
                  (fearGreed?.value || 50) > 40 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {fearGreed?.value || '--'}
              </span>
              <span className="text-xs text-tertiary">
                {fearGreed?.classification || 'Loading...'}
              </span>
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-elevated rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                (fearGreed?.value || 50) > 75 ? 'bg-green-500' :
                  (fearGreed?.value || 50) > 50 ? 'bg-lime-500' :
                    (fearGreed?.value || 50) > 25 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${fearGreed?.value || 50}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {fearGreed?.verifyUrl && (
            <a
              href={fearGreed.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              Verify on Alternative.me
            </a>
          )}
        </section>

        {/* Crypto Prices */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">Top Cryptos</span>
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              CoinGecko
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-3">
            {cryptos.length > 0 ? (
              cryptos.map((crypto) => (
                <CryptoRow key={crypto.id} crypto={crypto} />
              ))
            ) : (
              <div className="text-center py-4 text-tertiary text-sm">
                Loading prices...
              </div>
            )}
          </div>
        </section>

        {/* DeFi TVL */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-tertiary">DeFi TVL</span>
            <a
              href="https://defillama.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              DeFiLlama
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {tvl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Total TVL</span>
                <span className="font-mono font-semibold text-primary">
                  ${(tvl.total / 1e9).toFixed(2)}B
                </span>
              </div>
              <div className="space-y-1">
                {tvl.chains.slice(0, 4).map((chain) => (
                  <a
                    key={chain.name}
                    href={chain.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs hover:bg-elevated p-1 rounded transition-colors"
                  >
                    <span className="text-tertiary">{chain.name}</span>
                    <span className="font-mono text-secondary">
                      ${(chain.tvl / 1e9).toFixed(2)}B
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-tertiary text-sm">
              Loading TVL...
            </div>
          )}
        </section>

        {/* Trending Hashtags */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">CT Hashtags</span>
            </div>
            <div className="flex items-center gap-1">
              {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setHashtagTimeRange(range)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                    hashtagTimeRange === range
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-tertiary hover:text-secondary'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingHashtags.length > 0 ? (
              trendingHashtags.slice(0, 8).map((hashtag) => (
                <a
                  key={hashtag.tag}
                  href={hashtag.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-elevated text-xs text-secondary hover:text-primary hover:bg-hover transition-colors flex items-center gap-1"
                >
                  {hashtag.tag}
                  {hashtag.change !== undefined && (
                    <span className={cn(
                      'text-[10px]',
                      hashtag.change >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {hashtag.change >= 0 ? '+' : ''}{hashtag.change.toFixed(0)}%
                    </span>
                  )}
                </a>
              ))
            ) : (
              <div className="w-full text-center py-2 text-tertiary text-xs">
                Loading hashtags...
              </div>
            )}
          </div>
          {hashtagDisclaimer && (
            <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-[10px] text-yellow-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {hashtagDisclaimer}
              </p>
            </div>
          )}
        </section>

        {/* Latest News Headlines */}
        <section className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">Latest News</span>
            </div>
            <div className="flex items-center gap-1">
              {([
                { id: 'hot', label: 'Hot' },
                { id: 'featured', label: 'Featured' },
                { id: 'more', label: 'More' },
              ] as { id: NewsCategory; label: string }[]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setNewsCategory(id)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                    newsCategory === id
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-tertiary hover:text-secondary'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {newsHeadlines.length > 0 ? (
              newsHeadlines.slice(0, 5).map((headline, index) => (
                <a
                  key={index}
                  href={headline.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg hover:bg-elevated transition-colors group"
                >
                  <p className="text-sm text-secondary group-hover:text-primary line-clamp-2 transition-colors">
                    {headline.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-tertiary">{headline.source}</span>
                    <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-4 text-tertiary text-sm">
                Loading headlines...
              </div>
            )}
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

  // Generate a simple sparkline based on the price
  const generateSparkline = (price: number): number[] => {
    const data: number[] = [];
    let val = price * 0.98;
    for (let i = 0; i < 6; i++) {
      val = val + (price - val) * (0.1 + Math.random() * 0.2);
      data.push(val);
    }
    data.push(price);
    return data;
  };

  return (
    <a
      href={crypto.verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-xs font-semibold text-primary">
        {crypto.symbol}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-primary">{crypto.name}</span>
          <span className="font-mono text-sm font-semibold text-primary">
            ${crypto.price > 0 ? crypto.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs font-medium',
            isPositive ? 'text-market-up' : 'text-market-down'
          )}>
            {crypto.price > 0 ? (
              <>
                {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
              </>
            ) : '--'}
          </span>
          {crypto.price > 0 && (
            <Sparkline data={generateSparkline(crypto.price)} width={40} height={14} />
          )}
        </div>
      </div>
      <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

function EventRow({ event }: { event: EconomicEvent }) {
  const importanceColors = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    low: 'text-tertiary bg-elevated',
  };

  return (
    <a
      href={event.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-tertiary w-12">{event.date}</span>
        <span className="text-sm text-secondary">{event.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
          importanceColors[event.importance]
        )}>
          {event.importance}
        </span>
        <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
}
