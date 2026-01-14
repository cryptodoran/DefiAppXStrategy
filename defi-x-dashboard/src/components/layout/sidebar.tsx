'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  PenTool,
  Lightbulb,
  Search,
  Settings,
  TrendingUp,
  Users,
  FileText,
  Zap,
  Target,
  MessageSquare,
  Flame,
  Activity,
  Package,
  Globe,
  Sparkles,
  Mic,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Viral Discovery',
    href: '/viral',
    icon: Flame,
    badge: 'NEW',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { name: 'Post Performance', href: '/analytics/posts', icon: FileText },
      { name: 'Engagement Feed', href: '/analytics/engagement', icon: Activity },
      { name: 'Follower Analytics', href: '/analytics/followers', icon: Users },
      { name: 'Exposure Tracker', href: '/analytics/exposure', icon: Zap },
    ],
  },
  {
    name: 'Create',
    href: '/create',
    icon: PenTool,
    children: [
      { name: 'Viral Post', href: '/create/viral', icon: Flame },
      { name: 'Thread Builder', href: '/create/thread', icon: MessageSquare },
      { name: 'Article Writer', href: '/create/article', icon: FileText },
      { name: 'QT Optimizer', href: '/create/qt', icon: Target },
      { name: 'Take Generator', href: '/create/takes', icon: Mic },
      { name: 'Spicy Framework', href: '/create/spicy', icon: Flame },
    ],
  },
  {
    name: 'Suggestions',
    href: '/suggestions',
    icon: Lightbulb,
    children: [
      { name: 'Daily Recommendations', href: '/suggestions/daily', icon: Lightbulb },
      { name: 'Trending Topics', href: '/suggestions/trending', icon: TrendingUp },
    ],
  },
  {
    name: 'Research',
    href: '/research',
    icon: Search,
    children: [
      { name: 'Algorithm Intel', href: '/research/algorithm', icon: Zap },
      { name: 'Platform Trends', href: '/research/trends', icon: TrendingUp },
      { name: 'Product Intel', href: '/research/product', icon: Package },
      { name: 'Brand Positioning', href: '/research/brand', icon: Globe },
      { name: 'Viral Research', href: '/research/viral', icon: Sparkles },
      { name: 'Competitors', href: '/research/competitors', icon: Users },
      { name: 'Influencers', href: '/research/influencers', icon: Users },
      { name: 'CT Narratives', href: '/research/narratives', icon: MessageSquare },
      { name: 'Path to #1', href: '/research/path-to-1', icon: Target },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/settings', icon: Settings },
      { name: 'Brand Voice', href: '/settings/brand-voice', icon: Mic },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-base border-r border-white/5">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
          <span className="text-sm font-bold text-white">D</span>
        </div>
        <span className="text-lg font-semibold text-white">Defi App</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-elevated text-white'
                      : 'text-tertiary hover:bg-surface hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                  {(item as { badge?: string }).badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-violet-500 text-white rounded">
                      {(item as { badge?: string }).badge}
                    </span>
                  )}
                </Link>

                {/* Children */}
                {item.children && isActive && (
                  <ul className="mt-1 ml-4 space-y-1 border-l border-white/5 pl-4">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      const ChildIcon = child.icon;

                      return (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              isChildActive
                                ? 'bg-elevated text-white'
                                : 'text-tertiary hover:bg-surface hover:text-secondary'
                            )}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - simplified */}
      <div className="border-t border-white/5 p-4">
        <div className="rounded-lg bg-surface p-3">
          <div className="flex items-center gap-2 text-xs text-tertiary">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>Connected to X API</span>
          </div>
        </div>
      </div>
    </div>
  );
}
