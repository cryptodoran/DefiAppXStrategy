# PRD-06: War Room Real Data & Verification Links

## Objective
Ensure War Room content gaps and competitor alerts show real, verifiable data based on Defi App's actual X profile and competitors, with links to verify all claims.

## Current Problems
- Content gaps are hardcoded mock data
- Competitor alerts show fake activities
- No links to verify any claims
- Data doesn't reflect Defi App's actual needs

## Changes Required

### 1. Real Content Gap Analysis
Content gaps should be derived from:
- Analyzing Defi App's recent tweets (what we're NOT talking about)
- Analyzing competitor tweets (what THEY'RE talking about)
- Identifying gaps in our coverage

Each gap should show:
- Topic name
- Why it's a gap (evidence)
- Which competitors ARE covering it
- Suggested angle for Defi App
- Priority level

### 2. Competitor Alerts with Verification
For each alert, include:
- Direct link to the tweet/article/blog
- Actual engagement metrics
- Timestamp
- Screenshot or preview if possible

### 3. Evidence-Based Suggestions
Each content gap should prove itself:
- "You haven't posted about [X] in 30 days"
- "Competitors @zerion and @zapper posted about [X] this week"
- Link to competitor posts as evidence

### 4. Integration with Twitter API
- Fetch Defi App's recent posts to analyze coverage
- Fetch competitor posts for comparison
- Calculate what's missing

## Files to Modify
- `src/components/research/competitor-war-room.tsx` - Real data integration
- `src/app/api/twitter/content-gaps/route.ts` - New API for gap analysis
- `src/app/api/twitter/competitor-alerts/route.ts` - New API for alerts

## Success Criteria
- Every content gap has evidence explaining WHY it's a gap
- Every competitor alert has a clickable link to verify
- Data reflects Defi App's actual Twitter profile and competitors
