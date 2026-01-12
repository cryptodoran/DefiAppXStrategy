'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  error?: string;
  label?: string;
}

export function PremiumInput({
  className,
  leftIcon,
  rightIcon,
  onClear,
  error,
  label,
  id,
  ...props
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full h-10 bg-elevated border border-white/10 rounded-lg',
            'text-primary placeholder:text-tertiary text-sm',
            'transition-colors duration-150',
            'focus:outline-none focus:border-accent-base',
            leftIcon && 'pl-10',
            (rightIcon || onClear) && 'pr-10',
            !leftIcon && 'pl-4',
            !(rightIcon || onClear) && 'pr-4',
            error && 'border-red-500/50 focus:border-red-500',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Animated focus ring */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isFocused
              ? error
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                : '0 0 0 2px rgba(139, 92, 246, 0.2)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.15 }}
        />

        {onClear && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {rightIcon && !onClear && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
}

// Search input variant
interface SearchInputProps extends Omit<PremiumInputProps, 'leftIcon' | 'rightIcon'> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, className, ...props }: SearchInputProps) {
  const [value, setValue] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <PremiumInput
      leftIcon={<Search className="h-4 w-4" />}
      placeholder="Search..."
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClear={value ? handleClear : undefined}
      className={className}
      {...props}
    />
  );
}

// Textarea variant
interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  characterCount?: boolean;
  maxCharacters?: number;
}

export function PremiumTextarea({
  className,
  error,
  label,
  id,
  characterCount = false,
  maxCharacters = 280,
  value,
  onChange,
  ...props
}: PremiumTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [charCount, setCharCount] = React.useState(0);

  React.useEffect(() => {
    if (typeof value === 'string') {
      setCharCount(value.length);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    onChange?.(e);
  };

  const isOverLimit = charCount > maxCharacters;
  const isNearLimit = charCount > maxCharacters * 0.9;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={id}
          className={cn(
            'w-full min-h-[120px] bg-elevated border border-white/10 rounded-lg',
            'text-primary placeholder:text-tertiary text-sm',
            'transition-colors duration-150 resize-none',
            'focus:outline-none focus:border-accent-base',
            'p-4',
            error && 'border-red-500/50 focus:border-red-500',
            className
          )}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Animated focus ring */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isFocused
              ? error
                ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
                : '0 0 0 2px rgba(139, 92, 246, 0.2)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.15 }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5">
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        {characterCount && (
          <p
            className={cn(
              'text-xs ml-auto font-mono',
              isOverLimit && 'text-red-400',
              isNearLimit && !isOverLimit && 'text-yellow-400',
              !isNearLimit && 'text-tertiary'
            )}
          >
            {charCount}/{maxCharacters}
          </p>
        )}
      </div>
    </div>
  );
}
