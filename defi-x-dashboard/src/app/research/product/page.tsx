'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Package,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

// US-018: Product Intelligence Module

interface ProductFeature {
  id: string;
  name: string;
  status: 'live' | 'beta' | 'coming_soon' | 'planned';
  userSentiment: 'positive' | 'mixed' | 'negative';
  mentions: number;
  feedbackSummary: string;
  contentOpportunities: string[];
}

interface CompetitorFeature {
  competitor: string;
  feature: string;
  hasFeature: boolean;
  defiAppStatus: 'ahead' | 'behind' | 'parity';
}

const productFeatures: ProductFeature[] = [
  {
    id: '1',
    name: 'Multi-Chain Swaps',
    status: 'live',
    userSentiment: 'positive',
    mentions: 1250,
    feedbackSummary: 'Users love the seamless cross-chain experience. Some requests for more L2 support.',
    contentOpportunities: [
      'Tutorial: Cross-chain swap in under 30 seconds',
      'Comparison thread vs competitors',
      'User success story highlights',
    ],
  },
  {
    id: '2',
    name: 'Portfolio Tracking',
    status: 'live',
    userSentiment: 'mixed',
    mentions: 890,
    feedbackSummary: 'Basic tracking works well. Users want more advanced analytics and PnL tracking.',
    contentOpportunities: [
      'Feature deep dive thread',
      'Tips & tricks for power users',
      'Roadmap tease for improvements',
    ],
  },
  {
    id: '3',
    name: 'Yield Aggregation',
    status: 'beta',
    userSentiment: 'positive',
    mentions: 650,
    feedbackSummary: 'Beta users impressed with APY optimization. Some concerns about smart contract risk.',
    contentOpportunities: [
      'Beta announcement thread',
      'Behind the scenes: How we optimize yields',
      'Security audit highlights',
    ],
  },
  {
    id: '4',
    name: 'Intent-Based Trading',
    status: 'coming_soon',
    userSentiment: 'positive',
    mentions: 420,
    feedbackSummary: 'High anticipation. Users excited about simplified trading experience.',
    contentOpportunities: [
      'Explainer: What are intents?',
      'Teaser campaign content',
      'Early access waitlist push',
    ],
  },
  {
    id: '5',
    name: 'Mobile App',
    status: 'planned',
    userSentiment: 'mixed',
    mentions: 1100,
    feedbackSummary: 'Most requested feature. Users frustrated with mobile web experience.',
    contentOpportunities: [
      'Acknowledge feedback publicly',
      'Mobile-first design sneak peek',
      'Community input thread',
    ],
  },
];

const competitorComparison: CompetitorFeature[] = [
  { competitor: 'Uniswap', feature: 'Multi-chain', hasFeature: false, defiAppStatus: 'ahead' },
  { competitor: 'Uniswap', feature: 'Mobile App', hasFeature: true, defiAppStatus: 'behind' },
  { competitor: '1inch', feature: 'Aggregation', hasFeature: true, defiAppStatus: 'parity' },
  { competitor: '1inch', feature: 'Limit Orders', hasFeature: true, defiAppStatus: 'behind' },
  { competitor: 'Jupiter', feature: 'Intent Trading', hasFeature: true, defiAppStatus: 'behind' },
  { competitor: 'CoW Swap', feature: 'MEV Protection', hasFeature: true, defiAppStatus: 'parity' },
];

const userFeedbackThemes = [
  { theme: 'More L2 chains', count: 234, trend: 'rising', priority: 'high' },
  { theme: 'Better mobile UX', count: 189, trend: 'stable', priority: 'high' },
  { theme: 'Lower fees', count: 156, trend: 'rising', priority: 'medium' },
  { theme: 'Faster transactions', count: 123, trend: 'falling', priority: 'medium' },
  { theme: 'More tokens', count: 98, trend: 'stable', priority: 'low' },
];

const statusConfig = {
  live: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  beta: { color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  coming_soon: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  planned: { color: 'bg-white/5 text-tertiary', icon: Clock },
};

export default function ProductIntelligencePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleGenerateContent = (feature: ProductFeature) => {
    router.push(`/create?topic=${encodeURIComponent(feature.name)}`);
  };

  const handleHighlightStrengths = () => {
    router.push('/create?topic=' + encodeURIComponent('Defi App Competitive Advantages'));
    addToast({ type: 'info', title: 'Creating content', description: 'Opening editor for strengths highlight' });
  };

  const handleAddressGaps = () => {
    router.push('/create?topic=' + encodeURIComponent('Defi App Roadmap Updates'));
    addToast({ type: 'info', title: 'Creating content', description: 'Opening editor for gap addressing' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Product Intelligence</h1>
        <p className="text-tertiary">
          Track product sentiment and discover content opportunities
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Mentions</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(productFeatures.reduce((acc, f) => acc + f.mentions, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Positive Sentiment</p>
            <p className="text-2xl font-bold text-green-400">
              {productFeatures.filter((f) => f.userSentiment === 'positive').length}/
              {productFeatures.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Features Ahead</p>
            <p className="text-2xl font-bold text-blue-400">
              {competitorComparison.filter((c) => c.defiAppStatus === 'ahead').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Content Ideas</p>
            <p className="text-2xl font-bold text-purple-400">
              {productFeatures.reduce((acc, f) => acc + f.contentOpportunities.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="competitors">Competitive</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          {productFeatures.map((feature) => {
            const StatusIcon = statusConfig[feature.status].icon;

            return (
              <Card key={feature.id} className="bg-surface border-white/5">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-elevated">
                        <Package className="h-5 w-5 text-tertiary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{feature.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusConfig[feature.status].color}>
                            {feature.status.replace('_', ' ')}
                          </Badge>
                          <Badge
                            className={cn(
                              feature.userSentiment === 'positive'
                                ? 'bg-green-500/20 text-green-400'
                                : feature.userSentiment === 'negative'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            )}
                          >
                            {feature.userSentiment}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatNumber(feature.mentions)}
                      </p>
                      <p className="text-xs text-tertiary">mentions</p>
                    </div>
                  </div>

                  <p className="text-sm text-tertiary mb-4">{feature.feedbackSummary}</p>

                  <div className="p-3 bg-base rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-tertiary">Content Opportunities</span>
                    </div>
                    <ul className="space-y-1">
                      {feature.contentOpportunities.map((opp, i) => (
                        <li key={i} className="text-sm text-secondary flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <Button size="sm" className="bg-gradient-to-r from-violet-500 to-indigo-600" onClick={() => handleGenerateContent(feature)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Generate Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorComparison.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-tertiary">{item.competitor}</span>
                        <span className="text-tertiary mx-2">•</span>
                        <span className="text-white">{item.feature}</span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        item.defiAppStatus === 'ahead'
                          ? 'bg-green-500/20 text-green-400'
                          : item.defiAppStatus === 'behind'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      )}
                    >
                      {item.defiAppStatus === 'ahead'
                        ? 'Defi App Ahead'
                        : item.defiAppStatus === 'behind'
                        ? 'Gap to Close'
                        : 'Parity'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400">Content Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Focus content on areas where Defi App leads (multi-chain) while building
                anticipation for upcoming features that close competitive gaps.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleHighlightStrengths}>
                  Highlight Strengths
                </Button>
                <Button size="sm" variant="outline" onClick={handleAddressGaps}>
                  Address Gaps
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Top Feedback Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userFeedbackThemes.map((theme, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-tertiary text-sm w-6">#{index + 1}</span>
                      <div>
                        <p className="text-white">{theme.theme}</p>
                        <p className="text-xs text-tertiary">{theme.count} mentions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={cn(
                          theme.trend === 'rising'
                            ? 'bg-green-500/20 text-green-400'
                            : theme.trend === 'falling'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-tertiary'
                        )}
                      >
                        {theme.trend}
                      </Badge>
                      <Badge
                        className={cn(
                          theme.priority === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : theme.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/5 text-tertiary'
                        )}
                      >
                        {theme.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white">Response Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">Acknowledge & Engage</p>
                  <p className="text-xs text-tertiary mt-1">
                    Respond to high-priority feedback publicly to build trust
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium">Build Anticipation</p>
                  <p className="text-xs text-tertiary mt-1">
                    Tease upcoming features that address common requests
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-400 font-medium">Educate Users</p>
                  <p className="text-xs text-tertiary mt-1">
                    Create content explaining current capabilities users may not know about
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
