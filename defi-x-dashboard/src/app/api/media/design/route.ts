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

const DESIGN_SYSTEM_PROMPT = `You are the official graphic designer for Defi App. You create HTML/CSS designs that EXACTLY match Defi App's actual brand style.

## DEFI APP VISUAL IDENTITY (MANDATORY)

### Typography - THIS IS CRITICAL:
- Headlines: EXTREMELY BOLD, CONDENSED, ALL CAPS
- Use font-weight: 900 (Black) or 800 (Extra Bold)
- Use font-stretch: condensed or letter-spacing: -0.02em to make it tight
- Headlines are often ITALICIZED for impact (font-style: italic)
- Font stack: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif (for condensed look)
- Secondary text: Clean sans-serif, normal weight

### Logo Placement:
- ALWAYS include the Defi App logo
- Logo format: A circle (○) followed by "defi.app" or "Defi App"
- Position: Top center OR bottom center of the design
- Logo should be white, clean, relatively small (not overpowering)
- CSS for logo circle: A simple ring/circle outline

### Background Style:
- Pure black (#000000) or very dark gradient
- ALWAYS include subtle grid pattern overlay (thin lines, very low opacity ~5%)
- Grid creates a tech/matrix aesthetic
- Optional: Subtle radial glow behind main content matching theme color

### Color Themes (use based on content mood):
- GOLD (#FFD700): For premium, trading, money-related content
- GREEN (#00FF66): For launches, live announcements, positive news
- RED (#FF3333): For competitions, battle/gaming themes, urgent content
- DARK/WHITE: For neutral announcements

### Design Elements:
- Large, dramatic typography as the focal point
- Subtle reflections/gradients on text for 3D metallic effect
- Angular/hexagonal shapes for buttons/CTAs
- Starfield or particle dots in background (optional)
- Thin border lines creating tech aesthetic

### Layout Patterns:
1. Logo at top center (small)
2. HUGE headline in center (the main message)
3. Subtext below headline (smaller, often in theme accent color)
4. Optional CTA button (angular shape)
5. Logo at bottom center (if not at top)

## CRITICAL RULES:
1. Output ONLY raw HTML code - no explanations, no markdown
2. Headlines must be BOLD CONDENSED ALL CAPS - this is the signature look
3. ALWAYS include subtle grid pattern in background
4. ALWAYS include defi.app logo (circle + text)
5. NO external resources - use CSS only
6. Make it look DRAMATIC and PREMIUM
7. Font stack for headlines: Impact, 'Arial Black', sans-serif with font-weight:900

## HTML STRUCTURE:
<!DOCTYPE html>
<html>
<head><style>
.container { position: relative; background: #000; }
.grid { position: absolute; inset: 0; opacity: 0.05;
  background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 40px 40px; }
.logo { font-family: system-ui, sans-serif; color: white; }
.headline { font-family: Impact, 'Arial Black', sans-serif; font-weight: 900;
  text-transform: uppercase; color: white; font-style: italic; }
</style></head>
<body style="margin:0;padding:0;">
  <div class="container">
    <div class="grid"></div>
    <!-- content -->
  </div>
</body>
</html>`;

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
      gold: `GOLD THEME for trading/money content. Use gold accent (#FFD700) for key text and glows. Black background with subtle grid. Headlines should be HUGE, BOLD, CONDENSED, ITALIC, ALL CAPS in white or gold. Include "defi.app" logo. Think: "MILLION DOLLAR TRADING CONTEST" style. Luxurious, premium feel with gold metallic hints.`,
      green: `GREEN THEME for launches/live announcements. Use bright green (#00FF66) for accent text like "NOW LIVE" or "on Android". Black background with subtle grid and green radial glow. Headlines HUGE BOLD CONDENSED ITALIC ALL CAPS in white. Green for emphasis words. Include "defi.app" logo at top. Think: App launch announcement style.`,
      red: `RED THEME for competitions/battle/urgent content. Use red (#FF3333) for accents and glows. Black background with subtle grid. Headlines HUGE BOLD CONDENSED ITALIC ALL CAPS. Red angular shapes, battle/competition aesthetic. Include "Defi App" logo. Think: "BATTLE ROYALE" gaming competition style.`,
      dark: `DARK/NEUTRAL THEME for general announcements. Pure black background, white text, subtle grid pattern. Headlines HUGE BOLD CONDENSED ALL CAPS in white. Minimal color, maximum impact through typography. Clean and dramatic. Include "defi.app" logo.`,
      data: `DATA/DASHBOARD THEME for metrics and stats. Black background with grid. Show numbers prominently in white with theme accent highlights. Use CSS for simple charts/bars. Include metrics like "TOP 10 THRESHOLD: $4.91" style. Professional data visualization. Include "Defi App" logo.`,
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
