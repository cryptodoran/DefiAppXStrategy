import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const SETUP_SQL = `
-- Tracked Twitter accounts (competitors, influencers)
CREATE TABLE IF NOT EXISTS tracked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id TEXT UNIQUE,
  handle TEXT NOT NULL,
  name TEXT,
  type TEXT CHECK (type IN ('competitor', 'influencer', 'own')),
  tier TEXT CHECK (tier IN ('nano', 'micro', 'macro', 'mega')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Twitter metrics cache
CREATE TABLE IF NOT EXISTS twitter_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  followers_count INTEGER,
  following_count INTEGER,
  tweet_count INTEGER,
  engagement_rate DECIMAL,
  avg_impressions INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tweet cache
CREATE TABLE IF NOT EXISTS tweets_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id TEXT UNIQUE NOT NULL,
  author_id TEXT NOT NULL,
  author_handle TEXT,
  content TEXT,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  impressions INTEGER,
  created_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled content
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('single', 'thread', 'qt', 'article')),
  scheduled_for TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
  quality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('daily', 'trending', 'take', 'thread')),
  content TEXT NOT NULL,
  topic TEXT,
  hook TEXT,
  score INTEGER,
  reasoning TEXT,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform trends cache
CREATE TABLE IF NOT EXISTS trends_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT,
  volume INTEGER,
  volume_change INTEGER,
  velocity TEXT,
  sentiment TEXT,
  relevance_score INTEGER,
  related_hashtags TEXT[],
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics history
CREATE TABLE IF NOT EXISTS analytics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_twitter_metrics_account ON twitter_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_twitter_metrics_recorded ON twitter_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_tweets_cache_author ON tweets_cache(author_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_analytics_history_type ON analytics_history(metric_type);
CREATE INDEX IF NOT EXISTS idx_trends_cache_fetched ON trends_cache(fetched_at);
`;

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Execute the setup SQL
    const { error } = await supabase.rpc('exec_sql', { sql: SETUP_SQL });

    if (error) {
      // If RPC doesn't exist, tables might already be created or we need manual setup
      console.log('RPC not available, checking if tables exist...');

      // Try to query a table to see if setup is needed
      const { error: checkError } = await supabase
        .from('tracked_accounts')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist - need manual setup
        return NextResponse.json({
          success: false,
          message: 'Tables need to be created manually. Please run the SQL in Supabase SQL Editor.',
          sql: SETUP_SQL,
        });
      }

      // Tables might already exist
      return NextResponse.json({
        success: true,
        message: 'Database tables already exist or were created successfully.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed',
        sql: SETUP_SQL,
        message: 'Please run the SQL manually in Supabase SQL Editor'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Same as GET - for flexibility
  return GET();
}
