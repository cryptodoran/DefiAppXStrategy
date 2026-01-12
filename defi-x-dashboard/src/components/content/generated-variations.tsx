'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Copy, Sparkles, Flame, Brain, Laugh, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface GeneratedVariation {
  id: string;
  content: string;
  predictedScore: number;
  viralElements: string[];
  hookRating: number;
}

interface GeneratedVariationsProps {
  variations: GeneratedVariation[];
  selectedId: string | null;
  onSelect: (variation: GeneratedVariation) => void;
  onRefine: (id: string, refinement: string) => void;
}

const refinementOptions = [
  { id: 'spicier', label: 'Make it spicier', icon: Flame },
  { id: 'educational', label: 'Add education', icon: Brain },
  { id: 'humor', label: 'Add humor', icon: Laugh },
  { id: 'clarity', label: 'Improve clarity', icon: BookOpen },
];

const viralElementIcons: Record<string, React.ReactNode> = {
  controversy: <Flame className="h-3 w-3" />,
  humor: <Laugh className="h-3 w-3" />,
  educational: <Brain className="h-3 w-3" />,
  fomo: <Sparkles className="h-3 w-3" />,
};

export function GeneratedVariations({
  variations,
  selectedId,
  onSelect,
  onRefine,
}: GeneratedVariationsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Generated Variations</h3>

      {variations.map((variation, index) => (
        <Card
          key={variation.id}
          className={cn(
            'bg-zinc-900 border-zinc-800 cursor-pointer transition-all',
            selectedId === variation.id && 'ring-2 ring-blue-500 border-blue-500'
          )}
          onClick={() => onSelect(variation)}
        >
          <CardContent className="pt-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                  {index + 1}
                </span>
                <span className={cn('text-sm font-medium', getScoreColor(variation.predictedScore))}>
                  Score: {variation.predictedScore}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(variation.content, variation.id);
                  }}
                >
                  {copiedId === variation.id ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">
              {variation.content}
            </p>

            {/* Viral Elements */}
            <div className="flex flex-wrap gap-2 mt-3">
              {variation.viralElements.map((element) => (
                <Badge
                  key={element}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {viralElementIcons[element.toLowerCase()] || <Sparkles className="h-3 w-3" />}
                  {element}
                </Badge>
              ))}
            </div>

            {/* Hook Rating */}
            <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
              <span>Hook strength:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-3 rounded-full',
                      i <= variation.hookRating ? 'bg-yellow-400' : 'bg-zinc-700'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Quick Refinements */}
            {selectedId === variation.id && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-800">
                {refinementOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefine(variation.id, option.id);
                      }}
                      className="text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
