import { NextRequest, NextResponse } from 'next/server';

// Gemini-based text editing for templates
// Alternative to Claude for users who prefer Gemini

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

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      // Fall back to a simple response if Gemini isn't configured
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured. Please use Claude instead or add the API key.' },
        { status: 500 }
      );
    }

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    let imageData: string;
    let mimeType: string;

    if (base64Match) {
      mimeType = `image/${base64Match[1]}`;
      imageData = base64Match[2];
    } else if (image.startsWith('http')) {
      const imageResponse = await fetch(image);
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      mimeType = contentType;
    } else {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageData,
                  },
                },
                {
                  text: `Analyze this image and identify the text that needs to be changed based on this instruction:
"${instruction}"

Return a JSON array of text regions to modify. For EACH text element that needs changing, provide:

{
  "regions": [
    {
      "originalText": "the exact text currently shown",
      "newText": "what it should be changed to",
      "x": 10,
      "y": 40,
      "width": 30,
      "height": 15,
      "fontSize": 80,
      "fontWeight": "900",
      "color": "#FFFFFF",
      "backgroundColor": "#0a0a0a",
      "textAlign": "left",
      "letterSpacing": -2,
      "textTransform": "uppercase"
    }
  ]
}

IMPORTANT:
- Only include text that actually needs to change based on the instruction
- Be precise with coordinates - measure from the actual text boundaries
- Match the exact styling (color, weight, size) of the original text
- The backgroundColor should match the area directly behind the text
- x, y, width, height are PERCENTAGES (0-100)
- fontSize is in pixels assuming a 1024px wide image

Return ONLY the JSON object, no explanation or markdown.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      throw new Error('Failed to get response from Gemini');
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON from response
    let jsonStr = textContent.trim();

    // Clean up markdown if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonStr);

    console.log('Gemini text regions to edit:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      regions: result.regions || [],
      instruction,
      mode: 'gemini-text-edit',
    });
  } catch (error) {
    console.error('Gemini text edit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image with Gemini' },
      { status: 500 }
    );
  }
}
