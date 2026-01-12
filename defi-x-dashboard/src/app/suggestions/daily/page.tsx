'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  TrendingUp,
  Calendar,
  Sparkles,
  Check,
  X,
  Clock,
  Bookmark,
  Edit,
  Flame,
} from 'lucide-react';

// Mock suggestions
const suggestions = [
  {
    id: '1',
    content: 'Thread idea: "5 DeFi trends that will define 2026" - high engagement potential based on similar content performance',
    type: 'TRENDING',
    predictedScore: 85,
    optimalTime: '2:00 PM EST',
    source: 'Trending analysis',
    spiceLevel: 4,
    status: 'pending',
  },
  {
    id: '2',
    content: 'New feature announcement: Highlight the gas optimization update - your audience loves technical deep-dives',
    type: 'PRODUCT_UPDATE',
    predictedScore: 78,
    optimalTime: '10:00 AM EST',
    source: 'Product roadmap',
    spiceLevel: 2,
    status: 'pending',
  },
  {
    id: '3',
    content: 'Hot take opportunity: The SEC ruling today - take a stance on DeFi regulation. Historical similar posts did 3x better',
    type: 'TRENDING',
    predictedScore: 92,
    optimalTime: 'ASAP',
    source: 'Breaking news',
    spiceLevel: 7,
    status: 'pending',
  },
  {
    id: '4',
    content: 'Educational thread: "How to evaluate DeFi protocols" - your educational content consistently outperforms',
    type: 'HISTORICAL_PATTERN',
    predictedScore: 81,
    optimalTime: '4:00 PM EST',
    source: 'Pattern analysis',
    spiceLevel: 3,
    status: 'pending',
  },
  {
    id: '5',
    content: 'Competitor gap: None of the top 10 DeFi accounts are covering the new L2 launch today - first mover advantage',
    type: 'COMPETITOR_GAP',
    predictedScore: 88,
    optimalTime: '12:00 PM EST',
    source: 'Competitor analysis',
    spiceLevel: 5,
    status: 'pending',
  },
];

export default function DailySuggestionsPage() {
  const [items, setItems] = useState(suggestions);

  const updateStatus = (id: string, status: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRENDING':
        return <TrendingUp className="h-4 w-4" />;
      case 'PRODUCT_UPDATE':
        return <Sparkles className="h-4 w-4" />;
      case 'HISTORICAL_PATTERN':
        return <Clock className="h-4 w-4" />;
      case 'COMPETITOR_GAP':
        return <Lightbulb className="h-4 w-4" />;
      case 'CALENDAR_EVENT':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRENDING':
        return 'bg-orange-500/20 text-orange-400';
      case 'PRODUCT_UPDATE':
        return 'bg-blue-500/20 text-blue-400';
      case 'HISTORICAL_PATTERN':
        return 'bg-purple-500/20 text-purple-400';
      case 'COMPETITOR_GAP':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-white/5 text-tertiary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const pendingSuggestions = items.filter((item) => item.status === 'pending');
  const approvedSuggestions = items.filter((item) => item.status === 'approved');
  const savedSuggestions = items.filter((item) => item.status === 'saved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Recommendations</h1>
          <p className="text-tertiary">
            AI-powered content suggestions based on trends and patterns
          </p>
        </div>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate More
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Today&apos;s Suggestions</p>
            <p className="text-2xl font-bold text-white">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingSuggestions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Approved</p>
            <p className="text-2xl font-bold text-green-400">{approvedSuggestions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Avg. Predicted Score</p>
            <p className="text-2xl font-bold text-blue-400">
              {Math.round(items.reduce((acc, item) => acc + item.predictedScore, 0) / items.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {pendingSuggestions.map((suggestion) => (
          <Card key={suggestion.id} className="bg-surface border-white/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {/* Type indicator */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    getTypeColor(suggestion.type)
                  )}
                >
                  {getTypeIcon(suggestion.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary">{suggestion.content}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge className={getTypeColor(suggestion.type)}>
                      {suggestion.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-tertiary">
                      Source: {suggestion.source}
                    </span>
                    <span className="text-xs text-tertiary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Best time: {suggestion.optimalTime}
                    </span>
                    <span className="text-xs text-tertiary flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      Spice: {suggestion.spiceLevel}/10
                    </span>
                  </div>
                </div>

                {/* Score and Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className={cn('text-xl font-bold', getScoreColor(suggestion.predictedScore))}>
                      {suggestion.predictedScore}
                    </p>
                    <p className="text-xs text-tertiary">Predicted</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(suggestion.id, 'approved')}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(suggestion.id, 'saved')}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-tertiary hover:text-secondary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(suggestion.id, 'dismissed')}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingSuggestions.length === 0 && (
        <Card className="bg-surface border-white/5">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
            <p className="text-sm text-tertiary">
              You&apos;ve reviewed all suggestions for today. Check back later for more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
