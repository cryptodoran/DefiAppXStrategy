import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  topic: string;
  tone?: string;
  goal?: string;
  spiceLevel?: number;
  keyPoints?: string[];
}

// In production, this would call the Claude API
async function generateWithClaude(prompt: string): Promise<string> {
  // Mock response - in production, use actual Claude API
  // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  // const response = await anthropic.messages.create({...});

  return `Generated content for: ${prompt}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, tone = 'professional', goal = 'engagement', spiceLevel = 5, keyPoints = [] } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build prompt based on parameters
    const spiceDescriptions: Record<number, string> = {
      1: 'very safe and corporate',
      2: 'safe with mild opinions',
      3: 'warm with clear stance',
      4: 'opinionated with mild controversy',
      5: 'spicy hot takes',
      6: 'hot and divisive',
      7: 'very hot and controversial',
      8: 'fire - maximum controversy',
      9: 'inferno - extremely divisive',
      10: 'nuclear - rarely appropriate',
    };

    const systemPrompt = `You are a viral content creator for Defi App, a leading DeFi platform.
Your goal is to create ${goal}-focused content with a ${tone} tone.
Spice level: ${spiceLevel}/10 (${spiceDescriptions[spiceLevel] || 'balanced'})
Create content that is engaging, authentic, and aligned with the DeFi/Crypto Twitter culture.
Avoid generic "slop" content - be original and provide value.`;

    const userPrompt = `Create 3 variations of a viral tweet about: ${topic}
${keyPoints.length > 0 ? `Key points to include: ${keyPoints.join(', ')}` : ''}

For each variation, provide:
1. The tweet content (under 280 characters)
2. A predicted engagement score (0-100)
3. Viral elements present (e.g., controversy, humor, FOMO, educational, tribal)
4. Hook strength rating (1-5)`;

    // In production, call Claude API here
    // const response = await generateWithClaude(systemPrompt + userPrompt);

    // Mock response
    const variations = [
      {
        content: `DeFi isn't dead. It's evolving.\n\nWhile CT argues about memecoins, we've been quietly building the infrastructure for DeFi 2.0.\n\nHere's what most people miss about where this is all heading...`,
        predictedScore: 87,
        viralElements: ['FOMO', 'Educational', 'Tribal'],
        hookRating: 5,
      },
      {
        content: `Hot take: 90% of "DeFi protocols" will be obsolete in 2 years.\n\nThe ones that survive? They're solving real problems, not chasing TVL.\n\nDefi App is built different. Let me explain why...`,
        predictedScore: 82,
        viralElements: ['Controversy', 'FOMO', 'Educational'],
        hookRating: 4,
      },
      {
        content: `Everyone's talking about the next bull run.\n\nBut here's what separates winners from losers in DeFi:\n\nIt's not about timing the market. It's about using the right tools.`,
        predictedScore: 79,
        viralElements: ['Educational', 'FOMO'],
        hookRating: 4,
      },
    ];

    return NextResponse.json({ variations });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
