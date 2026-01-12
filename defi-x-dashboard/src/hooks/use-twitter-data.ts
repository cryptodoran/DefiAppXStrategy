'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface TwitterUserData {
  id: string;
  handle: string;
  name: string;
  description?: string;
  profileImage?: string;
  followers: number;
  following: number;
  tweets: number;
  engagementRate: number;
  tier: 'nano' | 'micro' | 'macro' | 'mega';
  recentTweets?: TweetData[];
}

export interface TweetData {
  id: string;
  content: string;
  authorHandle: string;
  authorName: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  createdAt: string;
}

export interface TrendData {
  id: string;
  topic: string;
  category: string;
  volume: number;
  volumeChange: number;
  velocity: 'rising' | 'stable' | 'falling';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevanceScore: number;
  relatedHashtags: string[];
}

// Fetch functions
async function fetchTwitterUser(handle: string): Promise<TwitterUserData> {
  const response = await fetch(`/api/twitter/user/${handle}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

async function fetchMultipleUsers(handles: string[]): Promise<TwitterUserData[]> {
  const response = await fetch('/api/twitter/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handles }),
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function fetchTrends(): Promise<TrendData[]> {
  const response = await fetch('/api/twitter/trends');
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
}

async function fetchViralTweets(category?: string): Promise<TweetData[]> {
  const url = category ? `/api/twitter/viral?category=${category}` : '/api/twitter/viral';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch viral tweets');
  return response.json();
}

async function searchTweets(query: string): Promise<TweetData[]> {
  const response = await fetch(`/api/twitter/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search tweets');
  return response.json();
}

// Hooks

// Get single Twitter user with auto-refresh
export function useTwitterUser(handle: string | null) {
  return useQuery({
    queryKey: ['twitter-user', handle],
    queryFn: () => fetchTwitterUser(handle!),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Get multiple Twitter users (for competitors/influencers)
export function useTwitterUsers(handles: string[]) {
  return useQuery({
    queryKey: ['twitter-users', handles.sort().join(',')],
    queryFn: () => fetchMultipleUsers(handles),
    enabled: handles.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });
}

// Get own account metrics
export function useOwnMetrics() {
  const ownHandle = process.env.NEXT_PUBLIC_TWITTER_OWN_HANDLE || 'defiapp';
  return useQuery({
    queryKey: ['own-metrics', ownHandle],
    queryFn: () => fetchTwitterUser(ownHandle),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Get platform trends
export function useTrends() {
  return useQuery({
    queryKey: ['trends'],
    queryFn: fetchTrends,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
}

// Get viral tweets
export function useViralTweets(category?: string) {
  return useQuery({
    queryKey: ['viral-tweets', category],
    queryFn: () => fetchViralTweets(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });
}

// Search tweets
export function useSearchTweets(query: string) {
  return useQuery({
    queryKey: ['search-tweets', query],
    queryFn: () => searchTweets(query),
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Track new account mutation
export function useTrackAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (handle: string) => {
      const response = await fetch('/api/twitter/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });
      if (!response.ok) throw new Error('Failed to track account');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['twitter-users'] });
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
}
