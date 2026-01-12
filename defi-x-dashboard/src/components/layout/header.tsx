'use client';

import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/store/dashboard';

export function Header() {
  const { notifications, toggleCommandPalette } = useDashboardStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-base px-6">
      {/* Search / Command Palette Trigger */}
      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-3 rounded-lg bg-surface px-4 py-2 text-sm text-tertiary transition-colors hover:bg-elevated hover:text-secondary"
      >
        <Search className="h-4 w-4" />
        <span>Search or run command...</span>
        <kbd className="ml-8 rounded bg-elevated px-2 py-0.5 text-xs font-medium text-tertiary">
          Ctrl+K
        </kbd>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Quick create button */}
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-tertiary transition-colors hover:bg-elevated hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-elevated">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
          <span className="font-medium text-white">Doran</span>
        </button>
      </div>
    </header>
  );
}
