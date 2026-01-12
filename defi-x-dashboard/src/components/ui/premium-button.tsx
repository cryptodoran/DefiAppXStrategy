'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
}

const variants = {
  primary: 'bg-accent-base text-white hover:bg-violet-500 border-transparent',
  secondary: 'bg-elevated text-primary border-white/10 hover:bg-hover hover:border-white/20',
  ghost: 'bg-transparent text-secondary hover:text-primary hover:bg-elevated border-transparent',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20',
  success: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = false,
  className,
  disabled,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg font-medium',
        'border transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent-base/50 focus:ring-offset-2 focus:ring-offset-background',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}

      {/* Glow overlay on hover */}
      {glow && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-accent-base/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.button>
  );
}

// Icon button variant
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary';
  'aria-label': string;
}

const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent-base/50',
        variant === 'ghost' && 'text-tertiary hover:text-primary hover:bg-elevated',
        variant === 'secondary' && 'bg-elevated text-secondary hover:text-primary border border-white/10',
        iconSizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
