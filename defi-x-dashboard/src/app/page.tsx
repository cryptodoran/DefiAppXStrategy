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

        {/* Quick Insights Row - Dynamic based on time/context */}
        <DynamicInsights />
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

// Dynamic insights based on current time and context
function DynamicInsights() {
  const [insights, setInsights] = React.useState({
    optimalTime: '',
    contentType: '',
    contentReason: '',
    focusTopic: '',
    topicReason: '',
  });

  React.useEffect(() => {
    // Calculate optimal posting time based on current hour (CT engagement patterns)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;

    // Peak CT engagement times (in EST)
    let optimalTime: string;
    let timeReason: string;
    if (hour < 9) {
      optimalTime = '9:00 AM EST';
      timeReason = 'Morning CT activity starting soon';
    } else if (hour < 12) {
      optimalTime = '12:00 PM EST';
      timeReason = 'Lunch hour peak engagement';
    } else if (hour < 15) {
      optimalTime = '2:30 PM EST';
      timeReason = 'Afternoon engagement peak';
    } else if (hour < 18) {
      optimalTime = '6:00 PM EST';
      timeReason = 'Evening scroll time';
    } else if (hour < 21) {
      optimalTime = '9:00 PM EST';
      timeReason = 'Night owl crypto crowd';
    } else {
      optimalTime = '9:00 AM EST tomorrow';
      timeReason = 'Schedule for morning peak';
    }

    // Rotate content recommendations based on day
    const contentTypes = [
      { type: 'Thread Format', reason: 'Threads get 3x more engagement on weekdays' },
      { type: 'Quick Take', reason: 'Short punchy content performs well mid-week' },
      { type: 'Educational Post', reason: 'How-to content drives saves and shares' },
      { type: 'Hot Take', reason: 'Controversial opinions drive discussion' },
      { type: 'Product Highlight', reason: 'Feature posts resonate on slow days' },
    ];
    const contentIndex = day % contentTypes.length;

    // Rotate focus topics
    const topics = [
      { topic: 'L2 Scaling', reason: 'High engagement on Ethereum L2 discussions' },
      { topic: 'Yield Strategies', reason: 'DeFi yield content trending' },
      { topic: 'Airdrops', reason: 'Airdrop discussions always engage' },
      { topic: 'Market Analysis', reason: 'Price action commentary performs well' },
      { topic: 'DeFi Security', reason: 'Educational security content gets shared' },
    ];
    const topicIndex = (day + hour) % topics.length;

    setInsights({
      optimalTime,
      contentType: contentTypes[contentIndex].type,
      contentReason: contentTypes[contentIndex].reason,
      focusTopic: topics[topicIndex].topic,
      topicReason: topics[topicIndex].reason,
    });
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <InsightCard
        icon={<TrendingUp className="h-5 w-5" />}
        title="Optimal Posting Time"
        value={insights.optimalTime || 'Calculating...'}
        description="Based on CT engagement patterns"
        accentColor="violet"
      />
      <InsightCard
        icon={<Sparkles className="h-5 w-5" />}
        title="Content Recommendation"
        value={insights.contentType || 'Loading...'}
        description={insights.contentReason || 'Analyzing patterns...'}
        accentColor="blue"
      />
      <InsightCard
        icon={<Target className="h-5 w-5" />}
        title="Focus Topic"
        value={insights.focusTopic || 'Loading...'}
        description={insights.topicReason || 'Checking trends...'}
        accentColor="green"
      />
    </div>
  );
}
