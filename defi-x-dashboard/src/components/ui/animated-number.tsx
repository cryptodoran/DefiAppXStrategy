'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  format = (v) => v.toLocaleString(),
  className,
  duration = 0.5,
}: AnimatedNumberProps) {
  const spring = useSpring(value, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => format(Math.round(v)));
  const [displayValue, setDisplayValue] = useState(format(value));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on('change', (v) => setDisplayValue(v));
  }, [display]);

  return (
    <motion.span className={cn('font-mono tabular-nums', className)}>
      {displayValue}
    </motion.span>
  );
}

interface PriceChangeProps {
  value: number;
  previousValue: number;
  format?: (value: number) => string;
  className?: string;
}

export function PriceWithChange({
  value,
  previousValue,
  format = (v) => `$${v.toLocaleString()}`,
  className,
}: PriceChangeProps) {
  const change = value - previousValue;
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100) : 0;
  const isPositive = change >= 0;
  const [flash, setFlash] = useState<'green' | 'red' | null>(null);

  useEffect(() => {
    if (change !== 0) {
      setFlash(isPositive ? 'green' : 'red');
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [value, change, isPositive]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'font-mono tabular-nums text-lg font-bold transition-colors',
          flash === 'green' && 'flash-green',
          flash === 'red' && 'flash-red'
        )}
      >
        <AnimatedNumber value={value} format={format} />
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          isPositive ? 'text-market-up' : 'text-market-down'
        )}
      >
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </span>
    </div>
  );
}
