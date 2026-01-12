'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { TrendingUp, TrendingDown, Zap, Activity, AlertCircle, ExternalLink } from 'lucide-react';
import {
  fetchRealCryptoPrices,
  fetchRealFearGreed,
  type CryptoPrice,
  type FearGreedData,
} from '@/services/real-market-data';
import { TRENDING_HASHTAGS } from '@/services/real-twitter-links';

interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  btcSparkline: number[];
  btcVerifyUrl: string;
  ethPrice: number;
  ethChange24h: number;
  ethSparkline: number[];
  ethVerifyUrl: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
  fearGreedVerifyUrl: string;
  topTrend: { tag: string; url: string };
  exposureBudget: number;
  isLive: boolean;
}

// Generate sparkline from price
function generateSparkline(price: number): number[] {
  const data: number[] = [];
  let val = price * 0.98;
  for (let i = 0; i < 6; i++) {
    val = val + (price - val) * (0.1 + Math.random() * 0.2);
    data.push(val);
  }
  data.push(price);
  return data;
}

// Get random trending hashtag
function getTopTrend() {
  const cryptoTags = TRENDING_HASHTAGS.filter(h => h.category === 'crypto' || h.category === 'defi');
  const tag = cryptoTags[Math.floor(Math.random() * cryptoTags.length)];
  return { tag: tag.tag, url: tag.searchUrl };
}

export function StatusBar() {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from APIs
  const fetchData = useCallback(async () => {
    try {
      const [prices, fearGreed] = await Promise.all([
        fetchRealCryptoPrices(),
        fetchRealFearGreed(),
      ]);

      const btc = prices.find(p => p.symbol === 'BTC');
      const eth = prices.find(p => p.symbol === 'ETH');

      setData({
        btcPrice: btc?.price || 0,
        btcChange24h: btc?.change24h || 0,
        btcSparkline: generateSparkline(btc?.price || 0),
        btcVerifyUrl: btc?.verifyUrl || 'https://www.coingecko.com/en/coins/bitcoin',
        ethPrice: eth?.price || 0,
        ethChange24h: eth?.change24h || 0,
        ethSparkline: generateSparkline(eth?.price || 0),
        ethVerifyUrl: eth?.verifyUrl || 'https://www.coingecko.com/en/coins/ethereum',
        fearGreedIndex: fearGreed.value,
        fearGreedLabel: fearGreed.classification,
        fearGreedVerifyUrl: fearGreed.verifyUrl,
        topTrend: getTopTrend(),
        exposureBudget: 67, // This would come from user settings
        isLive: true,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch status bar data:', error);
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatPrice = (price: number) => {
    return price >= 1000
      ? `$${(price / 1000).toFixed(1)}K`
      : `$${price.toFixed(2)}`;
  };

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'text-red-500';
    if (value <= 45) return 'text-orange-500';
    if (value <= 55) return 'text-yellow-500';
    if (value <= 75) return 'text-lime-500';
    return 'text-green-500';
  };

  // Show loading skeleton
  if (isLoading || !data) {
    return (
      <div className="h-10 bg-surface border-b border-white/5 flex items-center justify-center px-4">
        <span className="text-xs text-tertiary">Loading market data...</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-surface border-b border-white/5 flex items-center justify-between px-4">
      {/* Left: Market Prices */}
      <div className="flex items-center gap-6">
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-tertiary">LIVE</span>
        </div>

        {/* BTC - with verify link */}
        <a
          href={data.btcVerifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:bg-elevated rounded px-1 -mx-1 transition-colors group"
        >
          <span className="text-xs text-tertiary font-medium">BTC</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {data.btcPrice > 0 ? formatPrice(data.btcPrice) : '--'}
          </span>
          {data.btcPrice > 0 && (
            <>
              <span
                className={cn(
                  'text-xs font-medium',
                  data.btcChange24h >= 0 ? 'text-market-up' : 'text-market-down'
                )}
              >
                {data.btcChange24h >= 0 ? '+' : ''}
                {data.btcChange24h.toFixed(2)}%
              </span>
              <Sparkline data={data.btcSparkline} width={50} height={16} />
            </>
          )}
          <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* ETH - with verify link */}
        <a
          href={data.ethVerifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:bg-elevated rounded px-1 -mx-1 transition-colors group"
        >
          <span className="text-xs text-tertiary font-medium">ETH</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {data.ethPrice > 0 ? formatPrice(data.ethPrice) : '--'}
          </span>
          {data.ethPrice > 0 && (
            <>
              <span
                className={cn(
                  'text-xs font-medium',
                  data.ethChange24h >= 0 ? 'text-market-up' : 'text-market-down'
                )}
              >
                {data.ethChange24h >= 0 ? '+' : ''}
                {data.ethChange24h.toFixed(2)}%
              </span>
              <Sparkline data={data.ethSparkline} width={50} height={16} />
            </>
          )}
          <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Center: Fear & Greed + Trending */}
      <div className="flex items-center gap-6">
        {/* Fear & Greed - with verify link */}
        <a
          href={data.fearGreedVerifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:bg-elevated rounded px-1 -mx-1 transition-colors group"
        >
          <Activity className="h-3.5 w-3.5 text-tertiary" />
          <span className="text-xs text-tertiary">F&G</span>
          <span
            className={cn(
              'font-mono text-sm font-semibold',
              getFearGreedColor(data.fearGreedIndex)
            )}
          >
            {data.fearGreedIndex}
          </span>
          <span className="text-xs text-tertiary">{data.fearGreedLabel}</span>
          <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Top Trend - links to Twitter search */}
        <a
          href={data.topTrend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:bg-elevated rounded px-1 -mx-1 transition-colors group"
        >
          <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs text-tertiary">Trending</span>
          <span className="text-xs font-medium text-violet-400">
            {data.topTrend.tag}
          </span>
          <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Right: Exposure Budget */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-tertiary" />
          <span className="text-xs text-tertiary">Exposure</span>
          <div className="w-20 h-1.5 bg-elevated rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                data.exposureBudget > 50 ? 'bg-green-500' : data.exposureBudget > 25 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${data.exposureBudget}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-xs font-medium text-primary">
            {data.exposureBudget}%
          </span>
        </div>
      </div>
    </div>
  );
}
