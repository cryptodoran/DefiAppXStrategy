# PRD-09: Dashboard "Ready to Post" Optimization

## Objective
Optimize the "Ready to Post" section on the dashboard. It currently takes too long to load and takes up too much space when loaded.

## Current Problems
1. ProactiveSuggestions component fetches 5 suggestions, each can be long
2. Loading state shows 3 skeleton cards
3. When loaded, shows all suggestions expanded - takes massive vertical space
4. Each suggestion shows: badges, full content, based-on info, relevance reason, image suggestion, actions

## Changes Required

### 1. Truncated Default View
- Show suggestions in a compact, truncated format by default
- Display ONE suggestion at a time with navigation (prev/next or scroll)
- Collapsible/expandable detail view

### 2. Card Design Optimization
Default (truncated) view shows:
- Engagement badge (viral/high/medium/low)
- Voice match score
- First 100 characters of content with "..."
- "Copy" and "Expand" buttons

Expanded view shows:
- Full content
- Based on source
- Relevance reason
- Image suggestion
- All action buttons

### 3. Carousel/Scroll Navigation
Instead of vertical stack of 5 cards:
- Horizontal scroll or carousel
- Or: Single card with prev/next navigation
- Counter showing "1 of 5"

### 4. Loading Optimization
- Show single skeleton instead of 3
- Fetch 3 suggestions instead of 5 (faster)
- Cache previous suggestions while refreshing

## Files to Modify
- `src/components/dashboard/proactive-suggestions.tsx` - Complete redesign for compactness

## Success Criteria
- Ready to Post section loads faster
- Takes up less vertical space by default
- User can still access full details when needed
- Cleaner, less overwhelming dashboard
