'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { PriorityMetrics, SecondaryMetrics } from '@/components/dashboard/priority-metrics';
import { ActionCenter } from '@/components/dashboard/action-center';
import { MarketContextPanel } from '@/components/dashboard/market-context';
import { PremiumCard } from '@/components/ui/premium-card';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  Target,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
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
              Real-time insights for CT domination
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-tertiary">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Priority Metrics */}
        <PriorityMetrics />

        {/* Secondary Metrics */}
        <SecondaryMetrics />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Action Center */}
          <div className="lg:col-span-2">
            <ActionCenter />
          </div>
        </div>

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
