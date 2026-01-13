'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

// Fetch real tweets from Twitter API
async function fetchPostsData(): Promise<TwitterUserData> {
  const handle = process.env.NEXT_PUBLIC_TWITTER_OWN_HANDLE || 'defiapp';
  const response = await fetch(`/api/twitter/user/${handle}`);
  if (!response.ok) throw new Error('Failed to fetch posts data');
  return response.json();
}

export default function PostPerformancePage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [contentType, setContentType] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['post-analytics'],
    queryFn: fetchPostsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 3) return 'text-green-400';
    if (rate >= 1) return 'text-yellow-400';
    return 'text-orange-400';
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

  // Calculate performance chart data from real tweets
  const performanceData = data?.recentTweets?.map((tweet, index) => ({
    date: new Date(tweet.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    impressions: tweet.impressions || 0,
    engagements: tweet.likes + tweet.retweets + tweet.replies,
  })).reverse() || [];

  // Calculate totals and averages
  const totals = data?.recentTweets?.reduce(
    (acc, tweet) => ({
      impressions: acc.impressions + (tweet.impressions || 0),
      likes: acc.likes + tweet.likes,
      retweets: acc.retweets + tweet.retweets,
      replies: acc.replies + tweet.replies,
    }),
    { impressions: 0, likes: 0, retweets: 0, replies: 0 }
  ) || { impressions: 0, likes: 0, retweets: 0, replies: 0 };

  const avgImpressions = data?.recentTweets?.length
    ? Math.round(totals.impressions / data.recentTweets.length)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Post Performance</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading posts...
            </span>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-32 bg-elevated rounded" />
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
          <h1 className="text-2xl font-bold text-white">Post Performance</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load post data</p>
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
              <h1 className="text-2xl font-bold text-white">Post Performance</h1>
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
            <p className="text-tertiary">Real-time analytics from @{data?.handle?.replace('@', '')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Impressions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatNumber} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#impressionsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <p className="text-sm text-tertiary">Total Impressions</p>
              <p className="text-2xl font-bold text-white">{formatNumber(totals.impressions)}</p>
              <p className="text-xs text-tertiary">from {data?.recentTweets?.length || 0} posts</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <p className="text-sm text-tertiary">Total Likes</p>
              <p className="text-2xl font-bold text-pink-400">{formatNumber(totals.likes)}</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <p className="text-sm text-tertiary">Total Retweets</p>
              <p className="text-2xl font-bold text-green-400">{formatNumber(totals.retweets)}</p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <p className="text-sm text-tertiary">Avg Impressions</p>
              <p className="text-2xl font-bold text-blue-400">{formatNumber(avgImpressions)}</p>
              <p className="text-xs text-tertiary">per post</p>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <Card className="bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent Posts from @{data?.handle?.replace('@', '')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.recentTweets?.map((post) => {
              const totalEngagements = post.likes + post.retweets + post.replies;
              const engagementRate = post.impressions
                ? ((totalEngagements / post.impressions) * 100).toFixed(2)
                : '0.00';

              return (
                <div
                  key={post.id}
                  className="rounded-lg border border-white/5 bg-base p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-secondary line-clamp-3">
                        {post.content}
                      </p>
                      <p className="text-xs text-tertiary mt-2">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/defiapp/status/${post.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-tertiary">
                        <Eye className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatNumber(post.impressions || 0)}
                      </p>
                      <p className="text-xs text-tertiary">Impressions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-tertiary">
                        <Heart className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatNumber(post.likes)}
                      </p>
                      <p className="text-xs text-tertiary">Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-tertiary">
                        <Repeat2 className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatNumber(post.retweets)}
                      </p>
                      <p className="text-xs text-tertiary">Retweets</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-tertiary">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatNumber(post.replies)}
                      </p>
                      <p className="text-xs text-tertiary">Replies</p>
                    </div>
                    <div className="text-center">
                      <p className={cn('text-sm font-medium', getEngagementColor(parseFloat(engagementRate)))}>
                        {engagementRate}%
                      </p>
                      <p className="text-xs text-tertiary">Eng. Rate</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!data?.recentTweets || data.recentTweets.length === 0) && (
              <div className="text-center py-8 text-tertiary">
                No recent posts found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
