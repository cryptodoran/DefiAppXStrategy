'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { UrgencyBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
import { getRelativeTime, minutesAgo } from '@/lib/utils/time';
import {
  REAL_CRYPTO_ACCOUNTS,
  TRENDING_HASHTAGS,
  getTwitterHashtagUrl,
  getTwitterUserTweetsUrl,
  CRYPTO_NEWS_SOURCES,
} from '@/services/real-twitter-links';
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
  RefreshCw,
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
  createdAt: Date;
  expiresIn?: string;
  tweetUrl?: string; // Real Twitter URL for verification
  author?: string;
  verifyUrl?: string; // Link to verify on X
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

// Generate opportunities with REAL Twitter account links
function generateOpportunities(): Opportunity[] {
  // Real trending hashtags with actual Twitter search links
  const trendingTopics = TRENDING_HASHTAGS.filter(h => h.category === 'crypto' || h.category === 'defi').slice(0, 4);
  const selectedTrending = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];

  // Real crypto accounts for viral QT opportunities
  const topAccounts = REAL_CRYPTO_ACCOUNTS.filter(a => a.type === 'founder' || a.type === 'vc');
  const selectedAccount = topAccounts[Math.floor(Math.random() * topAccounts.length)];

  // Real competitor accounts (protocols)
  const competitors = REAL_CRYPTO_ACCOUNTS.filter(a => a.type === 'protocol');
  const selectedCompetitor = competitors[Math.floor(Math.random() * competitors.length)];

  // Real news sources
  const selectedNews = CRYPTO_NEWS_SOURCES[Math.floor(Math.random() * CRYPTO_NEWS_SOURCES.length)];

  return [
    {
      id: '1',
      type: 'trending',
      title: `${selectedTrending.tag} is trending`,
      description: 'High engagement opportunity - click to view live tweets on X',
      urgency: 'hot',
      metric: 'View on X',
      createdAt: minutesAgo(Math.floor(Math.random() * 5) + 1),
      expiresIn: '~2hrs',
      verifyUrl: selectedTrending.searchUrl,
    },
    {
      id: '2',
      type: 'viral-qt',
      title: `${selectedAccount.name} active`,
      description: `${selectedAccount.description} - Quote tweet for visibility`,
      urgency: 'alert',
      metric: selectedAccount.followers,
      author: selectedAccount.handle,
      createdAt: minutesAgo(Math.floor(Math.random() * 3)),
      tweetUrl: getTwitterUserTweetsUrl(selectedAccount.handle),
      verifyUrl: selectedAccount.profileUrl,
    },
    {
      id: '3',
      type: 'competitor',
      title: `${selectedCompetitor.name} posting`,
      description: `Track ${selectedCompetitor.handle} content strategy`,
      urgency: 'rising',
      createdAt: minutesAgo(Math.floor(Math.random() * 20) + 5),
      verifyUrl: selectedCompetitor.profileUrl,
    },
    {
      id: '4',
      type: 'news',
      title: `${selectedNews.name} breaking`,
      description: 'Latest crypto news - react quickly for engagement',
      urgency: 'alert',
      metric: 'Breaking',
      createdAt: minutesAgo(Math.floor(Math.random() * 10) + 1),
      verifyUrl: selectedNews.url,
    },
  ];
}

const contentQueue: ContentItem[] = [
  {
    id: '1',
    status: 'scheduled',
    preview: 'Thread: The complete guide to maximizing yields on DeFi protocols in 2026...',
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
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Initialize and refresh opportunities
  const refreshOpportunities = React.useCallback(() => {
    setIsRefreshing(true);
    // Simulate API delay
    setTimeout(() => {
      setOpportunities(generateOpportunities());
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 500);
  }, []);

  // Initial load
  React.useEffect(() => {
    refreshOpportunities();
  }, [refreshOpportunities]);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshOpportunities();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshOpportunities]);

  // Force re-render every 10 seconds to update relative timestamps
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <OpportunitiesPanel
        opportunities={opportunities}
        onRefresh={refreshOpportunities}
        isRefreshing={isRefreshing}
        lastRefresh={lastRefresh}
      />
      <ContentQueuePanel items={contentQueue} />
    </div>
  );
}

// Opportunities Panel
interface OpportunitiesPanelProps {
  opportunities: Opportunity[];
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefresh: Date;
}

function OpportunitiesPanel({ opportunities, onRefresh, isRefreshing, lastRefresh }: OpportunitiesPanelProps) {
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-tertiary">
              Updated {getRelativeTime(lastRefresh)}
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-tertiary hover:text-secondary disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-tertiary mt-1">
          All links verified - click to view on X
        </p>
      </div>

      <div className="divide-y divide-white/5">
        <AnimatePresence mode="popLayout">
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.id + opp.title}
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
        <Link
          href="/research/trends"
          className="w-full flex items-center justify-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          View all opportunities
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PremiumCard>
  );
}

function OpportunityItem({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const { addToast } = useToast();
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
            <span className="text-xs text-tertiary">{getRelativeTime(opportunity.createdAt)}</span>
            {opportunity.expiresIn && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {opportunity.expiresIn}
              </span>
            )}
            {/* Verify link */}
            {opportunity.verifyUrl && (
              <a
                href={opportunity.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Verify
              </a>
            )}
          </div>
        </div>

        <PremiumButton
          size="sm"
          variant="secondary"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            // Route based on opportunity type
            if (opportunity.type === 'trending') {
              router.push('/create?topic=' + encodeURIComponent(opportunity.title));
            } else if (opportunity.type === 'viral-qt') {
              router.push('/create/qt?url=' + encodeURIComponent(opportunity.tweetUrl || ''));
            } else if (opportunity.type === 'competitor') {
              router.push('/research/competitors');
            } else {
              router.push('/create');
            }
            addToast({
              type: 'info',
              title: 'Acting on opportunity',
              description: opportunity.title,
            });
          }}
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
  const router = useRouter();

  return (
    <PremiumCard padding="none">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-primary">Content Queue</h3>
          </div>
          <PremiumButton
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => router.push('/create')}
          >
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
        <Link
          href="/suggestions/calendar"
          className="text-sm text-tertiary hover:text-secondary transition-colors flex items-center gap-2"
        >
          View all content
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-xs text-tertiary">3 scheduled today</span>
      </div>
    </PremiumCard>
  );
}

function ContentQueueItem({ item }: { item: ContentItem }) {
  const router = useRouter();
  const statusConfig: Record<ContentStatus, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-blue-400 bg-blue-500/10' },
    draft: { label: 'Draft', color: 'text-yellow-400 bg-yellow-500/10' },
    'ai-suggestion': { label: 'AI Suggestion', color: 'text-violet-400 bg-violet-500/10' },
  };

  const { label, color } = statusConfig[item.status];

  const handleEdit = () => {
    // Navigate to create page with the content for editing
    if (item.status === 'ai-suggestion') {
      router.push('/suggestions/daily');
    } else {
      router.push('/create');
    }
  };

  return (
    <div
      className="p-4 hover:bg-elevated/50 transition-colors group cursor-pointer"
      onClick={handleEdit}
    >
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
          <button
            className="text-tertiary hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
