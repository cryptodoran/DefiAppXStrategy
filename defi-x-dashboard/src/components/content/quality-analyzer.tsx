'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface QualityBreakdown {
  originality: number;
  valueDensity: number;
  engagementHooks: number;
  clarity: number;
  brandVoice: number;
}

interface QualityAnalyzerProps {
  score: number;
  breakdown: QualityBreakdown;
  warnings: string[];
  improvements: string[];
  isAnalyzing?: boolean;
}

export function QualityAnalyzer({
  score,
  breakdown,
  warnings,
  improvements,
  isAnalyzing,
}: QualityAnalyzerProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const breakdownItems = [
    { label: 'Originality', value: breakdown.originality, description: 'How unique and non-generic' },
    { label: 'Value Density', value: breakdown.valueDensity, description: 'Information per character' },
    { label: 'Engagement Hooks', value: breakdown.engagementHooks, description: 'Elements that drive interaction' },
    { label: 'Clarity', value: breakdown.clarity, description: 'Easy to understand' },
    { label: 'Brand Voice', value: breakdown.brandVoice, description: 'Alignment with DeFi App tone' },
  ];

  if (isAnalyzing) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500 mx-auto" />
            <p className="mt-4 text-sm text-zinc-400">Analyzing content quality...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Quality Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-950 p-4">
          <div>
            <p className="text-sm text-zinc-400">Overall Score</p>
            <p className={cn('text-3xl font-bold', getScoreColor(score))}>
              {score}
            </p>
            <p className="text-sm text-zinc-500">{getScoreLabel(score)}</p>
          </div>
          <div
            className={cn(
              'h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center',
              getScoreBg(score)
            )}
          >
            {score >= 60 ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-white" />
            )}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-300">Breakdown</h4>
          {breakdownItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">{item.label}</span>
                <span className={cn('font-medium', getScoreColor(item.value))}>
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', getScoreBg(item.value))}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm text-zinc-400 pl-6">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-blue-400">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </h4>
            <ul className="space-y-1">
              {improvements.map((improvement, i) => (
                <li key={i} className="text-sm text-zinc-400 pl-6">
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
