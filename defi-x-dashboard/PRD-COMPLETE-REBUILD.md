# Complete Product Rebuild PRD

## Document Version: 2.0
## Date: January 12, 2026
## Status: Ready for Execution

---

# PART 1: FIX ALL BROKEN FEATURES

## 1.1 Opportunities Section - Currently Fake

**Problem:** Shows "Vitalik just posted" but it's randomly selected accounts, not real viral tweets.

**Fix Required:**
- Create `/api/twitter/viral` endpoint that fetches ACTUAL viral tweets from tracked accounts
- Use Twitter API v2 to get recent tweets with high engagement (likes > 1000, retweets > 200)
- Store last fetched tweets to compare engagement growth
- Show REAL tweet content with direct link to that specific tweet
- Include actual timestamp of when tweet was posted

**New Data Structure:**
```typescript
interface ViralTweet {
  tweetId: string;
  authorHandle: string;
  authorName: string;
  content: string;
  postedAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  quoteTweets: number;
  tweetUrl: string;
  engagementVelocity: number; // likes per hour
  isVerified: boolean;
}
```

---

## 1.2 News Section - RSS Often Fails

**Problem:** RSS feeds frequently fail, showing fallback or empty state.

**Fix Required:**
- Use a news aggregation API (CryptoPanic, NewsAPI) as backup
- Implement proper caching (5 min TTL)
- Add multiple fallback sources
- Show actual article publish time
- Include article preview/summary when available

---

## 1.3 Content Creator Buttons - Hardcoded Garbage

**Problem:** All AI assist buttons are hardcoded string operations, not actual AI.

**Fix Required:**
- Integrate Claude API for ALL content enhancement
- Remove all hardcoded string manipulation
- Create proper prompts for each action type:
  - **Make Spicier**: Add controversy, strong opinions, engagement hooks
  - **Add Context**: Analyze topic and add relevant market/news context
  - **Shorten**: Intelligently compress while preserving meaning
  - **Suggest Hook**: Generate multiple compelling opening hooks

**New API Route:** `/api/content/enhance`
```typescript
interface EnhanceRequest {
  content: string;
  action: 'spicier' | 'context' | 'shorten' | 'hook';
  brandVoice: BrandVoice;
}
```

---

## 1.4 Generate Variations - Does Nothing

**Problem:** Button just shows a toast, doesn't generate anything.

**Fix Required:**
- Create `/api/content/variations` endpoint
- Use Claude to generate 3 distinct variations
- Each variation should have different:
  - Tone (analytical, provocative, educational)
  - Length
  - Hook style
- Show predicted engagement score based on historical data

---

## 1.5 Spice Level Analysis - Hardcoded Results

**Problem:** Analysis shows same hardcoded results regardless of input.

**Fix Required:**
- Use Claude to analyze actual content
- Return real analysis based on:
  - Controversy level (0-100)
  - Brand alignment score
  - Engagement potential
  - Risk flags (specific to content)
  - Actionable suggestions

---

## 1.6 Thread Builder - Same 3 Tweets Every Time

**Problem:** "Expand to Thread" always adds identical hardcoded tweets.

**Fix Required:**
- Use Claude to actually expand the topic
- Generate contextually relevant continuation
- Maintain narrative flow
- Include appropriate hooks between tweets
- Suggest optimal thread length

---

## 1.7 QT Studio - Hardcoded Original Post

**Problem:** Always shows same mock Vitalik post.

**Fix Required:**
- Allow user to paste tweet URL
- Fetch actual tweet data via API
- Generate QT angles specific to that tweet's content
- Show real engagement metrics

---

## 1.8 Quality Analyzer - String Matching Only

**Problem:** Uses simple regex matching, not actual quality analysis.

**Fix Required:**
- Use Claude to analyze content quality
- Provide specific feedback on:
  - Hook strength
  - Value proposition clarity
  - Originality
  - Voice consistency
  - Call to action effectiveness

---

# PART 2: BUILD THE ACTUAL PRODUCT VISION

## 2.1 Core Product: Viral Tweet Discovery System

### Purpose
Show the most viral tweets from Crypto Twitter across multiple timeframes, allowing users to identify trends and opportunities in real-time.

### Features

**A. Viral Tweet Feed**
- Real-time feed of viral crypto tweets
- Filter by timeframe: 1h, 6h, 24h, 7d, 30d
- Filter by category: DeFi, NFT, Trading, News, Memes
- Filter by engagement type: Most liked, Most retweeted, Fastest growing
- Show tweet media (images, videos) inline

**B. Tracked Accounts**
- Pre-configured list of 50+ top crypto accounts
- User can add/remove accounts
- Categorize: Founders, Protocols, Influencers, News, VCs
- Show which tracked accounts are currently most active

**C. Engagement Metrics**
- Likes, retweets, quotes, replies
- Engagement velocity (growth rate)
- Comparison to account's average
- "Viral score" calculation

### API Endpoint: `/api/viral/tweets`
```typescript
interface ViralTweetsRequest {
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
  category?: string;
  sortBy: 'likes' | 'retweets' | 'velocity' | 'total';
  limit: number;
  includeMedia: boolean;
}

interface ViralTweet {
  id: string;
  author: {
    handle: string;
    name: string;
    avatar: string;
    followers: number;
    verified: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnailUrl?: string;
  }[];
  metrics: {
    likes: number;
    retweets: number;
    quotes: number;
    replies: number;
    views?: number;
  };
  velocity: {
    likesPerHour: number;
    retweetsPerHour: number;
  };
  postedAt: string;
  tweetUrl: string;
  viralScore: number;
}
```

---

## 2.2 Core Product: Brand Voice AI System

### Purpose
Generate tweet suggestions that perfectly match Defi App's brand voice, not generic content.

### Brand Voice Definition

**A. Voice Profile Storage**
Store in Supabase:
```typescript
interface BrandVoice {
  id: string;
  name: string; // "Defi App"
  tone: string[]; // ["confident", "technical", "accessible", "bold"]
  vocabulary: {
    preferred: string[]; // words to use
    avoid: string[]; // words to never use
    signatures: string[]; // signature phrases
  };
  style: {
    useEmojis: boolean;
    emojiStyle: string; // "minimal", "moderate", "heavy"
    sentenceLength: string; // "short", "medium", "varied"
    punctuation: string; // "formal", "casual", "dramatic"
  };
  examples: {
    great: string[]; // 10+ examples of great tweets
    bad: string[]; // examples of what NOT to write
  };
  topics: {
    core: string[]; // main topics to cover
    avoid: string[]; // topics to never touch
  };
  competitors: {
    handles: string[]; // competitor handles to monitor
    differentiation: string; // how to stand out
  };
}
```

**B. Voice Training**
- Import 50+ of Defi App's best performing tweets
- Analyze patterns: length, tone, hooks, CTAs
- Extract signature phrases and style
- Create voice embedding for Claude prompts

**C. Voice-Matched Suggestions**
When generating content:
1. Load brand voice profile
2. Include 5 example tweets in context
3. Generate content that matches patterns
4. Score output against voice profile
5. Iterate if voice alignment < 80%

### API Endpoint: `/api/voice/generate`
```typescript
interface GenerateRequest {
  type: 'single' | 'thread' | 'qt' | 'reply';
  topic?: string;
  inspiration?: string; // viral tweet to respond to
  tone: 'standard' | 'spicier' | 'professional' | 'educational';
  count: number; // how many suggestions
}

interface GeneratedContent {
  id: string;
  content: string;
  type: string;
  voiceAlignment: number; // 0-100
  predictedEngagement: {
    likes: [number, number]; // range
    retweets: [number, number];
  };
  reasoning: string; // why this works
  variations: string[]; // 2 alternatives
}
```

---

## 2.3 Core Product: Image/Meme Generation

### Purpose
Generate accompanying visuals for tweets without leaving the dashboard.

### Features

**A. Image Generation via Claude**
- Text-to-image descriptions
- Claude generates prompts for image generation
- Support multiple styles: meme, infographic, screenshot mock, chart

**B. Meme Templates**
- Pre-loaded popular crypto meme templates
- Auto-suggest relevant templates based on tweet content
- Simple text overlay editor

**C. Media Library**
- Save generated images
- Organize by category
- Quick re-use for similar content

### API Endpoint: `/api/media/generate`
```typescript
interface MediaGenerateRequest {
  tweetContent: string;
  style: 'meme' | 'infographic' | 'chart' | 'screenshot' | 'custom';
  customPrompt?: string;
}

interface MediaGenerateResponse {
  suggestions: {
    type: string;
    description: string;
    prompt: string; // for image generation
    templateId?: string; // if using meme template
  }[];
}
```

---

## 2.4 UI/UX Redesign

### New Dashboard Layout

**Left Sidebar (Navigation)**
- Dashboard
- Viral Discovery (NEW)
- Create Content
- Brand Voice Settings (NEW)
- Analytics
- Settings

**Main Content Area**
1. **Viral Discovery Page**
   - Top section: Timeframe filters
   - Main feed: Viral tweets with media
   - Right sidebar: Currently trending topics

2. **Create Content Page**
   - Left: Editor with real AI assistance
   - Right: Suggestions panel (voice-matched)
   - Bottom: Media generation panel

3. **Brand Voice Page**
   - Voice profile editor
   - Example tweets manager
   - Voice test/preview

---

## 2.5 Technical Architecture

### API Keys Required
- Twitter API v2 (Bearer Token) - for viral tweets
- Claude API (Anthropic) - for AI generation
- Supabase - for data storage

### Caching Strategy
- Viral tweets: 5 min cache (Redis or in-memory)
- Brand voice: On-demand, cached per session
- Generated content: Not cached (always fresh)

### Rate Limiting
- Twitter API: 300 requests/15 min
- Claude API: Based on tier
- Implement queue for high-volume requests

---

# EXECUTION PLAN

## Phase 1: Fix Critical Bugs (Day 1)
1. Remove all hardcoded mock data from action-center
2. Remove hardcoded string operations from content-creator
3. Create real `/api/content/enhance` with Claude integration
4. Fix news section with proper fallbacks

## Phase 2: Viral Discovery System (Day 1-2)
1. Create `/api/viral/tweets` endpoint
2. Build viral tweet feed UI
3. Add timeframe filters
4. Display tweet media inline
5. Add engagement metrics display

## Phase 3: Brand Voice System (Day 2-3)
1. Create brand voice schema in Supabase
2. Build voice profile editor UI
3. Create `/api/voice/generate` endpoint
4. Import Defi App's best tweets for training
5. Build suggestion generation with voice matching

## Phase 4: Image Generation (Day 3)
1. Create `/api/media/generate` endpoint
2. Build media suggestion UI
3. Add meme template system
4. Integrate with content creation flow

## Phase 5: Polish & Deploy (Day 3-4)
1. End-to-end testing
2. Performance optimization
3. Error handling
4. Deploy to Vercel

---

# SUCCESS METRICS

1. **Viral Discovery**: Can see actual viral tweets within 5 min of posting
2. **Brand Voice**: Generated content matches Defi App's voice 80%+ of time
3. **Image Generation**: Can generate relevant image suggestions for any tweet
4. **No Mock Data**: Zero hardcoded/fake data anywhere in the app
5. **All Buttons Work**: Every button performs its intended function
6. **Real AI**: All "AI" features actually use Claude API

---

# FILES TO CREATE/MODIFY

## New Files
- `src/app/api/viral/tweets/route.ts` - Viral tweets API
- `src/app/api/voice/generate/route.ts` - Voice-matched content
- `src/app/api/voice/profile/route.ts` - Brand voice CRUD
- `src/app/api/media/generate/route.ts` - Image generation
- `src/app/api/content/enhance/route.ts` - Real AI enhancement
- `src/app/viral/page.tsx` - Viral discovery page
- `src/app/settings/voice/page.tsx` - Brand voice settings
- `src/components/viral/viral-feed.tsx` - Viral tweet feed component
- `src/components/viral/tweet-card.tsx` - Individual tweet display
- `src/components/voice/voice-editor.tsx` - Voice profile editor
- `src/components/media/media-generator.tsx` - Image generation UI
- `src/lib/claude.ts` - Claude API integration
- `src/lib/brand-voice.ts` - Voice matching utilities
- `src/types/viral.ts` - Viral tweet types
- `src/types/voice.ts` - Brand voice types

## Files to Heavily Modify
- `src/components/dashboard/action-center.tsx` - Real opportunities
- `src/components/content-studio/content-creator.tsx` - Real AI
- `src/components/content-studio/thread-builder.tsx` - Real expansion
- `src/components/content-studio/qt-studio.tsx` - Real tweet fetching
- `src/app/create/spicy/page.tsx` - Real analysis
- `src/components/layout/sidebar.tsx` - New navigation

## Files to Delete
- `PRD-USER-TESTING-FEEDBACK.md` (outdated)
- `PRD-COMPREHENSIVE-FIXES.md` (outdated)
