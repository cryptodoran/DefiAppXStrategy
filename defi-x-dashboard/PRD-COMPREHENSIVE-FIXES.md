# Comprehensive Site Audit PRD

## Audit Date: January 12, 2026
## Status: Ready for Execution

---

## Critical Issues Identified

### ISSUE 1: Auto-Posting UI Gives False Impression

**Location:** `src/components/content-studio/content-creator.tsx`

**Problem:**
- "Post Now" button (line 224-230) implies the app will post to Twitter
- "Schedule" button (line 218-221) implies scheduling functionality
- Neither actually posts anything - they just show toasts
- User explicitly stated: "i dont want it to ever post for me"

**Current Behavior:**
```typescript
const handlePostNow = async () => {
  // Just shows a toast, doesn't actually post
  addToast({ type: 'success', title: 'Post scheduled!' });
  setContent('');
};
```

**Fix Required:**
- Replace "Post Now" with "Open in Twitter" - opens Twitter web intent with the content
- Remove "Schedule" button entirely (misleading)
- Make it clear this is a content DRAFTING tool, not a posting tool

---

### ISSUE 2: Content Calendar Shows Fake Scheduled Posts

**Location:** `src/app/suggestions/calendar/page.tsx`

**Problem:**
- Page shows mock "scheduled" posts (lines 36-65)
- Implies auto-posting capability that doesn't exist
- Stats like "Scheduled: X" and "Conflicts: X" are all fake

**Fix Required:**
- Either remove this page entirely, OR
- Rename to "Content Ideas Calendar" and make it clear these are DRAFT ideas, not scheduled posts
- Remove all "scheduled" language

---

### ISSUE 3: Content Queue in Dashboard is Misleading

**Location:** `src/components/dashboard/action-center.tsx`

**Problem:**
- "Content Queue" panel (lines 353-404) shows items with "Scheduled" status
- Mock data with fake scheduled times like "Today 2:30 PM"
- Implies auto-posting that doesn't exist

**Fix Required:**
- Rename to "Draft Ideas" or "Content Drafts"
- Remove "Scheduled" status and scheduled times
- Make it clear these are drafts for manual posting

---

### ISSUE 4: News Section Shows Sources Without Articles

**Location:** `src/components/dashboard/market-context.tsx` (lines 271-300)

**Problem:**
- "News Sources" section just shows source names (The Block, CoinDesk, etc.)
- Links go to homepage, not actual articles
- User said: "why would i care about sources without the actual articles?"

**Current Behavior:**
```jsx
{CRYPTO_NEWS_SOURCES.slice(0, 4).map((source) => (
  <div key={source.name}>
    <a href={source.url}>{source.name}</a>  // Just homepage link
  </div>
))}
```

**Fix Required:**
- Fetch actual headlines from RSS feeds
- Show article titles with direct links
- Keep source attribution but make content primary

---

### ISSUE 5: Trending Hashtags in Trends Page are Static Mock

**Location:** `src/app/research/trends/page.tsx` (lines 59-66)

**Problem:**
- Sidebar hashtags are hardcoded mock data
- Not clickable to verify on Twitter
- No real-time data

**Current Code:**
```typescript
const trendingHashtags = [
  { tag: '#DeFi', posts: 45000, change: 12 },  // Static!
  { tag: '#Ethereum', posts: 89000, change: 8 },
  // ...
];
```

**Fix Required:**
- Use `TRENDING_HASHTAGS` from `real-twitter-links.ts`
- Make each hashtag clickable with Twitter search URL
- Add "(click to verify on X)" text

---

### ISSUE 6: Trends Don't Have Verify Links

**Location:** `src/app/research/trends/page.tsx`

**Problem:**
- Main trend cards don't have "Verify on X" links
- Related hashtags in trend cards are not clickable
- No way to verify the trends are real

**Fix Required:**
- Add "View on X" button to each trend card
- Make related hashtags clickable with Twitter search URLs
- Add visual indicator that links go to Twitter

---

## Execution Plan

### Phase 1: Remove Auto-Posting Illusion (HIGH PRIORITY)
1. Replace "Post Now" with "Open in Twitter" using web intent
2. Remove "Schedule" button from content creator
3. Rename Content Queue to "Draft Ideas"
4. Update calendar page language

### Phase 2: Add Real News Headlines
1. Create RSS fetching service for crypto news
2. Update market-context to show actual headlines
3. Keep source attribution but show article titles

### Phase 3: Fix All Verify Links
1. Make trending hashtags clickable in trends page
2. Add verify buttons to trend cards
3. Make related hashtags in trends clickable

---

## Files to Modify

1. `src/components/content-studio/content-creator.tsx` - Fix posting buttons
2. `src/app/suggestions/calendar/page.tsx` - Fix scheduling language
3. `src/components/dashboard/action-center.tsx` - Fix content queue
4. `src/components/dashboard/market-context.tsx` - Add real news
5. `src/app/research/trends/page.tsx` - Add verify links
6. `src/services/real-twitter-links.ts` - Add news RSS support
7. Create `src/app/api/news/headlines/route.ts` - New API for headlines

---

## Success Criteria

1. No UI element implies auto-posting capability
2. All external data has clickable verify links to source
3. News section shows actual article headlines
4. User can click any hashtag to see it live on Twitter
5. All mock/static data replaced with real or clearly labeled
