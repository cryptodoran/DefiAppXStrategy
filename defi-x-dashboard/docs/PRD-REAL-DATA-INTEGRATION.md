# PRD: Full Real-Time Data Integration

## Executive Summary
Transform the DefiApp X Strategy Dashboard from static mock data to a fully dynamic, real-time system with live data from Twitter/X, market APIs, and AI-powered content generation.

---

## Current State (Problems)

### Static Mock Data Locations
| File | Mock Data | Replacement Needed |
|------|-----------|-------------------|
| `/research/influencers/page.tsx` | Hardcoded influencer array | Twitter API - user lookup |
| `/research/competitors/page.tsx` | Hardcoded competitor array | Twitter API - user metrics |
| `/research/trends/page.tsx` | Hardcoded trends array | Twitter API - trends |
| `/research/narratives/page.tsx` | Hardcoded narratives | Twitter API - search + AI analysis |
| `/research/viral/page.tsx` | Hardcoded viral posts | Twitter API - popular tweets |
| `/research/product/page.tsx` | Hardcoded product features | Database + Twitter search |
| `/research/path-to-1/page.tsx` | Hardcoded milestones | Twitter API + Database |
| `/research/algorithm/page.tsx` | Hardcoded insights | Twitter API analytics |
| `/suggestions/daily/page.tsx` | Hardcoded suggestions | AI API (Claude/OpenAI) |
| `/suggestions/trending/page.tsx` | Hardcoded trending | Twitter API + AI |
| `/suggestions/calendar/page.tsx` | Hardcoded posts | Database |
| `/analytics/*` | All hardcoded | Twitter API analytics |
| `/components/dashboard/*` | Mock metrics | Twitter API + Database |
| `/create/takes/page.tsx` | Hardcoded takes | AI API |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  - React Query for data fetching & caching                      │
│  - Real-time updates via polling (30s-5min intervals)           │
│  - Optimistic UI updates                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                        │
│  /api/twitter/* - Twitter data endpoints                        │
│  /api/analytics/* - Aggregated analytics                        │
│  /api/content/* - AI content generation                         │
│  /api/research/* - Research data endpoints                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │ Twitter   │ │ AI APIs   │ │ Market    │
            │ API v2    │ │ Claude/   │ │ APIs      │
            │           │ │ OpenAI    │ │ CoinGecko │
            └───────────┘ └───────────┘ └───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase/PostgreSQL)                │
│  - Cached Twitter data (rate limit management)                  │
│  - Historical analytics                                          │
│  - Scheduled content                                             │
│  - User preferences & tracked accounts                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Required External Services

### 1. Twitter/X API (CRITICAL)
**Why:** Core data source for all social metrics, trends, competitor tracking
**Tier Needed:** Basic ($100/month) or Pro ($5000/month)
**Endpoints Required:**
- `GET /2/users/by` - User lookup
- `GET /2/users/:id` - User details + metrics
- `GET /2/users/:id/tweets` - User tweets
- `GET /2/tweets/search/recent` - Search tweets
- `GET /2/tweets/:id` - Tweet details + metrics
- `GET /2/users/:id/followers` - Follower count
- `GET /2/trends/place` - Trending topics (if available)

**Rate Limits (Basic Tier):**
- 10,000 tweets/month read
- 500 requests/15 min for most endpoints

### 2. AI API (Claude or OpenAI)
**Why:** Content suggestions, take generation, narrative analysis
**Cost:** ~$0.01-0.03 per suggestion generated
**Endpoints:**
- Claude: `POST /v1/messages`
- OpenAI: `POST /v1/chat/completions`

### 3. Market Data APIs (Already Integrated)
- CoinGecko (free tier)
- DeFiLlama (free)
- Alternative.me Fear & Greed (free)

### 4. Database (Supabase - Free Tier Available)
**Why:** Cache data, store history, manage rate limits
**Tables Needed:**
- `tracked_accounts` - Competitors & influencers to track
- `twitter_metrics_cache` - Cached API responses
- `analytics_history` - Historical data points
- `scheduled_content` - Content calendar
- `generated_suggestions` - AI suggestions cache

---

## Implementation Plan

### Phase 1: Infrastructure Setup (Day 1)
1. Set up Supabase project & database schema
2. Create Twitter API developer account
3. Set up environment variables
4. Create base API service layer

### Phase 2: Twitter Integration (Day 1-2)
1. Twitter API client with rate limiting
2. User metrics fetching (followers, engagement)
3. Tweet fetching and analysis
4. Trend detection

### Phase 3: Database Layer (Day 2)
1. Supabase client setup
2. Caching layer for Twitter data
3. Historical data storage
4. CRUD operations for tracked accounts

### Phase 4: AI Integration (Day 2-3)
1. Claude/OpenAI client setup
2. Content suggestion generation
3. Take generation
4. Narrative analysis

### Phase 5: Frontend Integration (Day 3-4)
1. React Query setup for data fetching
2. Replace all mock data with API calls
3. Add loading states and error handling
4. Implement auto-refresh intervals

### Phase 6: Real-Time Features (Day 4-5)
1. Polling for live updates
2. Background data sync
3. Notification system for opportunities
4. Rate limit management UI

---

## Database Schema

```sql
-- Tracked Twitter accounts (competitors, influencers)
CREATE TABLE tracked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id TEXT UNIQUE NOT NULL,
  handle TEXT NOT NULL,
  name TEXT,
  type TEXT CHECK (type IN ('competitor', 'influencer', 'own')),
  tier TEXT CHECK (tier IN ('nano', 'micro', 'macro', 'mega')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached Twitter metrics
CREATE TABLE twitter_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES tracked_accounts(id),
  followers_count INTEGER,
  following_count INTEGER,
  tweet_count INTEGER,
  engagement_rate DECIMAL,
  avg_impressions INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tweet cache
CREATE TABLE tweets_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id TEXT UNIQUE NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT,
  likes INTEGER,
  retweets INTEGER,
  replies INTEGER,
  impressions INTEGER,
  created_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled content
CREATE TABLE scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('single', 'thread', 'qt', 'article')),
  scheduled_for TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  quality_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI generated suggestions
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('daily', 'trending', 'take', 'thread')),
  content TEXT NOT NULL,
  topic TEXT,
  score INTEGER,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform trends cache
CREATE TABLE trends_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT,
  volume INTEGER,
  velocity TEXT,
  sentiment TEXT,
  relevance_score INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics history
CREATE TABLE analytics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  value DECIMAL NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints to Create

### Twitter Data
```
GET  /api/twitter/user/[handle]     - Get user profile & metrics
GET  /api/twitter/user/[handle]/tweets - Get recent tweets
GET  /api/twitter/trends            - Get current trends
GET  /api/twitter/search?q=         - Search tweets
POST /api/twitter/track             - Add account to track
```

### Analytics
```
GET  /api/analytics/overview        - Dashboard metrics
GET  /api/analytics/followers       - Follower analytics
GET  /api/analytics/engagement      - Engagement analytics
GET  /api/analytics/posts           - Post performance
GET  /api/analytics/history         - Historical data
```

### Content
```
POST /api/content/generate          - Generate content (existing)
POST /api/content/suggestions       - Get AI suggestions
POST /api/content/takes             - Generate hot takes
GET  /api/content/scheduled         - Get scheduled posts
POST /api/content/schedule          - Schedule a post
```

### Research
```
GET  /api/research/competitors      - Competitor data
GET  /api/research/influencers      - Influencer data
GET  /api/research/trends           - Trend analysis
GET  /api/research/narratives       - Narrative analysis
GET  /api/research/viral            - Viral content analysis
```

---

## Environment Variables Needed

```env
# Twitter API v2
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# Your Twitter account (for own metrics)
TWITTER_OWN_HANDLE=deikiapp

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI APIs
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Existing (keep)
COINGECKO_API_KEY=
```

---

## Auto-Refresh Intervals

| Data Type | Refresh Interval | Reason |
|-----------|------------------|--------|
| Own metrics | 5 minutes | Core KPIs |
| Competitor metrics | 15 minutes | Rate limit management |
| Trends | 10 minutes | Time-sensitive |
| Viral tweets | 30 minutes | Less urgent |
| AI suggestions | On-demand | User triggered |
| Market data | 5 minutes | Already implemented |

---

## User Setup Required

### Step 1: Twitter Developer Account
1. Go to https://developer.twitter.com/
2. Sign up for developer account
3. Create a new App/Project
4. Subscribe to Basic tier ($100/month) for adequate limits
5. Generate Bearer Token and Access Tokens

### Step 2: Supabase Account
1. Go to https://supabase.com/
2. Create new project
3. Run the SQL schema provided above
4. Copy API URL and keys

### Step 3: AI API Key
1. Go to https://console.anthropic.com/ (Claude) OR
2. Go to https://platform.openai.com/ (OpenAI)
3. Create API key

### Step 4: Environment Variables
1. Add all keys to `.env.local`
2. Restart development server

---

## Success Metrics

- [ ] Zero hardcoded mock data in any page
- [ ] All metrics update in real-time (within defined intervals)
- [ ] Proper loading states during data fetches
- [ ] Error handling for API failures
- [ ] Rate limit awareness and management
- [ ] Historical data tracking in database
- [ ] AI suggestions generate on-demand
- [ ] Content calendar persists to database

---

## Files to Modify/Create

### New Files
- `/lib/supabase.ts` - Supabase client
- `/lib/twitter.ts` - Twitter API client
- `/lib/ai.ts` - AI API client (Claude/OpenAI)
- `/hooks/useTwitterUser.ts` - Twitter user data hook
- `/hooks/useAnalytics.ts` - Analytics data hook
- `/hooks/useTrends.ts` - Trends data hook
- `/hooks/useAISuggestions.ts` - AI suggestions hook
- `/api/twitter/[...route].ts` - Twitter API routes
- `/api/supabase/[...route].ts` - Database API routes

### Files to Modify (Remove Mock Data)
- All files in `/app/research/*`
- All files in `/app/analytics/*`
- All files in `/app/suggestions/*`
- All files in `/app/create/*`
- All files in `/components/dashboard/*`

---

## Execution Order

1. **You provide:** Twitter API credentials, Supabase project, AI API key
2. **I execute:**
   - Database schema setup
   - API clients and services
   - API routes
   - React Query integration
   - Replace all mock data with real API calls
   - Add loading/error states
   - Implement auto-refresh

Total estimated implementation: 4-6 hours of coding once credentials are provided.
