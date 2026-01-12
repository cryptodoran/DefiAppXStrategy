import { create } from 'zustand';
import type {
  AccountMetrics,
  Post,
  AlgorithmInsight,
  ContentSuggestion,
  Notification
} from '@/types';

interface DashboardState {
  // Current metrics
  currentMetrics: AccountMetrics | null;
  previousMetrics: AccountMetrics | null;

  // Posts
  recentPosts: Post[];
  viralPosts: Post[];

  // Algorithm
  algorithmInsights: AlgorithmInsight[];
  algorithmHealthScore: number;

  // Suggestions
  pendingSuggestions: ContentSuggestion[];

  // UI State
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  commandPaletteOpen: boolean;
  selectedTimeRange: '24h' | '7d' | '30d' | '90d';

  // Actions
  setCurrentMetrics: (metrics: AccountMetrics) => void;
  setPreviousMetrics: (metrics: AccountMetrics | null) => void;
  setRecentPosts: (posts: Post[]) => void;
  setViralPosts: (posts: Post[]) => void;
  setAlgorithmInsights: (insights: AlgorithmInsight[]) => void;
  setAlgorithmHealthScore: (score: number) => void;
  setPendingSuggestions: (suggestions: ContentSuggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleCommandPalette: () => void;
  setTimeRange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  currentMetrics: null,
  previousMetrics: null,
  recentPosts: [],
  viralPosts: [],
  algorithmInsights: [],
  algorithmHealthScore: 0,
  pendingSuggestions: [],
  isLoading: false,
  error: null,
  notifications: [],
  commandPaletteOpen: false,
  selectedTimeRange: '7d',

  // Actions
  setCurrentMetrics: (metrics) => set({ currentMetrics: metrics }),
  setPreviousMetrics: (metrics) => set({ previousMetrics: metrics }),
  setRecentPosts: (posts) => set({ recentPosts: posts }),
  setViralPosts: (posts) => set({ viralPosts: posts }),
  setAlgorithmInsights: (insights) => set({ algorithmInsights: insights }),
  setAlgorithmHealthScore: (score) => set({ algorithmHealthScore: score }),
  setPendingSuggestions: (suggestions) => set({ pendingSuggestions: suggestions }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false,
      },
      ...state.notifications,
    ].slice(0, 50), // Keep max 50 notifications
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),

  clearNotifications: () => set({ notifications: [] }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setTimeRange: (range) => set({ selectedTimeRange: range }),
}));
