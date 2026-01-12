'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Users,
  Target,
  Zap,
  MessageSquare,
} from 'lucide-react';

// US-023: CT Narrative Research

interface Narrative {
  id: string;
  name: string;
  description: string;
  lifecycle: 'emerging' | 'growing' | 'dominant' | 'fading' | 'dead';
  keyAccounts: string[];
  defiAppFit: 'strong' | 'moderate' | 'weak';
  suggestedContent: string[];
  volume: number;
  volumeChange: number;
}

const narratives: Narrative[] = [
  {
    id: '1',
    name: 'DeFi Summer 2.0',
    description: 'The belief that DeFi is entering a new growth phase with more sustainable economics and real utility.',
    lifecycle: 'growing',
    keyAccounts: ['@aaboronin', '@DeFiDad', '@sassal0x'],
    defiAppFit: 'strong',
    suggestedContent: [
      'Thread: Why this DeFi cycle is different',
      'Comparison: DeFi 1.0 vs 2.0 economics',
      'Defi App as infrastructure for the new wave',
    ],
    volume: 45000,
    volumeChange: 67,
  },
  {
    id: '2',
    name: 'L2 Season',
    description: 'Growing adoption and competition between Ethereum L2 solutions.',
    lifecycle: 'dominant',
    keyAccounts: ['@l2beat', '@arbitrum', '@optimismFND'],
    defiAppFit: 'strong',
    suggestedContent: [
      'L2 performance comparison using Defi App',
      'Gas savings analysis across chains',
      'Multi-chain DeFi strategy guide',
    ],
    volume: 89000,
    volumeChange: 23,
  },
  {
    id: '3',
    name: 'RWA Tokenization',
    description: 'Real-world assets being brought on-chain, bridging TradFi and DeFi.',
    lifecycle: 'emerging',
    keyAccounts: ['@MakerDAO', '@centaborohq', '@goldfinch_fi'],
    defiAppFit: 'moderate',
    suggestedContent: [
      'RWA primer for DeFi natives',
      'How RWA changes DeFi risk profiles',
      'Defi App RWA integration roadmap',
    ],
    volume: 23000,
    volumeChange: 156,
  },
  {
    id: '4',
    name: 'Intent-Based Trading',
    description: 'New trading paradigm where users express intent rather than executing specific transactions.',
    lifecycle: 'emerging',
    keyAccounts: ['@CoWSwap', '@UniswapLabs', '@1inch'],
    defiAppFit: 'moderate',
    suggestedContent: [
      'Explainer: What are intents?',
      'Intent vs traditional DEX comparison',
    ],
    volume: 12000,
    volumeChange: 234,
  },
  {
    id: '5',
    name: 'Points & Airdrop Meta',
    description: 'Protocols using points systems for user acquisition ahead of token launches.',
    lifecycle: 'fading',
    keyAccounts: ['@blur_io', '@friendtech', '@Blast_L2'],
    defiAppFit: 'weak',
    suggestedContent: [
      'Counter-narrative: Building without points',
      'Why real utility beats points farming',
    ],
    volume: 34000,
    volumeChange: -45,
  },
  {
    id: '6',
    name: 'Solana DeFi Renaissance',
    description: 'Revival of DeFi activity on Solana after FTX collapse recovery.',
    lifecycle: 'growing',
    keyAccounts: ['@JupiterExchange', '@MarginFi', '@solaboronin'],
    defiAppFit: 'moderate',
    suggestedContent: [
      'Multi-chain DeFi perspective',
      'Comparing Solana and ETH DeFi UX',
    ],
    volume: 56000,
    volumeChange: 89,
  },
];

const lifecycleConfig = {
  emerging: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
  growing: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  dominant: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  fading: { icon: TrendingDown, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  dead: { icon: Minus, color: 'text-tertiary', bg: 'bg-white/5' },
};

const fitConfig = {
  strong: { color: 'bg-green-500/20 text-green-400' },
  moderate: { color: 'bg-yellow-500/20 text-yellow-400' },
  weak: { color: 'bg-red-500/20 text-red-400' },
};

export default function NarrativesPage() {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sortedNarratives = [...narratives].sort((a, b) => {
    const order = { emerging: 0, growing: 1, dominant: 2, fading: 3, dead: 4 };
    return order[a.lifecycle] - order[b.lifecycle];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">CT Narratives</h1>
        <p className="text-tertiary">
          Track prevailing narratives and find opportunities to position Defi App
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Active Narratives</p>
            <p className="text-2xl font-bold text-white">{narratives.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Strong Fit</p>
            <p className="text-2xl font-bold text-green-400">
              {narratives.filter((n) => n.defiAppFit === 'strong').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Emerging</p>
            <p className="text-2xl font-bold text-blue-400">
              {narratives.filter((n) => n.lifecycle === 'emerging').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Total Volume</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatNumber(narratives.reduce((acc, n) => acc + n.volume, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Narratives Grid */}
      <div className="space-y-4">
        {sortedNarratives.map((narrative) => {
          const lifecycle = lifecycleConfig[narrative.lifecycle];
          const LifecycleIcon = lifecycle.icon;

          return (
            <Card key={narrative.id} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', lifecycle.bg)}>
                      <LifecycleIcon className={cn('h-5 w-5', lifecycle.color)} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{narrative.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={lifecycle.bg}>
                          <span className={lifecycle.color}>{narrative.lifecycle}</span>
                        </Badge>
                        <Badge className={fitConfig[narrative.defiAppFit].color}>
                          {narrative.defiAppFit} fit
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatNumber(narrative.volume)}</p>
                    <p className={cn(
                      'text-sm',
                      narrative.volumeChange > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {narrative.volumeChange > 0 ? '+' : ''}{narrative.volumeChange}%
                    </p>
                  </div>
                </div>

                <p className="text-sm text-tertiary mb-4">{narrative.description}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Key Accounts */}
                  <div className="p-3 bg-base rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-tertiary" />
                      <span className="text-xs text-tertiary">Key Accounts</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {narrative.keyAccounts.map((account, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {account}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Content */}
                  <div className="p-3 bg-base rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-tertiary" />
                      <span className="text-xs text-tertiary">Content Ideas</span>
                    </div>
                    <ul className="space-y-1">
                      {narrative.suggestedContent.slice(0, 2).map((content, i) => (
                        <li key={i} className="text-xs text-secondary flex items-center gap-2">
                          <Target className="h-3 w-3 text-blue-400" />
                          {content}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-indigo-600">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
