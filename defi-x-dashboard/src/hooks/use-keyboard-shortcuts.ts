'use client';

import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
};

const shortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    meta: true,
    action: () => useDashboardStore.getState().toggleCommandPalette(),
    description: 'Open command palette',
  },
  {
    key: 'k',
    ctrl: true,
    action: () => useDashboardStore.getState().toggleCommandPalette(),
    description: 'Open command palette (Windows)',
  },
];

export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const metaMatch =
        shortcut.meta === undefined || shortcut.meta === event.metaKey;
      const ctrlMatch =
        shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
      const shiftMatch =
        shortcut.shift === undefined || shortcut.shift === event.shiftKey;
      const altMatch =
        shortcut.alt === undefined || shortcut.alt === event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        metaMatch &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        // Check if this shortcut requires a modifier
        const requiresModifier =
          shortcut.meta || shortcut.ctrl || shortcut.shift || shortcut.alt;
        const hasModifier =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

        if (requiresModifier && hasModifier) {
          event.preventDefault();
          shortcut.action();
          return;
        } else if (!requiresModifier && !hasModifier) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
