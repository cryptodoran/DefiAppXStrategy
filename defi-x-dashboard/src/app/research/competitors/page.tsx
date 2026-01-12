'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ExternalLink,
  Eye,
  Heart,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

// US-020: Competitor Intelligence

interface Competitor {
  id: string;
  handle: string;
  name: string;
  type: 'brand' | 'influencer' | 'protocol';
  followers: number;
  followersChange: number;
  engagement: number;
  postingFrequency: number;
  avgImpressions: number;
  topContent: string[];
  strengths: string[];
  weaknesses: string[];
  lastAnalyzed: Date;
}

const competitors: Competitor[] = [
  {
    id: '1',
    handle: '@uniswap',
    name: 'Uniswap',
    type: 'protocol',
    followers: 1200000,
    followersChange: 2.3,
    engagement: 2.1,
    postingFrequency: 3.2,
    avgImpressions: 450000,
    topContent: ['Protocol updates', 'Governance proposals', 'Educational threads'],
    strengths: ['Brand recognition', 'Large following', 'Technical credibility'],
    weaknesses: ['Low engagement rate', 'Corporate tone', 'Infrequent posting'],
    lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    handle: '@aaboronin',
    name: 'DeFi Researcher',
    type: 'influencer',
    followers: 890000,
    followersChange: 4.5,
    engagement: 5.2,
    postingFrequency: 5.1,
    avgImpressions: 320000,
    topContent: ['Deep dives', 'Protocol analysis', 'Hot takes'],
    strengths: ['High engagement', 'Trusted voice', 'Quality content'],
    weaknesses: ['Not a brand account', 'Occasional controversy'],
    lastAnalyzed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    handle: '@defillama',
    name: 'DefiLlama',
    type: 'protocol',
    followers: 456000,
    followersChange: 8.2,
    engagement: 3.8,
    postingFrequency: 4.5,
    avgImpressions: 180000,
    topContent: ['TVL updates', 'Chain comparisons', 'Data insights'],
    strengths: ['Data authority', 'Growing fast', 'Trusted source'],
    weaknesses: ['Dry content', 'Limited personality'],
    lastAnalyzed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    handle: '@paradigm',
    name: 'Paradigm',
    type: 'brand',
    followers: 345000,
    followersChange: 1.2,
    engagement: 2.4,
    postingFrequency: 1.8,
    avgImpressions: 120000,
    topContent: ['Research papers', 'Investment announcements', 'Technical content'],
    strengths: ['Authority', 'Quality over quantity', 'Technical depth'],
    weaknesses: ['Low frequency', 'Academic tone', 'Limited engagement'],
    lastAnalyzed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const contentGaps = [
  { topic: 'L2 comparisons', competitors: 1, opportunity: 'high' },
  { topic: 'Security best practices', competitors: 2, opportunity: 'medium' },
  { topic: 'Beginner tutorials', competitors: 1, opportunity: 'high' },
  { topic: 'Market commentary', competitors: 4, opportunity: 'low' },
  { topic: 'Memes & humor', competitors: 1, opportunity: 'high' },
];

export default function CompetitorIntelPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredCompetitors = competitors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
          <p className="text-tertiary">Track and analyze competing DeFi accounts</p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
        <Input
          placeholder="Search competitors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-surface border-white/5"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Tracked Accounts</p>
            <p className="text-2xl font-bold text-white">{competitors.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Avg. Growth Rate</p>
            <p className="text-2xl font-bold text-green-400">
              {(competitors.reduce((acc, c) => acc + c.followersChange, 0) / competitors.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Your Growth</p>
            <p className="text-2xl font-bold text-blue-400">12.5%</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Content Gaps Found</p>
            <p className="text-2xl font-bold text-yellow-400">{contentGaps.filter((g) => g.opportunity === 'high').length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Competitor List */}
          {filteredCompetitors.map((competitor) => (
            <Card key={competitor.id} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-bold">{competitor.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{competitor.name}</h3>
                        <Badge variant="outline">{competitor.type}</Badge>
                      </div>
                      <p className="text-sm text-tertiary">{competitor.handle}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <Users className="h-4 w-4 text-tertiary mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{formatNumber(competitor.followers)}</p>
                    <p className="text-xs text-tertiary">Followers</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-400">+{competitor.followersChange}%</p>
                    <p className="text-xs text-tertiary">Growth</p>
                  </div>
                  <div className="text-center">
                    <Heart className="h-4 w-4 text-red-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{competitor.engagement}%</p>
                    <p className="text-xs text-tertiary">Engagement</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{competitor.postingFrequency}/day</p>
                    <p className="text-xs text-tertiary">Frequency</p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{formatNumber(competitor.avgImpressions)}</p>
                    <p className="text-xs text-tertiary">Avg. Reach</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-tertiary mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.strengths.map((s, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-tertiary mb-2">Weaknesses</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.weaknesses.map((w, i) => (
                        <Badge key={i} className="bg-red-500/20 text-red-400 text-xs">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Content Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-white">{gap.topic}</h4>
                      <p className="text-sm text-tertiary">
                        {gap.competitors} competitor{gap.competitors !== 1 ? 's' : ''} covering this
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={cn(
                          gap.opportunity === 'high' && 'bg-green-500/20 text-green-400',
                          gap.opportunity === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                          gap.opportunity === 'low' && 'bg-white/5 text-tertiary'
                        )}
                      >
                        {gap.opportunity} opportunity
                      </Badge>
                      <Button size="sm">Explore</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Recent Competitor Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">@uniswap launched viral campaign</p>
                      <p className="text-sm text-tertiary">New governance proposal thread gaining traction</p>
                    </div>
                    <Badge>2h ago</Badge>
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">@defillama passed 450K followers</p>
                      <p className="text-sm text-tertiary">Growth accelerating, up 8% this month</p>
                    </div>
                    <Badge>1d ago</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
