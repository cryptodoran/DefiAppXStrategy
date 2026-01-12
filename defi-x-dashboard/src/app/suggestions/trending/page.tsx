'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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
}

const trendingTopics: TrendingTopic[] = [
  {
    id: '1',
    topic: 'New SEC DeFi Guidelines',
    hashtag: '#DeFiRegulation',
    volume: 45000,
    volumeChange: 234,
    lifecycle: 'emerging',
    relevanceScore: 95,
    riskLevel: 'medium',
    suggestedAngles: [
      'Analysis of impact on DeFi protocols',
      'What this means for Defi App users',
      'Hot take: Is this bullish or bearish?',
    ],
    timeToAct: 'Next 2 hours',
  },
  {
    id: '2',
    topic: 'ETH L2 Gas Wars',
    hashtag: '#L2Season',
    volume: 32000,
    volumeChange: 89,
    lifecycle: 'peaking',
    relevanceScore: 88,
    riskLevel: 'low',
    suggestedAngles: [
      'Compare L2 gas costs',
      'Defi App performance across L2s',
      'Educational thread on L2 scaling',
    ],
    timeToAct: 'Next 4 hours',
  },
  {
    id: '3',
    topic: 'DeFi Summer 2.0 Narrative',
    hashtag: '#DeFiSummer',
    volume: 28000,
    volumeChange: 45,
    lifecycle: 'peaking',
    relevanceScore: 92,
    riskLevel: 'low',
    suggestedAngles: [
      'Why this time is different',
      'Top protocols positioned for the rally',
      'Defi App as infrastructure play',
    ],
    timeToAct: 'Ongoing',
  },
  {
    id: '4',
    topic: 'Major Protocol Exploit',
    hashtag: '#DeFiSecurity',
    volume: 67000,
    volumeChange: 567,
    lifecycle: 'emerging',
    relevanceScore: 75,
    riskLevel: 'high',
    suggestedAngles: [
      'Security analysis (be careful)',
      'How Defi App prevents this',
      'Educational: Smart contract security',
    ],
    timeToAct: 'Caution advised',
  },
  {
    id: '5',
    topic: 'Bitcoin ETF Inflows',
    hashtag: '#BitcoinETF',
    volume: 89000,
    volumeChange: -12,
    lifecycle: 'declining',
    relevanceScore: 45,
    riskLevel: 'low',
    suggestedAngles: [
      'Impact on DeFi liquidity',
      'TradFi meets DeFi narrative',
    ],
    timeToAct: 'Low priority',
  },
  {
    id: '6',
    topic: 'RWA Tokenization',
    hashtag: '#RWA',
    volume: 18000,
    volumeChange: 156,
    lifecycle: 'emerging',
    relevanceScore: 82,
    riskLevel: 'low',
    suggestedAngles: [
      'RWA integration possibilities',
      'The future of tokenized assets',
      'Defi App RWA roadmap tease',
    ],
    timeToAct: 'Next 6 hours',
  },
];

export default function TrendingTopicsPage() {
  const [topics, setTopics] = useState(trendingTopics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
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

  const sortedTopics = [...topics].sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trending Topics</h1>
          <p className="text-tertiary">
            Real-time trending topics in DeFi/Crypto with engagement opportunities
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Active Trends</p>
            <p className="text-2xl font-bold text-white">{topics.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Emerging</p>
            <p className="text-2xl font-bold text-green-400">
              {topics.filter((t) => t.lifecycle === 'emerging').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">High Relevance</p>
            <p className="text-2xl font-bold text-blue-400">
              {topics.filter((t) => t.relevanceScore >= 80).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Low Risk Opportunities</p>
            <p className="text-2xl font-bold text-purple-400">
              {topics.filter((t) => t.riskLevel === 'low' && t.relevanceScore >= 70).length}
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
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full mt-4 bg-gradient-to-r from-violet-500 to-indigo-600">
                <Zap className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
