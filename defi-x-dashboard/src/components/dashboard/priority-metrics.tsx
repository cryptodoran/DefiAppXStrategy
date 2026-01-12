'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { Sparkline } from '@/components/ui/sparkline';
import { TrendBadge } from '@/components/ui/premium-badge';
import {
  Users,
  Eye,
  TrendingUp,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils/time';

interface MetricData {
  value: number;
  previousValue: number;
  change: number;
  sparkline: number[];
}

interface PriorityMetricsData {
  followers: MetricData;
  impressions: MetricData;
  engagementRate: MetricData;
  viralityScore: MetricData;
}

// Generate dynamic metrics with slight variations
function generateMetrics(base?: PriorityMetricsData): PriorityMetricsData {
  const fluctuate = (value: number, volatility: number = 0.02) => {
    const change = value * volatility * (Math.random() - 0.5) * 2;
    return Math.round(value + change);
  };

  const fluctuateSmall = (value: number, volatility: number = 0.01) => {
    const change = value * volatility * (Math.random() - 0.5) * 2;
    return Math.round(value * 100 + change * 100) / 100;
  };

  const generateSparkline = (current: number, points: number = 7): number[] => {
    const data: number[] = [];
    let val = current * 0.95;
    for (let i = 0; i < points - 1; i++) {
      val = val + (current - val) * (0.1 + Math.random() * 0.2);
      data.push(val);
    }
    data.push(current);
    return data;
  };

  const baseFollowers = base?.followers.value || 127543;
  const baseImpressions = base?.impressions.value || 2847920;
  const baseEngagement = base?.engagementRate.value || 4.72;
  const baseVirality = base?.viralityScore.value || 78;

  const followers = fluctuate(baseFollowers, 0.005);
  const impressions = fluctuate(baseImpressions, 0.01);
  const engagement = fluctuateSmall(baseEngagement, 0.02);
  const virality = Math.max(60, Math.min(95, fluctuate(baseVirality, 0.05)));

  return {
    followers: {
      value: followers,
      previousValue: baseFollowers,
      change: Math.round(((followers - baseFollowers) / baseFollowers) * 10000) / 100,
      sparkline: generateSparkline(followers),
    },
    impressions: {
      value: impressions,
      previousValue: baseImpressions,
      change: Math.round(((impressions - baseImpressions) / baseImpressions) * 10000) / 100,
      sparkline: generateSparkline(impressions),
    },
    engagementRate: {
      value: engagement,
      previousValue: baseEngagement,
      change: Math.round(((engagement - baseEngagement) / baseEngagement) * 10000) / 100,
      sparkline: generateSparkline(engagement),
    },
    viralityScore: {
      value: virality,
      previousValue: baseVirality,
      change: Math.round(((virality - baseVirality) / baseVirality) * 10000) / 100,
      sparkline: generateSparkline(virality),
    },
  };
}

type TimeRange = '24h' | '7d' | '30d';

export function PriorityMetrics() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('24h');
  const [data, setData] = React.useState<PriorityMetricsData | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshData = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(prev => generateMetrics(prev || undefined));
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 300);
  }, []);

  // Initial load
  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 20 seconds
  React.useEffect(() => {
    const interval = setInterval(refreshData, 20000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Force re-render for timestamp every 10 seconds
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header with time range toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">Priority Metrics</h2>
          <span className="text-xs text-tertiary">
            Updated {getRelativeTime(lastUpdate)}
          </span>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="text-tertiary hover:text-secondary disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </button>
        </div>
        <div className="flex items-center gap-1 p-1 bg-elevated rounded-lg">
          {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                timeRange === range
                  ? 'bg-surface text-primary'
                  : 'text-tertiary hover:text-secondary'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Followers"
          icon={<Users className="h-4 w-4" />}
          value={data.followers.value}
          change={data.followers.change}
          sparkline={data.followers.sparkline}
          format={(v) => v.toLocaleString()}
          accentColor="violet"
        />

        <MetricCard
          label="Impressions"
          icon={<Eye className="h-4 w-4" />}
          value={data.impressions.value}
          change={data.impressions.change}
          sparkline={data.impressions.sparkline}
          format={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`}
          accentColor="blue"
        />

        <MetricCard
          label="Engagement Rate"
          icon={<TrendingUp className="h-4 w-4" />}
          value={data.engagementRate.value}
          change={data.engagementRate.change}
          sparkline={data.engagementRate.sparkline}
          format={(v) => `${v.toFixed(2)}%`}
          accentColor="green"
        />

        <MetricCard
          label="Virality Score"
          icon={<Flame className="h-4 w-4" />}
          value={data.viralityScore.value}
          change={data.viralityScore.change}
          sparkline={data.viralityScore.sparkline}
          format={(v) => v.toString()}
          accentColor="orange"
          showScore
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  change: number;
  sparkline: number[];
  format: (value: number) => string;
  accentColor: 'violet' | 'blue' | 'green' | 'orange';
  showScore?: boolean;
}

function MetricCard({
  label,
  icon,
  value,
  change,
  sparkline,
  format,
  accentColor,
  showScore,
}: MetricCardProps) {
  const isPositive = change >= 0;

  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <PremiumCard className="relative overflow-hidden">
      {/* Flash effect on positive change */}
      {isPositive && (
        <motion.div
          className="absolute inset-0 bg-green-500/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-md', colorClasses[accentColor])}>
            {icon}
          </div>
          <span className="text-sm text-tertiary font-medium">{label}</span>
        </div>
        <TrendBadge value={change} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <motion.p
            key={value}
            initial={{ opacity: 0.7, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold font-mono text-primary"
          >
            {format(value)}
          </motion.p>

          {showScore && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs text-tertiary">/100</span>
            </div>
          )}
        </div>

        <Sparkline
          data={sparkline}
          width={60}
          height={28}
          className="opacity-70"
        />
      </div>
    </PremiumCard>
  );
}

// Compact stats row for secondary metrics
interface SecondaryMetricsProps {
  className?: string;
}

export function SecondaryMetrics({ className }: SecondaryMetricsProps) {
  const [stats, setStats] = React.useState([
    { label: 'Avg Likes', value: '1.2K', change: 5.4 },
    { label: 'Avg Replies', value: '89', change: -2.1 },
    { label: 'Avg Retweets', value: '234', change: 12.8 },
    { label: 'Link Clicks', value: '3.4K', change: 8.2 },
    { label: 'Profile Visits', value: '12.1K', change: 3.7 },
  ]);

  // Update stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        change: Math.round((stat.change + (Math.random() - 0.5) * 2) * 10) / 10,
      })));
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('flex items-center gap-4 p-3 bg-surface rounded-lg overflow-x-auto', className)}>
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          <div className="flex-shrink-0">
            <p className="text-xs text-tertiary mb-0.5">{stat.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-semibold text-primary">{stat.value}</span>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  stat.change >= 0 ? 'text-market-up' : 'text-market-down'
                )}
              >
                {stat.change >= 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
          </div>
          {i < stats.length - 1 && (
            <div className="w-px h-8 bg-white/5 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
