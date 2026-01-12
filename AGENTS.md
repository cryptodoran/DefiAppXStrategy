# DeFi App X Strategy Dashboard - Agent Instructions

## Project Overview
Building a comprehensive X (Twitter) Strategy Dashboard for DeFi App to dominate Crypto Twitter (CT).

## Tech Stack
- **Frontend**: Next.js 14+, React 18+, TypeScript, TailwindCSS, Zustand, React Query, Recharts, shadcn/ui, Framer Motion
- **Backend**: Next.js API routes, PostgreSQL, Prisma
- **AI**: Claude API (Anthropic) for content generation and analysis

## Key Architectural Decisions

### State Management
- Use Zustand for client-side state (UI state, user preferences)
- Use React Query for server state (API data, caching)

### Styling
- TailwindCSS with dark mode as default (CT culture)
- shadcn/ui for accessible, consistent components
- DeFi App brand colors as accents

### Data Flow
- Prisma for database ORM
- Next.js API routes for backend endpoints
- React Query for data fetching with proper caching

## Important Patterns

### Component Structure
```
/src
  /app - Next.js app router pages
  /components
    /ui - Base shadcn components
    /dashboard - Dashboard-specific components
    /content - Content creation components
    /research - Research assistant components
  /lib - Utilities and helpers
  /hooks - Custom React hooks
  /store - Zustand stores
  /types - TypeScript type definitions
  /api - API route handlers
  /services - External service integrations
```

### API Integration
- X API v2 for Twitter data
- Claude API for AI content generation
- Implement rate limiting and error handling

## Known Gotchas

1. **X API Rate Limits**: Implement proper rate limit handling and caching
2. **Claude API**: Use streaming for long content generation
3. **Dark Mode**: Default to dark, use CSS variables for theming
4. **Real-time Updates**: Use WebSockets or polling for engagement feed

## Quality Standards

1. All components must be TypeScript with proper types
2. Use React Query for all data fetching
3. Implement loading and error states
4. Add keyboard shortcuts from the start
5. Mobile-responsive but desktop-first

## Content Quality ("Anti-Slop")
- Quality score system (1-100)
- Check originality, value density, engagement hooks
- Brand voice consistency checking
- Block posting if score below threshold
