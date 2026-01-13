import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Claude-powered HTML/CSS design generator
// Generates professional graphics matching Defi App's actual brand style
// Based on real examples from Defi App Image Examples folder

interface DesignRequest {
  prompt: string;
  style?: 'gold' | 'green' | 'red' | 'dark' | 'data';
  width?: number;
  height?: number;
}

// Defi App Brand Kit - Based on actual graphics
const DEFI_APP_BRAND = {
  // Theme colors based on actual campaigns
  themes: {
    gold: {
      accent: '#FFD700',
      accentDark: '#B8860B',
      gradient: 'linear-gradient(180deg, #1a1400 0%, #0a0800 50%, #000000 100%)',
      glow: 'rgba(255, 215, 0, 0.4)',
    },
    green: {
      accent: '#00FF66',
      accentDark: '#00CC52',
      gradient: 'linear-gradient(180deg, #001a0d 0%, #000d06 50%, #000000 100%)',
      glow: 'rgba(0, 255, 102, 0.4)',
    },
    red: {
      accent: '#FF3333',
      accentDark: '#CC0000',
      gradient: 'linear-gradient(180deg, #1a0000 0%, #0d0000 50%, #000000 100%)',
      glow: 'rgba(255, 51, 51, 0.4)',
    },
    dark: {
      accent: '#FFFFFF',
      accentDark: '#CCCCCC',
      gradient: 'linear-gradient(180deg, #0a0a0a 0%, #050505 50%, #000000 100%)',
      glow: 'rgba(255, 255, 255, 0.2)',
    },
  },
  colors: {
    background: '#000000',
    backgroundAlt: '#0a0a0a',
    textPrimary: '#FFFFFF',
    textMuted: '#888888',
    gridLine: 'rgba(255, 255, 255, 0.05)',
  },
  logo: {
    text: 'defi.app',
    altText: 'Defi App',
  },
};

const DESIGN_SYSTEM_PROMPT = `You create SIMPLE, DRAMATIC social media graphics for Defi App.

## THE #1 RULE: KEEP IT SIMPLE
- Your designs should have MAXIMUM 3 elements: logo, headline, optional subline
- NO cards, NO boxes, NO complex layouts, NO multiple sections
- ONE big message, dramatically presented
- Think billboard advertising - simple and impactful

## EXACT SPECIFICATIONS:

### Layout (ALWAYS follow this):
\`\`\`
[Logo at top: small, centered]

[HUGE HEADLINE]
[in center of image]

[small subline in accent color]

[Logo at bottom OR leave empty]
\`\`\`

### Typography:
- Headline: font-size 80-120px, font-weight 900, uppercase, letter-spacing: -2px
- Use system fonts: font-family: system-ui, -apple-system, sans-serif
- Make text VERY BOLD with text-shadow for depth

### Colors - USE THESE EXACT VALUES:
- Background: #000000 (pure black)
- Gold accent: #FFD700 (bright yellow-gold, NOT olive/brown)
- Green accent: #00FF88 (bright neon green)
- Red accent: #FF4444 (bright red)
- Text: #FFFFFF (pure white)

### Logo format:
- A thin white circle (border: 2px solid white, border-radius: 50%, width: 20px)
- Followed by "defi.app" in white, font-size 16px
- Position: top center, padding 40px from top

### Background:
- Pure black #000000
- Subtle grid: background-image with 1px lines at 5% opacity
- Optional: radial gradient glow in accent color at 10% opacity behind headline

## WHAT NOT TO DO:
- NO multiple cards or boxes
- NO complex infographics
- NO lists or bullet points
- NO small text sections
- NO cluttered layouts
- NO muddy colors (use BRIGHT pure colors)

## OUTPUT: Raw HTML only, no markdown, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const body: DesignRequest = await request.json();
    const { prompt, style = 'dark', width = 1024, height = 1024 } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: 'Prompt must be at least 5 characters' },
        { status: 400 }
      );
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: 'Claude API not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: anthropicKey });

    const styleGuide: Record<string, string> = {
      gold: `GOLD theme. Background: #000000. Accent: #FFD700 (bright gold). Create a SIMPLE design: defi.app logo at top, ONE huge white headline (80-120px), ONE gold subline below. NO cards, NO boxes. Just dramatic typography on black. Add subtle gold radial glow behind text.`,
      green: `GREEN theme. Background: #000000. Accent: #00FF88 (bright green). SIMPLE design: defi.app logo at top, ONE huge white headline, ONE green subline (like "NOW LIVE"). NO complexity. Subtle green glow behind text.`,
      red: `RED theme. Background: #000000. Accent: #FF4444 (bright red). SIMPLE design: defi.app logo at top, ONE huge white headline, ONE red accent word or subline. NO cards. Think dramatic announcement.`,
      dark: `DARK theme. Background: #000000. Text: #FFFFFF. SIMPLE design: defi.app logo at top, ONE huge white headline, maybe a subtle gray subline. Maximum simplicity, maximum impact. NO colors except white on black.`,
      data: `DATA theme. Background: #000000. For stats/numbers. SIMPLE: defi.app logo, ONE or TWO big numbers as the headline, small label text. Keep it minimal - just the key metric prominently displayed. NO complex charts.`,
    };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Create an HTML/CSS design for a ${width}x${height}px social media graphic.

DESIGN BRIEF: ${prompt}

STYLE: ${style}
${styleGuide[style]}

Remember:
- Output ONLY the raw HTML code
- No markdown, no explanations
- Self-contained with all CSS inline or in <style> tags
- Design must be exactly ${width}x${height}px
- Make it visually impressive and professional`,
        },
      ],
      system: DESIGN_SYSTEM_PROMPT,
    });

    // Extract the HTML from the response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No design generated');
    }

    let html = textContent.text.trim();

    // Clean up any markdown code blocks if Claude added them
    html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '');

    // Remove any @import statements for fonts (they won't work in html-to-image)
    html = html.replace(/@import\s+url\([^)]+\);?\s*/gi, '');

    // Replace any font-family declarations that reference external fonts with system fonts
    html = html.replace(/font-family:\s*['"]?Inter['"]?[^;]*/gi, "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");

    // Validate it looks like HTML
    if (!html.includes('<') || !html.includes('>')) {
      throw new Error('Invalid HTML generated');
    }

    return NextResponse.json({
      html,
      prompt,
      style,
      width,
      height,
      provider: 'claude-html',
      _note: 'Render this HTML to an image using html-to-image on the client',
    });
  } catch (error) {
    console.error('Design generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate design' },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;

  return NextResponse.json({
    status: hasKey ? 'available' : 'unavailable',
    provider: 'claude-html',
    description: 'Generates graphics matching Defi App brand style - bold condensed typography, grid backgrounds, dramatic layouts',
    supportedStyles: ['gold', 'green', 'red', 'dark', 'data'],
    styleDescriptions: {
      gold: 'Trading/money content - gold accents, premium feel',
      green: 'Launches/live announcements - green accents',
      red: 'Competitions/battle themes - red accents',
      dark: 'General announcements - clean black & white',
      data: 'Metrics/stats - dashboard style',
    },
    brandElements: {
      logo: 'defi.app with circle icon',
      typography: 'Bold condensed italic uppercase',
      background: 'Black with subtle grid pattern',
    },
    _note: hasKey ? 'Ready to generate on-brand designs' : 'Add ANTHROPIC_API_KEY to enable',
  });
}
