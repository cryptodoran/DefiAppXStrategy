'use client';

import { useQuery } from '@tanstack/react-query';

// Types
export interface AnalyticsOverview {
  followers: {
    count: number;
    change: number;
    changePercent: number;
  };
  engagement: {
    rate: number;
    change: number;
  };
  impressions: {
    total: number;
    change: number;
    changePercent: number;
  };
  posts: {
    count: number;
    avgEngagement: number;
  };
}

export interface FollowerAnalytics {
  total: number;
  gained: number;
  lost: number;
  netChange: number;
  growthRate: number;
  history: { date: string; count: number }[];
  demographics?: {
    topLocations: { location: string; count: number }[];
    interests: { interest: string; percentage: number }[];
  };
}

export interface PostAnalytics {
  id: string;
  content: string;
  type: string;
  postedAt: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  engagementRate: number;
  clickRate?: number;
}

export interface EngagementAnalytics {
  avgRate: number;
  rateChange: number;
  byType: {
    type: string;
    avgEngagement: number;
    count: number;
  }[];
  byTime: {
    hour: number;
    avgEngagement: number;
  }[];
  topPerformers: PostAnalytics[];
}

// Fetch functions
async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const response = await fetch('/api/analytics/overview');
  if (!response.ok) throw new Error('Failed to fetch analytics overview');
  return response.json();
}

async function fetchFollowerAnalytics(days: number = 30): Promise<FollowerAnalytics> {
  const response = await fetch(`/api/analytics/followers?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch follower analytics');
  return response.json();
}

async function fetchPostAnalytics(limit: number = 20): Promise<PostAnalytics[]> {
  const response = await fetch(`/api/analytics/posts?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch post analytics');
  return response.json();
}

async function fetchEngagementAnalytics(): Promise<EngagementAnalytics> {
  const response = await fetch('/api/analytics/engagement');
  if (!response.ok) throw new Error('Failed to fetch engagement analytics');
  return response.json();
}

// Hooks

// Get overview metrics for dashboard
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalyticsOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Get follower analytics
export function useFollowerAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['follower-analytics', days],
    queryFn: () => fetchFollowerAnalytics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

// Get post performance analytics
export function usePostAnalytics(limit: number = 20) {
  return useQuery({
    queryKey: ['post-analytics', limit],
    queryFn: () => fetchPostAnalytics(limit),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Get engagement analytics
export function useEngagementAnalytics() {
  return useQuery({
    queryKey: ['engagement-analytics'],
    queryFn: fetchEngagementAnalytics,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
