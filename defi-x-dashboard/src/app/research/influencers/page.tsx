'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

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
}

const influencers: Influencer[] = [
  {
    id: '1',
    handle: '@defi_chad',
    name: 'DeFi Chad',
    followers: 1500000,
    tier: 'mega',
    engagementRate: 4.8,
    qualityScore: 92,
    contentFocus: ['DeFi analysis', 'Hot takes', 'Market commentary'],
    defiAppSentiment: 'positive',
    pastCollabs: 2,
    contactInfo: 'DM open',
    lastEngagement: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    handle: '@crypto_whale',
    name: 'Crypto Whale',
    followers: 890000,
    tier: 'macro',
    engagementRate: 3.2,
    qualityScore: 78,
    contentFocus: ['Trading', 'Market analysis', 'Alpha leaks'],
    defiAppSentiment: 'neutral',
    pastCollabs: 0,
    contactInfo: null,
    lastEngagement: null,
  },
  {
    id: '3',
    handle: '@defi_educator',
    name: 'DeFi Educator',
    followers: 234000,
    tier: 'macro',
    engagementRate: 5.6,
    qualityScore: 95,
    contentFocus: ['Education', 'Tutorials', 'Protocol deep dives'],
    defiAppSentiment: 'positive',
    pastCollabs: 1,
    contactInfo: 'email@example.com',
    lastEngagement: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    handle: '@eth_maxi',
    name: 'ETH Maximalist',
    followers: 78000,
    tier: 'micro',
    engagementRate: 6.2,
    qualityScore: 85,
    contentFocus: ['Ethereum', 'L2s', 'Technical analysis'],
    defiAppSentiment: 'positive',
    pastCollabs: 0,
    contactInfo: 'DM open',
    lastEngagement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    handle: '@defi_degen',
    name: 'DeFi Degen',
    followers: 45000,
    tier: 'micro',
    engagementRate: 8.1,
    qualityScore: 72,
    contentFocus: ['Yield farming', 'New protocols', 'Degen plays'],
    defiAppSentiment: 'neutral',
    pastCollabs: 0,
    contactInfo: null,
    lastEngagement: null,
  },
  {
    id: '6',
    handle: '@newbie_crypto',
    name: 'Crypto Newbie',
    followers: 8500,
    tier: 'nano',
    engagementRate: 12.3,
    qualityScore: 88,
    contentFocus: ['Beginner content', 'Learning journey', 'Questions'],
    defiAppSentiment: 'positive',
    pastCollabs: 0,
    contactInfo: 'DM open',
    lastEngagement: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const tierConfig = {
  nano: { label: 'Nano', range: '< 10K', color: 'bg-white/5 text-tertiary' },
  micro: { label: 'Micro', range: '10K - 100K', color: 'bg-blue-500/20 text-blue-400' },
  macro: { label: 'Macro', range: '100K - 1M', color: 'bg-purple-500/20 text-purple-400' },
  mega: { label: 'Mega', range: '> 1M', color: 'bg-yellow-500/20 text-yellow-400' },
};

export default function InfluencerDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

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

  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || inf.tier === tierFilter;
    const matchesSentiment = sentimentFilter === 'all' || inf.defiAppSentiment === sentimentFilter;
    return matchesSearch && matchesTier && matchesSentiment;
  });

  const stats = {
    total: influencers.length,
    positive: influencers.filter((i) => i.defiAppSentiment === 'positive').length,
    withCollabs: influencers.filter((i) => i.pastCollabs > 0).length,
    avgEngagement: (influencers.reduce((acc, i) => acc + i.engagementRate, 0) / influencers.length).toFixed(1),
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Influencer Database</h1>
          <p className="text-tertiary">Discover and track CT influencers for collaborations</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-500 to-indigo-600">
          <Users className="mr-2 h-4 w-4" />
          Add Influencer
        </Button>
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
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
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
