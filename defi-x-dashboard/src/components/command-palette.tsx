'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Search,
  Zap,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Command,
  PenSquare,
  Target,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  section: 'quick-actions' | 'navigation' | 'recent' | 'search';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultCommands: CommandItem[] = [
  // Quick Actions
  {
    id: 'new-post',
    label: 'New Post',
    description: 'Create a new tweet with AI assistance',
    icon: <PenSquare className="h-4 w-4" />,
    shortcut: '⌘N',
    section: 'quick-actions',
    action: () => console.log('New post'),
  },
  {
    id: 'new-thread',
    label: 'New Thread',
    description: 'Create an engaging thread',
    icon: <MessageSquare className="h-4 w-4" />,
    shortcut: '⌘T',
    section: 'quick-actions',
    action: () => console.log('New thread'),
  },
  {
    id: 'get-suggestions',
    label: 'Get AI Suggestions',
    description: 'Generate content ideas based on current trends',
    icon: <Sparkles className="h-4 w-4" />,
    shortcut: '⌘G',
    section: 'quick-actions',
    action: () => console.log('Get suggestions'),
  },
  {
    id: 'find-opportunities',
    label: 'Find Opportunities',
    description: 'Scan for viral QT and trending topics',
    icon: <Target className="h-4 w-4" />,
    section: 'quick-actions',
    action: () => console.log('Find opportunities'),
  },
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    description: 'Go to main dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
    section: 'navigation',
    action: () => console.log('Go to dashboard'),
  },
  {
    id: 'nav-content',
    label: 'Content Studio',
    description: 'Create and manage content',
    icon: <FileText className="h-4 w-4" />,
    section: 'navigation',
    action: () => console.log('Go to content'),
  },
  {
    id: 'nav-analytics',
    label: 'Analytics',
    description: 'View performance metrics',
    icon: <TrendingUp className="h-4 w-4" />,
    section: 'navigation',
    action: () => console.log('Go to analytics'),
  },
  {
    id: 'nav-competitors',
    label: 'Competitor War Room',
    description: 'Monitor competitor activity',
    icon: <Users className="h-4 w-4" />,
    section: 'navigation',
    action: () => console.log('Go to competitors'),
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    description: 'Configure your preferences',
    icon: <Settings className="h-4 w-4" />,
    shortcut: '⌘,',
    section: 'navigation',
    action: () => console.log('Go to settings'),
  },
  // Recent
  {
    id: 'recent-1',
    label: 'ETH Bull Run Analysis Thread',
    description: 'Edited 2 hours ago',
    icon: <Clock className="h-4 w-4" />,
    section: 'recent',
    action: () => console.log('Open recent 1'),
  },
  {
    id: 'recent-2',
    label: 'QT: Vitalik announcement',
    description: 'Edited yesterday',
    icon: <Clock className="h-4 w-4" />,
    section: 'recent',
    action: () => console.log('Open recent 2'),
  },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter commands based on search
  const filteredCommands = React.useMemo(() => {
    if (!search) return defaultCommands;
    const query = search.toLowerCase();
    return defaultCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query)
    );
  }, [search]);

  // Group by section
  const sections = React.useMemo(() => {
    const grouped: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!grouped[cmd.section]) {
        grouped[cmd.section] = [];
      }
      grouped[cmd.section].push(cmd);
    });
    return grouped;
  }, [filteredCommands]);

  const sectionOrder = ['quick-actions', 'navigation', 'recent', 'search'];
  const sectionLabels: Record<string, string> = {
    'quick-actions': 'Quick Actions',
    navigation: 'Navigation',
    recent: 'Recent',
    search: 'Search Results',
  };

  // Flatten for keyboard navigation
  const flatCommands = React.useMemo(() => {
    return sectionOrder.flatMap((section) => sections[section] || []);
  }, [sections]);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatCommands, selectedIndex, onClose]);

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Calculate current index in flat list
  let currentFlatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 w-full max-w-xl z-50"
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: -10 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: -10 }}
            transition={{ type: 'spring', duration: 0.2, bounce: 0.1 }}
          >
            <div className="bg-elevated border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <Search className="h-5 w-5 text-tertiary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-primary placeholder:text-tertiary outline-none"
                />
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface text-tertiary text-xs">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {flatCommands.length === 0 ? (
                  <div className="py-8 text-center text-tertiary">
                    No commands found for "{search}"
                  </div>
                ) : (
                  sectionOrder.map((section) => {
                    const items = sections[section];
                    if (!items?.length) return null;

                    return (
                      <div key={section} className="mb-2 last:mb-0">
                        <div className="px-2 py-1.5 text-xs font-medium text-tertiary uppercase tracking-wider">
                          {sectionLabels[section]}
                        </div>
                        {items.map((cmd) => {
                          const isSelected = selectedIndex === currentFlatIndex;
                          const thisIndex = currentFlatIndex;
                          currentFlatIndex++;

                          return (
                            <motion.button
                              key={cmd.id}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                                'transition-colors duration-75',
                                isSelected ? 'bg-surface text-primary' : 'text-secondary hover:bg-surface/50'
                              )}
                              onClick={() => {
                                cmd.action();
                                onClose();
                              }}
                              onMouseEnter={() => setSelectedIndex(thisIndex)}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={cn(
                                'p-1.5 rounded-md',
                                isSelected ? 'bg-accent-base/20 text-violet-400' : 'bg-elevated text-tertiary'
                              )}>
                                {cmd.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{cmd.label}</div>
                                {cmd.description && (
                                  <div className="text-xs text-tertiary truncate">
                                    {cmd.description}
                                  </div>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <div className="flex items-center gap-1">
                                  {cmd.shortcut.split('').map((char, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 rounded bg-surface text-tertiary text-xs font-mono"
                                    >
                                      {char}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {isSelected && (
                                <ArrowRight className="h-4 w-4 text-tertiary" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-tertiary">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="px-1 py-0.5 rounded bg-surface">↑</span>
                    <span className="px-1 py-0.5 rounded bg-surface">↓</span>
                    <span className="ml-1">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="px-1 py-0.5 rounded bg-surface">↵</span>
                    <span className="ml-1">Select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="px-1 py-0.5 rounded bg-surface">esc</span>
                    <span className="ml-1">Close</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
