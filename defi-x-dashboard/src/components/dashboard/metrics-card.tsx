'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'percent' | 'currency';
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  trend,
  format = 'number',
}: MetricsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'percent':
        return `${val.toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
        }).format(val);
      default:
        return new Intl.NumberFormat('en-US', {
          notation: val >= 10000 ? 'compact' : 'standard',
        }).format(val);
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) {
      return <TrendingUp className="h-4 w-4" />;
    }
    if (trend === 'down' || (change !== undefined && change < 0)) {
      return <TrendingDown className="h-4 w-4" />;
    }
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) {
      return 'text-green-400';
    }
    if (trend === 'down' || (change !== undefined && change < 0)) {
      return 'text-red-400';
    }
    return 'text-tertiary';
  };

  return (
    <Card className={cn('bg-surface border-white/5', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-tertiary">
          {title}
        </CardTitle>
        {icon && <div className="text-tertiary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm mt-1', getTrendColor())}>
            {getTrendIcon()}
            <span>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-tertiary ml-1">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
