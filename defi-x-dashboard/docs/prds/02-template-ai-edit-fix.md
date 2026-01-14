# PRD-02: Template AI Edit Fix + Gemini Option

## Objective
1. Fix the "edit failed, failed to load image" error in template editing
2. Add option to use Gemini instead of Claude for template AI editing

## Current Problem
- Template editing fails with "failed to load image" error
- Only Claude is available for template AI editing

## Root Cause Analysis
The error occurs in `editImageWithCanvas` when:
1. Image URL is invalid or inaccessible
2. CORS issues with external images
3. Base64 data is corrupted or too large

## Changes Required

### 1. Fix Image Loading Error
- Add better error handling in canvas image loading
- Add image validation before processing
- Add retry logic for failed image loads
- Improve error messages to be more descriptive

### 2. Add Gemini Option
- Add model selection dropdown in Edit Template section
- Options: "Claude Vision" (default), "Gemini Nano"
- Create new API route `/api/media/edit-text-gemini` for Gemini processing
- Use Google AI SDK for Gemini integration

## Files to Modify
- `src/components/media/media-generator.tsx` - Add model selector, improve error handling
- `src/app/api/media/edit-text/route.ts` - Fix image loading, add validation
- `src/app/api/media/edit-text-gemini/route.ts` - New file for Gemini processing

## Success Criteria
- Template editing works reliably without "failed to load image" errors
- User can choose between Claude and Gemini for template editing
