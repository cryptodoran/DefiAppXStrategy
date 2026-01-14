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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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

// Parse thread content into individual posts
function parseThreadContent(content: string): string[] {
  const posts: string[] = [];

  // Remove "Thread:" header if present
  let cleanContent = content.replace(/^thread:\s*/i, '').trim();

  // Try to split by numbered pattern (1/, 2/, etc.)
  const numberedPattern = /(?:^|\n)\s*(\d+)\/\s*/g;
  const matches = [...cleanContent.matchAll(numberedPattern)];

  if (matches.length >= 2) {
    // Split by numbered posts
    for (let i = 0; i < matches.length; i++) {
      const startIndex = matches[i].index! + matches[i][0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : cleanContent.length;
      const postContent = cleanContent.slice(startIndex, endIndex).trim();
      if (postContent) {
        posts.push(postContent);
      }
    }
  } else {
    // Try splitting by double newlines or paragraph breaks
    const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length >= 2) {
      posts.push(...paragraphs.map(p => p.trim()));
    } else {
      // Just use the whole content as one post
      posts.push(cleanContent);
    }
  }

  return posts.length > 0 ? posts : [content];
}

export function ProactiveSuggestions() {
  const router = useRouter();
  const [suggestions, setSuggestions] = React.useState<ProactiveSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [isDemo, setIsDemo] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { addToast } = useToast();

  const fetchSuggestions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch only 3 suggestions for faster loading
      const response = await fetch('/api/suggestions/proactive?count=3');
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setIsDemo(data._demo === true);
      setDismissedIds(new Set());
      setCurrentIndex(0);
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

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < visibleSuggestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsExpanded(false);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsExpanded(false);
    }
  };

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

      {/* Content - Compact Single Card View */}
      <div className="p-4">
        {isLoading && suggestions.length === 0 ? (
          <div className="animate-pulse p-4 rounded-lg bg-elevated">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 bg-surface rounded" />
              <div className="h-5 w-12 bg-surface rounded" />
            </div>
            <div className="h-4 bg-surface rounded w-full mb-2" />
            <div className="h-4 bg-surface rounded w-4/5" />
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-tertiary opacity-50" />
            <p className="text-tertiary text-sm">No suggestions available</p>
            <PremiumButton
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={fetchSuggestions}
            >
              Generate New
            </PremiumButton>
          </div>
        ) : (
          <div>
            {/* Current Suggestion Card */}
            {visibleSuggestions[currentIndex] && (() => {
              const suggestion = visibleSuggestions[currentIndex];
              const voiceIndicator = getVoiceMatchIndicator(suggestion.voiceMatchScore);

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-elevated border border-white/5"
                >
                  {/* Top Row - Badges & Navigation */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                        ENGAGEMENT_COLORS[suggestion.predictedEngagement]
                      )}>
                        {suggestion.predictedEngagement === 'viral' && <Zap className="h-3 w-3 inline mr-1" />}
                        {suggestion.predictedEngagement}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        voiceIndicator.bg,
                        voiceIndicator.color
                      )}>
                        {suggestion.voiceMatchScore}% match
                      </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-tertiary">
                        {currentIndex + 1} of {visibleSuggestions.length}
                      </span>
                      <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="p-1 rounded hover:bg-white/5 text-tertiary hover:text-secondary disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={currentIndex === visibleSuggestions.length - 1}
                        className="p-1 rounded hover:bg-white/5 text-tertiary hover:text-secondary disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content - Truncated by default */}
                  <p className={cn(
                    'text-primary whitespace-pre-wrap leading-relaxed',
                    !isExpanded && 'line-clamp-3'
                  )}>
                    {suggestion.content}
                  </p>

                  {/* Expand/Collapse Button */}
                  {suggestion.content.length > 150 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show more
                        </>
                      )}
                    </button>
                  )}

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {/* Based On */}
                        {suggestion.basedOn && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-tertiary">
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

                        {/* Relevance */}
                        <p className="text-xs text-tertiary italic mt-2">
                          {suggestion.relevanceReason}
                        </p>

                        {/* Image Suggestion */}
                        {suggestion.imageSuggestion && (
                          <div className="p-2 rounded bg-surface mt-3">
                            <div className="flex items-center gap-2 text-xs text-tertiary">
                              <Image className="h-3 w-3" />
                              <span className="capitalize">{suggestion.imageSuggestion.type}:</span>
                              <span className="text-secondary">{suggestion.imageSuggestion.description}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions - Always visible */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <PremiumButton
                      size="sm"
                      variant="primary"
                      leftIcon={copiedId === suggestion.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      onClick={() => copyToClipboard(suggestion.content, suggestion.id)}
                    >
                      {copiedId === suggestion.id ? 'Copied!' : 'Copy'}
                    </PremiumButton>

                    <PremiumButton
                      size="sm"
                      variant="secondary"
                      leftIcon={<Edit3 className="h-4 w-4" />}
                      onClick={() => {
                        const isThread = /\d+\//.test(suggestion.content) ||
                                        suggestion.content.toLowerCase().startsWith('thread:') ||
                                        suggestion.content.toLowerCase().includes('\nthread:');

                        if (isThread) {
                          const threadPosts = parseThreadContent(suggestion.content);
                          sessionStorage.setItem('editThreadPosts', JSON.stringify(threadPosts));
                          sessionStorage.removeItem('editTweetContent');
                          router.push('/create?tab=thread');
                          addToast({
                            type: 'success',
                            title: 'Opening Thread Builder',
                            description: `Thread with ${threadPosts.length} posts loaded`,
                          });
                        } else {
                          sessionStorage.setItem('editTweetContent', suggestion.content);
                          sessionStorage.removeItem('editThreadPosts');
                          if (suggestion.imageSuggestion) {
                            sessionStorage.setItem('editTweetImagePrompt', suggestion.imageSuggestion.prompt);
                          }
                          router.push('/create');
                          addToast({
                            type: 'success',
                            title: 'Opening editor',
                            description: 'Tweet loaded for editing',
                          });
                        }
                      }}
                    >
                      Edit
                    </PremiumButton>

                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="ml-auto p-2 rounded hover:bg-white/5 text-tertiary hover:text-secondary transition-colors"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
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
