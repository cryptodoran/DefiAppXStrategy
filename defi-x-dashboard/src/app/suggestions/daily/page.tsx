'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

interface AISuggestion {
  id: string;
  type: string;
  content: string;
  topic: string;
  hook: string;
  score: number;
  reasoning: string;
  createdAt: string;
  status?: string;
  _mock?: boolean;
}

// Fetch AI suggestions
async function fetchSuggestions(): Promise<AISuggestion[]> {
  const response = await fetch('/api/content/suggestions');
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
}

export default function DailySuggestionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  // Fetch real AI suggestions
  const { data: suggestions, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['daily-suggestions'],
    queryFn: fetchSuggestions,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Regenerate suggestions
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/content/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: true }),
      });
      if (!response.ok) throw new Error('Failed to regenerate');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['daily-suggestions'], data);
      setLocalStatuses({});
      addToast({ type: 'success', title: 'Regenerated', description: 'New AI suggestions generated!' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', description: 'Failed to regenerate suggestions' });
    },
  });

  const updateStatus = (id: string, status: string) => {
    setLocalStatuses(prev => ({ ...prev, [id]: status }));
    addToast({
      type: status === 'approved' ? 'success' : 'info',
      title: status === 'approved' ? 'Approved' : status === 'saved' ? 'Saved' : 'Dismissed',
      description: `Suggestion ${status}`,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'thread':
      case 'thread idea':
        return <TrendingUp className="h-4 w-4" />;
      case 'single':
      case 'single tweet':
        return <Sparkles className="h-4 w-4" />;
      case 'qt':
      case 'quote tweet':
      case 'quote tweet angle':
        return <Clock className="h-4 w-4" />;
      case 'take':
        return <Flame className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'thread':
      case 'thread idea':
        return 'bg-purple-500/20 text-purple-400';
      case 'single':
      case 'single tweet':
        return 'bg-blue-500/20 text-blue-400';
      case 'qt':
      case 'quote tweet':
      case 'quote tweet angle':
        return 'bg-orange-500/20 text-orange-400';
      case 'take':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/5 text-tertiary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Merge local statuses with suggestions
  const items = suggestions?.map(s => ({
    ...s,
    status: localStatuses[s.id] || 'pending',
  })) || [];

  const pendingSuggestions = items.filter((item) => item.status === 'pending');
  const approvedSuggestions = items.filter((item) => item.status === 'approved');
  const savedSuggestions = items.filter((item) => item.status === 'saved');
  const isLive = suggestions && suggestions.length > 0 && !suggestions[0]._mock;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Daily Recommendations</h1>
            <span className="text-xs text-tertiary flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Generating AI suggestions...
            </span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-surface border-white/5 animate-pulse">
                <CardContent className="pt-4">
                  <div className="h-24 bg-elevated rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white">Daily Recommendations</h1>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load suggestions</p>
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
            <h1 className="text-2xl font-bold text-white">Daily Recommendations</h1>
            {isLive ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                AI Generated
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
                Sample Data
              </span>
            )}
          </div>
          <p className="text-tertiary">
            AI-powered content suggestions based on trends and patterns
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending}
        >
          {regenerateMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {regenerateMutation.isPending ? 'Generating...' : 'Generate More'}
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
              {items.length > 0 ? Math.round(items.reduce((acc, item) => acc + (item.score || 0), 0) / items.length) : 0}
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

                  {suggestion.hook && (
                    <p className="text-xs text-tertiary mt-2 italic">Hook: {suggestion.hook}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge className={getTypeColor(suggestion.type)}>
                      {suggestion.type}
                    </Badge>
                    {suggestion.topic && (
                      <span className="text-xs text-tertiary">
                        Topic: {suggestion.topic}
                      </span>
                    )}
                    {suggestion.reasoning && (
                      <span className="text-xs text-tertiary">
                        Why: {suggestion.reasoning.slice(0, 60)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Score and Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className={cn('text-xl font-bold', getScoreColor(suggestion.score || 0))}>
                      {suggestion.score || 0}
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
                      onClick={() => {
                        router.push('/create?topic=' + encodeURIComponent(suggestion.content));
                        addToast({ type: 'info', title: 'Opening editor', description: 'Loading suggestion in content studio...' });
                      }}
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
            <p className="text-sm text-tertiary mb-4">
              You&apos;ve reviewed all suggestions for today.
            </p>
            <Button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </AppLayout>
  );
}
