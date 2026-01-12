'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Mic, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface VoiceMatchIndicatorProps {
  score: number | null;
  isLoading?: boolean;
  className?: string;
  showSuggestions?: boolean;
  suggestions?: string[];
}

export function VoiceMatchIndicator({
  score,
  isLoading = false,
  className,
  showSuggestions = true,
  suggestions = [],
}: VoiceMatchIndicatorProps) {
  const getIndicatorConfig = (value: number) => {
    if (value >= 80) {
      return {
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Great voice match',
        indicator: 'green',
      };
    }
    if (value >= 50) {
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Could be improved',
        indicator: 'yellow',
      };
    }
    return {
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: <XCircle className="h-4 w-4" />,
      label: 'Needs work',
      indicator: 'red',
    };
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-tertiary" />
        <span className="text-sm text-tertiary">Analyzing voice...</span>
      </div>
    );
  }

  if (score === null) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated', className)}>
        <Mic className="h-4 w-4 text-tertiary" />
        <span className="text-sm text-tertiary">Voice match</span>
      </div>
    );
  }

  const config = getIndicatorConfig(score);

  return (
    <div className={cn('space-y-2', className)}>
      <motion.div
        key={score}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
          config.bg,
          config.border
        )}
      >
        <span className={cn('flex items-center gap-1.5', config.color)}>
          {config.icon}
          <span className="text-sm font-medium">{score}%</span>
        </span>
        <span className="text-sm text-secondary">{config.label}</span>

        {/* Traffic light indicator */}
        <div className="ml-auto flex items-center gap-1">
          <span className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors',
            config.indicator === 'red' ? 'bg-red-400' : 'bg-red-400/20'
          )} />
          <span className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors',
            config.indicator === 'yellow' ? 'bg-yellow-400' : 'bg-yellow-400/20'
          )} />
          <span className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors',
            config.indicator === 'green' ? 'bg-green-400' : 'bg-green-400/20'
          )} />
        </div>
      </motion.div>

      {/* Improvement suggestions */}
      <AnimatePresence>
        {showSuggestions && score < 80 && suggestions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 rounded-lg bg-elevated text-xs text-tertiary">
              <p className="font-medium mb-1">Tips to improve:</p>
              <ul className="space-y-0.5">
                {suggestions.slice(0, 3).map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-violet-400">-</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for inline use
export function VoiceMatchBadge({
  score,
  isLoading = false,
  className,
}: {
  score: number | null;
  isLoading?: boolean;
  className?: string;
}) {
  if (isLoading) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-elevated text-xs', className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }

  if (score === null) return null;

  const getConfig = (value: number) => {
    if (value >= 80) return { color: 'text-green-400 bg-green-500/10', dot: 'bg-green-400' };
    if (value >= 50) return { color: 'text-yellow-400 bg-yellow-500/10', dot: 'bg-yellow-400' };
    return { color: 'text-red-400 bg-red-500/10', dot: 'bg-red-400' };
  };

  const config = getConfig(score);

  return (
    <motion.span
      key={score}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        config.color,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {score}% voice
    </motion.span>
  );
}
