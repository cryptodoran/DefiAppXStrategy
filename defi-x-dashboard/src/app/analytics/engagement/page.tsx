'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Eye,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BarChart3,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

interface Tweet {
  id: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  createdAt: string;
}

interface TwitterUserData {
  id: string;
  handle: string;
  name: string;
  followers: number;
  tweets: number;
  engagementRate: number;
  tier: string;
  recentTweets: Tweet[];
  _mock?: boolean;
}

// Fetch real engagement data from Twitter API
async function fetchEngagementData(): Promise<TwitterUserData> {
  const handle = process.env.NEXT_PUBLIC_TWITTER_OWN_HANDLE || 'defiapp';
  const response = await fetch(`/api/twitter/user/${handle}`);
  if (!response.ok) throw new Error('Failed to fetch engagement data');
  return response.json();
}

export default function EngagementAnalyticsPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['engagement-analytics'],
    queryFn: fetchEngagementData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLive = data && !data._mock;

  // Calculate engagement stats from real tweets
  const stats = data?.recentTweets?.reduce(
    (acc, tweet) => ({
      totalLikes: acc.totalLikes + tweet.likes,
      totalRetweets: acc.totalRetweets + tweet.retweets,
      totalReplies: acc.totalReplies + tweet.replies,
      totalImpressions: acc.totalImpressions + (tweet.impressions || 0),
      highEngagement: acc.highEngagement + (
        (tweet.impressions && ((tweet.likes + tweet.retweets + tweet.replies) / tweet.impressions) > 0.02) ? 1 : 0
      ),
    }),
    { totalLikes: 0, totalRetweets: 0, totalReplies: 0, totalImpressions: 0, highEngagement: 0 }
  ) || { totalLikes: 0, totalRetweets: 0, totalReplies: 0, totalImpressions: 0, highEngagement: 0 };

  const totalEngagements = stats.totalLikes + stats.totalRetweets + stats.totalReplies;
  const overallEngagementRate = stats.totalImpressions > 0
    ? ((totalEngagements / stats.totalImpressions) * 100).toFixed(2)
    : '0.00';

  // Sort tweets by engagement
  const sortedTweets = [...(data?.recentTweets || [])].sort((a, b) => {
    const engA = a.likes + a.retweets + a.replies;
    const engB = b.likes + b.retweets + b.replies;
    return engB - engA;
  });

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading engagement data...
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-20 bg-elevated rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load engagement data</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>
              {isLive ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Live Data
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
                  Sample Data
                </span>
              )}
            </div>
            <p className="text-tertiary">Real engagement metrics from @{data?.handle?.replace('@', '')}</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-white">{formatNumber(totalEngagements)}</p>
              <p className="text-xs text-tertiary">Total Engagements</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-400">{formatNumber(stats.totalLikes)}</p>
              <p className="text-xs text-tertiary">Likes</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-400">{formatNumber(stats.totalRetweets)}</p>
              <p className="text-xs text-tertiary">Retweets</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{formatNumber(stats.totalReplies)}</p>
              <p className="text-xs text-tertiary">Replies</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{overallEngagementRate}%</p>
              <p className="text-xs text-tertiary">Avg Eng. Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.highEngagement}</p>
              <p className="text-xs text-tertiary">High Performers</p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Breakdown by Post */}
        <Card className="bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engagement by Post (Sorted by Total Engagement)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedTweets.map((tweet, index) => {
                const totalEng = tweet.likes + tweet.retweets + tweet.replies;
                const engRate = tweet.impressions
                  ? ((totalEng / tweet.impressions) * 100).toFixed(2)
                  : '0.00';
                const isHighPerformer = tweet.impressions && (totalEng / tweet.impressions) > 0.02;

                return (
                  <div
                    key={tweet.id}
                    className={cn(
                      'rounded-lg border p-4 transition-all',
                      isHighPerformer
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-base border-white/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          {isHighPerformer && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              High Performer
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-secondary line-clamp-2">
                          {tweet.content}
                        </p>
                        <p className="text-xs text-tertiary mt-1">
                          {formatDate(tweet.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://twitter.com/defiapp/status/${tweet.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Engagement Bars */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20 text-xs text-tertiary">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span>{formatNumber(tweet.likes)}</span>
                        </div>
                        <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${Math.min(100, (tweet.likes / Math.max(...sortedTweets.map(t => t.likes))) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20 text-xs text-tertiary">
                          <Repeat2 className="h-3 w-3 text-green-400" />
                          <span>{formatNumber(tweet.retweets)}</span>
                        </div>
                        <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${Math.min(100, (tweet.retweets / Math.max(...sortedTweets.map(t => t.retweets), 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20 text-xs text-tertiary">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          <span>{formatNumber(tweet.replies)}</span>
                        </div>
                        <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${Math.min(100, (tweet.replies / Math.max(...sortedTweets.map(t => t.replies), 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-1 text-tertiary">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(tweet.impressions || 0)} impressions</span>
                      </div>
                      <div className="text-tertiary">
                        Total: <span className="text-white font-medium">{formatNumber(totalEng)}</span> engagements
                      </div>
                      <div className="text-tertiary">
                        Rate: <span className={cn('font-medium', parseFloat(engRate) > 2 ? 'text-green-400' : 'text-white')}>{engRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sortedTweets.length === 0 && (
                <div className="text-center py-8 text-tertiary">
                  No engagement data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
