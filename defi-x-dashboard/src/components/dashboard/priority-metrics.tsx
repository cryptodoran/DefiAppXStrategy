'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Sparkline } from '@/components/ui/sparkline';
import { TrendBadge } from '@/components/ui/premium-badge';
import {
  Users,
  Eye,
  TrendingUp,
  Zap,
  BarChart3,
  Flame,
} from 'lucide-react';

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

// Mock data - in production this would come from real APIs
const mockData: PriorityMetricsData = {
  followers: {
    value: 127543,
    previousValue: 125890,
    change: 1.31,
    sparkline: [124000, 124500, 125200, 125890, 126300, 127100, 127543],
  },
  impressions: {
    value: 2847920,
    previousValue: 2456789,
    change: 15.93,
    sparkline: [2100000, 2300000, 2456789, 2500000, 2650000, 2750000, 2847920],
  },
  engagementRate: {
    value: 4.72,
    previousValue: 4.58,
    change: 3.06,
    sparkline: [4.2, 4.35, 4.58, 4.45, 4.6, 4.68, 4.72],
  },
  viralityScore: {
    value: 78,
    previousValue: 72,
    change: 8.33,
    sparkline: [65, 68, 72, 74, 75, 76, 78],
  },
};

type TimeRange = '24h' | '7d' | '30d';

export function PriorityMetrics() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('24h');
  const [data] = React.useState(mockData);

  return (
    <div className="space-y-4">
      {/* Header with time range toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Priority Metrics</h2>
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
  const stats = [
    { label: 'Avg Likes', value: '1.2K', change: 5.4 },
    { label: 'Avg Replies', value: '89', change: -2.1 },
    { label: 'Avg Retweets', value: '234', change: 12.8 },
    { label: 'Link Clicks', value: '3.4K', change: 8.2 },
    { label: 'Profile Visits', value: '12.1K', change: 3.7 },
  ];

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
