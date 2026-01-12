'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Users,
  Search,
  Star,
  ExternalLink,
  Mail,
  TrendingUp,
  CheckCircle,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

// US-021: Influencer & KOL Database

interface Influencer {
  id: string;
  handle: string;
  name: string;
  followers: number;
  tier: 'nano' | 'micro' | 'macro' | 'mega';
  engagementRate: number;
  qualityScore: number;
  contentFocus: string[];
  defiAppSentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  pastCollabs: number;
  contactInfo: string | null;
  lastEngagement: Date | null;
  description?: string;
  profileImage?: string;
  _mock?: boolean;
}

// Default DeFi influencers to track
const DEFAULT_INFLUENCER_HANDLES = [
  'DefiIgnas',
  'sassal0x',
  'milesdeutscher',
  'Route2FI',
  'Cryptovince_',
  'thedefiedge',
  'Pentosh1',
  'CryptoKaduna',
];

// Content focus mapping based on account
const CONTENT_FOCUS_MAP: Record<string, string[]> = {
  defiignas: ['DeFi Research', 'Alpha', 'Protocol Analysis'],
  sassal0x: ['Ethereum', 'DeFi News', 'ETH Daily'],
  milesdeutscher: ['Trading', 'Tutorials', 'Portfolio Updates'],
  route2fi: ['Financial Freedom', 'DeFi Strategy', 'Yield Farming'],
  cryptovince_: ['Crypto Analysis', 'Trading', 'Market Updates'],
  thedefiedge: ['DeFi Education', 'Thread Writing', 'Protocol Deep Dives'],
  pentosh1: ['Technical Analysis', 'Trading', 'Charts'],
  cryptokaduna: ['DeFi Alpha', 'Airdrops', 'Yield Opportunities'],
};

// Fetch influencers from Twitter API
async function fetchInfluencers(handles: string[]): Promise<Influencer[]> {
  const response = await fetch('/api/twitter/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handles }),
  });
  if (!response.ok) throw new Error('Failed to fetch influencers');
  const users = await response.json();

  // Transform API response to Influencer format
  return users.map((user: {
    id: string;
    handle: string;
    name: string;
    followers: number;
    tier: 'nano' | 'micro' | 'macro' | 'mega';
    engagementRate: number;
    description?: string;
    profileImage?: string;
    _mock?: boolean;
  }) => ({
    id: user.id,
    handle: user.handle,
    name: user.name,
    followers: user.followers,
    tier: user.tier,
    engagementRate: user.engagementRate,
    qualityScore: Math.min(100, Math.round(user.engagementRate * 15 + 50)),
    contentFocus: CONTENT_FOCUS_MAP[user.handle.replace('@', '').toLowerCase()] || ['Crypto', 'DeFi'],
    defiAppSentiment: 'unknown' as const,
    pastCollabs: 0,
    contactInfo: 'DM open',
    lastEngagement: null,
    description: user.description,
    profileImage: user.profileImage,
    _mock: user._mock,
  }));
}

const tierConfig = {
  nano: { label: 'Nano', range: '< 10K', color: 'bg-white/5 text-tertiary' },
  micro: { label: 'Micro', range: '10K - 100K', color: 'bg-blue-500/20 text-blue-400' },
  macro: { label: 'Macro', range: '100K - 1M', color: 'bg-purple-500/20 text-purple-400' },
  mega: { label: 'Mega', range: '> 1M', color: 'bg-yellow-500/20 text-yellow-400' },
};

const STORAGE_KEY = 'tracked-influencers';

export default function InfluencerDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [newHandle, setNewHandle] = useState('');
  const [trackedHandles, setTrackedHandles] = useState(DEFAULT_INFLUENCER_HANDLES);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

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
        console.error('Failed to parse stored influencers:', e);
      }
    }
  }, []);

  // Save tracked handles to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedHandles));
  }, [trackedHandles]);

  // Fetch influencer data with auto-refresh
  const { data: influencers, isLoading, error, refetch } = useQuery({
    queryKey: ['influencers', trackedHandles],
    queryFn: () => fetchInfluencers(trackedHandles),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const handleAddInfluencer = () => {
    if (newHandle.trim()) {
      const handle = newHandle.trim().replace('@', '');
      if (!trackedHandles.includes(handle)) {
        setTrackedHandles([...trackedHandles, handle]);
        setNewHandle('');
        addToast({
          type: 'success',
          title: 'Influencer Added',
          description: `Now tracking @${handle}`,
        });
      }
    } else {
      addToast({
        type: 'info',
        title: 'Add Influencer',
        description: 'Enter a Twitter handle to track',
      });
    }
  };

  const handleContact = (influencer: Influencer) => {
    if (influencer.contactInfo) {
      addToast({
        type: 'success',
        title: 'Contact Info',
        description: `${influencer.name}: ${influencer.contactInfo}`,
      });
    }
  };

  const handleViewProfile = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    window.open(`https://twitter.com/${cleanHandle}`, '_blank');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentColor = (sentiment: Influencer['defiAppSentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-400';
      case 'negative':
        return 'bg-red-500/20 text-red-400';
      case 'neutral':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-white/5 text-tertiary';
    }
  };

  const filteredInfluencers = (influencers || []).filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || inf.tier === tierFilter;
    const matchesSentiment = sentimentFilter === 'all' || inf.defiAppSentiment === sentimentFilter;
    return matchesSearch && matchesTier && matchesSentiment;
  });

  const influencerList = influencers || [];
  const stats = {
    total: influencerList.length,
    positive: influencerList.filter((i) => i.defiAppSentiment === 'positive').length,
    withCollabs: influencerList.filter((i) => i.pastCollabs > 0).length,
    avgEngagement: influencerList.length > 0
      ? (influencerList.reduce((acc, i) => acc + i.engagementRate, 0) / influencerList.length).toFixed(1)
      : '0',
  };

  const isLive = influencers && influencers.length > 0 && !influencers[0]._mock;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Influencer Database</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading influencer data...
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-32 bg-elevated rounded" />
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
          <h1 className="text-2xl font-bold text-white">Influencer Database</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load influencer data</p>
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
            <h1 className="text-2xl font-bold text-white">Influencer Database</h1>
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
          <p className="text-tertiary">Discover and track CT influencers for collaborations</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="@handle"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInfluencer()}
            className="w-32 bg-surface border-white/5"
          />
          <Button className="bg-gradient-to-r from-violet-500 to-indigo-600" onClick={handleAddInfluencer}>
            <Users className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Tracked</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Positive Sentiment</p>
            <p className="text-2xl font-bold text-green-400">{stats.positive}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Past Collaborations</p>
            <p className="text-2xl font-bold text-purple-400">{stats.withCollabs}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Avg. Engagement</p>
            <p className="text-2xl font-bold text-blue-400">{stats.avgEngagement}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
          <Input
            placeholder="Search influencers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface border-white/5"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40 bg-surface border-white/5">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="nano">Nano (&lt; 10K)</SelectItem>
            <SelectItem value="micro">Micro (10K-100K)</SelectItem>
            <SelectItem value="macro">Macro (100K-1M)</SelectItem>
            <SelectItem value="mega">Mega (&gt; 1M)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-40 bg-surface border-white/5">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Influencer List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredInfluencers.map((influencer) => (
          <Card key={influencer.id} className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold">{influencer.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{influencer.name}</h3>
                      {influencer.pastCollabs > 0 && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-tertiary">{influencer.handle}</p>
                  </div>
                </div>
                <Badge className={tierConfig[influencer.tier].color}>
                  {tierConfig[influencer.tier].label}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{formatNumber(influencer.followers)}</p>
                  <p className="text-xs text-tertiary">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{influencer.engagementRate}%</p>
                  <p className="text-xs text-tertiary">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{influencer.qualityScore}</p>
                  <p className="text-xs text-tertiary">Quality</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {influencer.contentFocus.map((focus, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {focus}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Badge className={getSentimentColor(influencer.defiAppSentiment)}>
                  {influencer.defiAppSentiment} sentiment
                </Badge>
                <div className="flex gap-2">
                  {influencer.contactInfo && (
                    <Button variant="outline" size="sm" onClick={() => handleContact(influencer)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleViewProfile(influencer.handle)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </AppLayout>
  );
}
