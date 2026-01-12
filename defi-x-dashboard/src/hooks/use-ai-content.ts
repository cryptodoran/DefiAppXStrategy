'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface AISuggestion {
  id: string;
  type: 'single' | 'thread' | 'qt' | 'take';
  content: string;
  topic: string;
  hook: string;
  score: number;
  reasoning: string;
  createdAt: string;
}

export interface HotTake {
  id: string;
  content: string;
  angle: string;
  spiciness: 'mild' | 'medium' | 'spicy' | 'nuclear';
  targetAudience: string;
}

export interface ContentScore {
  score: number;
  feedback: string[];
  suggestions: string[];
}

// Fetch functions
async function fetchDailySuggestions(): Promise<AISuggestion[]> {
  const response = await fetch('/api/content/suggestions');
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
}

async function generateTakes(topic: string): Promise<HotTake[]> {
  const response = await fetch('/api/content/takes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!response.ok) throw new Error('Failed to generate takes');
  return response.json();
}

async function generateThread(topic: string, style: string, length: number): Promise<string[]> {
  const response = await fetch('/api/content/thread', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, style, length }),
  });
  if (!response.ok) throw new Error('Failed to generate thread');
  return response.json();
}

async function scoreContent(content: string): Promise<ContentScore> {
  const response = await fetch('/api/content/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to score content');
  return response.json();
}

// Hooks

// Get daily AI suggestions
export function useDailySuggestions() {
  return useQuery({
    queryKey: ['daily-suggestions'],
    queryFn: fetchDailySuggestions,
    staleTime: 60 * 60 * 1000, // 1 hour - suggestions don't need frequent updates
    refetchOnWindowFocus: false,
  });
}

// Generate hot takes mutation
export function useGenerateTakes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topic: string) => generateTakes(topic),
    onSuccess: (data) => {
      // Cache the generated takes
      queryClient.setQueryData(['hot-takes', data[0]?.id], data);
    },
  });
}

// Generate thread mutation
export function useGenerateThread() {
  return useMutation({
    mutationFn: ({ topic, style, length }: { topic: string; style: string; length: number }) =>
      generateThread(topic, style, length),
  });
}

// Score content mutation
export function useScoreContent() {
  return useMutation({
    mutationFn: (content: string) => scoreContent(content),
  });
}

// Regenerate daily suggestions
export function useRegenerateSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/content/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: true }),
      });
      if (!response.ok) throw new Error('Failed to regenerate suggestions');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['daily-suggestions'], data);
    },
  });
}
