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
              text: `Find and locate the text "${instruction.replace(/change\s+/i, '').split(/\s+to\s+/i)[0] || 'specified'}" in this image.

Return BOUNDING BOX as PERCENTAGES (0-100):

MEASUREMENT METHOD:
1. Find the EXACT text to change
2. Measure y from TOP of image to TOP of the TEXT (not to any decorative element above)
3. For text in the upper-left area, y is typically 25-35%
4. width should be GENEROUS (25-35% for a phrase with spacing)

JSON:
{
  "regions": [{
    "originalText": "the text found",
    "newText": "the replacement",
    "x": 5,
    "y": 30,
    "width": 28,
    "height": 6,
    "fontSize": 55,
    "fontWeight": "900",
    "color": "#FFFFFF",
    "backgroundColor": "#000000",
    "textAlign": "left",
    "letterSpacing": 0,
    "textTransform": "uppercase"
  }]
}

INSTRUCTION: "${instruction}"

Be generous with width (25-35%). Return ONLY JSON.`,
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

    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', jsonStr);
      throw new Error('AI returned invalid response format. Please try again.');
    }

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
