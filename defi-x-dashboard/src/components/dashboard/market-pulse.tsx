'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/ui/premium-card';
import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/lib/utils/time';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface MarketPulse {
  btc: { price: number; change24h: number };
  eth: { price: number; change24h: number };
  fearGreed: { value: number; label: string };
  trending: string[];
  lastUpdated: string;
}

export function MarketPulseWidget() {
  const [data, setData] = React.useState<MarketPulse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/market/pulse');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (e) {
      console.error('Market pulse error:', e);
      setError('Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'text-red-400';
    if (value <= 45) return 'text-orange-400';
    if (value <= 55) return 'text-yellow-400';
    if (value <= 75) return 'text-green-400';
    return 'text-emerald-400';
  };

  if (error) {
    return (
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="p-1 rounded hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-tertiary" />
          </button>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-primary">Market Pulse</span>
        </div>
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-tertiary" />
        ) : (
          <span className="text-xs text-tertiary">
            {data?.lastUpdated && getRelativeTime(new Date(data.lastUpdated))}
          </span>
        )}
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-3 gap-4 animate-pulse">
          <div className="h-12 bg-elevated rounded" />
          <div className="h-12 bg-elevated rounded" />
          <div className="h-12 bg-elevated rounded" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-4">
          {/* BTC */}
          <div>
            <p className="text-xs text-tertiary mb-1">BTC</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(data.btc.price)}
            </p>
            <p className={cn(
              'text-xs flex items-center gap-0.5',
              data.btc.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {data.btc.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatChange(data.btc.change24h)}
            </p>
          </div>

          {/* ETH */}
          <div>
            <p className="text-xs text-tertiary mb-1">ETH</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(data.eth.price)}
            </p>
            <p className={cn(
              'text-xs flex items-center gap-0.5',
              data.eth.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {data.eth.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatChange(data.eth.change24h)}
            </p>
          </div>

          {/* Fear & Greed */}
          <div>
            <p className="text-xs text-tertiary mb-1">Fear & Greed</p>
            <p className={cn(
              'text-sm font-semibold',
              getFearGreedColor(data.fearGreed.value)
            )}>
              {data.fearGreed.value}
            </p>
            <p className="text-xs text-tertiary">{data.fearGreed.label}</p>
          </div>
        </div>
      ) : null}

      {/* Trending Topics */}
      {data?.trending && data.trending.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-tertiary">Trending:</span>
            {data.trending.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </PremiumCard>
  );
}
