import { NextResponse } from 'next/server';
import { callClaude, parseClaudeJSON, isClaudeConfigured, DEFAULT_DEFI_APP_VOICE } from '@/lib/claude';

interface DailySuggestion {
  id: string;
  content: string;
  type: 'TRENDING' | 'PRODUCT_UPDATE' | 'COMPETITOR_GAP' | 'HISTORICAL_PATTERN' | 'HOT_TAKE';
  predictedPerformance: number;
  optimalTime: string;
  source: string;
  spiceLevel: number;
}

// Fallback suggestions when API not configured - these link to real actions
function getFallbackSuggestions(): DailySuggestion[] {
  const now = new Date();
  const hour = now.getHours();

  // Dynamic optimal times based on current time
  const times = [
    hour < 10 ? '10:00 AM EST' : hour < 14 ? '2:00 PM EST' : '6:00 PM EST',
    hour < 12 ? '12:00 PM EST' : '4:00 PM EST',
    'Within 2 hours',
    hour < 16 ? '4:00 PM EST' : '9:00 AM EST tomorrow',
  ];

  return [
    {
      id: `suggestion-${Date.now()}-1`,
      content: 'Share insights on the latest DeFi developments - aggregators, yield optimization, and cross-chain bridging are hot topics right now.',
      type: 'TRENDING',
      predictedPerformance: 75,
      optimalTime: times[0],
      source: 'DeFi trend analysis',
      spiceLevel: 4,
    },
    {
      id: `suggestion-${Date.now()}-2`,
      content: 'Create a thread explaining how DeFi App saves users money on swaps through smart routing and aggregation.',
      type: 'PRODUCT_UPDATE',
      predictedPerformance: 70,
      optimalTime: times[1],
      source: 'Product feature highlight',
      spiceLevel: 3,
    },
    {
      id: `suggestion-${Date.now()}-3`,
      content: 'Hot take: Share a contrarian view on a trending crypto narrative. Controversial but thoughtful takes drive engagement.',
      type: 'HOT_TAKE',
      predictedPerformance: 80,
      optimalTime: times[2],
      source: 'Engagement pattern',
      spiceLevel: 7,
    },
    {
      id: `suggestion-${Date.now()}-4`,
      content: 'Educational content: Break down a complex DeFi concept in simple terms. These threads get saved and shared.',
      type: 'HISTORICAL_PATTERN',
      predictedPerformance: 72,
      optimalTime: times[3],
      source: 'Content performance data',
      spiceLevel: 2,
    },
  ];
}

async function generateAISuggestions(): Promise<DailySuggestion[]> {
  const voice = DEFAULT_DEFI_APP_VOICE;

  const systemPrompt = `You are a social media strategist for DeFi App. Generate daily content suggestions that:
1. Match DeFi App's voice: ${voice.tone.join(', ')}
2. Cover different content types (trends, product, hot takes, educational)
3. Have realistic performance predictions
4. Include appropriate spice levels (1-10 scale)

Current time context: ${new Date().toISOString()}`;

  const userPrompt = `Generate 5 daily tweet/content suggestions for DeFi App.

For each suggestion, provide:
- content: The suggestion (what to tweet about, not the actual tweet)
- type: One of TRENDING, PRODUCT_UPDATE, COMPETITOR_GAP, HISTORICAL_PATTERN, HOT_TAKE
- predictedPerformance: 60-95 (realistic score)
- optimalTime: Specific time like "2:00 PM EST" or "Within 2 hours"
- source: Where this insight comes from
- spiceLevel: 1-10 (how controversial/bold)

Return as JSON array.`;

  const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 1500 });
  const suggestions = parseClaudeJSON<Omit<DailySuggestion, 'id'>[]>(response);

  return suggestions.map((s, i) => ({
    ...s,
    id: `suggestion-${Date.now()}-${i}`,
  }));
}

export async function GET() {
  try {
    if (!isClaudeConfigured()) {
      return NextResponse.json({
        suggestions: getFallbackSuggestions(),
        _demo: true,
        _message: 'Add ANTHROPIC_API_KEY for AI-powered suggestions'
      });
    }

    const suggestions = await generateAISuggestions();
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions fetch error:', error);
    return NextResponse.json({
      suggestions: getFallbackSuggestions(),
      _error: String(error)
    });
  }
}
