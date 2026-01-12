import { NextRequest, NextResponse } from 'next/server';
import { generateHotTakes } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'topic required' }, { status: 400 });
    }

    // Check if AI API is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock takes when API not configured
      return NextResponse.json([
        {
          id: `mock-take-1`,
          content: `Hot take about ${topic}: Most people are thinking about this wrong.`,
          angle: 'Contrarian perspective',
          spiciness: 'medium',
          targetAudience: 'DeFi natives',
          _mock: true,
        },
        {
          id: `mock-take-2`,
          content: `Unpopular opinion: ${topic} is actually bullish for DeFi adoption.`,
          angle: 'Bullish reframe',
          spiciness: 'spicy',
          targetAudience: 'Crypto traders',
          _mock: true,
        },
        {
          id: `mock-take-3`,
          content: `Everyone talking about ${topic} is missing the real story here.`,
          angle: 'Hidden narrative',
          spiciness: 'mild',
          targetAudience: 'General crypto audience',
          _mock: true,
        },
      ]);
    }

    const takes = await generateHotTakes(topic, 5);

    return NextResponse.json(takes);
  } catch (error) {
    console.error('Takes generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate takes' },
      { status: 500 }
    );
  }
}
