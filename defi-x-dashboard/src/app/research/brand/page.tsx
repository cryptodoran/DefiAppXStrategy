'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Target,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// US-019: Brand Positioning Research

interface BrandAttribute {
  attribute: string;
  current: number;
  target: number;
  competitorAvg: number;
  trend: 'up' | 'down' | 'stable';
}

interface AudienceSegment {
  name: string;
  size: string;
  engagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyNeeds: string[];
  contentPreference: string[];
}

const brandAttributes: BrandAttribute[] = [
  { attribute: 'Trustworthy', current: 72, target: 90, competitorAvg: 68, trend: 'up' },
  { attribute: 'Innovative', current: 85, target: 95, competitorAvg: 75, trend: 'up' },
  { attribute: 'User-Friendly', current: 78, target: 85, competitorAvg: 72, trend: 'stable' },
  { attribute: 'Technical', current: 82, target: 80, competitorAvg: 85, trend: 'down' },
  { attribute: 'Community-Driven', current: 65, target: 85, competitorAvg: 70, trend: 'up' },
  { attribute: 'Transparent', current: 88, target: 95, competitorAvg: 62, trend: 'up' },
];

const audienceSegments: AudienceSegment[] = [
  {
    name: 'DeFi Natives',
    size: '15K followers',
    engagement: 8.2,
    sentiment: 'positive',
    keyNeeds: ['Advanced features', 'Alpha insights', 'Technical content'],
    contentPreference: ['Deep dives', 'Market analysis', 'New feature announcements'],
  },
  {
    name: 'Crypto Curious',
    size: '35K followers',
    engagement: 5.4,
    sentiment: 'neutral',
    keyNeeds: ['Education', 'Safety', 'Simple UX'],
    contentPreference: ['Tutorials', 'Explainers', 'Success stories'],
  },
  {
    name: 'Yield Farmers',
    size: '8K followers',
    engagement: 12.1,
    sentiment: 'positive',
    keyNeeds: ['APY comparisons', 'Risk assessment', 'New opportunities'],
    contentPreference: ['Yield updates', 'Strategy threads', 'Protocol analysis'],
  },
  {
    name: 'Traders',
    size: '12K followers',
    engagement: 6.8,
    sentiment: 'neutral',
    keyNeeds: ['Speed', 'Low fees', 'Market data'],
    contentPreference: ['Hot takes', 'Market commentary', 'Trading tips'],
  },
];

const brandVoicePillars = [
  {
    pillar: 'Expertise Without Arrogance',
    description: 'Share knowledge confidently but remain approachable',
    dos: ['Explain complex concepts simply', 'Acknowledge when you don\'t know'],
    donts: ['Talk down to beginners', 'Use unnecessary jargon'],
  },
  {
    pillar: 'Playful Professionalism',
    description: 'Have fun while maintaining credibility',
    dos: ['Use CT humor appropriately', 'Celebrate wins with community'],
    donts: ['Force memes', 'Be unprofessional during serious moments'],
  },
  {
    pillar: 'Transparent & Direct',
    description: 'Be honest about capabilities and limitations',
    dos: ['Acknowledge issues quickly', 'Share roadmap openly'],
    donts: ['Overpromise', 'Hide problems'],
  },
];

const competitorPositioning = [
  { name: 'Uniswap', position: 'The OG DEX', strength: 'Brand recognition', weakness: 'Corporate feel' },
  { name: '1inch', position: 'Best rates aggregator', strength: 'Technical reputation', weakness: 'Complex UX' },
  { name: 'Jupiter', position: 'Solana DeFi hub', strength: 'Community love', weakness: 'Single chain' },
  { name: 'Paraswap', position: 'Gas optimizer', strength: 'Technical efficiency', weakness: 'Low awareness' },
];

export default function BrandPositioningPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Brand Positioning</h1>
        <p className="text-tertiary">
          Understand and optimize Defi App's brand perception on CT
        </p>
      </div>

      {/* Brand Health Score */}
      <Card className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border-violet-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tertiary">Overall Brand Health</p>
              <p className="text-4xl font-bold text-white">78/100</p>
              <p className="text-sm text-green-400 mt-1">+5 from last month</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tertiary">Position in Category</p>
              <p className="text-2xl font-bold text-white">#4</p>
              <p className="text-sm text-tertiary">of 12 tracked competitors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Attributes */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Brand Attribute Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brandAttributes.map((attr, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{attr.attribute}</span>
                    {attr.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : attr.trend === 'down' ? (
                      <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-tertiary">Competitor avg: {attr.competitorAvg}</span>
                    <span className="text-tertiary">Target: {attr.target}</span>
                    <span className="text-white font-medium">{attr.current}</span>
                  </div>
                </div>
                <div className="relative h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                    style={{ width: `${attr.current}%` }}
                  />
                  <div
                    className="absolute h-full w-0.5 bg-yellow-400"
                    style={{ left: `${attr.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience Segments */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Audience Segments</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {audienceSegments.map((segment, index) => (
            <Card key={index} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-white">{segment.name}</h3>
                    <p className="text-sm text-tertiary">{segment.size}</p>
                  </div>
                  <Badge
                    className={cn(
                      segment.sentiment === 'positive'
                        ? 'bg-green-500/20 text-green-400'
                        : segment.sentiment === 'negative'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    )}
                  >
                    {segment.sentiment}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-base rounded-lg">
                    <p className="text-lg font-bold text-white">{segment.engagement}%</p>
                    <p className="text-xs text-tertiary">Engagement</p>
                  </div>
                  <div className="text-center p-2 bg-base rounded-lg">
                    <p className="text-lg font-bold text-white">{segment.keyNeeds.length}</p>
                    <p className="text-xs text-tertiary">Key Needs</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-tertiary">Key Needs:</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.keyNeeds.map((need, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs text-tertiary">Content Preference:</p>
                  <div className="flex flex-wrap gap-1">
                    {segment.contentPreference.map((pref, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Brand Voice Pillars */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Brand Voice Pillars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {brandVoicePillars.map((pillar, index) => (
              <div key={index} className="p-4 bg-base rounded-lg">
                <h4 className="font-medium text-white mb-1">{pillar.pillar}</h4>
                <p className="text-sm text-tertiary mb-4">{pillar.description}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-400 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Do
                    </p>
                    <ul className="space-y-1">
                      {pillar.dos.map((item, i) => (
                        <li key={i} className="text-sm text-secondary">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Don't
                    </p>
                    <ul className="space-y-1">
                      {pillar.donts.map((item, i) => (
                        <li key={i} className="text-sm text-secondary">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Competitive Positioning Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitorPositioning.map((comp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-base rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">{comp.name}</p>
                  <p className="text-sm text-tertiary">"{comp.position}"</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xs text-tertiary">Strength</p>
                    <Badge className="bg-green-500/20 text-green-400">{comp.strength}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-tertiary">Weakness</p>
                    <Badge className="bg-red-500/20 text-red-400">{comp.weakness}</Badge>
                  </div>
                </div>
              </div>
            ))}

            {/* Defi App positioning */}
            <div className="p-4 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Defi App</p>
                  <p className="text-sm text-blue-400">"The multi-chain DeFi powerhouse"</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xs text-tertiary">Strength</p>
                    <Badge className="bg-green-500/20 text-green-400">Multi-chain native</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-tertiary">To Build</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Community love</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-sm text-white">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-base rounded-lg">
              <div className="p-1.5 rounded bg-green-500/20">
                <Star className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white">Double down on transparency</p>
                <p className="text-xs text-tertiary">
                  Currently scoring 88 vs 62 competitor avg - this is a key differentiator
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-base rounded-lg">
              <div className="p-1.5 rounded bg-yellow-500/20">
                <Users className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-white">Build community engagement</p>
                <p className="text-xs text-tertiary">
                  Gap of 20 points between current (65) and target (85) - biggest opportunity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-base rounded-lg">
              <div className="p-1.5 rounded bg-blue-500/20">
                <Heart className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white">Target DeFi Natives segment</p>
                <p className="text-xs text-tertiary">
                  Highest engagement (8.2%) and already positive - amplify this sentiment
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
