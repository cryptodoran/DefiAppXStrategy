# Product Requirements Document: DefiAppXStrategy V2

## Executive Summary
Complete overhaul of the DefiAppXStrategy dashboard to replace mock data with real APIs, fix broken features, and implement brand voice learning for authentic AI-generated content.

---

## P0 - CRITICAL (Immediate)

### 1. Analytics Page Crash [COMPLETED]
- **Status:** Fixed - Added mounted state checks to prevent Recharts hydration errors
- **Commit:** f7ea746

---

## P1 - HIGH PRIORITY

### 2. Opportunities Module - Real Data
**Current State:** Mock data with fake timestamps, links to profiles instead of tweets
**Requirements:**
- [ ] Fetch real viral tweets from Twitter API
- [ ] Show actual tweet timestamps
- [ ] Link directly to specific tweets (not profiles)
- [ ] Replace "Verify" text with link icon
- [ ] Only show genuinely recent opportunities

**Implementation:**
- Update `/api/viral/tweets` to fetch real data when Twitter API configured
- Update `ActionCenter` component to use proper tweet URLs
- Add timestamp formatting based on actual tweet times

### 3. Priority Metrics - Real Data
**Current State:** Shows 0 for all metrics
**Requirements:**
- [ ] Connect to real Twitter API for @defiapp metrics
- [ ] Display actual: Avg Likes, Avg Replies, Avg Retweets, Total Tweets
- [ ] Calculate engagement tier dynamically

**Implementation:**
- Use `/api/twitter/user/defiapp` endpoint
- Update MarketContextPanel to fetch and display real metrics

---

## P2 - HIGH PRIORITY

### 4. News Sources - Real Articles
**Current State:** Static platform names only
**Requirements:**
- [ ] Display actual trending crypto news from RSS feeds
- [ ] Auto-update daily
- [ ] Clickable article links
- [ ] Time filter options: 24h, 7d, 30d

**Implementation:**
- Update `/api/news/headlines` with better RSS parsing
- Add time filtering to news component
- Ensure fallback headlines have real links

### 5. CT Hashtags - Real Trending Data
**Current State:** Static generic hashtags
**Requirements:**
- [ ] Pull real trending crypto hashtags
- [ ] Auto-update daily
- [ ] Time filter options: 24h, 7d, 30d
- [ ] Add disclaimer about hashtag deboost risk

**Implementation:**
- Update `/api/twitter/trends` to fetch real CT hashtags
- Add filtering UI to hashtags component
- Add warning tooltip

---

## P3 - MAJOR FEATURES

### 6. Content Studio Overhaul
**Current State:** Generic AI-sounding content
**Requirements:**
- [ ] Viral Content Analysis: Analyze viral CT content from last 48h
- [ ] Brand Voice Learning: Scrape @defiapp tweets, learn tone/style
- [ ] Image Generation: Suggest images for tweets
- [ ] Quality Standard: Output must match brand voice, not sound like AI

**Implementation:**
- Create `/api/brand/voice` endpoint to analyze @defiapp tweets
- Store brand voice profile in prompts
- Update all content generation to use brand voice
- Add image suggestion using Claude vision

### 7. Daily Recommendations - Brand Voice
**Current State:** AI-typical phrases
**Requirements:**
- [ ] Apply brand voice learning
- [ ] Analyze actual viral CT content
- [ ] Remove AI patterns
- [ ] Match @defiapp posting style

**Implementation:**
- Update ProactiveSuggestions to use brand voice profile
- Update `/api/suggestions/proactive` with brand context

### 8. Thread Builder & QT Studio - Brand Voice
**Requirements:**
- [ ] Apply brand voice to thread generation
- [ ] Apply brand voice to QT suggestions
- [ ] Add image generation suggestions

### 9. Create Content from Trends - Fix Flow
**Current State:** Button doesn't properly set up draft
**Requirements:**
- [ ] Open Content Studio with trend context pre-filled
- [ ] Generate brand-voice suggestions for selected trend
- [ ] Include relevant hashtag/angle

---

## P4 - NEW FEATURES TO BUILD

### 10. Influencer Database
**Current State:** "Coming soon" placeholder
**Requirements:**
- [ ] Database of CT KOLs
- [ ] Metrics: follower count, growth rate, engagement rate
- [ ] Content topics, audience quality score
- [ ] Filtering/sorting capabilities

**Implementation:**
- Create `/api/influencers` endpoint
- Build influencer tracking database
- Create Influencers page UI

### 11. Path to #1 Strategy
**Current State:** Basic placeholder
**Requirements:**
- [ ] AI-generated strategic blueprint
- [ ] Current account performance analysis
- [ ] Trending topics leverage strategy
- [ ] Viral patterns analysis
- [ ] Competitor analysis
- [ ] Actionable tips
- [ ] Recommended posting schedule

**Implementation:**
- Create `/api/strategy/path-to-1` endpoint
- Build comprehensive Path to #1 page

### 12. Enhanced Analytics
**Current State:** Basic charts working
**Requirements:**
- [ ] Tweet performance analysis with KOL engagement tracking
- [ ] Day/Week/Month/Year growth metrics
- [ ] Engagement analytics (best content types, optimal times)
- [ ] Quick glance dashboard

---

## Technical Requirements

### API Integrations
1. **Twitter API:** Real-time tweets, trends, user metrics
2. **News RSS:** CoinDesk, The Block, Decrypt, Blockworks
3. **Claude API:** Brand-voice content generation
4. **Image Generation:** Claude vision for tweet visuals

### Brand Voice Training
1. Analyze @defiapp tweet history
2. Extract: tone, vocabulary, emoji patterns, structure
3. Create reusable brand voice profile
4. Apply to all content generation

### Data Accuracy
- All "live" data must be actually live
- Timestamps must be accurate
- Links must go to correct destinations
- Metrics must come from real APIs

---

## Implementation Order
1. P1: Opportunities + Priority Metrics (real Twitter data)
2. P2: News Sources + Hashtags (real feeds)
3. P3: Brand Voice System (core to all content)
4. P3: Apply brand voice to all generators
5. P4: Build new features (Influencers, Path to #1, Enhanced Analytics)
