# PRD-08: Settings Page Cleanup

## Objective
Simplify settings page by removing unnecessary tabs and options, fixing integration display, and adding password protection.

## Current State
Settings has 4 tabs:
1. Account - Profile info, security
2. Integrations - Connected services
3. Notifications - Alert preferences
4. Preferences - Display settings, content defaults, danger zone

## Changes Required

### 1. Remove Notifications Tab
- Delete entire notifications tab
- These alerts don't actually work (no push notification system)

### 2. Remove Security Tab Content
- Remove 2FA, API access, sessions sections
- These don't function in a Vercel-deployed web app

### 3. Fix Integrations Display
- Show all connected data providers
- If API key is in .env, show as CONNECTED (locked/read-only)
- Remove "Setup" buttons for env-configured services
- Just visual information, no action needed

### 4. Simplify Preferences Tab
- REMOVE: Display Preferences section (dark mode, layout)
  - Dark mode should be default and unchangeable
  - Layout should be default
- KEEP: Spice level warnings toggle
- KEEP: Default spice level selector
- CHECK: AI model preference - if it does something, keep it; if not, remove it
- REMOVE: Danger Zone section entirely

### 5. Add Password Protection to Site
- Require password "sesame" to access the entire application
- Add middleware or layout-level check
- Simple password gate on first visit
- Store in sessionStorage after entry

## Files to Modify
- `src/app/settings/page.tsx` - Remove tabs and options
- `src/middleware.ts` - Add password protection
- `src/components/auth/password-gate.tsx` - New component for password entry

## Success Criteria
- Settings page is clean and focused
- No non-functional options
- Integrations show accurate status
- Site requires password "sesame" to access
