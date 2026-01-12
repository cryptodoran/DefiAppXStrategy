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
import { getRelativeTime } from '@/lib/utils/time';
import {
  TrendingUp,
  MessageSquare,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  ExternalLink,
  RefreshCw,
  Heart,
  Repeat,
  Eye,
} from 'lucide-react';

// Viral tweet from the API
interface ViralTweet {
  id: string;
  author: {
    handle: string;
    name: string;
    avatar: string;
    followers: number;
    verified: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnailUrl?: string;
  }[];
  metrics: {
    likes: number;
    retweets: number;
    quotes: number;
    replies: number;
    views?: number;
  };
  velocity: {
    likesPerHour: number;
    retweetsPerHour: number;
  };
  postedAt: string;
  tweetUrl: string;
  viralScore: number;
}

// Content draft item types
type DraftStatus = 'draft' | 'ai-suggestion';

interface ContentItem {
  id: string;
  status: DraftStatus;
  preview: string;
  score?: number;
}

const contentDrafts: ContentItem[] = [
  {
    id: '1',
    status: 'draft',
    preview: 'Thread: The complete guide to maximizing yields on DeFi protocols in 2026...',
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
  const [viralTweets, setViralTweets] = React.useState<ViralTweet[]>([]);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch viral tweets from API
  const fetchViralTweets = React.useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch('/api/viral/tweets?timeframe=6h&sortBy=velocity&limit=4');

      if (!response.ok) {
        throw new Error('Failed to fetch viral tweets');
      }

      const data = await response.json();
      setViralTweets(data.tweets || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching viral tweets:', err);
      setError('Failed to load opportunities');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    fetchViralTweets();
  }, [fetchViralTweets]);

  // Auto-refresh every 2 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchViralTweets();
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchViralTweets]);

  // Force re-render every 30 seconds to update relative timestamps
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <ViralTweetsPanel
        tweets={viralTweets}
        onRefresh={fetchViralTweets}
        isRefreshing={isRefreshing}
        lastRefresh={lastRefresh}
        error={error}
      />
      <ContentDraftsPanel items={contentDrafts} />
    </div>
  );
}

// Viral Tweets Panel
interface ViralTweetsPanelProps {
  tweets: ViralTweet[];
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefresh: Date;
  error: string | null;
}

function ViralTweetsPanel({ tweets, onRefresh, isRefreshing, lastRefresh, error }: ViralTweetsPanelProps) {
  return (
    <PremiumCard padding="none">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h3 className="font-semibold text-primary">Viral Tweets</h3>
            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              {tweets.length}
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
          Real viral tweets from Crypto Twitter - click to view on X
        </p>
      </div>

      {error ? (
        <div className="p-4 text-center text-tertiary">
          <p className="text-sm">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-2 text-xs text-violet-400 hover:text-violet-300"
          >
            Try again
          </button>
        </div>
      ) : tweets.length === 0 && !isRefreshing ? (
        <div className="p-4 text-center text-tertiary">
          <p className="text-sm">No viral tweets found</p>
          <p className="text-xs mt-1">Configure Twitter API for real data</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          <AnimatePresence mode="popLayout">
            {tweets.map((tweet, index) => (
              <motion.div
                key={tweet.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
              >
                <ViralTweetItem tweet={tweet} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="p-3 border-t border-white/5">
        <Link
          href="/viral"
          className="w-full flex items-center justify-center gap-2 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          View all viral tweets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PremiumCard>
  );
}

function ViralTweetItem({ tweet }: { tweet: ViralTweet }) {
  const router = useRouter();
  const { addToast } = useToast();

  // Determine urgency based on viral score
  const getUrgency = (score: number): 'alert' | 'hot' | 'rising' | 'normal' => {
    if (score >= 90) return 'alert';
    if (score >= 75) return 'hot';
    if (score >= 50) return 'rising';
    return 'normal';
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="p-4 hover:bg-elevated/50 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Author avatar */}
        <div className="w-10 h-10 rounded-full bg-elevated overflow-hidden flex-shrink-0">
          {tweet.author.avatar ? (
            <img
              src={tweet.author.avatar}
              alt={tweet.author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-tertiary">
              {tweet.author.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-primary truncate">{tweet.author.name}</span>
            {tweet.author.verified && (
              <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
              </svg>
            )}
            <span className="text-tertiary text-sm">@{tweet.author.handle}</span>
            <UrgencyBadge level={getUrgency(tweet.viralScore)} />
          </div>

          {/* Tweet content preview */}
          <p className="text-sm text-secondary line-clamp-2 mb-2">{tweet.content}</p>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-tertiary">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" />
              {formatNumber(tweet.metrics.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3 text-green-400" />
              {formatNumber(tweet.metrics.retweets)}
            </span>
            {tweet.metrics.views && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(tweet.metrics.views)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getRelativeTime(new Date(tweet.postedAt))}
            </span>
            {/* Direct link to tweet */}
            <a
              href={tweet.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </div>
        </div>

        <PremiumButton
          size="sm"
          variant="secondary"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={() => {
            // Go to QT studio with this tweet URL
            router.push('/create/qt?url=' + encodeURIComponent(tweet.tweetUrl));
            addToast({
              type: 'info',
              title: 'Creating QT response',
              description: `For @${tweet.author.handle}'s viral tweet`,
            });
          }}
        >
          QT
        </PremiumButton>
      </div>

      {/* Media preview if available */}
      {tweet.media && tweet.media.length > 0 && (
        <div className="mt-3 ml-13 rounded-lg overflow-hidden">
          {tweet.media[0].type === 'image' && (
            <img
              src={tweet.media[0].thumbnailUrl || tweet.media[0].url}
              alt="Tweet media"
              className="w-full max-h-32 object-cover rounded-lg"
            />
          )}
          {tweet.media[0].type === 'video' && (
            <div className="relative bg-black/50 rounded-lg h-24 flex items-center justify-center">
              <span className="text-xs text-tertiary">Video content</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Content Drafts Panel
interface ContentDraftsPanelProps {
  items: ContentItem[];
}

function ContentDraftsPanel({ items }: ContentDraftsPanelProps) {
  const router = useRouter();

  return (
    <PremiumCard padding="none">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-primary">Draft Ideas</h3>
          </div>
          <PremiumButton
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => router.push('/create')}
          >
            New Draft
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
            <ContentDraftItem item={item} />
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 flex items-center justify-between">
        <Link
          href="/suggestions/daily"
          className="text-sm text-tertiary hover:text-secondary transition-colors flex items-center gap-2"
        >
          View AI suggestions
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-xs text-tertiary">{items.length} drafts</span>
      </div>
    </PremiumCard>
  );
}

function ContentDraftItem({ item }: { item: ContentItem }) {
  const router = useRouter();
  const statusConfig: Record<DraftStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'text-yellow-400 bg-yellow-500/10' },
    'ai-suggestion': { label: 'AI Idea', color: 'text-violet-400 bg-violet-500/10' },
  };

  const { label, color } = statusConfig[item.status];

  const handleEdit = () => {
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
