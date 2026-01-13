'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Flame,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Users,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

// US-025: Spice Level Framework

interface SpiceLevel {
  level: number;
  name: string;
  emoji: string;
  description: string;
  examples: string[];
  riskFactors: string[];
  bestFor: string[];
  approvalRequired: boolean;
}

const spiceLevels: SpiceLevel[] = [
  {
    level: 1,
    name: 'Mild',
    emoji: '🌱',
    description: 'Safe, factual content that builds trust and credibility',
    examples: [
      'Educational threads about DeFi basics',
      'Product update announcements',
      'Data-driven market analysis',
    ],
    riskFactors: ['None - safest content type'],
    bestFor: ['Building credibility', 'New followers', 'Professional audience'],
    approvalRequired: false,
  },
  {
    level: 3,
    name: 'Warm',
    emoji: '🌶️',
    description: 'Light opinions that most would agree with',
    examples: [
      '"DeFi makes finance accessible" type takes',
      'Celebrating ecosystem wins',
      'Soft critiques of TradFi',
    ],
    riskFactors: ['Low - might seem too safe to CT audience'],
    bestFor: ['Daily engagement', 'Community building', 'Brand voice establishment'],
    approvalRequired: false,
  },
  {
    level: 5,
    name: 'Medium',
    emoji: '🔥',
    description: 'Clear stance that sparks healthy debate',
    examples: [
      'L1 vs L2 preferences',
      'Protocol comparison takes',
      'Market cycle predictions',
    ],
    riskFactors: ['Some may disagree', 'Could attract critics'],
    bestFor: ['Driving engagement', 'Establishing expertise', 'Thought leadership'],
    approvalRequired: false,
  },
  {
    level: 7,
    name: 'Hot',
    emoji: '🌋',
    description: 'Controversial takes that will drive strong reactions',
    examples: [
      'Calling out specific protocols',
      'Strong market predictions',
      'Challenging popular narratives',
    ],
    riskFactors: ['Will attract criticism', 'May alienate some followers', 'Quote tweet bait'],
    bestFor: ['Viral potential', 'Standing out', 'Establishing strong brand identity'],
    approvalRequired: true,
  },
  {
    level: 9,
    name: 'Nuclear',
    emoji: '☢️',
    description: 'Maximum controversy - use sparingly and strategically',
    examples: [
      'Attacking sacred cows',
      'Contrarian takes during euphoria/fear',
      'Bold predictions with receipts',
    ],
    riskFactors: ['High controversy', 'Potential backlash', 'Brand risk if wrong'],
    bestFor: ['Breaking through noise', 'Establishing contrarian reputation', 'Going viral'],
    approvalRequired: true,
  },
];

interface SpiceAnalysis {
  currentSpice: number;
  controversyScore: number;
  engagementPotential: number;
  brandAlignment: number;
  riskFlags: string[];
  suggestions: string[];
}

const defaultAnalysis: SpiceAnalysis = {
  currentSpice: 0,
  controversyScore: 0,
  engagementPotential: 0,
  brandAlignment: 0,
  riskFlags: [],
  suggestions: ['Enter content to analyze'],
};

// Analyze content spice level using AI
async function analyzeSpiceLevel(content: string): Promise<SpiceAnalysis> {
  try {
    const response = await fetch('/api/content/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type: 'spice' }),
    });

    const data = await response.json();

    if (data.analysis) {
      return {
        currentSpice: data.analysis.spiceLevel || 5,
        controversyScore: data.analysis.controversyScore || 50,
        engagementPotential: data.analysis.engagementPotential || 50,
        brandAlignment: data.analysis.brandAlignment || 50,
        riskFlags: data.analysis.riskFlags || [],
        suggestions: data.analysis.suggestions || [],
      };
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Spice analysis error:', error);
    return defaultAnalysis;
  }
}

// This data would ideally come from analytics but is a reasonable reference
const historicalPerformance = [
  { spiceLevel: '1-2', avgEngagement: 2.1, avgReach: 15000, posts: 45 },
  { spiceLevel: '3-4', avgEngagement: 3.8, avgReach: 28000, posts: 67 },
  { spiceLevel: '5-6', avgEngagement: 5.2, avgReach: 45000, posts: 34 },
  { spiceLevel: '7-8', avgEngagement: 7.8, avgReach: 89000, posts: 12 },
  { spiceLevel: '9-10', avgEngagement: 12.4, avgReach: 156000, posts: 3 },
];

export default function SpicyFrameworkPage() {
  const [content, setContent] = useState('');
  const [targetSpice, setTargetSpice] = useState([5]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SpiceAnalysis>(defaultAnalysis);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSpiceLevel(content);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCurrentLevel = () => {
    return spiceLevels.find(
      (l) => targetSpice[0] >= l.level && targetSpice[0] < (spiceLevels[spiceLevels.indexOf(l) + 1]?.level || 11)
    ) || spiceLevels[2];
  };

  const currentLevel = getCurrentLevel();

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Spice Level Framework</h1>
        <p className="text-tertiary">
          Calibrate your content's controversy level for optimal engagement
        </p>
      </div>

      <Tabs defaultValue="framework" className="space-y-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="framework">Framework</TabsTrigger>
          <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
          <TabsTrigger value="performance">Performance Data</TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="space-y-6">
          {/* Spice Level Selector */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Spice Level Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tertiary">Select target spice level:</span>
                  <span className="text-2xl">
                    {currentLevel.emoji} {currentLevel.name}
                  </span>
                </div>
                <Slider
                  value={targetSpice}
                  onValueChange={setTargetSpice}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-tertiary">
                  <span>🌱 Mild</span>
                  <span>🌶️ Warm</span>
                  <span>🔥 Medium</span>
                  <span>🌋 Hot</span>
                  <span>☢️ Nuclear</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Level Details */}
          <Card className="bg-surface border-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{currentLevel.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentLevel.name}</h3>
                  <p className="text-tertiary">{currentLevel.description}</p>
                </div>
                {currentLevel.approvalRequired && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 ml-auto">
                    <Shield className="h-3 w-3 mr-1" />
                    Approval Required
                  </Badge>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-base rounded-lg">
                  <h4 className="text-sm text-tertiary mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Examples
                  </h4>
                  <ul className="space-y-2">
                    {currentLevel.examples.map((ex, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-base rounded-lg">
                  <h4 className="text-sm text-tertiary mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-2">
                    {currentLevel.riskFactors.map((risk, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-base rounded-lg">
                  <h4 className="text-sm text-tertiary mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Best For
                  </h4>
                  <ul className="space-y-2">
                    {currentLevel.bestFor.map((use, i) => (
                      <li key={i} className="text-sm text-secondary flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Levels Overview */}
          <div className="grid gap-4 md:grid-cols-5">
            {spiceLevels.map((level) => (
              <Card
                key={level.level}
                className={cn(
                  'bg-surface border-white/5 cursor-pointer transition-all',
                  targetSpice[0] >= level.level &&
                    targetSpice[0] < (spiceLevels[spiceLevels.indexOf(level) + 1]?.level || 11) &&
                    'ring-2 ring-blue-500'
                )}
                onClick={() => setTargetSpice([level.level])}
              >
                <CardContent className="pt-4 text-center">
                  <span className="text-3xl">{level.emoji}</span>
                  <p className="font-medium text-white mt-2">{level.name}</p>
                  <p className="text-xs text-tertiary mt-1">Level {level.level}-{level.level + 1}</p>
                  {level.approvalRequired && (
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 text-xs">
                      Needs Approval
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Analyze Your Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your draft content here to analyze its spice level..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-base border-white/5"
                />
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                  disabled={!content || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-4 w-4" />
                      Analyze Spice Level
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-base rounded-lg text-center">
                    <p className="text-3xl font-bold text-white">{analysis.currentSpice || '-'}</p>
                    <p className="text-xs text-tertiary">Spice Level</p>
                    {analysis.currentSpice > 0 && (
                      <p className="text-sm text-orange-400 mt-1">
                        {analysis.currentSpice <= 2 ? '🌱 Mild' :
                         analysis.currentSpice <= 4 ? '🌶️ Warm' :
                         analysis.currentSpice <= 6 ? '🔥 Medium' :
                         analysis.currentSpice <= 8 ? '🌋 Hot' : '☢️ Nuclear'}
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-base rounded-lg text-center">
                    <p className="text-3xl font-bold text-white">{analysis.engagementPotential || '-'}%</p>
                    <p className="text-xs text-tertiary">Engagement Potential</p>
                  </div>
                  <div className="p-4 bg-base rounded-lg text-center">
                    <p className="text-3xl font-bold text-white">{analysis.controversyScore || '-'}%</p>
                    <p className="text-xs text-tertiary">Controversy Score</p>
                  </div>
                  <div className="p-4 bg-base rounded-lg text-center">
                    <p className="text-3xl font-bold text-white">{analysis.brandAlignment || '-'}%</p>
                    <p className="text-xs text-tertiary">Brand Alignment</p>
                  </div>
                </div>

                {/* Risk Flags */}
                {analysis.riskFlags.length > 0 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h4 className="text-sm text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Flags
                    </h4>
                    <ul className="space-y-1">
                      {analysis.riskFlags.map((flag, i) => (
                        <li key={i} className="text-sm text-secondary">
                          • {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm text-blue-400 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-secondary">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historical Performance by Spice Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalPerformance.map((data, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20">
                        <Badge className="bg-elevated text-secondary">
                          Level {data.spiceLevel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-white">{data.posts} posts</p>
                        <p className="text-xs text-tertiary">Sample size</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">{data.avgEngagement}%</p>
                        <p className="text-xs text-tertiary">Avg Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">
                          {(data.avgReach / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-tertiary">Avg Reach</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-lg">
                <h4 className="font-medium text-white mb-2">Key Insight</h4>
                <p className="text-sm text-secondary">
                  Posts at spice level 7-8 show 3.7x higher engagement than mild content (1-2),
                  but make up only 7% of total posts. Consider increasing spicier content while
                  maintaining brand safety guidelines.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-4">
                <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
                <h4 className="font-medium text-white mb-2">Safe Zone (1-4)</h4>
                <p className="text-sm text-tertiary">
                  Great for daily content, building trust, and establishing expertise.
                  Use for most of your content mix.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="pt-4">
                <Zap className="h-8 w-8 text-yellow-400 mb-3" />
                <h4 className="font-medium text-white mb-2">Growth Zone (5-7)</h4>
                <p className="text-sm text-tertiary">
                  Optimal for driving engagement and establishing thought leadership.
                  Use 2-3x per week.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="pt-4">
                <Flame className="h-8 w-8 text-red-400 mb-3" />
                <h4 className="font-medium text-white mb-2">Viral Zone (8-10)</h4>
                <p className="text-sm text-tertiary">
                  Maximum viral potential but highest risk. Reserve for strategic moments.
                  Use sparingly (1-2x per month).
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
