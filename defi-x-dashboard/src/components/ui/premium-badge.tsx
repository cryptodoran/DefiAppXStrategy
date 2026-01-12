'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'live' | 'hot' | 'rising' | 'alert';

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-elevated text-secondary border-white/10',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  live: 'bg-green-500/10 text-green-400 border-green-500/20',
  hot: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  rising: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  alert: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const sizeStyles = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

export function PremiumBadge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  icon,
  className,
}: PremiumBadgeProps) {
  const showPulse = pulse || variant === 'live' || variant === 'hot' || variant === 'alert';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium uppercase tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {showPulse && (
        <motion.span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'live' && 'bg-green-400',
            variant === 'hot' && 'bg-orange-400',
            variant === 'alert' && 'bg-red-400',
            variant === 'rising' && 'bg-violet-400',
            !['live', 'hot', 'alert', 'rising'].includes(variant) && 'bg-current'
          )}
          animate={{
            opacity: [1, 0.4, 1],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

// Status indicator with live updates
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'syncing' | 'error';
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online' },
    offline: { color: 'bg-gray-500', text: 'Offline' },
    syncing: { color: 'bg-yellow-500', text: 'Syncing' },
    error: { color: 'bg-red-500', text: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.color)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', config.color)} />
      </span>
      <span className="text-xs text-tertiary">{label || config.text}</span>
    </div>
  );
}

// Trend badge with direction
interface TrendBadgeProps {
  value: number;
  format?: 'percent' | 'number';
  className?: string;
}

export function TrendBadge({ value, format = 'percent', className }: TrendBadgeProps) {
  const isPositive = value >= 0;
  const displayValue = format === 'percent'
    ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
    : `${isPositive ? '+' : ''}${value.toLocaleString()}`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium font-mono',
        isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400',
        className
      )}
    >
      <svg
        className={cn('h-3 w-3', !isPositive && 'rotate-180')}
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9V3M6 3L3 6M6 3L9 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {displayValue}
    </span>
  );
}

// Urgency badges for opportunities
type UrgencyLevel = 'alert' | 'hot' | 'rising' | 'normal';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const config: Record<UrgencyLevel, { label: string; variant: BadgeVariant }> = {
    alert: { label: 'ALERT', variant: 'alert' },
    hot: { label: 'HOT', variant: 'hot' },
    rising: { label: 'RISING', variant: 'rising' },
    normal: { label: 'NEW', variant: 'default' },
  };

  const { label, variant } = config[level];

  return (
    <PremiumBadge variant={variant} size="sm" pulse className={className}>
      {label}
    </PremiumBadge>
  );
}

// Market mood badge
type MarketMood = 'euphoria' | 'bullish' | 'neutral' | 'bearish' | 'panic' | 'chaos';

interface MarketMoodBadgeProps {
  mood: MarketMood;
  className?: string;
}

export function MarketMoodBadge({ mood, className }: MarketMoodBadgeProps) {
  const config: Record<MarketMood, { label: string; variant: BadgeVariant; emoji: string }> = {
    euphoria: { label: 'EUPHORIA', variant: 'success', emoji: '🚀' },
    bullish: { label: 'BULLISH', variant: 'success', emoji: '📈' },
    neutral: { label: 'NEUTRAL', variant: 'default', emoji: '➡️' },
    bearish: { label: 'BEARISH', variant: 'warning', emoji: '📉' },
    panic: { label: 'PANIC', variant: 'danger', emoji: '🔥' },
    chaos: { label: 'CHAOS', variant: 'alert', emoji: '⚡' },
  };

  const { label, variant } = config[mood];

  return (
    <PremiumBadge variant={variant} size="md" pulse={mood === 'chaos' || mood === 'panic'} className={className}>
      {label}
    </PremiumBadge>
  );
}
