'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { MarketContextPanel } from '@/components/dashboard/market-context';
import { MarketPulseWidget } from '@/components/dashboard/market-pulse';
import { TopViralPreview } from '@/components/dashboard/top-viral-preview';
import { ProactiveSuggestions } from '@/components/dashboard/proactive-suggestions';
import { ActionCenter } from '@/components/dashboard/action-center';
import { PremiumCard } from '@/components/ui/premium-card';
import { motion } from 'framer-motion';
import { getRelativeTime } from '@/lib/utils/time';
import {
  TrendingUp,
  Sparkles,
  Target,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [, forceUpdate] = React.useState(0);

  // Update timestamp periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render for relative time display
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout rightPanel={<MarketContextPanel />}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-tertiary mt-1">
              AI-powered suggestions ready to post
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-tertiary">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {getRelativeTime(lastUpdate)}</span>
          </div>
        </div>

        {/* Top Row: Market Pulse + Top Viral */}
        <div className="grid gap-4 md:grid-cols-2">
          <MarketPulseWidget />
          <TopViralPreview />
        </div>

        {/* Main Feature: Proactive Suggestions */}
        <ProactiveSuggestions />

        {/* Action Center (Viral Opportunities) */}
        <ActionCenter />

        {/* Quick Insights Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <InsightCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Optimal Posting Time"
            value="2:30 PM EST"
            description="Based on your audience engagement patterns"
            accentColor="violet"
          />
          <InsightCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Content Recommendation"
            value="Thread Format"
            description="Threads performing 3.2x better this week"
            accentColor="blue"
          />
          <InsightCard
            icon={<Target className="h-5 w-5" />}
            title="Focus Topic"
            value="L2 Scaling"
            description="High engagement potential based on CT trends"
            accentColor="green"
          />
        </div>
      </motion.div>
    </AppLayout>
  );
}

// Insight Card Component
interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  accentColor: 'violet' | 'blue' | 'green' | 'orange';
}

function InsightCard({ icon, title, value, description, accentColor }: InsightCardProps) {
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <PremiumCard>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[accentColor]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-tertiary mb-1">{title}</p>
          <p className="font-semibold text-primary">{value}</p>
          <p className="text-xs text-tertiary mt-1 line-clamp-1">{description}</p>
        </div>
      </div>
    </PremiumCard>
  );
}
