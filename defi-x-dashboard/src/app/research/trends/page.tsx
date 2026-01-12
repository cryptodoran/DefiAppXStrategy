'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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
  peakTime: string;
  relatedHashtags: string[];
  topTweets: number;
}

const platformTrends: PlatformTrend[] = [
  {
    id: '1',
    topic: 'ETH ETF',
    category: 'crypto',
    volume: 125000,
    volumeChange: 234,
    velocity: 'rising',
    sentiment: 'bullish',
    relevanceScore: 95,
    peakTime: '2 hours ago',
    relatedHashtags: ['#Ethereum', '#ETF', '#SEC', '#BlackRock'],
    topTweets: 450,
  },
  {
    id: '2',
    topic: 'Base Season',
    category: 'defi',
    volume: 89000,
    volumeChange: 156,
    velocity: 'rising',
    sentiment: 'bullish',
    relevanceScore: 88,
    peakTime: '4 hours ago',
    relatedHashtags: ['#Base', '#L2', '#Coinbase', '#DeFi'],
    topTweets: 320,
  },
  {
    id: '3',
    topic: 'Airdrop Season',
    category: 'defi',
    volume: 67000,
    volumeChange: 45,
    velocity: 'stable',
    sentiment: 'neutral',
    relevanceScore: 72,
    peakTime: '6 hours ago',
    relatedHashtags: ['#Airdrop', '#Points', '#Farming'],
    topTweets: 210,
  },
  {
    id: '4',
    topic: 'Ordinals',
    category: 'nft',
    volume: 45000,
    volumeChange: -23,
    velocity: 'falling',
    sentiment: 'bearish',
    relevanceScore: 45,
    peakTime: '12 hours ago',
    relatedHashtags: ['#Bitcoin', '#Ordinals', '#BRC20'],
    topTweets: 150,
  },
  {
    id: '5',
    topic: 'AI Agents',
    category: 'tech',
    volume: 78000,
    volumeChange: 89,
    velocity: 'rising',
    sentiment: 'bullish',
    relevanceScore: 65,
    peakTime: '3 hours ago',
    relatedHashtags: ['#AI', '#Crypto', '#DeFAI'],
    topTweets: 280,
  },
  {
    id: '6',
    topic: 'Restaking',
    category: 'defi',
    volume: 56000,
    volumeChange: 67,
    velocity: 'rising',
    sentiment: 'bullish',
    relevanceScore: 92,
    peakTime: '5 hours ago',
    relatedHashtags: ['#EigenLayer', '#Restaking', '#LST'],
    topTweets: 190,
  },
];

const trendingHashtags = [
  { tag: '#DeFi', posts: 45000, change: 12 },
  { tag: '#Ethereum', posts: 89000, change: 8 },
  { tag: '#Crypto', posts: 234000, change: -3 },
  { tag: '#Web3', posts: 34000, change: 15 },
  { tag: '#Bitcoin', posts: 156000, change: 5 },
  { tag: '#NFT', posts: 23000, change: -12 },
];

const categoryConfig = {
  crypto: { color: 'bg-orange-500/20 text-orange-400' },
  defi: { color: 'bg-blue-500/20 text-blue-400' },
  nft: { color: 'bg-purple-500/20 text-purple-400' },
  general: { color: 'bg-white/5 text-tertiary' },
  tech: { color: 'bg-green-500/20 text-green-400' },
};

export default function PlatformTrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredTrends = platformTrends.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const highRelevanceTrends = platformTrends.filter((t) => t.relevanceScore >= 80);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Trends</h1>
          <p className="text-tertiary">Real-time X platform trends and opportunities</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Active Trends</p>
            <p className="text-2xl font-bold text-white">{platformTrends.length}</p>
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
              {platformTrends.filter((t) => t.velocity === 'rising').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Volume</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatNumber(platformTrends.reduce((acc, t) => acc + t.volume, 0))}
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
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-indigo-600">
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
          {/* Trending Hashtags */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Trending Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingHashtags.map((hashtag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-tertiary text-sm w-4">{index + 1}</span>
                    <span className="text-sm text-white">{hashtag.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tertiary">{formatNumber(hashtag.posts)}</span>
                    <span
                      className={cn(
                        'text-xs',
                        hashtag.change > 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {hashtag.change > 0 ? '+' : ''}
                      {hashtag.change}%
                    </span>
                  </div>
                </div>
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
              <Button size="sm" className="w-full">
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
  );
}
