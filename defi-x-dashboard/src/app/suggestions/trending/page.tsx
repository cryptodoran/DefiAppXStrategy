'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

// US-012: Trending Topic Analyzer

interface TrendingTopic {
  id: string;
  topic: string;
  hashtag?: string;
  volume: number;
  volumeChange: number;
  lifecycle: 'emerging' | 'peaking' | 'declining';
  relevanceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedAngles: string[];
  timeToAct: string;
  _mock?: boolean;
}

interface TrendAPIResponse {
  id: string;
  topic: string;
  category: string;
  volume: number;
  volumeChange: number;
  velocity: 'rising' | 'stable' | 'falling';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceScore: number;
  relatedHashtags: string[];
  _mock?: boolean;
}

// Suggested angles based on topic category
const ANGLE_SUGGESTIONS: Record<string, string[]> = {
  defi: [
    'Educational thread on how this works',
    'Impact analysis for DeFi users',
    'Hot take: Why this matters now',
  ],
  crypto: [
    'Market impact analysis',
    'What this means for traders',
    'Historical comparison thread',
  ],
  tech: [
    'Technical deep dive',
    'Implications for Web3',
    'Future predictions',
  ],
  default: [
    'Explainer thread',
    'Your unique perspective',
    'Community discussion starter',
  ],
};

// Fetch trending topics from API
async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  const response = await fetch('/api/twitter/trends');
  if (!response.ok) throw new Error('Failed to fetch trends');
  const data: TrendAPIResponse[] = await response.json();

  // Transform API response to TrendingTopic format
  return data.map((trend) => {
    // Determine lifecycle from velocity
    const lifecycle: TrendingTopic['lifecycle'] =
      trend.velocity === 'rising' ? 'emerging' :
      trend.velocity === 'falling' ? 'declining' : 'peaking';

    // Determine risk level from sentiment and volume change
    const riskLevel: TrendingTopic['riskLevel'] =
      trend.sentiment === 'bearish' || Math.abs(trend.volumeChange) > 300 ? 'high' :
      Math.abs(trend.volumeChange) > 100 ? 'medium' : 'low';

    // Determine time to act based on lifecycle and relevance
    const timeToAct =
      lifecycle === 'emerging' && trend.relevanceScore >= 80 ? 'Next 2 hours' :
      lifecycle === 'emerging' ? 'Next 6 hours' :
      lifecycle === 'peaking' ? 'Ongoing' : 'Low priority';

    // Get suggested angles based on category
    const suggestedAngles = ANGLE_SUGGESTIONS[trend.category] || ANGLE_SUGGESTIONS.default;

    return {
      id: trend.id,
      topic: trend.topic,
      hashtag: trend.relatedHashtags[0] || undefined,
      volume: trend.volume,
      volumeChange: trend.volumeChange,
      lifecycle,
      relevanceScore: trend.relevanceScore,
      riskLevel,
      suggestedAngles,
      timeToAct,
      _mock: trend._mock,
    };
  });
}

export default function TrendingTopicsPage() {
  const { addToast } = useToast();
  const router = useRouter();

  // Fetch trending topics with auto-refresh
  const { data: topics, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: fetchTrendingTopics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });

  const handleRefresh = () => {
    refetch();
    addToast({
      type: 'info',
      title: 'Refreshing',
      description: 'Fetching latest trending topics...',
    });
  };

  const isLive = topics && topics.length > 0 && !topics[0]._mock;

  const handleGenerateContent = (topic: TrendingTopic) => {
    router.push(`/create?topic=${encodeURIComponent(topic.topic)}`);
  };

  const handleGenerateAngle = (topic: TrendingTopic, angle: string) => {
    router.push(`/create?topic=${encodeURIComponent(`${topic.topic}: ${angle}`)}`);
  };

  const getLifecycleIcon = (lifecycle: TrendingTopic['lifecycle']) => {
    switch (lifecycle) {
      case 'emerging':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'peaking':
        return <Minus className="h-4 w-4 text-yellow-400" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
  };

  const getLifecycleColor = (lifecycle: TrendingTopic['lifecycle']) => {
    switch (lifecycle) {
      case 'emerging':
        return 'bg-green-500/20 text-green-400';
      case 'peaking':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'declining':
        return 'bg-red-500/20 text-red-400';
    }
  };

  const getRiskColor = (risk: TrendingTopic['riskLevel']) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'high':
        return 'bg-red-500/20 text-red-400';
    }
  };

  const formatVolume = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const topicsList = topics || [];
  const sortedTopics = [...topicsList].sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Trending Topics</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading trends...
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-48 bg-elevated rounded" />
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
          <h1 className="text-2xl font-bold text-white">Trending Topics</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load trending topics</p>
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
            <h1 className="text-2xl font-bold text-white">Trending Topics</h1>
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
          <p className="text-tertiary">
            Real-time trending topics in DeFi/Crypto with engagement opportunities
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Active Trends</p>
            <p className="text-2xl font-bold text-white">{topicsList.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Emerging</p>
            <p className="text-2xl font-bold text-green-400">
              {topicsList.filter((t) => t.lifecycle === 'emerging').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">High Relevance</p>
            <p className="text-2xl font-bold text-blue-400">
              {topicsList.filter((t) => t.relevanceScore >= 80).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Low Risk Opportunities</p>
            <p className="text-2xl font-bold text-purple-400">
              {topicsList.filter((t) => t.riskLevel === 'low' && t.relevanceScore >= 70).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sortedTopics.map((topic) => (
          <Card key={topic.id} className="bg-surface border-white/5">
            <CardContent className="pt-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">{topic.topic}</h3>
                  {topic.hashtag && (
                    <p className="text-sm text-blue-400">{topic.hashtag}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getLifecycleColor(topic.lifecycle)}>
                    {getLifecycleIcon(topic.lifecycle)}
                    <span className="ml-1">{topic.lifecycle}</span>
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-tertiary">Volume</p>
                  <p className="text-lg font-bold text-white">{formatVolume(topic.volume)}</p>
                  <p className={cn(
                    'text-xs',
                    topic.volumeChange > 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {topic.volumeChange > 0 ? '+' : ''}{topic.volumeChange}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-tertiary">Relevance</p>
                  <p className="text-lg font-bold text-blue-400">{topic.relevanceScore}</p>
                  <p className="text-xs text-tertiary">for Defi App</p>
                </div>
                <div>
                  <p className="text-xs text-tertiary">Risk Level</p>
                  <Badge className={getRiskColor(topic.riskLevel)}>
                    {topic.riskLevel}
                  </Badge>
                </div>
              </div>

              {/* Time to Act */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-base rounded-lg">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-tertiary">Time to act:</span>
                <span className="text-sm font-medium text-yellow-400">{topic.timeToAct}</span>
              </div>

              {/* Suggested Angles */}
              <div>
                <p className="text-xs text-tertiary mb-2">Suggested Angles:</p>
                <div className="space-y-2">
                  {topic.suggestedAngles.map((angle, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-base rounded-lg group"
                    >
                      <span className="text-sm text-secondary">{angle}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleGenerateAngle(topic, angle)}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-4 bg-gradient-to-r from-violet-500 to-indigo-600"
                onClick={() => handleGenerateContent(topic)}
              >
                <Zap className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </AppLayout>
  );
}
