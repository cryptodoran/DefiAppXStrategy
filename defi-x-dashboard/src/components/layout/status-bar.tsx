'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { TrendingUp, TrendingDown, Zap, Activity, AlertCircle } from 'lucide-react';

interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  btcSparkline: number[];
  ethPrice: number;
  ethChange24h: number;
  ethSparkline: number[];
  fearGreedIndex: number;
  fearGreedLabel: string;
  topTrend: string;
  exposureBudget: number;
}

// Mock data - in production this would come from real APIs
const mockMarketData: MarketData = {
  btcPrice: 97842,
  btcChange24h: 2.34,
  btcSparkline: [94000, 95200, 94800, 96100, 97200, 96800, 97842],
  ethPrice: 3456,
  ethChange24h: -0.87,
  ethSparkline: [3520, 3480, 3510, 3450, 3420, 3470, 3456],
  fearGreedIndex: 72,
  fearGreedLabel: 'Greed',
  topTrend: '#ETH100K',
  exposureBudget: 67,
};

export function StatusBar() {
  const [data, setData] = useState<MarketData>(mockMarketData);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 100,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 20,
        btcChange24h: prev.btcChange24h + (Math.random() - 0.5) * 0.1,
        ethChange24h: prev.ethChange24h + (Math.random() - 0.5) * 0.1,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

        {/* BTC */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary font-medium">BTC</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {formatPrice(data.btcPrice)}
          </span>
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
        </div>

        {/* ETH */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary font-medium">ETH</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {formatPrice(data.ethPrice)}
          </span>
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
        </div>
      </div>

      {/* Center: Fear & Greed + Trending */}
      <div className="flex items-center gap-6">
        {/* Fear & Greed */}
        <div className="flex items-center gap-2">
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
        </div>

        {/* Top Trend */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs text-tertiary">Trending</span>
          <span className="text-xs font-medium text-violet-400">
            {data.topTrend}
          </span>
        </div>
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
