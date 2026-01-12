'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

// Mock algorithm data
const algorithmFactors = [
  {
    id: '1',
    category: 'EXPOSURE_ALLOCATION',
    factorName: 'Daily Exposure Budget',
    understanding: 'Each account has a limited daily exposure budget. Reply-guying and excessive posting cannibalize main post reach. Optimal cadence is 1-2 main posts + 1 QT per day.',
    confidence: 0.9,
    impact: 5,
    source: '@nikitabier analysis',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    verified: true,
    trend: 'stable',
  },
  {
    id: '2',
    category: 'CONTENT_QUALITY',
    factorName: 'Anti-Slop Detection',
    understanding: 'Low-effort "slop" content now receives algorithmic penalties instead of rewards. Generic, templated posts are deprioritized. Higher-effort content (threads, articles) gets preferential treatment.',
    confidence: 0.85,
    impact: 5,
    source: 'Multiple CT researchers',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    verified: true,
    trend: 'increasing',
  },
  {
    id: '3',
    category: 'THREAD_BOOST',
    factorName: 'Thread Algorithm Boost',
    understanding: 'Threads with 5+ quality tweets receive significant algorithmic boost. Each tweet in the thread should be able to stand alone for engagement. Strategic placement of hooks throughout increases total reach.',
    confidence: 0.8,
    impact: 4,
    source: 'Platform observation',
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    verified: true,
    trend: 'stable',
  },
  {
    id: '4',
    category: 'ENGAGEMENT_WEIGHTING',
    factorName: 'Engagement Value Hierarchy',
    understanding: 'Not all engagement is equal. Comments > Retweets > Likes in terms of algorithmic value. Engagement from high-follower accounts has multiplier effect.',
    confidence: 0.75,
    impact: 4,
    source: 'Community consensus',
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    verified: false,
    trend: 'stable',
  },
  {
    id: '5',
    category: 'QT_VS_RT',
    factorName: 'QT vs RT Preference',
    understanding: 'Quote tweets are now weighted more favorably than simple retweets. QTs with substantive commentary get additional reach. Empty or low-effort QTs may be penalized.',
    confidence: 0.7,
    impact: 3,
    source: '@sweatystartup',
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    verified: false,
    trend: 'increasing',
  },
  {
    id: '6',
    category: 'PENALTY_TRIGGERS',
    factorName: 'Reach Penalty Triggers',
    understanding: 'Excessive hashtags (>2-3), link-only posts, spam-like behavior, and engagement bait trigger reach reduction. Posting too frequently in short windows also penalized.',
    confidence: 0.85,
    impact: 5,
    source: 'Direct observation',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    verified: true,
    trend: 'stable',
  },
];

const recentChanges = [
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    title: 'Increased thread boost factor',
    description: 'Threads now receiving ~20% more reach compared to last month',
    impact: 'positive',
  },
  {
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    title: 'Slop detection tightened',
    description: 'Generic motivational content seeing significant reach drops',
    impact: 'neutral',
  },
  {
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    title: 'Reply-guy penalty increased',
    description: 'Excessive replying to large accounts now more heavily penalized',
    impact: 'negative',
  },
];

const trackedResearchers = [
  { handle: '@nikitabier', focus: 'Algorithm mechanics', reliability: 'high' },
  { handle: '@sweatystartup', focus: 'Growth tactics', reliability: 'high' },
  { handle: '@thedankoe', focus: 'Content strategy', reliability: 'medium' },
  { handle: '@dickiebush', focus: 'Thread optimization', reliability: 'medium' },
];

export default function AlgorithmIntelPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EXPOSURE_ALLOCATION':
        return <Zap className="h-4 w-4" />;
      case 'PENALTY_TRIGGERS':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CONTENT_QUALITY':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-white/10" />;
    }
  };

  const filteredFactors = activeCategory === 'all'
    ? algorithmFactors
    : algorithmFactors.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Algorithm Intelligence</h1>
          <p className="text-tertiary">
            Real-time insights into how the X algorithm works
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Intel
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Tracked Factors</p>
            <p className="text-2xl font-bold text-white">{algorithmFactors.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Verified Insights</p>
            <p className="text-2xl font-bold text-green-400">
              {algorithmFactors.filter((f) => f.verified).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Recent Changes</p>
            <p className="text-2xl font-bold text-yellow-400">{recentChanges.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Tracked Researchers</p>
            <p className="text-2xl font-bold text-blue-400">{trackedResearchers.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="factors" className="space-y-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="factors">Algorithm Factors</TabsTrigger>
          <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          <TabsTrigger value="researchers">Tracked Researchers</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Button>
            {['EXPOSURE_ALLOCATION', 'CONTENT_QUALITY', 'THREAD_BOOST', 'ENGAGEMENT_WEIGHTING', 'QT_VS_RT', 'PENALTY_TRIGGERS'].map(
              (cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </Button>
              )
            )}
          </div>

          {/* Factors List */}
          <div className="space-y-4">
            {filteredFactors.map((factor) => (
              <Card key={factor.id} className="bg-surface border-white/5">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-tertiary">{getCategoryIcon(factor.category)}</div>
                      <div>
                        <h3 className="font-medium text-white">{factor.factorName}</h3>
                        <p className="text-xs text-tertiary">
                          {factor.category.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {factor.verified && (
                        <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                      )}
                      {getTrendIcon(factor.trend)}
                    </div>
                  </div>

                  <p className="text-sm text-secondary mb-4">{factor.understanding}</p>

                  <div className="flex items-center justify-between text-xs text-tertiary">
                    <div className="flex items-center gap-4">
                      <span>Confidence: {Math.round(factor.confidence * 100)}%</span>
                      <span className="flex items-center gap-1">
                        Impact:
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-1.5 w-3 rounded-full',
                                i <= factor.impact ? 'bg-yellow-400' : 'bg-white/10'
                              )}
                            />
                          ))}
                        </div>
                      </span>
                      <span>Source: {factor.source}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round((Date.now() - factor.lastUpdated.getTime()) / (24 * 60 * 60 * 1000))}d ago
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          {recentChanges.map((change, index) => (
            <Card key={index} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{change.title}</h3>
                    <p className="text-sm text-tertiary mt-1">{change.description}</p>
                  </div>
                  <Badge
                    className={cn(
                      change.impact === 'positive' && 'bg-green-500/20 text-green-400',
                      change.impact === 'negative' && 'bg-red-500/20 text-red-400',
                      change.impact === 'neutral' && 'bg-white/5 text-tertiary'
                    )}
                  >
                    {change.impact}
                  </Badge>
                </div>
                <p className="text-xs text-tertiary mt-3">
                  {Math.round((Date.now() - change.date.getTime()) / (24 * 60 * 60 * 1000))} days ago
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="researchers" className="space-y-4">
          {trackedResearchers.map((researcher, index) => (
            <Card key={index} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
                    <div>
                      <h3 className="font-medium text-white">{researcher.handle}</h3>
                      <p className="text-sm text-tertiary">{researcher.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        researcher.reliability === 'high' && 'bg-green-500/20 text-green-400',
                        researcher.reliability === 'medium' && 'bg-yellow-500/20 text-yellow-400'
                      )}
                    >
                      {researcher.reliability} reliability
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
