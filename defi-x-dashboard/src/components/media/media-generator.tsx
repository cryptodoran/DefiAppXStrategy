'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useToast } from '@/components/ui/toast';
import {
  Image,
  Sparkles,
  Copy,
  Check,
  Loader2,
  BarChart3,
  MessageSquare,
  Laugh,
  Smartphone,
  Palette,
  ExternalLink,
} from 'lucide-react';

interface MediaSuggestion {
  type: 'meme' | 'infographic' | 'chart' | 'screenshot' | 'custom';
  description: string;
  imagePrompt: string;
  reasoning: string;
}

interface MediaGeneratorProps {
  tweetContent: string;
  onPromptSelect?: (prompt: string) => void;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  meme: <Laugh className="h-4 w-4" />,
  infographic: <BarChart3 className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  screenshot: <Smartphone className="h-4 w-4" />,
  custom: <Palette className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  meme: 'text-yellow-400 bg-yellow-500/10',
  infographic: 'text-blue-400 bg-blue-500/10',
  chart: 'text-green-400 bg-green-500/10',
  screenshot: 'text-purple-400 bg-purple-500/10',
  custom: 'text-violet-400 bg-violet-500/10',
};

export function MediaGenerator({ tweetContent, onPromptSelect, className }: MediaGeneratorProps) {
  const [suggestions, setSuggestions] = React.useState<MediaSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const { addToast } = useToast();

  // Generate suggestions when content changes
  const generateSuggestions = React.useCallback(async () => {
    if (!tweetContent.trim() || tweetContent.length < 20) {
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/media/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tweetContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Media suggestion error:', error);
      addToast({
        type: 'error',
        title: 'Failed to generate suggestions',
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tweetContent, addToast]);

  const copyPrompt = async (prompt: string, index: number) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    addToast({
      type: 'success',
      title: 'Prompt copied!',
      description: 'Use this prompt with any image generator',
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectPrompt = (suggestion: MediaSuggestion, index: number) => {
    setSelectedIndex(index);
    if (onPromptSelect) {
      onPromptSelect(suggestion.imagePrompt);
    }
  };

  return (
    <PremiumCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-violet-400" />
          <h3 className="font-semibold text-primary">Media Suggestions</h3>
        </div>
        <PremiumButton
          size="sm"
          variant="secondary"
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          onClick={generateSuggestions}
          disabled={isLoading || tweetContent.length < 20}
        >
          {isLoading ? 'Generating...' : 'Suggest Media'}
        </PremiumButton>
      </div>

      {tweetContent.length < 20 && (
        <div className="text-center py-6 text-tertiary">
          <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Write at least 20 characters to get media suggestions</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-elevated">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface" />
                <div className="h-4 bg-surface rounded w-24" />
              </div>
              <div className="h-3 bg-surface rounded w-full mb-2" />
              <div className="h-3 bg-surface rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-lg border transition-colors cursor-pointer',
                  selectedIndex === index
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : 'bg-elevated border-white/5 hover:border-white/10'
                )}
                onClick={() => selectPrompt(suggestion, index)}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={cn('p-2 rounded-lg', TYPE_COLORS[suggestion.type])}>
                    {TYPE_ICONS[suggestion.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary capitalize">{suggestion.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(suggestion.imagePrompt, index);
                        }}
                        className="text-tertiary hover:text-secondary transition-colors"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-secondary mb-2">{suggestion.description}</p>

                    {/* Reasoning */}
                    <p className="text-xs text-tertiary italic">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      {suggestion.reasoning}
                    </p>

                    {/* Prompt Preview */}
                    <div className="mt-3 p-2 rounded bg-surface text-xs text-tertiary font-mono line-clamp-2">
                      {suggestion.imagePrompt}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-tertiary mb-3">
            Copy prompts and use them with:
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://midjourney.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              Midjourney <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://openai.com/dall-e-3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              DALL-E 3 <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://leonardo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              Leonardo.ai <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://stability.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              Stable Diffusion <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </PremiumCard>
  );
}
