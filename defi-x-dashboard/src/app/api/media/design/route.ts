import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Claude-powered HTML/CSS design generator
// Generates professional graphics matching Defi App's actual brand style
// Based on real examples from Defi App Image Examples folder

interface DesignRequest {
  prompt: string;
  style?: 'gold' | 'green' | 'red' | 'dark' | 'data' | 'blue' | 'purple' | 'gradient' | 'minimal' | 'bold';
  width?: number;
  height?: number;
}

// Official Defi App logo as SVG - crosshair/target style with 4 arc segments and center dot
// This is injected directly into generated designs to ensure consistency
const DEFI_APP_LOGO_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" style="display:inline-block;vertical-align:middle;margin-right:8px;">
  <path d="M 14.5 2.2 A 10 10 0 0 1 21.8 9.5" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 21.8 14.5 A 10 10 0 0 1 14.5 21.8" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 9.5 21.8 A 10 10 0 0 1 2.2 14.5" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 2.2 9.5 A 10 10 0 0 1 9.5 2.2" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="3" fill="white"/>
</svg>`;

// The complete logo HTML block to inject at top center of designs
const DEFI_APP_LOGO_HTML = `<div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;z-index:100;">
  ${DEFI_APP_LOGO_SVG}
  <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:600;color:white;letter-spacing:-0.5px;">defi.app</span>
</div>`;

const DESIGN_SYSTEM_PROMPT = `You create SIMPLE, DRAMATIC social media graphics for Defi App.

## THE #1 RULE: KEEP IT SIMPLE
- MAXIMUM 2 elements: headline and optional subline
- NO cards, NO boxes, NO complex layouts
- ONE big message, dramatically presented

## IMPORTANT: DO NOT CREATE A LOGO
The logo will be automatically injected. Do NOT include any logo, circle icon, or "defi.app" text.
Just leave space at the top (padding-top: 100px on your main container).

## BACKGROUND (MUST HAVE DEPTH):
Don't use plain black. Create atmosphere:
1. Base: #000000
2. Add radial gradient from center using accent color at 15-20% opacity
3. Add grid pattern: 1px lines, accent color, 8% opacity, 40px spacing

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
- Headline: 80-120px, font-weight 900, uppercase, letter-spacing: -2px
- Text-shadow for glow: 0 0 40px rgba(ACCENT, 0.5), 0 0 80px rgba(ACCENT, 0.3)
- Font: system-ui, -apple-system, sans-serif
- Center the text vertically (use flexbox with align-items: center)

## COLORS:
- Gold: #FFD700
- Green: #00FF88
- Red: #FF4444
- Text: #FFFFFF

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
      gold: `GOLD theme. Accent: #FFD700 (bright gold). ONE huge white headline (80-120px), ONE gold subline below. NO cards, NO boxes. Just dramatic typography. Gold radial glow behind text. Remember: NO logo - it's auto-injected.`,
      green: `GREEN theme. Accent: #00FF88 (bright green). ONE huge white headline, ONE green subline (like "NOW LIVE"). Green glow behind text. Remember: NO logo - it's auto-injected.`,
      red: `RED theme. Accent: #FF4444 (bright red). ONE huge white headline, ONE red subline. Red glow effect. Remember: NO logo - it's auto-injected.`,
      dark: `DARK theme. Text: #FFFFFF. ONE huge white headline, subtle gray subline. Maximum simplicity. Remember: NO logo - it's auto-injected.`,
      data: `DATA theme. For stats/numbers. ONE or TWO big numbers as headline, small label text. Minimal. Remember: NO logo - it's auto-injected.`,
      blue: `BLUE theme. Accent: #00D4FF (electric cyan/blue). ONE huge white headline, ONE cyan subline. Cyan glow effect. Tech/futuristic vibe. Remember: NO logo - it's auto-injected.`,
      purple: `PURPLE theme. Accent: #A855F7 (vibrant purple/violet). ONE huge white headline, ONE purple subline. Purple radial glow behind text. Premium feel. Remember: NO logo - it's auto-injected.`,
      gradient: `GRADIENT theme. Multi-color gradient from purple (#A855F7) to blue (#00D4FF) to green (#00FF88). Apply gradient to the background as subtle radial. Text stays white. Futuristic, vibrant feel. Remember: NO logo - it's auto-injected.`,
      minimal: `MINIMAL theme. Almost no color - pure black #000000 background. ONE huge white headline, minimal gray #666666 subline if needed. Maximum whitespace. Ultra clean. NO grid pattern. Remember: NO logo - it's auto-injected.`,
      bold: `BOLD theme. MASSIVE typography (100-140px). ONE word or short phrase as huge white headline. High contrast. Impact font style - use font-weight: 900, letter-spacing: -4px. Very bold, attention-grabbing. Remember: NO logo - it's auto-injected.`,
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

    // Inject the official Defi App logo into the design
    // Find the main container (first div after body or the root div) and inject logo
    if (html.includes('<body')) {
      // If there's a body tag, inject after it
      html = html.replace(/<body[^>]*>/i, (match) => `${match}${DEFI_APP_LOGO_HTML}`);
    } else {
      // Otherwise inject after the first opening div that has style
      html = html.replace(/<div[^>]*style="[^"]*position:\s*relative[^"]*"[^>]*>/i, (match) => `${match}${DEFI_APP_LOGO_HTML}`);
      // If no position:relative div, try any div with width
      if (!html.includes(DEFI_APP_LOGO_SVG)) {
        html = html.replace(/<div[^>]*style="[^"]*width[^"]*"[^>]*>/i, (match) => `${match}${DEFI_APP_LOGO_HTML}`);
      }
      // Last resort: inject after first div
      if (!html.includes(DEFI_APP_LOGO_SVG)) {
        html = html.replace(/<div[^>]*>/i, (match) => `${match}${DEFI_APP_LOGO_HTML}`);
      }
    }

    // Ensure the main container has position:relative for the logo positioning
    if (!html.includes('position:relative') && !html.includes('position: relative')) {
      html = html.replace(/<div([^>]*)style="([^"]*)"/, '<div$1style="position:relative;$2"');
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
    supportedStyles: ['gold', 'green', 'red', 'dark', 'data', 'blue', 'purple', 'gradient', 'minimal', 'bold'],
    styleDescriptions: {
      gold: 'Trading/money content - gold accents, premium feel',
      green: 'Launches/live announcements - green accents',
      red: 'Competitions/battle themes - red accents',
      dark: 'General announcements - clean black & white',
      data: 'Metrics/stats - dashboard style',
      blue: 'Tech/futuristic - cyan/electric blue accents',
      purple: 'Premium/vibrant - purple/violet accents',
      gradient: 'Multi-color - purple to blue to green gradient',
      minimal: 'Ultra clean - maximum whitespace, no grid',
      bold: 'Impact - massive typography for attention',
    },
    brandElements: {
      logo: 'defi.app with circle icon',
      typography: 'Bold condensed italic uppercase',
      background: 'Black with subtle grid pattern',
    },
    _note: hasKey ? 'Ready to generate on-brand designs' : 'Add ANTHROPIC_API_KEY to enable',
  });
}
