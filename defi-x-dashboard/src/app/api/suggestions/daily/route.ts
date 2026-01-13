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

// Fallback suggestions matching @defiapp voice - casual, direct, confident
function getFallbackSuggestions(): DailySuggestion[] {
  const now = new Date();
  const hour = now.getHours();

  // Dynamic optimal times based on current time
  const times = [
    hour < 10 ? '10:00 AM EST' : hour < 14 ? '2:00 PM EST' : '6:00 PM EST',
    hour < 12 ? '12:00 PM EST' : '4:00 PM EST',
    'Within 2 hours',
    hour < 16 ? '4:00 PM EST' : '9:00 AM EST tomorrow',
    hour < 18 ? '7:00 PM EST' : '11:00 AM EST tomorrow',
  ];

  return [
    {
      id: `suggestion-${Date.now()}-1`,
      content: 'someone compared swap fees across protocols and we came out on top. again. maybe flex that.',
      type: 'PRODUCT_UPDATE',
      predictedPerformance: 78,
      optimalTime: times[0],
      source: 'Product wins',
      spiceLevel: 5,
    },
    {
      id: `suggestion-${Date.now()}-2`,
      content: 'hot take: most "defi protocols" are just expensive middlemen with extra steps. we\'re not.',
      type: 'HOT_TAKE',
      predictedPerformance: 85,
      optimalTime: times[2],
      source: 'Spicy content performs well',
      spiceLevel: 8,
    },
    {
      id: `suggestion-${Date.now()}-3`,
      content: 'thread idea: how much people are actually losing to slippage and bad routing (spoiler: a lot)',
      type: 'TRENDING',
      predictedPerformance: 76,
      optimalTime: times[1],
      source: 'Educational threads convert',
      spiceLevel: 4,
    },
    {
      id: `suggestion-${Date.now()}-4`,
      content: 'new chain integration shipped. more routes = better rates. that\'s literally it.',
      type: 'PRODUCT_UPDATE',
      predictedPerformance: 72,
      optimalTime: times[3],
      source: 'Product update',
      spiceLevel: 3,
    },
    {
      id: `suggestion-${Date.now()}-5`,
      content: 'why are people still paying 2% fees in 2026? genuine question.',
      type: 'HOT_TAKE',
      predictedPerformance: 82,
      optimalTime: times[4],
      source: 'Rhetorical questions perform',
      spiceLevel: 6,
    },
  ];
}

async function generateAISuggestions(): Promise<DailySuggestion[]> {
  const voice = DEFAULT_DEFI_APP_VOICE;

  const systemPrompt = `You are the social media strategist for @defiapp. Their voice is:
- Casual, lowercase, direct
- Confident but not arrogant
- Slightly irreverent and witty
- Data-driven when it matters
- Never uses: "gm", "wagmi", "ser", "fren", "wen", "lfg", "probably nothing"
- Never sounds like generic AI: avoid "revolutionary", "game-changing", "excited to announce"

Example tweets from @defiapp that perform well:
- "best rates or something idk"
- "why are you still paying 2% fees when you can get 0.1%?"
- "we ship. you save. simple."
- "hot take: most defi protocols are just expensive middlemen with extra steps"

Generate suggestions that SOUND LIKE THIS VOICE - casual, direct, sometimes spicy.`;

  const userPrompt = `Generate 5 daily tweet suggestions for @defiapp.

These should be ACTUAL TWEET IDEAS in @defiapp's voice (casual, lowercase, direct), not generic marketing suggestions.

For each:
- content: The actual tweet idea in @defiapp's voice style
- type: TRENDING | PRODUCT_UPDATE | COMPETITOR_GAP | HISTORICAL_PATTERN | HOT_TAKE
- predictedPerformance: 65-90 (be realistic)
- optimalTime: e.g., "2:00 PM EST" or "Within 2 hours"
- source: Brief context
- spiceLevel: 1-10

CRITICAL: The content should sound like @defiapp wrote it - lowercase, casual, direct. NOT generic AI marketing speak.

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
