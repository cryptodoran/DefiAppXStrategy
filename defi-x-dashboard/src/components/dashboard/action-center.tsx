'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { UrgencyBadge } from '@/components/ui/premium-badge';
import {
  TrendingUp,
  MessageSquare,
  Users,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';

// Opportunity types
type OpportunityType = 'trending' | 'viral-qt' | 'competitor' | 'news';
type UrgencyLevel = 'alert' | 'hot' | 'rising' | 'normal';

interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  metric?: string;
  timestamp: string;
  expiresIn?: string;
}

// Content queue item types
type ContentStatus = 'scheduled' | 'draft' | 'ai-suggestion';

interface ContentItem {
  id: string;
  status: ContentStatus;
  preview: string;
  scheduledFor?: string;
  score?: number;
}

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    type: 'trending',
    title: '#ETH100K is trending',
    description: 'High engagement opportunity for bullish ETH content',
    urgency: 'hot',
    metric: '45K tweets/hr',
    timestamp: '2m ago',
    expiresIn: '~2hrs',
  },
  {
    id: '2',
    type: 'viral-qt',
    title: 'Vitalik just posted',
    description: 'New post about L2 scaling - QT opportunity',
    urgency: 'alert',
    metric: '12K likes in 10m',
    timestamp: 'Just now',
  },
  {
    id: '3',
    type: 'competitor',
    title: 'Competitor posted thread',
    description: '@competitor launched similar feature thread',
    urgency: 'rising',
    timestamp: '15m ago',
  },
  {
    id: '4',
    type: 'news',
    title: 'Major protocol hack',
    description: '$50M exploit on XYZ Protocol - breaking news',
    urgency: 'alert',
    metric: 'Breaking',
    timestamp: '5m ago',
  },
];

const mockContentQueue: ContentItem[] = [
  {
    id: '1',
    status: 'scheduled',
    preview: 'Thread: The complete guide to maximizing yields on DeFi protocols in 2024...',
    scheduledFor: 'Today 2:30 PM',
    score: 85,
  },
  {
    id: '2',
    status: 'ai-suggestion',
    preview: 'Hot take: ETH will flip BTC by end of year. Here\'s why the metrics support it...',
    score: 92,
  },
  {
    id: '3',
    status: 'draft',
    preview: 'Unpopular opinion: Most DeFi projects are solving problems that don\'t exist...',
    score: 78,
  },
];

export function ActionCenter() {
  return (
    <div className="space-y-6">
      <OpportunitiesPanel opportunities={mockOpportunities} />
      <ContentQueuePanel items={mockContentQueue} />
    </div>
  );
}

// Opportunities Panel
interface OpportunitiesPanelProps {
  opportunities: Opportunity[];
}

function OpportunitiesPanel({ opportunities }: OpportunitiesPanelProps) {
  return (
    <PremiumCard padding="none">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h3 className="font-semibold text-primary">Opportunities</h3>
            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              {opportunities.length}
            </span>
          </div>
          <button className="text-tertiary hover:text-secondary">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        <AnimatePresence>
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
            >
              <OpportunityItem opportunity={opp} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors">
          View all opportunities
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </PremiumCard>
  );
}

function OpportunityItem({ opportunity }: { opportunity: Opportunity }) {
  const typeIcons: Record<OpportunityType, React.ReactNode> = {
    trending: <TrendingUp className="h-4 w-4" />,
    'viral-qt': <MessageSquare className="h-4 w-4" />,
    competitor: <Users className="h-4 w-4" />,
    news: <Zap className="h-4 w-4" />,
  };

  const typeColors: Record<OpportunityType, string> = {
    trending: 'text-green-400 bg-green-500/10',
    'viral-qt': 'text-blue-400 bg-blue-500/10',
    competitor: 'text-violet-400 bg-violet-500/10',
    news: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="p-4 hover:bg-elevated/50 transition-colors group">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', typeColors[opportunity.type])}>
          {typeIcons[opportunity.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-primary truncate">{opportunity.title}</h4>
            <UrgencyBadge level={opportunity.urgency} />
          </div>
          <p className="text-sm text-tertiary line-clamp-1">{opportunity.description}</p>

          <div className="flex items-center gap-3 mt-2">
            {opportunity.metric && (
              <span className="text-xs font-medium text-secondary">{opportunity.metric}</span>
            )}
            <span className="text-xs text-tertiary">{opportunity.timestamp}</span>
            {opportunity.expiresIn && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {opportunity.expiresIn}
              </span>
            )}
          </div>
        </div>

        <PremiumButton
          size="sm"
          variant="secondary"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Act
        </PremiumButton>
      </div>
    </div>
  );
}

// Content Queue Panel
interface ContentQueuePanelProps {
  items: ContentItem[];
}

function ContentQueuePanel({ items }: ContentQueuePanelProps) {
  return (
    <PremiumCard padding="none">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-primary">Content Queue</h3>
          </div>
          <PremiumButton size="sm" variant="primary" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            New Post
          </PremiumButton>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentQueueItem item={item} />
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 flex items-center justify-between">
        <button className="text-sm text-tertiary hover:text-secondary transition-colors flex items-center gap-2">
          View all content
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-xs text-tertiary">3 scheduled today</span>
      </div>
    </PremiumCard>
  );
}

function ContentQueueItem({ item }: { item: ContentItem }) {
  const statusConfig: Record<ContentStatus, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-blue-400 bg-blue-500/10' },
    draft: { label: 'Draft', color: 'text-yellow-400 bg-yellow-500/10' },
    'ai-suggestion': { label: 'AI Suggestion', color: 'text-violet-400 bg-violet-500/10' },
  };

  const { label, color } = statusConfig[item.status];

  return (
    <div className="p-4 hover:bg-elevated/50 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', color)}>
              {label}
            </span>
            {item.scheduledFor && (
              <span className="text-xs text-tertiary flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.scheduledFor}
              </span>
            )}
          </div>
          <p className="text-sm text-secondary line-clamp-2">{item.preview}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {item.score && (
            <div className={cn(
              'px-2 py-1 rounded text-xs font-mono font-medium',
              item.score >= 80 ? 'text-green-400 bg-green-500/10' :
                item.score >= 60 ? 'text-yellow-400 bg-yellow-500/10' :
                  'text-red-400 bg-red-500/10'
            )}>
              {item.score}/100
            </div>
          )}
          <button className="text-tertiary hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
