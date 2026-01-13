import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Claude-powered HTML/CSS design generator
// Generates professional graphics as HTML that can be rendered to images
// Uses official Defi App brand kit from https://brand.defi.app/

interface DesignRequest {
  prompt: string;
  style?: 'brand' | 'gradient' | 'neon' | 'minimal' | 'data' | 'corporate';
  width?: number;
  height?: number;
}

// Official Defi App Brand Kit
const DEFI_APP_BRAND = {
  colors: {
    accent: '#5b8cff',           // Primary blue accent
    accentGlow: 'rgba(91, 140, 255, 0.4)',
    background: '#0b0d10',       // Deep dark background
    surface: '#151922',          // Card/panel surface
    surfaceLight: '#1a1f2a',     // Lighter surface for hover
    border: 'rgba(255, 255, 255, 0.08)',
    borderAccent: 'rgba(91, 140, 255, 0.3)',
    textPrimary: '#e6e8ec',      // Primary text
    textMuted: '#9aa0ad',        // Muted/secondary text
    success: '#10b981',          // Green for positive
    error: '#ef4444',            // Red for negative
  },
  fonts: {
    // Manrope is the brand font, but we use system fonts for rendering
    stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  radius: '12px',
  shadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
};

const DESIGN_SYSTEM_PROMPT = `You are the official graphic designer for Defi App, a crypto/DeFi company. You create HTML/CSS designs that MUST follow the Defi App brand guidelines.

## DEFI APP BRAND KIT (MANDATORY)

### Colors - USE THESE EXACT VALUES:
- Primary Accent: ${DEFI_APP_BRAND.colors.accent} (blue) - Use for highlights, buttons, important elements
- Accent Glow: ${DEFI_APP_BRAND.colors.accentGlow} - For subtle glow effects
- Background: ${DEFI_APP_BRAND.colors.background} - Main background color
- Surface: ${DEFI_APP_BRAND.colors.surface} - Cards, panels, elevated elements
- Surface Light: ${DEFI_APP_BRAND.colors.surfaceLight} - Hover states, lighter panels
- Border: ${DEFI_APP_BRAND.colors.border} - Subtle borders
- Border Accent: ${DEFI_APP_BRAND.colors.borderAccent} - Highlighted borders
- Text Primary: ${DEFI_APP_BRAND.colors.textPrimary} - Main text color
- Text Muted: ${DEFI_APP_BRAND.colors.textMuted} - Secondary text
- Success Green: ${DEFI_APP_BRAND.colors.success} - Positive indicators
- Error Red: ${DEFI_APP_BRAND.colors.error} - Negative indicators

### Typography:
- Font: ${DEFI_APP_BRAND.fonts.stack}
- Style: Clean, modern, professional
- Weights: Use bold (700) for headlines, medium (500) for body

### Design Elements:
- Border Radius: ${DEFI_APP_BRAND.radius}
- Shadow: ${DEFI_APP_BRAND.shadow}
- Glass effects: Use backdrop-filter with the brand surface colors
- Gradients: Subtle, using accent blue with darker blues (#1a3a8a, #0d2157)

### Brand Voice:
- Confident but not arrogant
- Technical but accessible
- Crypto-native aesthetic
- Premium, fintech quality

## CRITICAL RULES:
1. Output ONLY the HTML code - no explanations, no markdown
2. ALWAYS use the Defi App brand colors above
3. Use modern CSS (gradients, box-shadows, backdrop-filter)
4. FONTS: Use ONLY system fonts. NEVER use @import or external fonts
5. NO images, NO external resources - only CSS shapes, gradients, and text
6. Include "Defi App" branding subtly when appropriate (small logo text or watermark)
7. Make designs feel premium and crypto-native

## OUTPUT FORMAT:
<!DOCTYPE html>
<html>
<head><style>/* all styles */</style></head>
<body style="margin:0;padding:0;">
  <div style="width:XXpx;height:XXpx;">
    <!-- design content -->
  </div>
</body>
</html>`;

export async function POST(request: NextRequest) {
  try {
    const body: DesignRequest = await request.json();
    const { prompt, style = 'gradient', width = 1024, height = 1024 } = body;

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
      brand: `STRICT Defi App brand style. Use ONLY the brand colors: accent ${DEFI_APP_BRAND.colors.accent}, background ${DEFI_APP_BRAND.colors.background}, surface ${DEFI_APP_BRAND.colors.surface}. Clean, premium fintech aesthetic. Subtle blue glow effects. Include small "Defi App" text as watermark in corner.`,
      gradient: `Defi App branded gradient. Use ${DEFI_APP_BRAND.colors.accent} to darker blues (#1a3a8a, #0d2157). Background ${DEFI_APP_BRAND.colors.background}. Add glassmorphism with brand surface colors. Subtle blue glow borders.`,
      neon: `Dark Defi App style. Background ${DEFI_APP_BRAND.colors.background}. Neon ${DEFI_APP_BRAND.colors.accent} accents with glow effects. Cyberpunk but on-brand. Grid patterns optional.`,
      minimal: `Clean Defi App minimal. Dark background ${DEFI_APP_BRAND.colors.background}. Single accent ${DEFI_APP_BRAND.colors.accent}. Lots of whitespace. Bold typography. Simple geometric shapes.`,
      data: `Defi App dashboard aesthetic. Background ${DEFI_APP_BRAND.colors.background}, surface ${DEFI_APP_BRAND.colors.surface}. Metrics with ${DEFI_APP_BRAND.colors.accent} highlights. CSS bar charts, progress indicators. Professional data viz.`,
      corporate: `Professional Defi App corporate. ${DEFI_APP_BRAND.colors.accent} as primary. Clean layout on ${DEFI_APP_BRAND.colors.background}. Subtle shadows. Business-ready, trust-inspiring.`,
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
    description: 'Generates professional HTML/CSS designs using Defi App brand kit',
    supportedStyles: ['brand', 'gradient', 'neon', 'minimal', 'data', 'corporate'],
    brandColors: DEFI_APP_BRAND.colors,
    _note: hasKey ? 'Ready to generate on-brand designs' : 'Add ANTHROPIC_API_KEY to enable',
  });
}
