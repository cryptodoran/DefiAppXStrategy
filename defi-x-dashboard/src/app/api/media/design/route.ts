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
- MAXIMUM 3 elements: logo, headline, optional subline
- NO cards, NO boxes, NO complex layouts
- ONE big message, dramatically presented

## DEFI APP LOGO (CRITICAL - GET THIS RIGHT):
The logo is a circle with a GAP/NOTCH at the top-right, like a progress indicator at 80%.
Create it with CSS:
\`\`\`css
.logo-circle {
  width: 22px;
  height: 22px;
  border: 2.5px solid white;
  border-radius: 50%;
  border-top-color: transparent; /* This creates the notch/gap */
  transform: rotate(45deg); /* Position the gap at top-right */
}
\`\`\`
Place the logo circle + "defi.app" text at TOP CENTER of design.

## BACKGROUND (MUST HAVE DEPTH):
Don't use plain black. Create atmosphere:
1. Base: #000000
2. Add gradient overlay: radial-gradient from center, using accent color at 15-20% opacity
3. Add grid pattern: 1px lines, accent color tinted, 8-10% opacity, 40px spacing
4. Add subtle noise/texture effect with tiny dots or secondary grid
5. Optional: Add diagonal lines or geometric shapes at very low opacity for depth

Example background CSS:
\`\`\`css
background:
  radial-gradient(ellipse at center, rgba(ACCENT, 0.15) 0%, transparent 60%),
  linear-gradient(rgba(ACCENT, 0.08) 1px, transparent 1px),
  linear-gradient(90deg, rgba(ACCENT, 0.08) 1px, transparent 1px),
  #000000;
background-size: 100% 100%, 40px 40px, 40px 40px, 100% 100%;
\`\`\`

## TYPOGRAPHY:
- Headline: 90-130px, font-weight 900, uppercase, letter-spacing: -3px
- Add text-shadow for glow: 0 0 40px rgba(ACCENT, 0.5), 0 0 80px rgba(ACCENT, 0.3)
- Font: system-ui, -apple-system, sans-serif

## COLORS:
- Gold: #FFD700
- Green: #00FF88
- Red: #FF4444
- Text: #FFFFFF

## OUTPUT: Raw HTML only, no explanation.`;

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
