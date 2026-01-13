import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Claude-powered HTML/CSS design generator
// Generates professional graphics as HTML that can be rendered to images

interface DesignRequest {
  prompt: string;
  style?: 'gradient' | 'neon' | 'minimal' | 'data' | 'corporate';
  width?: number;
  height?: number;
}

const DESIGN_SYSTEM_PROMPT = `You are a professional graphic designer creating HTML/CSS designs for social media graphics.

CRITICAL RULES:
1. Output ONLY the HTML code, nothing else - no explanations, no markdown code blocks
2. The design must be self-contained with inline styles
3. Use modern CSS (gradients, box-shadows, backdrop-filter)
4. Design dimensions should fit within the specified size
5. FONTS: Use ONLY system fonts. NEVER use @import or external fonts. Use this font stack: font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
6. Make it visually striking and professional
7. NO images, NO external resources - only CSS shapes, gradients, and text
8. Include the main message/concept from the prompt prominently
9. IMPORTANT: No @import statements, no url() for fonts, no external resources of any kind

STYLE GUIDELINES BY TYPE:
- gradient: Purple/blue/cyan gradients, smooth transitions, glassmorphism, subtle glow effects
- neon: Dark backgrounds (#0a0a1a), neon borders, glow effects, cyberpunk aesthetic
- minimal: Clean white/light backgrounds, single accent color, lots of whitespace, elegant typography
- data: Dashboard aesthetic, metrics display, charts represented with CSS bars/circles
- corporate: Professional blues/purples, clean layout, subtle shadows, business-ready

OUTPUT FORMAT:
Return a complete HTML document with embedded CSS. Example structure:
<!DOCTYPE html>
<html>
<head><style>/* all styles inline */</style></head>
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

    const styleGuide = {
      gradient: 'Use purple (#8b5cf6) to blue (#3b82f6) to cyan (#06b6d4) gradients. Add glassmorphism effects with backdrop-filter. Subtle glowing borders.',
      neon: 'Dark background (#0a0a1a or #0f0f23). Neon cyan (#00ffff) and magenta (#ff00ff) accents. Glowing borders with box-shadow. Grid patterns optional.',
      minimal: 'Clean white or very light gray background. Single accent color (violet #8b5cf6). Lots of whitespace. Bold typography. Simple geometric shapes.',
      data: 'Dashboard style. Dark or light background. Show metrics/stats prominently. Use CSS for simple bar charts or progress indicators. Professional data viz aesthetic.',
      corporate: 'Professional blue (#1e40af) to purple (#7c3aed) palette. Clean layout. Subtle shadows. Business-ready design. Trust-inspiring.',
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
    description: 'Generates professional HTML/CSS designs that can be rendered to images',
    supportedStyles: ['gradient', 'neon', 'minimal', 'data', 'corporate'],
    _note: hasKey ? 'Ready to generate designs' : 'Add ANTHROPIC_API_KEY to enable',
  });
}
