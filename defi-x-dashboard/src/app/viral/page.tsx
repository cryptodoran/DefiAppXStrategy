'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useToast } from '@/components/ui/toast';
import { getRelativeTime } from '@/lib/utils/time';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Heart,
  Repeat,
  Eye,
  MessageCircle,
  Filter,
  ChevronDown,
  Flame,
  Zap,
  BarChart3,
} from 'lucide-react';

// Types
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

type Timeframe = '1h' | '6h' | '24h' | '7d' | '30d';
type SortBy = 'velocity' | 'likes' | 'retweets' | 'viralScore' | 'newest';

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

const SORT_OPTIONS: { value: SortBy; label: string; icon: React.ReactNode }[] = [
  { value: 'viralScore', label: 'Viral Score', icon: <Flame className="h-4 w-4" /> },
  { value: 'velocity', label: 'Fastest Growing', icon: <Zap className="h-4 w-4" /> },
  { value: 'likes', label: 'Most Liked', icon: <Heart className="h-4 w-4" /> },
  { value: 'retweets', label: 'Most Retweeted', icon: <Repeat className="h-4 w-4" /> },
  { value: 'newest', label: 'Most Recent', icon: <Clock className="h-4 w-4" /> },
];

export default function ViralDiscoveryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [tweets, setTweets] = React.useState<ViralTweet[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeframe, setTimeframe] = React.useState<Timeframe>('6h');
  const [sortBy, setSortBy] = React.useState<SortBy>('viralScore');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Fetch viral tweets
  const fetchTweets = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeframe,
        sortBy,
        limit: '20',
        includeMedia: 'true',
      });

      const response = await fetch(`/api/viral/tweets?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch viral tweets');
      }

      const data = await response.json();
      setTweets(data.tweets || []);
    } catch (err) {
      console.error('Error fetching viral tweets:', err);
      setError('Failed to load viral tweets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, sortBy]);

  // Initial load and refetch on filter changes
  React.useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // Auto-refresh every 2 minutes
  React.useEffect(() => {
    const interval = setInterval(fetchTweets, 120000);
    return () => clearInterval(interval);
  }, [fetchTweets]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Viral Discovery
            </h1>
            <p className="text-tertiary text-sm mt-1">
              Real-time viral tweets from Crypto Twitter
            </p>
          </div>
          <PremiumButton
            variant="secondary"
            leftIcon={<RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />}
            onClick={fetchTweets}
            disabled={isLoading}
          >
            Refresh
          </PremiumButton>
        </div>

        {/* Filters */}
        <PremiumCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Timeframe selector */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">Timeframe:</span>
              <div className="flex rounded-lg bg-elevated overflow-hidden">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium transition-colors',
                      timeframe === tf.value
                        ? 'bg-violet-500 text-white'
                        : 'text-tertiary hover:text-secondary hover:bg-elevated/80'
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="h-4 w-4 text-tertiary" />
              <span className="text-sm text-tertiary">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated text-secondary text-sm"
                >
                  {SORT_OPTIONS.find(s => s.value === sortBy)?.icon}
                  {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isFilterOpen && "rotate-180")} />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-elevated rounded-lg shadow-lg border border-white/10 py-1 z-50">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                          sortBy === option.value
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'text-secondary hover:bg-white/5'
                        )}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Results info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-tertiary">
            {tweets.length} viral tweets in the last {TIMEFRAMES.find(t => t.value === timeframe)?.label.toLowerCase()}
          </span>
          <span className="text-tertiary">
            Sorted by {SORT_OPTIONS.find(s => s.value === sortBy)?.label.toLowerCase()}
          </span>
        </div>

        {/* 30d/7d Notice */}
        {(timeframe === '30d' || timeframe === '7d') && tweets.length < 10 && !isLoading && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
            <strong>Note:</strong> Twitter API limits historical data to ~7 days.
            {timeframe === '30d' && ' 30-day view uses cached data from previous sessions.'}
            {' '}Results may be limited.
          </div>
        )}

        {/* Tweet list */}
        {error ? (
          <PremiumCard>
            <div className="text-center py-8">
              <p className="text-tertiary mb-4">{error}</p>
              <PremiumButton onClick={fetchTweets} variant="secondary">
                Try Again
              </PremiumButton>
            </div>
          </PremiumCard>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <PremiumCard key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-elevated" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-elevated rounded w-1/4" />
                      <div className="h-3 bg-elevated rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-elevated rounded w-full" />
                    <div className="h-4 bg-elevated rounded w-2/3" />
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <PremiumCard>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-tertiary mx-auto mb-4" />
              <p className="text-secondary font-medium mb-2">No viral tweets found</p>
              <p className="text-tertiary text-sm mb-4">
                Try adjusting the timeframe or configure the Twitter API
              </p>
              <PremiumButton onClick={fetchTweets} variant="secondary">
                Refresh
              </PremiumButton>
            </div>
          </PremiumCard>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tweets.map((tweet, index) => (
                <motion.div
                  key={tweet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ViralTweetCard
                    tweet={tweet}
                    rank={index + 1}
                    onQuoteTweet={() => {
                      router.push('/create?tab=qt&url=' + encodeURIComponent(tweet.tweetUrl));
                      addToast({
                        type: 'info',
                        title: 'Creating QT response',
                        description: `For @${tweet.author.handle}'s viral tweet`,
                      });
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual tweet card
interface ViralTweetCardProps {
  tweet: ViralTweet;
  rank: number;
  onQuoteTweet: () => void;
}

function ViralTweetCard({ tweet, rank, onQuoteTweet }: ViralTweetCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-red-400 bg-red-500/10';
    if (score >= 75) return 'text-orange-400 bg-orange-500/10';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  return (
    <PremiumCard className="group hover:border-violet-500/30 transition-colors">
      <div className="flex gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center justify-start gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            rank <= 3 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' : 'bg-elevated text-tertiary'
          )}>
            {rank}
          </div>
          <div className={cn('px-2 py-1 rounded text-xs font-mono font-medium', getScoreColor(tweet.viralScore))}>
            {tweet.viralScore}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-elevated overflow-hidden flex-shrink-0">
              {tweet.author.avatar ? (
                <img
                  src={tweet.author.avatar}
                  alt={tweet.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tertiary text-lg font-medium">
                  {tweet.author.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary truncate">{tweet.author.name}</span>
                {tweet.author.verified && (
                  <svg className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <span>@{tweet.author.handle}</span>
                <span>·</span>
                <span>{formatNumber(tweet.author.followers)} followers</span>
                <span>·</span>
                <span>{getRelativeTime(new Date(tweet.postedAt))}</span>
              </div>
            </div>
          </div>

          {/* Tweet content */}
          <p className="text-secondary mb-4 whitespace-pre-wrap">{tweet.content}</p>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
              {tweet.media[0].type === 'image' && (
                <img
                  src={tweet.media[0].thumbnailUrl || tweet.media[0].url}
                  alt="Tweet media"
                  className="w-full max-h-80 object-cover"
                />
              )}
              {tweet.media[0].type === 'video' && (
                <div className="relative bg-black/50 h-48 flex items-center justify-center">
                  <span className="text-tertiary">Video content - view on X</span>
                </div>
              )}
            </div>
          )}

          {/* Metrics */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-tertiary">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-medium">{formatNumber(tweet.metrics.likes)}</span>
              <span className="text-xs text-tertiary/70">
                (+{formatNumber(tweet.velocity.likesPerHour)}/hr)
              </span>
            </div>
            <div className="flex items-center gap-2 text-tertiary">
              <Repeat className="h-4 w-4 text-green-400" />
              <span className="font-medium">{formatNumber(tweet.metrics.retweets)}</span>
              <span className="text-xs text-tertiary/70">
                (+{formatNumber(tweet.velocity.retweetsPerHour)}/hr)
              </span>
            </div>
            <div className="flex items-center gap-2 text-tertiary">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{formatNumber(tweet.metrics.replies)}</span>
            </div>
            {tweet.metrics.views && (
              <div className="flex items-center gap-2 text-tertiary">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{formatNumber(tweet.metrics.views)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
            <a
              href={tweet.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated text-secondary text-sm hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on X
            </a>
            <PremiumButton
              size="sm"
              variant="primary"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={onQuoteTweet}
            >
              Quote Tweet
            </PremiumButton>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
