'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumBadge } from '@/components/ui/premium-badge';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  Eye,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

interface AlgorithmFactor {
  id: string;
  name: string;
  description: string;
  currentUnderstanding: string;
  confidenceLevel: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: Date;
  sources: string[];
}

interface AlgorithmChange {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  date: Date;
  source: string;
  verified: boolean;
}

// Mock data
const mockFactors: AlgorithmFactor[] = [
  {
    id: '1',
    name: 'Exposure Allocation',
    description: 'Daily budget for post visibility',
    currentUnderstanding: 'Limited daily exposure budget per account. Reply-guying cannibalizes main post reach. Optimal strategy: 1-2 main posts + 1 QT per day.',
    confidenceLevel: 0.85,
    impact: 'high',
    trend: 'stable',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    sources: ['@nikitabier', '@sweatystartup', 'Internal testing'],
  },
  {
    id: '2',
    name: 'Content Quality Signals',
    description: 'How the algorithm assesses post quality',
    currentUnderstanding: 'Higher-effort content (threads, articles) receives preferential treatment. AI-generated "slop" is now being penalized. Dwell time is a key signal.',
    confidenceLevel: 0.9,
    impact: 'high',
    trend: 'increasing',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sources: ['Official X docs', '@elonmusk', 'Algorithm research'],
  },
  {
    id: '3',
    name: 'Thread Boost Factor',
    description: 'Additional visibility for thread-format content',
    currentUnderstanding: 'Threads with 5+ tweets receive algorithmic boost. Each tweet should provide standalone value. Optimal length: 5-8 tweets.',
    confidenceLevel: 0.75,
    impact: 'medium',
    trend: 'stable',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sources: ['Community testing', 'Performance analysis'],
  },
  {
    id: '4',
    name: 'Penalty Triggers',
    description: 'Actions that reduce post visibility',
    currentUnderstanding: 'Triggers: excessive hashtags (>2), link-only posts, generic content, posting too frequently, engagement bait.',
    confidenceLevel: 0.8,
    impact: 'high',
    trend: 'increasing',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sources: ['@elonmusk', 'Community reports'],
  },
  {
    id: '5',
    name: 'Following Feed Weight',
    description: 'Visibility in Following vs For You',
    currentUnderstanding: 'Following feed now shows chronologically. For You prioritizes engagement velocity and mutual interactions.',
    confidenceLevel: 0.7,
    impact: 'medium',
    trend: 'decreasing',
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    sources: ['Official X blog'],
  },
];

const mockChanges: AlgorithmChange[] = [
  {
    id: '1',
    title: 'AI-generated content detection',
    description: 'X is now using classifiers to identify and reduce reach of AI-generated content that lacks originality.',
    impact: 'negative',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    source: '@elonmusk',
    verified: true,
  },
  {
    id: '2',
    title: 'Long-form content boost',
    description: 'Posts with substantial original content (200+ characters) receiving increased visibility.',
    impact: 'positive',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    source: 'Community testing',
    verified: false,
  },
  {
    id: '3',
    title: 'Reply chain visibility changes',
    description: 'Reply chains now getting less visibility unless they add significant value.',
    impact: 'neutral',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    source: '@sweatystartup',
    verified: true,
  },
];

export function AlgorithmIntel() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Algorithm Intelligence</h1>
          <p className="text-tertiary mt-1">Track and understand X algorithm changes</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-tertiary">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Last updated: 2 hours ago</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Brain className="h-5 w-5" />}
          label="Overall Confidence"
          value="78%"
          description="In current algorithm understanding"
          color="violet"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Recent Changes"
          value="3"
          description="In the last 30 days"
          color="yellow"
        />
        <SummaryCard
          icon={<Zap className="h-5 w-5" />}
          label="Impact Factors"
          value="5"
          description="High-confidence factors tracked"
          color="green"
        />
      </div>

      {/* Algorithm Factors */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Known Algorithm Factors</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-tertiary">Sorted by impact</span>
          </div>
        </div>

        <div className="space-y-4">
          {mockFactors.map((factor, index) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AlgorithmFactorCard factor={factor} />
            </motion.div>
          ))}
        </div>
      </PremiumCard>

      {/* Recent Changes */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Recent Algorithm Changes</h2>
          <PremiumBadge variant="info" size="sm">3 new</PremiumBadge>
        </div>

        <div className="space-y-3">
          {mockChanges.map((change, index) => (
            <motion.div
              key={change.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AlgorithmChangeCard change={change} />
            </motion.div>
          ))}
        </div>
      </PremiumCard>

      {/* Monitored Accounts */}
      <PremiumCard>
        <h2 className="text-lg font-semibold text-primary mb-4">Monitored Accounts</h2>
        <p className="text-sm text-tertiary mb-4">
          These accounts frequently share insights about the X algorithm
        </p>
        <div className="flex flex-wrap gap-2">
          {['@nikitabier', '@sweatystartup', '@elonmusk', '@alexhormozi', '@naval'].map((account) => (
            <a
              key={account}
              href={`https://twitter.com/${account.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm flex items-center gap-1"
            >
              {account}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  color: 'violet' | 'yellow' | 'green';
}) {
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green: 'text-green-400 bg-green-500/10',
  };

  return (
    <PremiumCard>
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-tertiary">{label}</p>
          <p className="text-2xl font-bold font-mono text-primary">{value}</p>
          <p className="text-xs text-tertiary mt-0.5">{description}</p>
        </div>
      </div>
    </PremiumCard>
  );
}

function AlgorithmFactorCard({ factor }: { factor: AlgorithmFactor }) {
  const impactColors = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    low: 'text-green-400 bg-green-500/10',
  };

  const trendIcons = {
    increasing: <TrendingUp className="h-3 w-3 text-green-400" />,
    stable: <BarChart3 className="h-3 w-3 text-tertiary" />,
    decreasing: <TrendingDown className="h-3 w-3 text-red-400" />,
  };

  return (
    <div className="p-4 rounded-lg bg-elevated border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-primary">{factor.name}</h3>
          <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', impactColors[factor.impact])}>
            {factor.impact.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trendIcons[factor.trend]}
          <span className="text-xs text-tertiary">
            {Math.round(factor.confidenceLevel * 100)}% confidence
          </span>
        </div>
      </div>

      <p className="text-sm text-secondary mb-3">{factor.currentUnderstanding}</p>

      <div className="flex items-center justify-between text-xs text-tertiary">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatTimeAgo(factor.lastUpdated)}</span>
        </div>
        <div className="flex items-center gap-1">
          Sources: {factor.sources.slice(0, 2).join(', ')}
          {factor.sources.length > 2 && ` +${factor.sources.length - 2}`}
        </div>
      </div>
    </div>
  );
}

function AlgorithmChangeCard({ change }: { change: AlgorithmChange }) {
  const impactConfig = {
    positive: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-400 bg-green-500/10' },
    negative: { icon: <TrendingDown className="h-4 w-4" />, color: 'text-red-400 bg-red-500/10' },
    neutral: { icon: <BarChart3 className="h-4 w-4" />, color: 'text-tertiary bg-elevated' },
  };

  const { icon, color } = impactConfig[change.impact];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-elevated">
      <div className={cn('p-2 rounded-lg', color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-primary">{change.title}</h4>
          {change.verified && (
            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
          )}
        </div>
        <p className="text-sm text-secondary">{change.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-tertiary">
          <span>{formatTimeAgo(change.date)}</span>
          <span>via {change.source}</span>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
