'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  className,
  strokeWidth = 1.5,
  showArea = true,
}: SparklineProps) {
  const { path, areaPath, isPositive } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', isPositive: true };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const isPositive = data[data.length - 1] >= data[0];

    return { path, areaPath, isPositive };
  }, [data, width, height]);

  const color = isPositive ? 'var(--market-up)' : 'var(--market-down)';
  const gradientId = useMemo(() => `sparkline-${Math.random().toString(36).slice(2)}`, []);

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
