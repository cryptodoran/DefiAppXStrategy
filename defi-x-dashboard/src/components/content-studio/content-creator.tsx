'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { PremiumBadge, MarketMoodBadge } from '@/components/ui/premium-badge';
import { Sparkline } from '@/components/ui/sparkline';
import {
  Sparkles,
  Wand2,
  Flame,
  Scissors,
  ArrowUp,
  Eye,
  Clock,
  TrendingUp,
  Send,
  Calendar,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface QualityScore {
  overall: number;
  breakdown: {
    hook: number;
    value: number;
    originality: number;
    voice: number;
  };
  issues: QualityIssue[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface QualityIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion: string;
}

interface MarketContextData {
  btcPrice: number;
  btcChange: number;
  ethPrice: number;
  ethChange: number;
  mood: 'euphoria' | 'bullish' | 'neutral' | 'bearish' | 'panic' | 'chaos';
  topTrend: string;
}

// Mock data
const mockMarketContext: MarketContextData = {
  btcPrice: 97842,
  btcChange: 2.34,
  ethPrice: 3456,
  ethChange: -0.87,
  mood: 'bullish',
  topTrend: '#ETH100K',
};

export function ContentCreator() {
  const [content, setContent] = React.useState('');
  const [qualityScore, setQualityScore] = React.useState<QualityScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Analyze content quality in real-time
  React.useEffect(() => {
    if (!content.trim()) {
      setQualityScore(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      // Simulate quality analysis
      const mockScore: QualityScore = analyzeContentQuality(content);
      setQualityScore(mockScore);
      setIsAnalyzing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B': return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
      case 'C': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'D': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-4">
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Create Post</h2>
            <div className="flex items-center gap-2">
              <PremiumButton size="sm" variant="ghost" leftIcon={<Calendar className="h-4 w-4" />}>
                Schedule
              </PremiumButton>
              <PremiumButton size="sm" variant="primary" leftIcon={<Send className="h-4 w-4" />}>
                Post Now
              </PremiumButton>
            </div>
          </div>

          {/* Textarea */}
          <PremiumTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Write something that adds value..."
            characterCount
            maxCharacters={280}
            className="min-h-[160px]"
          />

          {/* Quality Issues */}
          {qualityScore && qualityScore.issues.length > 0 && (
            <div className="mt-4 space-y-2">
              {qualityScore.issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-lg text-sm',
                    issue.severity === 'critical' && 'bg-red-500/10 text-red-400',
                    issue.severity === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                    issue.severity === 'info' && 'bg-blue-500/10 text-blue-400'
                  )}
                >
                  {issue.severity === 'critical' ? (
                    <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{issue.description}</p>
                    <p className="text-xs opacity-80 mt-0.5">{issue.suggestion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 p-4 rounded-lg bg-elevated border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-tertiary" />
              <span className="text-xs text-tertiary">Preview</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">DeFi App</span>
                  <span className="text-tertiary">@defiapp</span>
                </div>
                <p className="text-secondary mt-1 whitespace-pre-wrap">
                  {content || 'Your post will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Assistance Panel */}
      <div className="space-y-4">
        {/* Quality Score */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Quality Score</h3>
            {qualityScore && (
              <span className={cn(
                'px-2 py-1 rounded-lg border text-lg font-bold font-mono',
                getGradeColor(qualityScore.grade)
              )}>
                {qualityScore.grade}
              </span>
            )}
          </div>

          {qualityScore ? (
            <div className="space-y-4">
              {/* Overall score */}
              <div className="text-center">
                <motion.div
                  key={qualityScore.overall}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn('text-4xl font-bold font-mono', getScoreColor(qualityScore.overall))}
                >
                  {qualityScore.overall}
                </motion.div>
                <p className="text-xs text-tertiary mt-1">out of 100</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                {Object.entries(qualityScore.breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-secondary capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-elevated rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'h-full rounded-full',
                            value >= 75 ? 'bg-green-500' :
                              value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-tertiary w-8">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start typing to see quality analysis</p>
            </div>
          )}
        </PremiumCard>

        {/* Market Context */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary">Market Pulse</h3>
            <MarketMoodBadge mood={mockMarketContext.mood} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-tertiary">BTC</span>
                <span className="font-mono text-sm font-semibold text-primary">
                  ${(mockMarketContext.btcPrice / 1000).toFixed(1)}K
                </span>
              </div>
              <span className={cn(
                'text-xs font-medium',
                mockMarketContext.btcChange >= 0 ? 'text-market-up' : 'text-market-down'
              )}>
                {mockMarketContext.btcChange >= 0 ? '+' : ''}{mockMarketContext.btcChange}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-tertiary">ETH</span>
                <span className="font-mono text-sm font-semibold text-primary">
                  ${(mockMarketContext.ethPrice / 1000).toFixed(1)}K
                </span>
              </div>
              <span className={cn(
                'text-xs font-medium',
                mockMarketContext.ethChange >= 0 ? 'text-market-up' : 'text-market-down'
              )}>
                {mockMarketContext.ethChange >= 0 ? '+' : ''}{mockMarketContext.ethChange}%
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-sm text-tertiary">Top Trend</span>
              <span className="text-sm font-medium text-violet-400">{mockMarketContext.topTrend}</span>
            </div>
          </div>
        </PremiumCard>

        {/* Quick Actions */}
        <PremiumCard>
          <h3 className="font-semibold text-primary mb-3">AI Assist</h3>
          <div className="grid grid-cols-2 gap-2">
            <AssistButton icon={<Flame className="h-4 w-4" />} label="Make Spicier" />
            <AssistButton icon={<ArrowUp className="h-4 w-4" />} label="Add Context" />
            <AssistButton icon={<Scissors className="h-4 w-4" />} label="Shorten" />
            <AssistButton icon={<Wand2 className="h-4 w-4" />} label="Suggest Hook" />
          </div>
          <button className="w-full mt-3 p-2.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-colors flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate 3 Variations
          </button>
        </PremiumCard>
      </div>
    </div>
  );
}

function AssistButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm">
      {icon}
      {label}
    </button>
  );
}

// Mock quality analysis function
function analyzeContentQuality(content: string): QualityScore {
  const issues: QualityIssue[] = [];
  let hookScore = 70;
  let valueScore = 70;
  let originalityScore = 70;
  let voiceScore = 80;

  // Check for generic phrases
  const genericPhrases = ['game changer', 'revolutionary', 'exciting news', 'stay tuned'];
  for (const phrase of genericPhrases) {
    if (content.toLowerCase().includes(phrase)) {
      issues.push({
        type: 'generic',
        severity: 'critical',
        description: `Generic phrase detected: "${phrase}"`,
        suggestion: 'Replace with specific, concrete language',
      });
      originalityScore -= 20;
    }
  }

  // Check emoji count
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount > 2) {
    issues.push({
      type: 'emoji-overload',
      severity: 'warning',
      description: `Too many emojis (${emojiCount}). Max: 2`,
      suggestion: 'Quality content speaks for itself',
    });
    voiceScore -= 10;
  }

  // Check for hollow enthusiasm
  if (/^(Wow|Amazing|Incredible)!?\s/i.test(content)) {
    issues.push({
      type: 'hollow-enthusiasm',
      severity: 'warning',
      description: 'Content starts with hollow enthusiasm',
      suggestion: 'Lead with value or insight instead',
    });
    hookScore -= 15;
  }

  // Boost for good patterns
  if (/\d+%|\$[\d,]+/.test(content)) {
    valueScore += 10;
  }

  if (content.length > 100 && content.length < 250) {
    hookScore += 5;
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  hookScore = clamp(hookScore);
  valueScore = clamp(valueScore);
  originalityScore = clamp(originalityScore);
  voiceScore = clamp(voiceScore);

  const overall = Math.round(
    hookScore * 0.25 + valueScore * 0.3 + originalityScore * 0.25 + voiceScore * 0.2
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall,
    breakdown: { hook: hookScore, value: valueScore, originality: originalityScore, voice: voiceScore },
    issues,
    grade,
  };
}
