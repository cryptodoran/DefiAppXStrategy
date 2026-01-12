'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends HTMLMotionProps<'div'> {
  variant?: 'surface' | 'elevated' | 'glass';
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  surface: 'bg-surface border-white/5',
  elevated: 'bg-elevated border-white/8',
  glass: 'bg-elevated/50 backdrop-blur-xl border-white/10',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function PremiumCard({
  children,
  variant = 'surface',
  hover = true,
  glow = false,
  padding = 'md',
  className,
  ...props
}: PremiumCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl border',
        variantStyles[variant],
        paddingStyles[padding],
        glow && 'shadow-[0_0_30px_rgba(139,92,246,0.1)]',
        className
      )}
      whileHover={hover ? {
        y: -2,
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        transition: { duration: 0.15, ease: 'easeOut' }
      } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-elevated">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-primary">{title}</h3>
          {subtitle && (
            <p className="text-sm text-tertiary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Metric Card - specialized for dashboard metrics
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  sparkline?: number[];
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel = '24h',
  icon,
  sparkline,
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <PremiumCard className={cn('min-w-[200px]', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-tertiary font-medium">{label}</span>
        {icon && (
          <div className="text-tertiary">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <motion.p
            className="text-2xl font-bold font-mono text-primary"
            key={value}
            initial={{ opacity: 0.5, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <p
              className={cn(
                'text-sm font-medium mt-1',
                isPositive ? 'text-market-up' : 'text-market-down'
              )}
            >
              {isPositive ? '+' : ''}{change.toFixed(2)}% {changeLabel}
            </p>
          )}
        </div>

        {/* Mini sparkline placeholder */}
        {sparkline && (
          <div className="opacity-50">
            <svg width="60" height="24" viewBox="0 0 60 24">
              <path
                d={sparkline.map((val, i) => {
                  const x = (i / (sparkline.length - 1)) * 60;
                  const min = Math.min(...sparkline);
                  const max = Math.max(...sparkline);
                  const y = 24 - ((val - min) / (max - min || 1)) * 20 - 2;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke={isPositive ? 'var(--market-up)' : 'var(--market-down)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

// Stat Card - compact version for grids
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  className?: string;
}

export function StatCard({ label, value, change, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('p-3 rounded-lg bg-elevated/50', className)}>
      <p className="text-xs text-tertiary mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold font-mono text-primary">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-market-up' : 'text-market-down'
            )}
          >
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
