# PRD-01: UI/UX Simplification & Anti-Overengineering

## Objective
Simplify the entire UI/UX from the standpoint of a senior UX designer who doesn't want to overwhelm users. Remove unnecessary complexity, consolidate redundant features, and create a cleaner, more focused experience.

## Current Problems
1. AI Suggestions has separate meme/infographic/chart/screenshot/custom types - unnecessary complexity
2. Exposure Budget bar (67%) exists but has no real functionality - confusing
3. Multiple tabs and options that don't add value
4. Too many clicks to accomplish simple tasks

## Changes Required

### 1. Media Generator Simplification
- **REMOVE**: Separate meme/infographic/chart/screenshot/custom suggestion types
- **REPLACE WITH**: Single "AI Suggestion" with one editable prompt field
- Keep: Design from Scratch styles (Claude HTML + Flux AI)
- Keep: Edit Template functionality
- Keep: Figma Templates

### 2. Exposure Budget
- **REMOVE**: The 67% exposure bar from status bar (line 233-253 in status-bar.tsx)
- **REMOVE**: The 73% exposure bar from sidebar bottom section
- **REASONING**: It's a hardcoded placeholder that provides no real value and confuses users

### 3. Sidebar Cleanup
- Remove exposure budget section from sidebar bottom

### 4. General Principles Applied
- Reduce visual noise
- Single clear path for each action
- No options that don't do anything

## Files to Modify
- `src/components/media/media-generator.tsx` - Simplify suggestion types
- `src/components/layout/status-bar.tsx` - Remove exposure bar
- `src/components/layout/sidebar.tsx` - Remove exposure budget section

## Success Criteria
- User sees ONE AI suggestion field instead of 5 types
- No confusing "Exposure Budget" bar anywhere
- Cleaner, more focused interface
