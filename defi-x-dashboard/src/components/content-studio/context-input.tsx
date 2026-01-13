'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import {
  Link2,
  FileText,
  Twitter,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export interface ContextSource {
  type: 'tweet' | 'docs' | 'blog' | 'text';
  content: string;
  url?: string;
  title?: string;
  fetchedContent?: string;
}

interface ContextInputProps {
  context: ContextSource[];
  onContextChange: (context: ContextSource[]) => void;
  className?: string;
}

export function ContextInput({ context, onContextChange, className }: ContextInputProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [inputType, setInputType] = React.useState<'tweet' | 'docs' | 'blog' | 'text'>('text');
  const [isFetching, setIsFetching] = React.useState(false);

  // Detect input type from content
  const detectInputType = (value: string): 'tweet' | 'docs' | 'blog' | 'text' => {
    if (value.includes('twitter.com') || value.includes('x.com')) {
      return 'tweet';
    }
    if (value.includes('docs.') || value.includes('/docs/') || value.includes('documentation')) {
      return 'docs';
    }
    if (value.includes('blog.') || value.includes('/blog/') || value.includes('medium.com') || value.includes('substack.com')) {
      return 'blog';
    }
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return 'docs'; // Default links to docs
    }
    return 'text';
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const detected = detectInputType(value);
    setInputType(detected);
  };

  const addContext = async () => {
    if (!inputValue.trim()) return;

    const type = detectInputType(inputValue);
    const isUrl = inputValue.startsWith('http://') || inputValue.startsWith('https://');

    let newSource: ContextSource = {
      type,
      content: inputValue,
      url: isUrl ? inputValue : undefined,
    };

    // If it's a URL, try to fetch content
    if (isUrl) {
      setIsFetching(true);
      try {
        const response = await fetch('/api/docs/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputValue }),
        });

        if (response.ok) {
          const data = await response.json();
          newSource.fetchedContent = data.content?.slice(0, 2000) || '';
          newSource.title = data.title || inputValue;
        }
      } catch (error) {
        console.error('Failed to fetch URL content:', error);
        // Still add the URL even if fetch fails
      }
      setIsFetching(false);
    }

    onContextChange([...context, newSource]);
    setInputValue('');
  };

  const removeContext = (index: number) => {
    onContextChange(context.filter((_, i) => i !== index));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tweet':
        return <Twitter className="h-3 w-3" />;
      case 'docs':
        return <FileText className="h-3 w-3" />;
      case 'blog':
        return <ExternalLink className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tweet':
        return 'text-blue-400 bg-blue-500/10';
      case 'docs':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'blog':
        return 'text-orange-400 bg-orange-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className={cn('', className)}>
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-surface border border-white/5 hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-secondary">
            Add Context
            {context.length > 0 && (
              <span className="ml-2 text-xs text-tertiary">
                ({context.length} source{context.length !== 1 ? 's' : ''})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {context.length > 0 && (
            <div className="flex -space-x-1">
              {context.slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  className={cn('p-1 rounded-full', getTypeColor(src.type))}
                >
                  {getTypeIcon(src.type)}
                </div>
              ))}
              {context.length > 3 && (
                <div className="p-1 rounded-full bg-white/10 text-tertiary text-[10px] w-5 h-5 flex items-center justify-center">
                  +{context.length - 3}
                </div>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-tertiary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-tertiary" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-2 p-3 rounded-lg bg-surface border border-white/5 space-y-3">
          <p className="text-xs text-tertiary">
            Add tweet links, doc URLs, or paste text to give AI full context
          </p>

          {/* Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addContext()}
                placeholder="Paste tweet URL, docs link, or text..."
                className="w-full px-3 py-2 pr-10 rounded-lg bg-elevated border border-white/5 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-violet-500/50"
              />
              {inputValue && (
                <div className={cn('absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded', getTypeColor(inputType))}>
                  {getTypeIcon(inputType)}
                </div>
              )}
            </div>
            <button
              onClick={addContext}
              disabled={!inputValue.trim() || isFetching}
              className="px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </button>
          </div>

          {/* Context List */}
          {context.length > 0 && (
            <div className="space-y-2">
              {context.map((src, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-elevated/50 group"
                >
                  <div className={cn('p-1.5 rounded', getTypeColor(src.type))}>
                    {getTypeIcon(src.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-secondary capitalize">
                        {src.type}
                      </span>
                      {src.fetchedContent && (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-tertiary truncate mt-0.5">
                      {src.title || src.content}
                    </p>
                    {src.fetchedContent && (
                      <p className="text-[10px] text-tertiary/70 line-clamp-2 mt-1">
                        {src.fetchedContent.slice(0, 150)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeContext(index)}
                    className="p-1 rounded text-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to format context for AI prompts
export function formatContextForAI(context: ContextSource[]): string {
  if (context.length === 0) return '';

  const sections = context.map((src, i) => {
    const header = `[${src.type.toUpperCase()} ${i + 1}]`;
    const url = src.url ? `URL: ${src.url}` : '';
    const content = src.fetchedContent || src.content;
    return `${header}\n${url}\n${content}`.trim();
  });

  return `\n\nCONTEXT PROVIDED BY USER:\n${sections.join('\n\n')}`;
}
