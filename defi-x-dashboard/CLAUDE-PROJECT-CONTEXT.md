# Claude Project Context - DeFi App X Strategy Dashboard

## CRITICAL: Read This First Before Making Any Changes

### Vercel Deployment
- **Production URL**: https://defi-x-dashboard.vercel.app
- **Create Page**: https://defi-x-dashboard.vercel.app/create
- **GitHub Repo**: https://github.com/cryptodoran/DefiAppXStrategy
- **Branch**: master

### Project Structure
```
DefiAppXStrategy/
└── defi-x-dashboard/          # Next.js 14 App Router project
    ├── src/
    │   ├── app/               # App router pages and API routes
    │   │   ├── api/           # API endpoints
    │   │   │   ├── media/     # Image generation & editing
    │   │   │   │   ├── edit-text/     # Claude-based text editing
    │   │   │   │   ├── edit-text-gemini/  # Gemini alternative
    │   │   │   │   └── test/  # API diagnostic endpoint
    │   │   │   └── ...
    │   │   └── create/        # Content creation page
    │   └── components/
    │       └── media/
    │           └── media-generator.tsx  # Edit Template UI
    └── image stuff/           # Test images
```

### Environment Variables Required on Vercel
```
ANTHROPIC_API_KEY=sk-ant-...   # Required for Edit Template AI
TWITTER_API_KEY=...            # For Twitter integration
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
GOOGLE_API_KEY=...             # For Gemini alternative
```

### Key Features to Test

#### 1. Edit Template AI (Priority Fix)
- **Location**: /create page → Edit Template section
- **Flow**: Upload image → Enter instruction (e.g., "change DAY 1 to DAY 2") → Click "Edit Template with AI"
- **Test Image**: `defi-x-dashboard/image stuff/4b7af7fc-8618-4927-97d9-f5579ab6971b.png`
- **Expected**: Image text changes, rest of image preserved

#### 2. Figma Templates Pro
- **Location**: /create page → Figma Templates section
- **Requires**: FIGMA_ACCESS_TOKEN on Vercel

### Common Issues & Solutions

#### "Edit failed" Error
1. Check ANTHROPIC_API_KEY is set on Vercel
2. Visit /api/media/test to verify API configuration
3. Check browser console (F12) for detailed error
4. Check Vercel function logs

#### Image Not Loading in Canvas
- The crossOrigin attribute must NOT be set for base64 data URLs
- Only set crossOrigin='anonymous' for HTTP/HTTPS URLs

#### Claude API Errors
- Model: claude-sonnet-4-20250514
- Ensure API key has access to vision models

### Testing Checklist
- [ ] API key configured: GET /api/media/test shows apiWorking: true
- [ ] Upload test image works
- [ ] Edit instruction recognized
- [ ] Canvas renders edited image
- [ ] Download/use edited image works

### DO NOT
- Deploy to different Vercel projects without user approval
- Change the production URL
- Modify environment variable names
- Use different model IDs without testing

### Contact
- If stuck, ask user for browser console errors
- If API issues, ask user to check Vercel environment variables
