'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Flame,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Repeat,
  Eye,
  Zap,
  Clock,
  Copy,
  Sparkles,
} from 'lucide-react';

// US-024: Viral Content Research

interface ViralPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  viralScore: number;
  postType: 'hot_take' | 'thread' | 'meme' | 'news' | 'educational';
  viralFactors: string[];
  timing: string;
  audienceResonance: string;
}

interface ViralPattern {
  pattern: string;
  frequency: number;
  avgEngagement: number;
  examples: string[];
  applicability: 'high' | 'medium' | 'low';
}

const viralPosts: ViralPost[] = [
  {
    id: '1',
    author: '@cobie',
    content: 'The best time to buy ETH was 2017. The second best time is never because this is all a scam. (jk the second best time is now)',
    likes: 45000,
    retweets: 8900,
    replies: 2300,
    impressions: 2400000,
    viralScore: 98,
    postType: 'hot_take',
    viralFactors: ['Contrarian hook', 'Self-aware humor', 'Bullish conclusion'],
    timing: 'Market uncertainty',
    audienceResonance: 'Speaks to both bears and bulls',
  },
  {
    id: '2',
    author: '@sassal0x',
    content: 'A thread on why Ethereum will flip Bitcoin...',
    likes: 23000,
    retweets: 5600,
    replies: 1800,
    impressions: 1200000,
    viralScore: 92,
    postType: 'thread',
    viralFactors: ['Strong thesis', 'Data-backed', 'Tribe-aligned'],
    timing: 'Post ETF approval',
    audienceResonance: 'ETH maxis + curious neutrals',
  },
  {
    id: '3',
    author: '@deaboronin',
    content: 'POV: You "don\'t believe in DeFi" [image of bank account earning 0.01% APY]',
    likes: 34000,
    retweets: 12000,
    replies: 890,
    impressions: 1800000,
    viralScore: 95,
    postType: 'meme',
    viralFactors: ['Relatable', 'Us vs them', 'Visual punch'],
    timing: 'Fed rate decision day',
    audienceResonance: 'DeFi users + TradFi skeptics',
  },
  {
    id: '4',
    author: '@banteg',
    content: 'BREAKING: [Protocol] just got exploited for $50M. Here\'s what happened...',
    likes: 18000,
    retweets: 9200,
    replies: 3400,
    impressions: 900000,
    viralScore: 88,
    postType: 'news',
    viralFactors: ['Breaking news', 'First mover', 'Expert analysis'],
    timing: 'Real-time during exploit',
    audienceResonance: 'Security-conscious + news seekers',
  },
];

const viralPatterns: ViralPattern[] = [
  {
    pattern: 'Contrarian Opening',
    frequency: 34,
    avgEngagement: 4.8,
    examples: [
      'Unpopular opinion:',
      'Hot take:',
      'Everyone is wrong about...',
    ],
    applicability: 'high',
  },
  {
    pattern: 'Data-Backed Thread',
    frequency: 28,
    avgEngagement: 3.9,
    examples: [
      'I analyzed 1000 wallets...',
      'Here\'s what the data shows:',
      'The numbers don\'t lie:',
    ],
    applicability: 'high',
  },
  {
    pattern: 'Self-Deprecating Humor',
    frequency: 22,
    avgEngagement: 5.2,
    examples: [
      'Me explaining DeFi to my family:',
      'When you buy the top again:',
      'My portfolio vs my confidence:',
    ],
    applicability: 'medium',
  },
  {
    pattern: 'Breaking News Format',
    frequency: 18,
    avgEngagement: 4.1,
    examples: [
      'BREAKING:',
      'JUST IN:',
      'This is huge:',
    ],
    applicability: 'medium',
  },
  {
    pattern: 'Educational Thread',
    frequency: 15,
    avgEngagement: 3.5,
    examples: [
      'A thread on how X works:',
      'ELI5: [complex topic]',
      'Most people don\'t understand...',
    ],
    applicability: 'high',
  },
];

const optimalTimings = [
  { event: 'Market pump/dump', opportunity: 'Hot takes, analysis', urgency: 'high' },
  { event: 'Protocol exploit', opportunity: 'Security threads, post-mortem', urgency: 'high' },
  { event: 'Major announcement', opportunity: 'Analysis, predictions', urgency: 'medium' },
  { event: 'CT drama', opportunity: 'Memes, commentary', urgency: 'medium' },
  { event: 'Quiet Sunday', opportunity: 'Educational threads', urgency: 'low' },
];

export default function ViralResearchPage() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const postTypeConfig = {
    hot_take: { color: 'bg-orange-500/20 text-orange-400', icon: Flame },
    thread: { color: 'bg-blue-500/20 text-blue-400', icon: MessageSquare },
    meme: { color: 'bg-purple-500/20 text-purple-400', icon: Sparkles },
    news: { color: 'bg-red-500/20 text-red-400', icon: Zap },
    educational: { color: 'bg-green-500/20 text-green-400', icon: Users },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Viral Content Research</h1>
        <p className="text-tertiary">
          Analyze viral patterns and reverse-engineer successful CT content
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Posts Analyzed</p>
            <p className="text-2xl font-bold text-white">{viralPosts.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Avg Viral Score</p>
            <p className="text-2xl font-bold text-green-400">
              {Math.round(viralPosts.reduce((acc, p) => acc + p.viralScore, 0) / viralPosts.length)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Patterns Found</p>
            <p className="text-2xl font-bold text-blue-400">{viralPatterns.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">High Applicability</p>
            <p className="text-2xl font-bold text-purple-400">
              {viralPatterns.filter((p) => p.applicability === 'high').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Viral Posts Analysis */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Viral Posts</h2>
          {viralPosts.map((post) => {
            const TypeIcon = postTypeConfig[post.postType].icon;

            return (
              <Card key={post.id} className="bg-surface border-white/5">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-medium">{post.author}</span>
                      <Badge className={postTypeConfig[post.postType].color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {post.postType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      <Flame className="h-3 w-3 mr-1" />
                      {post.viralScore}
                    </Badge>
                  </div>

                  <p className="text-sm text-secondary mb-4 p-3 bg-base rounded-lg">
                    "{post.content}"
                  </p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-base rounded-lg">
                      <Heart className="h-4 w-4 text-red-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{formatNumber(post.likes)}</p>
                    </div>
                    <div className="text-center p-2 bg-base rounded-lg">
                      <Repeat className="h-4 w-4 text-green-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{formatNumber(post.retweets)}</p>
                    </div>
                    <div className="text-center p-2 bg-base rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{formatNumber(post.replies)}</p>
                    </div>
                    <div className="text-center p-2 bg-base rounded-lg">
                      <Eye className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{formatNumber(post.impressions)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-tertiary">Why it worked:</p>
                    <div className="flex flex-wrap gap-1">
                      {post.viralFactors.map((factor, i) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-tertiary">Timing</p>
                      <p className="text-secondary">{post.timing}</p>
                    </div>
                    <div>
                      <p className="text-xs text-tertiary">Audience</p>
                      <p className="text-secondary">{post.audienceResonance}</p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <Button size="sm" variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Adapt Pattern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Viral Patterns */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Viral Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {viralPatterns.map((pattern, index) => (
                <div key={index} className="p-3 bg-base rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{pattern.pattern}</span>
                    <Badge
                      className={cn(
                        pattern.applicability === 'high'
                          ? 'bg-green-500/20 text-green-400'
                          : pattern.applicability === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-white/5 text-tertiary'
                      )}
                    >
                      {pattern.applicability}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-tertiary mb-2">
                    <span>{pattern.frequency}% frequency</span>
                    <span>{pattern.avgEngagement}% avg eng</span>
                  </div>
                  <div className="space-y-1">
                    {pattern.examples.slice(0, 2).map((ex, i) => (
                      <p key={i} className="text-xs text-tertiary">
                        • {ex}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimal Timing */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timing Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimalTimings.map((timing, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-base rounded-lg"
                >
                  <div>
                    <p className="text-sm text-white">{timing.event}</p>
                    <p className="text-xs text-tertiary">{timing.opportunity}</p>
                  </div>
                  <Badge
                    className={cn(
                      timing.urgency === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : timing.urgency === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-white/5 text-tertiary'
                    )}
                  >
                    {timing.urgency}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Generate */}
          <Card className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-violet-500/30">
            <CardContent className="pt-4">
              <h3 className="font-medium text-white mb-2">Generate Viral Content</h3>
              <p className="text-sm text-tertiary mb-4">
                Use analyzed patterns to create high-potential content
              </p>
              <Button className="w-full bg-gradient-to-r from-violet-500 to-indigo-600">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
