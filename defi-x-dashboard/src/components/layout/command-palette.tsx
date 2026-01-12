'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useDashboardStore } from '@/store/dashboard';
import {
  LayoutDashboard,
  BarChart3,
  PenTool,
  Lightbulb,
  Search,
  Settings,
  FileText,
  Users,
  Zap,
  MessageSquare,
  Target,
  Flame,
  Calendar,
  TrendingUp,
} from 'lucide-react';

const commands = [
  {
    group: 'Navigation',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Post Performance', href: '/analytics/posts', icon: FileText },
      { name: 'Follower Analytics', href: '/analytics/followers', icon: Users },
      { name: 'Exposure Tracker', href: '/analytics/exposure', icon: Zap },
    ],
  },
  {
    group: 'Create Content',
    items: [
      { name: 'Viral Post Creator', href: '/create/viral', icon: Flame },
      { name: 'Thread Builder', href: '/create/thread', icon: MessageSquare },
      { name: 'Article Writer', href: '/create/article', icon: FileText },
      { name: 'QT Optimizer', href: '/create/qt', icon: Target },
    ],
  },
  {
    group: 'Research',
    items: [
      { name: 'Algorithm Intel', href: '/research/algorithm', icon: Zap },
      { name: 'Competitor Analysis', href: '/research/competitors', icon: Users },
      { name: 'Influencer Database', href: '/research/influencers', icon: Users },
      { name: 'CT Narratives', href: '/research/narratives', icon: MessageSquare },
      { name: 'Path to #1', href: '/research/path-to-1', icon: Target },
    ],
  },
  {
    group: 'Suggestions',
    items: [
      { name: 'Daily Recommendations', href: '/suggestions/daily', icon: Lightbulb },
      { name: 'Trending Topics', href: '/suggestions/trending', icon: TrendingUp },
      { name: 'Content Calendar', href: '/suggestions/calendar', icon: Calendar },
    ],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, toggleCommandPalette } = useDashboardStore();

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleCommandPalette]);

  const handleSelect = (href: string) => {
    router.push(href);
    toggleCommandPalette();
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map((group, index) => (
          <div key={group.group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group.group}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    onSelect={() => handleSelect(item.href)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
