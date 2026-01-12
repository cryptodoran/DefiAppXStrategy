'use client';

import { useState } from 'react';
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
  Filter,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Mock post data
const posts = [
  {
    id: '1',
    content: 'DeFi isn\'t dead. It\'s evolving. Here\'s what most people miss...',
    type: 'THREAD',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    impressions: 234000,
    engagements: 8900,
    likes: 4560,
    retweets: 1890,
    replies: 567,
    quotes: 234,
    qualityScore: 92,
    viralScore: 87,
    spiceLevel: 6,
    topics: ['DeFi', 'Market Commentary'],
    isViral: true,
  },
  {
    id: '2',
    content: 'Just shipped a massive update to DeFi App. Your favorite features just got 10x better...',
    type: 'SINGLE',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    impressions: 156000,
    engagements: 5340,
    likes: 2340,
    retweets: 890,
    replies: 234,
    quotes: 123,
    qualityScore: 87,
    viralScore: 72,
    spiceLevel: 3,
    topics: ['Product Update'],
    isViral: true,
  },
  {
    id: '3',
    content: 'The DeFi summer 2.0 narrative is real. Here\'s why DeFi App is positioned to capture...',
    type: 'THREAD',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    impressions: 89000,
    engagements: 3230,
    likes: 1230,
    retweets: 456,
    replies: 167,
    quotes: 89,
    qualityScore: 85,
    viralScore: 65,
    spiceLevel: 4,
    topics: ['DeFi', 'Analysis'],
    isViral: false,
  },
  {
    id: '4',
    content: 'Hot take: Most "DeFi protocols" will be obsolete in 2 years. The ones that survive?...',
    type: 'SINGLE',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    impressions: 67000,
    engagements: 2890,
    likes: 1890,
    retweets: 567,
    replies: 234,
    quotes: 45,
    qualityScore: 78,
    viralScore: 58,
    spiceLevel: 7,
    topics: ['Hot Take', 'Market Commentary'],
    isViral: false,
  },
];

const performanceData = [
  { date: 'Mon', impressions: 45000, engagements: 1200 },
  { date: 'Tue', impressions: 52000, engagements: 1400 },
  { date: 'Wed', impressions: 89000, engagements: 2300 },
  { date: 'Thu', impressions: 156000, engagements: 4100 },
  { date: 'Fri', impressions: 234000, engagements: 5800 },
  { date: 'Sat', impressions: 178000, engagements: 4500 },
  { date: 'Sun', impressions: 145000, engagements: 3900 },
];

const benchmarks = {
  accountAvg: { impressions: 85000, engagement: 3.2 },
  ctDeFiAvg: { impressions: 45000, engagement: 2.8 },
};

export default function PostPerformancePage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [contentType, setContentType] = useState('all');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Post Performance</h1>
          <p className="text-zinc-400">Detailed analytics on every post</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single Posts</SelectItem>
              <SelectItem value="thread">Threads</SelectItem>
              <SelectItem value="qt">Quote Tweets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#impressionsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">vs Your Average</p>
                <p className="text-2xl font-bold text-green-400">+47%</p>
                <p className="text-xs text-zinc-500">impressions this week</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">vs CT DeFi Average</p>
                <p className="text-2xl font-bold text-green-400">+89%</p>
                <p className="text-xs text-zinc-500">above benchmark</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-300 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{post.type}</Badge>
                    {post.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {post.isViral && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                        Viral
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-lg font-bold', getScoreColor(post.qualityScore))}>
                    {post.qualityScore}
                  </p>
                  <p className="text-xs text-zinc-500">Quality</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-zinc-800">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-400">
                    <Eye className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatNumber(post.impressions)}
                  </p>
                  <p className="text-xs text-zinc-500">Impressions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatNumber(post.likes)}
                  </p>
                  <p className="text-xs text-zinc-500">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-400">
                    <Repeat2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatNumber(post.retweets)}
                  </p>
                  <p className="text-xs text-zinc-500">Retweets</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-400">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-white">
                    {formatNumber(post.replies)}
                  </p>
                  <p className="text-xs text-zinc-500">Replies</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {((post.engagements / post.impressions) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-zinc-500">Eng. Rate</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
