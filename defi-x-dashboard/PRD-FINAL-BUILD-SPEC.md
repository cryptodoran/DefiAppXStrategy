# PRD: DeFi App X Strategy Platform - Final Build Spec Execution

## Document Version: 3.0
## Date: January 12, 2026
## Source: DeFi_App_FINAL_BUILD_SPEC.docx
## Status: Ready for Execution

---

# EXECUTIVE SUMMARY

The core insight from the spec: **Users don't want to come up with ideas and have AI improve them. They want AI to come up with ideas that are ready to post, in their voice, based on what's actually happening.**

---

# WHAT'S ALREADY BUILT (Previous PRD)

- ✅ Claude API integration library (`src/lib/claude.ts`)
- ✅ Viral tweets discovery API (`/api/viral/tweets`)
- ✅ Viral discovery page with timeframe filters (`/viral`)
- ✅ Content enhancement API (spicier, context, shorten, hook)
- ✅ QT angles generation API (`/api/content/qt-angles`)
- ✅ Media suggestion API (`/api/media/suggest`)
- ✅ Thread builder with real AI
- ✅ QT studio with URL-based tweet fetching
- ✅ Brand voice settings page with AI analysis
- ✅ Action center showing real viral tweets

---

# WHAT STILL NEEDS TO BE BUILT

## 1. Proactive Suggestion Engine (CRITICAL)

**The Problem:** Current dashboard requires user to type ideas first. The spec says: "Default view: AI-generated suggestions ready to post"

**Solution:**
- Dashboard opens with 5-10 tweet suggestions already generated
- Each suggestion shows:
  - Tweet text (in DeFi App voice)
  - Why it's relevant NOW (based on viral trends)
  - Image suggestion
  - Predicted engagement (Low/Medium/High/Viral)
- Actions: Post (copy), Edit, Variations, Dismiss, Refresh

### API Endpoint: `/api/suggestions/proactive`
```typescript
interface ProactiveSuggestion {
  id: string;
  content: string;
  relevanceReason: string;
  basedOn?: {
    type: 'viral_tweet' | 'trending_topic' | 'market_move' | 'news';
    source: string;
    link?: string;
  };
  imageSuggestion: {
    type: 'meme' | 'chart' | 'infographic' | 'screenshot';
    description: string;
    prompt: string;
  };
  predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
  voiceMatchScore: number;
}
```

---

## 2. Voice Profile Analyzer

**The Problem:** Voice profile is hardcoded. Spec says: "Before generating ANY content, Claude must analyze DeFi App's existing tweets"

**Solution:**
- Create API that analyzes @deikiapp tweets
- Extract: tone, phrases, topics, structures, emoji usage
- Generate voice profile document
- Store and use in all generation

### Voice Profile Structure:
```typescript
interface AnalyzedVoiceProfile {
  tone: {
    formalCasualScale: number; // 1-10
    humorLevel: number;
    technicalLevel: number;
  };
  patterns: {
    avgTweetLength: number;
    usesThreads: boolean;
    usesEmojis: boolean;
    emojiFrequency: string;
  };
  vocabulary: {
    commonPhrases: string[];
    neverUsePhrases: string[];
    preferredTerms: string[];
  };
  topics: {
    primary: string[];
    secondary: string[];
    avoid: string[];
  };
  bestPerformers: {
    tweet: string;
    engagement: number;
    whyItWorked: string;
  }[];
  antiExamples: string[]; // Tweets that would NEVER come from DeFi App
}
```

---

## 3. Real-Time Voice Match Indicator

**The Problem:** User doesn't know if their tweet matches DeFi App's voice until after posting.

**Solution:**
- As user types, show voice match score in real-time
- Visual indicator: 🔴 (<50%), 🟡 (50-80%), 🟢 (>80%)
- Suggestions for improvement if score is low

---

## 4. Market Pulse Widget

**The Problem:** No market context on dashboard.

**Solution:**
- Show BTC/ETH prices with 24h change
- Fear & Greed Index
- Top 3 trending topics on CT
- Compact widget on dashboard

---

## 5. Enhanced Dashboard Layout

**Current:** Empty content creator as main view
**Required:** AI suggestions as main view, content creator as secondary

### New Dashboard Structure:
```
┌─────────────────────────────────────────────────────────┐
│ DASHBOARD                                               │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │ MARKET PULSE            │ │ TOP VIRAL RIGHT NOW     │ │
│ │ BTC: $XX,XXX (+X.X%)    │ │ @user: "tweet..."       │ │
│ │ ETH: $X,XXX (+X.X%)     │ │ 🔥 15.2K likes          │ │
│ │ Fear & Greed: XX        │ │ [View] [Inspire Me]     │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ READY TO POST (Refresh for new suggestions)            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SUGGESTION 1                           [HIGH] 🟢 92% │ │
│ │ "Tweet content here..."                             │ │
│ │ 📍 Based on: @vitalik viral tweet about L2s        │ │
│ │ 🖼️ Image: Chart showing L2 TVL growth              │ │
│ │ [Copy to Post] [Edit] [Variations] [Dismiss]        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SUGGESTION 2                        [MEDIUM] 🟢 87% │ │
│ │ ...                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

# EXECUTION PLAN

## Phase 1: Proactive Suggestions API
1. Create `/api/suggestions/proactive` endpoint
2. Assemble context: viral tweets, trends, market data
3. Generate 5-10 suggestions using Claude
4. Include relevance reason, image suggestion, engagement prediction

## Phase 2: Dashboard Redesign
1. Create new dashboard component with suggestions-first layout
2. Add market pulse widget
3. Add "top viral right now" preview
4. Replace current "opportunities" with "ready to post" suggestions

## Phase 3: Voice Match Indicator
1. Add debounced voice analysis as user types
2. Show score badge in content creator
3. Add improvement suggestions if score < 80%

## Phase 4: Market Data Integration
1. Create `/api/market/pulse` endpoint
2. Fetch BTC/ETH prices from CoinGecko
3. Fetch Fear & Greed from alternative.me
4. Display in compact widget

## Phase 5: Polish
1. Ensure all "Last updated X ago" timestamps work
2. Test all links open correct destinations
3. Test all buttons perform actions
4. Verify voice matching accuracy

---

# SUCCESS CRITERIA (from spec)

Data Accuracy:
- [ ] No displayed tweet is older than claimed
- [ ] 'Just posted' means <1 hour old
- [ ] All data shows 'Last updated X ago' timestamp
- [ ] Stale data shows error state, not fake data

Links:
- [ ] Every tweet preview links to actual tweet on X
- [ ] Every news item links to actual article
- [ ] 'View on X' opens correct tweet in new tab

Buttons:
- [ ] Every visible button performs an action
- [ ] Every button shows loading state during async
- [ ] Every button shows success/error feedback

Voice:
- [ ] Generated tweets sound like DeFi App
- [ ] 'Make it spicier' produces CT-appropriate spice
- [ ] Voice profile is documented and editable

Overall:
- [ ] First-time user can generate and post a tweet in <2 minutes
- [ ] No feature is fake or mocked
- [ ] Product feels premium, not hacky

---

# FILES TO CREATE/MODIFY

## New Files:
- `src/app/api/suggestions/proactive/route.ts`
- `src/app/api/market/pulse/route.ts`
- `src/app/api/voice/analyze/route.ts`
- `src/components/dashboard/proactive-suggestions.tsx`
- `src/components/dashboard/market-pulse.tsx`
- `src/components/dashboard/top-viral-preview.tsx`
- `src/components/ui/voice-match-indicator.tsx`

## Files to Modify:
- `src/app/page.tsx` - Redesign dashboard layout
- `src/components/content-studio/content-creator.tsx` - Add voice indicator
- `src/lib/claude.ts` - Add voice analysis function

---

**NO SHORTCUTS. EVERYTHING MUST WORK.**
