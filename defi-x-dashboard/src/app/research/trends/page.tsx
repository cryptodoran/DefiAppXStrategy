'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Hash,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  Filter,
  Globe,
  Flame,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { TRENDING_HASHTAGS, getTwitterSearchUrl } from '@/services/real-twitter-links';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

// US-017: Platform Trends Research

interface PlatformTrend {
  id: string;
  topic: string;
  category: 'crypto' | 'defi' | 'nft' | 'general' | 'tech';
  volume: number;
  volumeChange: number;
  velocity: 'rising' | 'stable' | 'falling';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceScore: number;
  peakTime?: string;
  relatedHashtags: string[];
  topTweets?: number;
  _mock?: boolean;
}

// Fetch trends from API
async function fetchTrends(): Promise<PlatformTrend[]> {
  const response = await fetch('/api/twitter/trends');
  if (!response.ok) throw new Error('Failed to fetch trends');
  const data = await response.json();

  // Transform API response to add missing fields
  return data.map((trend: PlatformTrend) => ({
    ...trend,
    peakTime: trend.peakTime || 'Recently',
    topTweets: trend.topTweets || Math.floor(trend.volume / 100),
  }));
}

// Use real hashtags from the service - these link to actual Twitter searches

const categoryConfig: Record<string, { color: string }> = {
  crypto: { color: 'bg-orange-500/20 text-orange-400' },
  defi: { color: 'bg-blue-500/20 text-blue-400' },
  nft: { color: 'bg-purple-500/20 text-purple-400' },
  general: { color: 'bg-white/5 text-tertiary' },
  tech: { color: 'bg-green-500/20 text-green-400' },
};

export default function PlatformTrendsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch trends data with auto-refresh
  const { data: platformTrends, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['platform-trends'],
    queryFn: fetchTrends,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });

  const handleRefresh = () => {
    refetch();
    addToast({ type: 'info', title: 'Refreshing', description: 'Fetching latest trends...' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const trendsList = platformTrends || [];
  const filteredTrends = trendsList.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const highRelevanceTrends = trendsList.filter((t) => t.relevanceScore >= 80);
  const isLive = platformTrends && platformTrends.length > 0 && !platformTrends[0]._mock;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Platform Trends</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading trends...
            </span>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-surface border-white/5 animate-pulse">
                  <CardContent className="pt-4">
                    <div className="h-32 bg-elevated rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
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
          <h1 className="text-2xl font-bold text-white">Platform Trends</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load trends</p>
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
            <h1 className="text-2xl font-bold text-white">Platform Trends</h1>
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
          <p className="text-tertiary">Real-time X platform trends and opportunities</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Active Trends</p>
            <p className="text-2xl font-bold text-white">{trendsList.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">High Relevance</p>
            <p className="text-2xl font-bold text-green-400">{highRelevanceTrends.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Rising Fast</p>
            <p className="text-2xl font-bold text-blue-400">
              {trendsList.filter((t) => t.velocity === 'rising').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Volume</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatNumber(trendsList.reduce((acc, t) => acc + t.volume, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {['all', 'crypto', 'defi', 'nft', 'tech', 'general'].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Trends */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Trending Topics</h2>
          {filteredTrends.map((trend) => (
            <Card key={trend.id} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        trend.velocity === 'rising'
                          ? 'bg-green-500/20'
                          : trend.velocity === 'falling'
                          ? 'bg-red-500/20'
                          : 'bg-white/5'
                      )}
                    >
                      {trend.velocity === 'rising' ? (
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      ) : trend.velocity === 'falling' ? (
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-tertiary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{trend.topic}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={categoryConfig[trend.category].color}>
                          {trend.category}
                        </Badge>
                        <Badge
                          className={cn(
                            trend.sentiment === 'bullish'
                              ? 'bg-green-500/20 text-green-400'
                              : trend.sentiment === 'bearish'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 text-tertiary'
                          )}
                        >
                          {trend.sentiment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatNumber(trend.volume)}</p>
                    <p
                      className={cn(
                        'text-sm',
                        trend.volumeChange > 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {trend.volumeChange > 0 ? '+' : ''}
                      {trend.volumeChange}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-base rounded-lg">
                    <p className="text-lg font-bold text-white">{trend.relevanceScore}</p>
                    <p className="text-xs text-tertiary">Relevance</p>
                  </div>
                  <div className="text-center p-2 bg-base rounded-lg">
                    <p className="text-lg font-bold text-white">{trend.topTweets}</p>
                    <p className="text-xs text-tertiary">Top Tweets</p>
                  </div>
                  <div className="text-center p-2 bg-base rounded-lg">
                    <p className="text-sm font-medium text-white">{trend.peakTime}</p>
                    <p className="text-xs text-tertiary">Peak</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {trend.relatedHashtags.map((tag, i) => (
                    <a
                      key={i}
                      href={getTwitterSearchUrl(tag)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Badge variant="outline" className="text-xs hover:bg-violet-500/20 hover:text-violet-400 hover:border-violet-500/30 transition-colors cursor-pointer">
                        {tag}
                      </Badge>
                    </a>
                  ))}
                </div>

                <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                  <a
                    href={getTwitterSearchUrl(trend.topic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on X
                  </a>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-indigo-600"
                    onClick={() => {
                      router.push('/create?topic=' + encodeURIComponent(trend.topic));
                      addToast({ type: 'info', title: 'Creating content', description: `Opening editor for "${trend.topic}"` });
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Hashtags - Click to view on X */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Trending Hashtags
                </div>
                <span className="text-[10px] text-tertiary font-normal">Click to view on X</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TRENDING_HASHTAGS.slice(0, 8).map((hashtag, index) => (
                <a
                  key={index}
                  href={hashtag.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-tertiary text-sm w-4">{index + 1}</span>
                    <span className="text-sm text-white group-hover:text-violet-400 transition-colors">{hashtag.tag}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Opportunity Alert */}
          <Card className="bg-green-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Hot Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white mb-2">ETH ETF + Restaking</p>
              <p className="text-xs text-tertiary mb-4">
                Two high-relevance trends can be combined for a unique angle on institutional DeFi
                adoption.
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  router.push('/create?topic=' + encodeURIComponent('ETH ETF + Restaking: The Institutional DeFi Angle'));
                  addToast({ type: 'info', title: 'Exploring angle', description: 'Opening editor with combined trends' });
                }}
              >
                Explore Angle
              </Button>
            </CardContent>
          </Card>

          {/* Timing Insights */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Best Times Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: '10:00 AM', activity: 'High', score: 92 },
                { time: '2:00 PM', activity: 'Peak', score: 98 },
                { time: '6:00 PM', activity: 'High', score: 85 },
                { time: '9:00 PM', activity: 'Medium', score: 72 },
              ].map((slot, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-tertiary">{slot.time}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        slot.activity === 'Peak'
                          ? 'bg-green-500/20 text-green-400'
                          : slot.activity === 'High'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-tertiary'
                      )}
                    >
                      {slot.activity}
                    </Badge>
                    <span className="text-xs text-tertiary">{slot.score}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
