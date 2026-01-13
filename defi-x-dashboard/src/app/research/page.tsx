'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { AlgorithmIntel } from '@/components/research/algorithm-intel';
import { CompetitorWarRoom } from '@/components/research/competitor-war-room';
import { MarketContextPanel } from '@/components/dashboard/market-context';
import { Brain, Users, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type ResearchTab = 'algorithm' | 'competitors' | 'influencers' | 'path-to-one';

export default function ResearchPage() {
  const [activeTab, setActiveTab] = React.useState<ResearchTab>('algorithm');
  const router = useRouter();

  const tabs = [
    { id: 'algorithm', label: 'Algorithm Intel', icon: <Brain className="h-4 w-4" />, href: null },
    { id: 'competitors', label: 'War Room', icon: <Users className="h-4 w-4" />, href: null },
    { id: 'influencers', label: 'Influencers', icon: <TrendingUp className="h-4 w-4" />, href: '/research/influencers' },
    { id: 'path-to-one', label: 'Path to #1', icon: <Trophy className="h-4 w-4" />, href: '/research/path-to-1' },
  ] as const;

  const handleTabClick = (tab: typeof tabs[number]) => {
    if (tab.href) {
      router.push(tab.href);
    } else {
      setActiveTab(tab.id);
    }
  };

  return (
    <AppLayout rightPanel={<MarketContextPanel />}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id && !tab.href
                  ? 'bg-elevated text-primary'
                  : 'text-tertiary hover:text-secondary'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'algorithm' && <AlgorithmIntel />}
        {activeTab === 'competitors' && <CompetitorWarRoom />}
      </motion.div>
    </AppLayout>
  );
}
