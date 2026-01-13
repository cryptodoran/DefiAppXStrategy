'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  X,
  Loader2,
  TrendingUp,
  Zap,
  Image,
  ExternalLink,
  Shuffle,
} from 'lucide-react';

interface ProactiveSuggestion {
  id: string;
  content: string;
  relevanceReason: string;
  basedOn?: {
    type: 'viral_tweet' | 'trending_topic' | 'market_move' | 'news';
    source: string;
    link?: string;
  };
  imageSuggestion: {
    type: 'meme' | 'chart' | 'infographic' | 'screenshot' | 'custom';
    description: string;
    prompt: string;
  };
  predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
  voiceMatchScore: number;
}

const ENGAGEMENT_COLORS = {
  low: 'text-gray-400 bg-gray-500/10',
  medium: 'text-blue-400 bg-blue-500/10',
  high: 'text-green-400 bg-green-500/10',
  viral: 'text-violet-400 bg-violet-500/10',
};

const TYPE_LABELS = {
  viral_tweet: 'Viral Tweet',
  trending_topic: 'Trending',
  market_move: 'Market Move',
  news: 'News',
};

export function ProactiveSuggestions() {
  const router = useRouter();
  const [suggestions, setSuggestions] = React.useState<ProactiveSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [isDemo, setIsDemo] = React.useState(false);
  const { addToast } = useToast();

  const fetchSuggestions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suggestions/proactive?count=5');
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setIsDemo(data._demo === true);
      setDismissedIds(new Set());
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      addToast({
        type: 'error',
        title: 'Failed to load suggestions',
        description: 'Please try refreshing',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    addToast({
      type: 'success',
      title: 'Copied to clipboard!',
      description: 'Ready to paste on X',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dismissSuggestion = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getVoiceMatchIndicator = (score: number) => {
    if (score >= 90) return { color: 'text-green-400', bg: 'bg-green-500/10' };
    if (score >= 80) return { color: 'text-green-400', bg: 'bg-green-500/10' };
    if (score >= 70) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const visibleSuggestions = suggestions.filter(s => !dismissedIds.has(s.id));

  return (
    <PremiumCard className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h2 className="font-semibold text-primary">Ready to Post</h2>
          {isDemo && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">
              Demo Mode
            </span>
          )}
        </div>
        <PremiumButton
          size="sm"
          variant="secondary"
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          onClick={fetchSuggestions}
          disabled={isLoading}
        >
          Refresh
        </PremiumButton>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading && suggestions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-16 bg-surface rounded" />
                  <div className="h-5 w-12 bg-surface rounded" />
                </div>
                <div className="h-4 bg-surface rounded w-full mb-2" />
                <div className="h-4 bg-surface rounded w-4/5 mb-2" />
                <div className="h-4 bg-surface rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-tertiary opacity-50" />
            <p className="text-tertiary">No suggestions available</p>
            <PremiumButton
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={fetchSuggestions}
            >
              Generate New Suggestions
            </PremiumButton>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {visibleSuggestions.map((suggestion, index) => {
                const voiceIndicator = getVoiceMatchIndicator(suggestion.voiceMatchScore);

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-elevated border border-white/5 hover:border-white/10 transition-colors"
                  >
                    {/* Top Row - Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {/* Engagement Badge */}
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                          ENGAGEMENT_COLORS[suggestion.predictedEngagement]
                        )}>
                          {suggestion.predictedEngagement === 'viral' && <Zap className="h-3 w-3 inline mr-1" />}
                          {suggestion.predictedEngagement}
                        </span>

                        {/* Voice Match */}
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs',
                          voiceIndicator.bg,
                          voiceIndicator.color
                        )}>
                          {suggestion.voiceMatchScore}% match
                        </span>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="p-1 rounded hover:bg-white/5 text-tertiary hover:text-secondary transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Tweet Content */}
                    <p className="text-primary whitespace-pre-wrap mb-3 leading-relaxed">
                      {suggestion.content}
                    </p>

                    {/* Based On */}
                    {suggestion.basedOn && (
                      <div className="flex items-center gap-2 mb-3 text-xs text-tertiary">
                        <TrendingUp className="h-3 w-3" />
                        <span>Based on: {TYPE_LABELS[suggestion.basedOn.type]} - {suggestion.basedOn.source}</span>
                        {suggestion.basedOn.link && (
                          <a
                            href={suggestion.basedOn.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Relevance Reason */}
                    <p className="text-xs text-tertiary italic mb-3">
                      {suggestion.relevanceReason}
                    </p>

                    {/* Image Suggestion */}
                    {suggestion.imageSuggestion && (
                      <div className="p-2 rounded bg-surface mb-3">
                        <div className="flex items-center gap-2 text-xs text-tertiary">
                          <Image className="h-3 w-3" />
                          <span className="capitalize">{suggestion.imageSuggestion.type}:</span>
                          <span className="text-secondary">{suggestion.imageSuggestion.description}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <PremiumButton
                        size="sm"
                        variant="primary"
                        leftIcon={copiedId === suggestion.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                      >
                        {copiedId === suggestion.id ? 'Copied!' : 'Copy to Post'}
                      </PremiumButton>

                      <PremiumButton
                        size="sm"
                        variant="secondary"
                        leftIcon={<Edit3 className="h-4 w-4" />}
                        onClick={() => {
                          // Store content in sessionStorage for the create page to read
                          sessionStorage.setItem('editTweetContent', suggestion.content);
                          if (suggestion.imageSuggestion) {
                            sessionStorage.setItem('editTweetImagePrompt', suggestion.imageSuggestion.prompt);
                          }
                          router.push('/create');
                          addToast({
                            type: 'success',
                            title: 'Opening editor',
                            description: 'Tweet loaded for editing',
                          });
                        }}
                      >
                        Edit
                      </PremiumButton>

                      <PremiumButton
                        size="sm"
                        variant="ghost"
                        leftIcon={<Shuffle className="h-4 w-4" />}
                        onClick={() => {
                          // TODO: Generate variations
                          addToast({
                            type: 'info',
                            title: 'Coming soon',
                            description: 'Variations will be added',
                          });
                        }}
                      >
                        Variations
                      </PremiumButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {isDemo && (
        <div className="p-4 border-t border-white/5 bg-yellow-500/5">
          <p className="text-xs text-yellow-400">
            Add your ANTHROPIC_API_KEY to .env.local to enable AI-powered suggestions
          </p>
        </div>
      )}
    </PremiumCard>
  );
}
