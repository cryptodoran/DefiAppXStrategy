import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Claude Vision-based image editing
// Analyzes the template and recreates it with requested changes

const DEFI_APP_LOGO_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" style="display:inline-block;vertical-align:middle;margin-right:8px;">
  <path d="M 14.5 2.2 A 10 10 0 0 1 21.8 9.5" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 21.8 14.5 A 10 10 0 0 1 14.5 21.8" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 9.5 21.8 A 10 10 0 0 1 2.2 14.5" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 2.2 9.5 A 10 10 0 0 1 9.5 2.2" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="3" fill="white"/>
</svg>`;

interface EditRequest {
  referenceImage: string; // Base64 data URL
  editInstruction: string; // e.g., "change DAY 1 to DAY 2"
  width?: number;
  height?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EditRequest = await request.json();
    const { referenceImage, editInstruction, width = 1024, height = 1024 } = body;

    if (!referenceImage || !editInstruction) {
      return NextResponse.json(
        { error: 'Missing required fields: referenceImage, editInstruction' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Extract base64 data from data URL
    const base64Match = referenceImage.match(/^data:image\/(\w+);base64,(.+)$/);
    let imageData: string;
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    if (base64Match) {
      mediaType = `image/${base64Match[1]}` as typeof mediaType;
      imageData = base64Match[2];
    } else if (referenceImage.startsWith('http')) {
      // Fetch the image and convert to base64
      const imageResponse = await fetch(referenceImage);
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      mediaType = contentType as typeof mediaType;
    } else {
      return NextResponse.json(
        { error: 'Invalid image format. Provide base64 data URL or HTTP URL.' },
        { status: 400 }
      );
    }

    // Use Claude Vision to analyze and recreate
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: `You are a professional graphic designer recreating this design with specific edits.

EDIT INSTRUCTION: ${editInstruction}

Analyze this image carefully and recreate it as HTML/CSS with the requested edit applied.

CRITICAL REQUIREMENTS:
1. PRESERVE the exact layout, positioning, and visual hierarchy
2. PRESERVE all visual elements (logos, icons, decorative elements, backgrounds)
3. PRESERVE the color scheme exactly
4. PRESERVE all text that is NOT being edited
5. APPLY the edit instruction to change ONLY what is requested
6. Use the EXACT same fonts/styles (use system fonts that match: bold sans-serif for headers, etc.)

For the Defi App logo, use this exact SVG (it's a 4-notch crosshair with center dot):
${DEFI_APP_LOGO_SVG}

For any coin/token graphics, recreate them using CSS (gradients, borders, shadows).

Output ONLY the complete HTML document with embedded CSS. No explanation, no markdown code blocks.

CRITICAL HTML STRUCTURE:
- Start with <!DOCTYPE html>
- Include all CSS in a <style> tag in the head
- The body must contain a single container div with EXACT inline styles:
  <div style="width: ${width}px; height: ${height}px; position: relative; background: #0a0a0a; overflow: hidden;">
- All content goes inside this container
- Use absolute positioning for elements within the container

Use a dark background (#0a0a0a or similar) if the original has one.`,
            },
          ],
        },
      ],
    });

    // Extract HTML from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No HTML content in response');
    }

    let html = textContent.text.trim();

    // Clean up if Claude wrapped it in markdown
    if (html.startsWith('```html')) {
      html = html.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    } else if (html.startsWith('```')) {
      html = html.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Ensure it starts with DOCTYPE
    if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
      // Try to find where HTML starts
      const htmlStart = html.indexOf('<!DOCTYPE');
      if (htmlStart > 0) {
        html = html.substring(htmlStart);
      }
    }

    // Ensure the body has a properly sized container
    // Check if body content has a width-specified div
    if (!html.includes(`width: ${width}px`) && !html.includes(`width:${width}px`)) {
      console.log('Adding wrapper div for proper sizing');
      // Wrap body content in a sized container
      html = html.replace(
        /<body[^>]*>([\s\S]*?)<\/body>/i,
        `<body style="margin:0;padding:0;background:#000;">
          <div style="width:${width}px;height:${height}px;position:relative;background:#0a0a0a;overflow:hidden;">
            $1
          </div>
        </body>`
      );
    }

    console.log('Final HTML length:', html.length);
    console.log('HTML preview:', html.substring(0, 300));

    return NextResponse.json({
      html,
      editInstruction,
      width,
      height,
      mode: 'claude-vision-edit',
    });
  } catch (error) {
    console.error('Image edit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to edit image' },
      { status: 500 }
    );
  }
}
