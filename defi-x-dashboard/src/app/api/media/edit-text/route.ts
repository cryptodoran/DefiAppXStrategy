import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Canvas-based text editing - preserves original image, only replaces text
// Much better quality than HTML recreation

interface EditTextRequest {
  image: string; // Base64 data URL or HTTP URL
  instruction: string; // e.g., "change DAY 1 to DAY 2"
}

interface TextRegion {
  originalText: string;
  newText: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width: number; // percentage of image width
  height: number; // percentage of image height
  fontSize: number; // estimated font size in pixels (for 1024px image)
  fontWeight: string; // normal, bold, 900
  color: string; // hex color
  backgroundColor: string; // hex color to paint over original text
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number; // pixels
  textTransform?: 'uppercase' | 'lowercase' | 'none';
}

export async function POST(request: NextRequest) {
  try {
    const body: EditTextRequest = await request.json();
    const { image, instruction } = body;

    if (!image || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields: image, instruction' },
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
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    let imageData: string;
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    if (base64Match) {
      mediaType = `image/${base64Match[1]}` as typeof mediaType;
      imageData = base64Match[2];
    } else if (image.startsWith('http')) {
      const imageResponse = await fetch(image);
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      mediaType = contentType as typeof mediaType;
    } else {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Use Claude Vision to analyze text regions
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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
              text: `Analyze this image and identify the text that needs to be changed based on this instruction:
"${instruction}"

Return a JSON array of text regions to modify. For EACH text element that needs changing, provide:

{
  "regions": [
    {
      "originalText": "the exact text currently shown",
      "newText": "what it should be changed to",
      "x": 10,          // percentage from left edge (0-100)
      "y": 40,          // percentage from top edge (0-100)
      "width": 30,      // width as percentage of image
      "height": 15,     // height as percentage of image
      "fontSize": 80,   // font size in pixels (assuming 1024px image)
      "fontWeight": "900",  // CSS font weight
      "color": "#FFFFFF",   // text color
      "backgroundColor": "#0a0a0a",  // color behind text (to paint over original)
      "textAlign": "left",  // left, center, or right
      "letterSpacing": -2,  // letter spacing in pixels (optional)
      "textTransform": "uppercase"  // uppercase, lowercase, or none (optional)
    }
  ]
}

IMPORTANT:
- Only include text that actually needs to change based on the instruction
- Be precise with coordinates - measure from the actual text boundaries
- Match the exact styling (color, weight, size) of the original text
- The backgroundColor should match the area directly behind the text
- For the font, we'll use system sans-serif, so estimate the size accordingly

Return ONLY the JSON object, no explanation.`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No response from Claude');
    }

    let jsonStr = textContent.text.trim();

    // Clean up markdown if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonStr);

    console.log('Text regions to edit:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      regions: result.regions || [],
      instruction,
      mode: 'canvas-text-edit',
    });
  } catch (error) {
    console.error('Text edit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
