# PRD-03: News Feed 30-Minute Polling with Smart Categorization

## Objective
Add 30-minute polling to news feeds and market data with intelligent categorization logic for Hot/Featured/More categories.

## Current State
- News refreshes every 60 seconds (too frequent, wastes API calls)
- Manual categorization into Hot/Featured/More tabs
- No intelligent sorting algorithm

## Changes Required

### 1. Polling Interval Changes
- Change news refresh from 60 seconds to 30 minutes (1800000ms)
- Keep market prices (BTC/ETH/Fear&Greed) at 60-second refresh (they're lightweight)
- Add visual indicator showing "Last updated X minutes ago"

### 2. Smart Categorization Logic
When fetching news, automatically categorize based on:

**HOT (Breaking/High Priority):**
- Published within last 2 hours
- Contains keywords: "breaking", "urgent", "just in", "alert"
- High engagement signals from source

**FEATURED (Important but not breaking):**
- Published within last 12 hours
- From tier-1 sources (CoinDesk, Cointelegraph)
- Contains DeFi-specific keywords

**MORE (General Interest):**
- Everything else
- Older than 12 hours
- General crypto news

### 3. Caching Strategy
- Cache news in localStorage with timestamp
- Only fetch new data if cache is older than 30 minutes
- Show cached data immediately, then update in background

## Files to Modify
- `src/components/dashboard/market-context.tsx` - Update polling interval, add categorization
- `src/app/api/news/headlines/route.ts` - Add categorization logic server-side

## Success Criteria
- News refreshes every 30 minutes automatically
- Smart categorization into Hot/Featured/More
- Reduced API calls while maintaining freshness
