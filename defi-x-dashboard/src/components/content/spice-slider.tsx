'use client';

import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface SpiceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const spiceLevels = [
  { level: 1, label: 'Safe', description: 'Corporate-friendly, no controversy', color: 'bg-green-500' },
  { level: 2, label: 'Mild', description: 'Light opinions, low risk', color: 'bg-green-400' },
  { level: 3, label: 'Warm', description: 'Clear stance, still safe', color: 'bg-lime-400' },
  { level: 4, label: 'Medium', description: 'Opinionated, mild controversy', color: 'bg-yellow-400' },
  { level: 5, label: 'Spicy', description: 'Hot takes, some pushback expected', color: 'bg-yellow-500' },
  { level: 6, label: 'Hot', description: 'Divisive, will spark debate', color: 'bg-orange-400' },
  { level: 7, label: 'Very Hot', description: 'Controversial, high engagement risk', color: 'bg-orange-500' },
  { level: 8, label: 'Fire', description: 'Maximum controversy, use carefully', color: 'bg-red-400' },
  { level: 9, label: 'Inferno', description: 'Extremely divisive, brand risk', color: 'bg-red-500' },
  { level: 10, label: 'Nuclear', description: 'Maximum heat, rarely appropriate', color: 'bg-red-600' },
];

export function SpiceSlider({ value, onChange }: SpiceSliderProps) {
  const currentLevel = spiceLevels[value - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">
          Spice Level
        </label>
        <div className="flex items-center gap-2">
          <Flame className={cn('h-4 w-4', value >= 7 ? 'text-red-400' : value >= 4 ? 'text-orange-400' : 'text-green-400')} />
          <span className="text-sm font-medium text-white">
            {currentLevel.label} ({value}/10)
          </span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-zinc-600"
        />
        {/* Colored track overlay */}
        <div
          className={cn(
            'absolute top-0 left-0 h-2 rounded-full pointer-events-none',
            currentLevel.color
          )}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>

      {/* Level indicators */}
      <div className="flex justify-between px-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              'w-6 h-6 rounded-full text-xs font-medium transition-all',
              value === level
                ? cn(spiceLevels[level - 1].color, 'text-white')
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-500">
        {currentLevel.description}
      </p>
    </div>
  );
}
