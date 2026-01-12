'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StatusBar } from './status-bar';
import { CommandPalette, useCommandPalette } from '@/components/command-palette';
import {
  LayoutDashboard,
  PenSquare,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  Zap,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/' },
  { id: 'create', label: 'Create', icon: <PenSquare className="h-5 w-5" />, href: '/create' },
  { id: 'suggestions', label: 'AI Suggestions', icon: <Sparkles className="h-5 w-5" />, href: '/suggestions/daily', badge: '3' },
  { id: 'opportunities', label: 'Opportunities', icon: <Target className="h-5 w-5" />, href: '/research/trends', badge: 'HOT' },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-5 w-5" />, href: '/analytics/followers' },
  { id: 'competitors', label: 'War Room', icon: <Users className="h-5 w-5" />, href: '/research/competitors' },
  { id: 'calendar', label: 'Schedule', icon: <Calendar className="h-5 w-5" />, href: '/suggestions/calendar' },
  { id: 'research', label: 'Research', icon: <BookOpen className="h-5 w-5" />, href: '/research' },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, href: '/settings' },
];

export function AppLayout({ children, rightPanel }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const pathname = usePathname();
  const commandPalette = useCommandPalette();

  // Determine active nav based on current path
  const getActiveNav = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/create')) return 'create';
    if (pathname.startsWith('/suggestions')) return 'suggestions';
    if (pathname.startsWith('/analytics')) return 'analytics';
    if (pathname.startsWith('/research/competitors')) return 'competitors';
    if (pathname.startsWith('/research/trends')) return 'opportunities';
    if (pathname.startsWith('/research')) return 'research';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeNav = getActiveNav();

  // Persist collapsed state
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-base">
      {/* Command Palette */}
      <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />

      {/* Status Bar */}
      <StatusBar />

      <div className="flex h-[calc(100vh-40px)]">
        {/* Left Sidebar */}
        <motion.aside
          className={cn(
            'h-full bg-surface border-r border-white/5 flex flex-col',
            'transition-[width] duration-200 ease-out'
          )}
          animate={{ width: sidebarCollapsed ? 64 : 240 }}
        >
          {/* Logo */}
          <Link href="/" className="h-14 flex items-center justify-between px-4 border-b border-white/5 hover:bg-elevated/50 transition-colors">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold text-primary">DeFi App X</span>
                </motion.div>
              )}
            </AnimatePresence>

            {sidebarCollapsed && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto">
                <Zap className="h-4 w-4 text-white" />
              </div>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={activeNav === item.id}
                collapsed={sidebarCollapsed}
              />
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="py-4 px-2 border-t border-white/5">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={activeNav === item.id}
                collapsed={sidebarCollapsed}
              />
            ))}

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-2',
                'text-tertiary hover:text-secondary hover:bg-elevated transition-colors'
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 mx-auto" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-6">
            {children}
          </div>
        </main>

        {/* Right Panel */}
        {rightPanel && (
          <aside className="w-[360px] h-full bg-surface border-l border-white/5 overflow-y-auto">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}

// Nav link component using Next.js Link
interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

function NavLink({ item, isActive, collapsed }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg relative',
        'transition-colors duration-150',
        isActive
          ? 'bg-elevated text-primary'
          : 'text-secondary hover:text-primary hover:bg-elevated/50'
      )}
    >
      <span className={cn(
        'flex-shrink-0',
        isActive && 'text-violet-400'
      )}>
        {item.icon}
      </span>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      {item.badge && !collapsed && (
        <span
          className={cn(
            'ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
            item.badge === 'HOT'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-violet-500/20 text-violet-400'
          )}
        >
          {item.badge}
        </span>
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full"
          layoutId="activeNav"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Context panel component for the right sidebar
interface ContextPanelProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ContextPanel({ title, children, action }: ContextPanelProps) {
  return (
    <div className="p-4 border-b border-white/5 last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
