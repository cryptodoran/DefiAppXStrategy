'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlgorithmInsight {
  id: string;
  factorName: string;
  currentUnderstanding: string;
  confidenceLevel: number;
  category: string;
  impactRating: number | null;
}

interface AlgorithmPanelProps {
  insights: AlgorithmInsight[];
  healthScore: number;
}

export function AlgorithmPanel({ insights, healthScore }: AlgorithmPanelProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-500/5';
    if (score >= 40) return 'from-orange-500/20 to-orange-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High', variant: 'default' as const };
    if (confidence >= 0.5) return { label: 'Medium', variant: 'secondary' as const };
    return { label: 'Low', variant: 'outline' as const };
  };

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

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-yellow-400" />
            Algorithm Intelligence
          </CardTitle>
          <div
            className={cn(
              'rounded-lg bg-gradient-to-r px-4 py-2',
              getHealthBg(healthScore)
            )}
          >
            <span className="text-sm text-zinc-400">Health Score</span>
            <span className={cn('ml-2 text-lg font-bold', getHealthColor(healthScore))}>
              {healthScore}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.slice(0, 5).map((insight) => {
            const confidence = getConfidenceBadge(insight.confidenceLevel);
            return (
              <div
                key={insight.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-zinc-400">
                      {getCategoryIcon(insight.category)}
                    </div>
                    <h4 className="font-medium text-white">{insight.factorName}</h4>
                  </div>
                  <Badge variant={confidence.variant}>{confidence.label}</Badge>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {insight.currentUnderstanding}
                </p>
                {insight.impactRating !== null && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Impact:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 w-4 rounded-full',
                            i <= (insight.impactRating || 0)
                              ? 'bg-yellow-400'
                              : 'bg-zinc-700'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
