'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Users,
  TrendingUp,
  TrendingDown,
  MapPin,
  Globe,
  Star,
  AlertTriangle,
  UserMinus,
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// US-006: Follower Analytics & Growth

const followerData = {
  total: 47832,
  growth: {
    daily: 234,
    weekly: 1632,
    monthly: 5890,
    percentChange: 12.5,
  },
  demographics: {
    locations: [
      { name: 'United States', value: 35, color: '#3b82f6' },
      { name: 'United Kingdom', value: 15, color: '#8b5cf6' },
      { name: 'Germany', value: 10, color: '#10b981' },
      { name: 'Singapore', value: 8, color: '#f59e0b' },
      { name: 'Other', value: 32, color: '#6b7280' },
    ],
    languages: [
      { name: 'English', value: 78 },
      { name: 'Chinese', value: 8 },
      { name: 'Spanish', value: 5 },
      { name: 'German', value: 4 },
      { name: 'Other', value: 5 },
    ],
  },
  quality: {
    averageScore: 72,
    distribution: {
      high: 45,
      medium: 35,
      low: 15,
      bot: 5,
    },
  },
  notableFollowers: [
    { handle: '@vikivinik', name: 'Vik Vink', followers: 1200000, engagement: 4.2, verified: true },
    { handle: '@defi_whale', name: 'DeFi Whale', followers: 890000, engagement: 3.8, verified: true },
    { handle: '@crypto_trader', name: 'Crypto Trader', followers: 567000, engagement: 5.1, verified: true },
    { handle: '@eth_maxi', name: 'ETH Maximalist', followers: 345000, engagement: 4.5, verified: false },
    { handle: '@sol_builder', name: 'SOL Builder', followers: 234000, engagement: 3.9, verified: true },
  ],
  growthTrend: [
    { date: 'Jan 1', followers: 42000, gained: 180, lost: 45 },
    { date: 'Jan 8', followers: 43200, gained: 250, lost: 50 },
    { date: 'Jan 15', followers: 44500, gained: 350, lost: 50 },
    { date: 'Jan 22', followers: 45800, gained: 380, lost: 80 },
    { date: 'Jan 29', followers: 46900, gained: 320, lost: 70 },
    { date: 'Feb 5', followers: 47832, gained: 234, lost: 52 },
  ],
  churn: {
    totalUnfollows: 347,
    reasons: [
      { reason: 'Account inactive', percentage: 35 },
      { reason: 'Content mismatch', percentage: 25 },
      { reason: 'Posting frequency', percentage: 20 },
      { reason: 'Bot cleanup', percentage: 15 },
      { reason: 'Unknown', percentage: 5 },
    ],
  },
  growthAttribution: [
    { post: 'DeFi isn\'t dead thread', followers: 890, impressions: 234000 },
    { post: 'Product update announcement', followers: 456, impressions: 156000 },
    { post: 'Hot take on regulations', followers: 234, impressions: 89000 },
    { post: 'Educational thread on DeFi', followers: 178, impressions: 67000 },
  ],
  competitorComparison: [
    { name: 'DeFi App', followers: 47832, growth: 12.5 },
    { name: '@uniswap', followers: 1200000, growth: 2.3 },
    { name: '@aaboronin', followers: 890000, growth: 4.5 },
    { name: '@defillama', followers: 456000, growth: 8.2 },
  ],
};

export default function FollowerAnalyticsPage() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Follower Analytics</h1>
        <p className="text-zinc-400">Deep insights into your follower base</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Followers</p>
                <p className="text-3xl font-bold text-white">{formatNumber(followerData.total)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Weekly Growth</p>
                <p className="text-3xl font-bold text-green-400">+{formatNumber(followerData.growth.weekly)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Quality Score</p>
                <p className="text-3xl font-bold text-yellow-400">{followerData.quality.averageScore}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Growth Rate</p>
                <p className="text-3xl font-bold text-purple-400">+{followerData.growth.percentChange}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-zinc-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="notable">Notable Followers</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Growth Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Follower Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={followerData.growthTrend}>
                    <defs>
                      <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatNumber} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="followers"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#followersGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Attribution */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Growth Attribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followerData.growthAttribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                    <div>
                      <p className="text-sm text-zinc-300">{item.post}</p>
                      <p className="text-xs text-zinc-500">{formatNumber(item.impressions)} impressions</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <UserPlus className="h-4 w-4" />
                      <span className="font-medium">+{item.followers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Location Distribution */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={followerData.demographics.locations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {followerData.demographics.locations.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followerData.demographics.languages.map((lang, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-400">{lang.name}</span>
                        <span className="text-white">{lang.value}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${lang.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Follower Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400">High Quality</span>
                      <span className="text-2xl font-bold text-green-400">{followerData.quality.distribution.high}%</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Active, engaged, real accounts</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400">Medium Quality</span>
                      <span className="text-2xl font-bold text-yellow-400">{followerData.quality.distribution.medium}%</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Occasional engagement</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-400">Low Quality</span>
                      <span className="text-2xl font-bold text-orange-400">{followerData.quality.distribution.low}%</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Inactive or low engagement</p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Suspected Bots</span>
                      <span className="text-2xl font-bold text-red-400">{followerData.quality.distribution.bot}%</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Automated or fake accounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Competitor Growth Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followerData.competitorComparison.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg">
                      <div>
                        <p className={cn('font-medium', index === 0 ? 'text-blue-400' : 'text-white')}>
                          {comp.name}
                        </p>
                        <p className="text-sm text-zinc-500">{formatNumber(comp.followers)} followers</p>
                      </div>
                      <Badge className={comp.growth > 10 ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}>
                        +{comp.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notable" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Notable Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followerData.notableFollowers.map((follower, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{follower.name}</span>
                          {follower.verified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                        </div>
                        <p className="text-sm text-zinc-500">{follower.handle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{formatNumber(follower.followers)}</p>
                      <p className="text-sm text-zinc-500">{follower.engagement}% engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserMinus className="h-5 w-5 text-red-400" />
                  Unfollow Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-red-400">{followerData.churn.totalUnfollows}</p>
                  <p className="text-zinc-500">unfollows this month</p>
                </div>
                <div className="space-y-3">
                  {followerData.churn.reasons.map((reason, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-400">{reason.reason}</span>
                        <span className="text-white">{reason.percentage}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Churn Prevention Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium">Maintain Posting Consistency</p>
                  <p className="text-xs text-zinc-500 mt-1">20% of unfollows are due to irregular posting. Aim for 1-2 posts daily.</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">Engage With Your Audience</p>
                  <p className="text-xs text-zinc-500 mt-1">Reply to comments and acknowledge your community to reduce churn.</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-400 font-medium">Stay On Topic</p>
                  <p className="text-xs text-zinc-500 mt-1">25% unfollow due to content mismatch. Keep content relevant to DeFi.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
