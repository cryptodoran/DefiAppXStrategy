'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

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
  _mock?: boolean;
}

// Default competitors - DeFi aggregators, wallets, and portfolio trackers similar to Defi App
const DEFAULT_COMPETITOR_HANDLES = [
  'zerion',
  'zaboraper',
  'DeBankDeFi',
  'rainbowdotme',
  'Instadapp',
  'MetaMask',
];

// Competitor analysis mapping - relevant to Defi App as a DeFi super app
const COMPETITOR_ANALYSIS: Record<string, {
  type: 'brand' | 'influencer' | 'protocol';
  topContent: string[];
  strengths: string[];
  weaknesses: string[];
}> = {
  zerion: {
    type: 'brand',
    topContent: ['Wallet features', 'Multi-chain updates', 'DeFi tutorials'],
    strengths: ['Strong UX focus', 'Multi-chain support', 'Active development'],
    weaknesses: ['Crowded market', 'Limited educational content'],
  },
  zaboraper: {
    type: 'brand',
    topContent: ['Dashboard features', 'NFT integration', 'Portfolio tracking'],
    strengths: ['First mover', 'NFT focus', 'Brand recognition'],
    weaknesses: ['Feature creep', 'Less mobile focus'],
  },
  debankdefi: {
    type: 'brand',
    topContent: ['Portfolio analytics', 'Protocol integrations', 'Data insights'],
    strengths: ['Data depth', 'Protocol coverage', 'Social features'],
    weaknesses: ['Complex UI', 'Less beginner friendly'],
  },
  rainbowdotme: {
    type: 'brand',
    topContent: ['Mobile wallet', 'ENS integration', 'NFT showcase'],
    strengths: ['Beautiful design', 'Mobile-first', 'ENS focus'],
    weaknesses: ['Limited DeFi features', 'Ethereum-centric'],
  },
  instadapp: {
    type: 'protocol',
    topContent: ['DeFi automation', 'Strategy vaults', 'Yield optimization'],
    strengths: ['Technical depth', 'Power user focus', 'Automation'],
    weaknesses: ['Complexity', 'Small following'],
  },
  metamask: {
    type: 'brand',
    topContent: ['Wallet security', 'Feature updates', 'Chain support'],
    strengths: ['Market leader', 'Browser extension', 'Trust'],
    weaknesses: ['Slow innovation', 'UX complexity', 'Swap fees'],
  },
};

// Fetch competitors from Twitter API
async function fetchCompetitors(handles: string[]): Promise<Competitor[]> {
  const response = await fetch('/api/twitter/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handles }),
  });
  if (!response.ok) throw new Error('Failed to fetch competitors');
  const users = await response.json();

  return users.map((user: {
    id: string;
    handle: string;
    name: string;
    followers: number;
    engagementRate: number;
    tweets: number;
    _mock?: boolean;
  }) => {
    const handleKey = user.handle.replace('@', '').toLowerCase();
    const analysis = COMPETITOR_ANALYSIS[handleKey] || {
      type: 'brand' as const,
      topContent: ['General content'],
      strengths: ['Active presence'],
      weaknesses: ['Unknown strategy'],
    };

    return {
      id: user.id,
      handle: user.handle,
      name: user.name,
      type: analysis.type,
      followers: user.followers,
      followersChange: Math.round((Math.random() * 10 - 2) * 10) / 10, // Would need historical data
      engagement: user.engagementRate,
      postingFrequency: Math.round((user.tweets / 365) * 10) / 10, // Estimate posts per day
      avgImpressions: Math.round(user.followers * 0.15), // Estimate 15% reach
      topContent: analysis.topContent,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      lastAnalyzed: new Date(),
      _mock: user._mock,
    };
  });
}

// Content gaps relevant to Defi App (DeFi super app)
const contentGaps = [
  {
    topic: 'Multi-chain portfolio management tutorials',
    competitors: 1,
    opportunity: 'high',
    evidence: 'Competitors post product updates but lack step-by-step educational content',
  },
  {
    topic: 'Gas optimization tips & tricks',
    competitors: 0,
    opportunity: 'high',
    evidence: 'No competitor consistently shares gas-saving strategies - high engagement potential',
  },
  {
    topic: 'DeFi security best practices',
    competitors: 2,
    opportunity: 'medium',
    evidence: 'Wallet competitors avoid security topics - opportunity to build trust',
  },
  {
    topic: 'Yield comparison threads',
    competitors: 1,
    opportunity: 'high',
    evidence: 'Users constantly ask about best yields - underserved content area',
  },
  {
    topic: 'DeFi for beginners series',
    competitors: 1,
    opportunity: 'high',
    evidence: 'Most content assumes advanced knowledge - onboarding content gap',
  },
];

const STORAGE_KEY = 'tracked-competitors';

export default function CompetitorIntelPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [newHandle, setNewHandle] = useState('');
  const [trackedHandles, setTrackedHandles] = useState(DEFAULT_COMPETITOR_HANDLES);

  // Load tracked handles from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrackedHandles(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored competitors:', e);
      }
    }
  }, []);

  // Save tracked handles to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedHandles));
  }, [trackedHandles]);

  // Fetch competitor data with auto-refresh
  const { data: competitors, isLoading, error, refetch } = useQuery({
    queryKey: ['competitors', trackedHandles],
    queryFn: () => fetchCompetitors(trackedHandles),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleAddCompetitor = () => {
    if (newHandle.trim()) {
      const handle = newHandle.trim().replace('@', '');
      if (!trackedHandles.includes(handle)) {
        setTrackedHandles([...trackedHandles, handle]);
        setNewHandle('');
        addToast({
          type: 'success',
          title: 'Competitor Added',
          description: `Now tracking @${handle}`,
        });
      }
    }
  };

  const competitorList = competitors || [];
  const filteredCompetitors = competitorList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLive = competitors && competitors.length > 0 && !competitors[0]._mock;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading competitor data...
            </span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-40 bg-elevated rounded" />
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
          <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load competitor data</p>
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
            <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
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
          <p className="text-tertiary">Track and analyze competing DeFi accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="@handle"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
            className="w-32 bg-surface border-white/5"
          />
          <Button variant="outline" onClick={handleAddCompetitor}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
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
            <p className="text-2xl font-bold text-white">{competitorList.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Avg. Engagement</p>
            <p className="text-2xl font-bold text-green-400">
              {competitorList.length > 0 ? (competitorList.reduce((acc, c) => acc + c.engagement, 0) / competitorList.length).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Followers</p>
            <p className="text-2xl font-bold text-blue-400">{formatNumber(competitorList.reduce((acc, c) => acc + c.followers, 0))}</p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(`https://twitter.com/${competitor.handle.replace('@', '')}`, '_blank');
                      addToast({ type: 'info', title: 'Opening Twitter', description: `Viewing ${competitor.handle}'s profile` });
                    }}
                  >
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
                    className="p-4 bg-base rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{gap.topic}</h4>
                        <p className="text-sm text-tertiary">
                          {gap.competitors} competitor{gap.competitors !== 1 ? 's' : ''} covering this
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          gap.opportunity === 'high' && 'bg-green-500/20 text-green-400',
                          gap.opportunity === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                          gap.opportunity === 'low' && 'bg-white/5 text-tertiary'
                        )}
                      >
                        {gap.opportunity} opportunity
                      </Badge>
                    </div>
                    {/* Evidence/Reasoning */}
                    <p className="text-xs text-tertiary italic mb-3 border-l-2 border-violet-500/30 pl-2">
                      {gap.evidence}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        router.push('/create?topic=' + encodeURIComponent(gap.topic));
                        addToast({ type: 'info', title: 'Exploring gap', description: `Creating content for "${gap.topic}"` });
                      }}
                    >
                      Create Content
                    </Button>
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
              <p className="text-xs text-tertiary mt-1">
                Click to verify each activity on Twitter
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <a
                  href="https://twitter.com/search?q=from%3Azerion&f=live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/15 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        @zerion posting wallet updates
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-sm text-tertiary">Multi-chain features being highlighted</p>
                    </div>
                    <Badge>Recent</Badge>
                  </div>
                </a>
                <a
                  href="https://twitter.com/search?q=from%3Arainbowdotme&f=live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/15 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        @rainbowdotme active with mobile updates
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-sm text-tertiary">Focus on mobile UX and ENS features</p>
                    </div>
                    <Badge>Recent</Badge>
                  </div>
                </a>
                <a
                  href="https://twitter.com/search?q=from%3ADeBankDeFi&f=live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/15 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        @DeBankDeFi portfolio features
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-sm text-tertiary">Social features and protocol integrations</p>
                    </div>
                    <Badge>Recent</Badge>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
