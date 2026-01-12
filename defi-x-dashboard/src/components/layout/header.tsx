'use client';

import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/store/dashboard';

export function Header() {
  const { notifications, toggleCommandPalette } = useDashboardStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      {/* Search / Command Palette Trigger */}
      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      >
        <Search className="h-4 w-4" />
        <span>Search or run command...</span>
        <kbd className="ml-8 rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
          Ctrl+K
        </kbd>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Quick create button */}
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="font-medium text-white">Doran</span>
        </button>
      </div>
    </header>
  );
}
