# PRD-05: Schedule Tab Removal & Feature Salvage

## Objective
Remove the broken schedule/calendar page since the web app cannot post for users. Salvage useful features (optimal posting times) into the AI suggestions flow.

## Current State
- `/suggestions/calendar` exists as a "Content Planner"
- Shows mock content ideas on a calendar
- Cannot actually schedule or post anything
- Optimal posting times feature buried in this page

## Changes Required

### 1. Remove Schedule Tab
- Remove `/suggestions/calendar` from sidebar navigation
- Keep the page file but mark as deprecated (or delete entirely)
- Remove "Content Calendar" from Suggestions children in sidebar

### 2. Salvage Optimal Posting Times
Move optimal posting times data to:
- Dashboard page (in DynamicInsights component)
- AI Suggestions/Proactive Suggestions

The optimal times data:
```javascript
const optimalTimeSlots = [
  { time: '10:00 AM', score: 85 },
  { time: '2:00 PM', score: 92 },
  { time: '6:00 PM', score: 78 },
  { time: '9:00 PM', score: 71 },
];
```

### 3. Update Navigation
Suggestions menu should only have:
- Daily Recommendations
- Trending Topics

## Files to Modify
- `src/components/layout/sidebar.tsx` - Remove Content Calendar from navigation
- `src/app/suggestions/calendar/page.tsx` - Delete or deprecate
- `src/components/dashboard/proactive-suggestions.tsx` - Add optimal time hint to suggestions

## Success Criteria
- No broken schedule feature confusing users
- Optimal posting times visible where relevant
- Cleaner navigation structure
