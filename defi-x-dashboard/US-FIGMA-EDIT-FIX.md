# User Story: Fix Figma Template AI Text Editing

## US-FIX-001: AI Template Text Editing Must Work End-to-End

**As** Sarah (Social Media Manager)
**I want** to edit text in Figma templates using AI
**So that** I can quickly create variations without manual editing

### The Feature Flow
1. User uploads image OR selects Figma template
2. User enters instruction: "change DAY 1 to DAY 2"
3. AI (Claude/Gemini) analyzes image, returns text regions with coordinates
4. Canvas draws over original text with background color
5. Canvas draws new text with matching styling
6. Result: Original image with ONLY the specified text changed

### Test Case
- **Original Image**: `defi-x-dashboard/image stuff/4b7af7fc-8618-4927-97d9-f5579ab6971b.png`
- **Instruction**: "change DAY 1 to DAY 2"
- **Expected Result**: Image identical to original EXCEPT "DAY 1" now says "DAY 2"

### Acceptance Criteria
- [ ] AI correctly identifies "DAY 1" text location
- [ ] AI returns accurate x, y, width, height percentages
- [ ] Canvas paints over original "DAY 1" text completely
- [ ] Canvas draws "DAY 2" with matching font weight (bold/900)
- [ ] Canvas draws "DAY 2" with matching color (white)
- [ ] Canvas draws "DAY 2" with matching position (left-aligned)
- [ ] Final image looks professional, not glitchy
- [ ] Text is readable and properly sized

### Current Architecture

**API Endpoints:**
- `/api/media/edit-text` - Claude-based text analysis
- `/api/media/edit-text-gemini` - Gemini-based text analysis

**Client Component:**
- `src/components/media/media-generator.tsx`
- Function: `editImageWithCanvas()` - Canvas rendering
- Function: `generateEditedTemplate()` - Orchestrates the flow

### Known Issues to Investigate
1. AI coordinate accuracy - are x, y, width, height percentages correct?
2. Background color detection - is it matching the area behind text?
3. Font rendering - is the font weight/size/spacing matching?
4. Canvas scaling - is the scaleFactor calculation correct?

### Completion Promise
**THIS USER STORY IS COMPLETE WHEN:**
Testing the feature live produces an edited image where "DAY 1" is changed to "DAY 2" and the result looks visually correct compared to the original.

---

## Debug Steps for Ralph Loop

1. Start dev server: `npm run dev`
2. Navigate to content creator page
3. Upload the test image
4. Enter instruction: "change DAY 1 to DAY 2"
5. Click "Edit Template with AI"
6. Compare result to original
7. If broken: check console logs, fix code, iterate
8. If working: document success, exit loop
