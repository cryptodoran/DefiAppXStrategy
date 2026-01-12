import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for API routes)
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// Database types
export interface TrackedAccount {
  id: string;
  twitter_id: string;
  handle: string;
  name: string | null;
  type: 'competitor' | 'influencer' | 'own';
  tier: 'nano' | 'micro' | 'macro' | 'mega' | null;
  created_at: string;
  updated_at: string;
}

export interface TwitterMetrics {
  id: string;
  account_id: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  engagement_rate: number | null;
  avg_impressions: number | null;
  recorded_at: string;
}

export interface TweetCache {
  id: string;
  tweet_id: string;
  author_id: string;
  author_handle?: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number | null;
  created_at: string;
  fetched_at: string;
}

export interface ScheduledContent {
  id: string;
  content: string;
  type: 'single' | 'thread' | 'qt' | 'article';
  scheduled_for: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  quality_score: number | null;
  created_at: string;
}

export interface AISuggestion {
  id: string;
  type: 'daily' | 'trending' | 'take' | 'thread';
  content: string;
  topic: string | null;
  score: number | null;
  used: boolean;
  created_at: string;
}

export interface TrendCache {
  id: string;
  topic: string;
  category: string | null;
  volume: number | null;
  velocity: string | null;
  sentiment: string | null;
  relevance_score: number | null;
  fetched_at: string;
}

export interface AnalyticsHistory {
  id: string;
  metric_type: string;
  value: number;
  recorded_at: string;
}

// Database type for Supabase client
export type Database = {
  public: {
    Tables: {
      tracked_accounts: {
        Row: TrackedAccount;
        Insert: Omit<TrackedAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrackedAccount, 'id'>>;
      };
      twitter_metrics: {
        Row: TwitterMetrics;
        Insert: Omit<TwitterMetrics, 'id' | 'recorded_at'>;
        Update: Partial<Omit<TwitterMetrics, 'id'>>;
      };
      tweets_cache: {
        Row: TweetCache;
        Insert: Omit<TweetCache, 'id' | 'fetched_at'>;
        Update: Partial<Omit<TweetCache, 'id'>>;
      };
      scheduled_content: {
        Row: ScheduledContent;
        Insert: Omit<ScheduledContent, 'id' | 'created_at'>;
        Update: Partial<Omit<ScheduledContent, 'id'>>;
      };
      ai_suggestions: {
        Row: AISuggestion;
        Insert: Omit<AISuggestion, 'id' | 'created_at'>;
        Update: Partial<Omit<AISuggestion, 'id'>>;
      };
      trends_cache: {
        Row: TrendCache;
        Insert: Omit<TrendCache, 'id' | 'fetched_at'>;
        Update: Partial<Omit<TrendCache, 'id'>>;
      };
      analytics_history: {
        Row: AnalyticsHistory;
        Insert: Omit<AnalyticsHistory, 'id' | 'recorded_at'>;
        Update: Partial<Omit<AnalyticsHistory, 'id'>>;
      };
    };
  };
};
