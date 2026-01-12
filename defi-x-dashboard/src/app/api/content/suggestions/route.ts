import { NextRequest, NextResponse } from 'next/server';
import { generateDailySuggestions } from '@/lib/ai';

export async function GET() {
  try {
    // Check if AI API is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock suggestions when API not configured
      return NextResponse.json([
        {
          id: 'mock-1',
          type: 'thread',
          content: 'Thread idea: The complete guide to DeFi aggregation in 2026',
          topic: 'DeFi Education',
          hook: 'Most DeFi users are leaving money on the table. Here\'s how to fix that...',
          score: 92,
          reasoning: 'Educational content performs well, addresses common pain point',
          createdAt: new Date().toISOString(),
          _mock: true,
        },
        {
          id: 'mock-2',
          type: 'single',
          content: 'Hot take: The real alpha isn\'t in finding new protocols, it\'s in maximizing what you already use.',
          topic: 'Trading Strategy',
          hook: 'Contrarian view on alpha hunting',
          score: 88,
          reasoning: 'Contrarian takes drive engagement',
          createdAt: new Date().toISOString(),
          _mock: true,
        },
        {
          id: 'mock-3',
          type: 'qt',
          content: 'Quote tweet angle: Add context/analysis to trending market news',
          topic: 'Market Commentary',
          hook: 'Provide unique insight on breaking news',
          score: 85,
          reasoning: 'Newsjacking with added value performs well',
          createdAt: new Date().toISOString(),
          _mock: true,
        },
        {
          id: 'mock-4',
          type: 'take',
          content: 'The next DeFi summer won\'t be about yields - it\'ll be about UX.',
          topic: 'DeFi Trends',
          hook: 'Bold prediction with reasoning',
          score: 90,
          reasoning: 'Prediction content sparks debate',
          createdAt: new Date().toISOString(),
          _mock: true,
        },
        {
          id: 'mock-5',
          type: 'thread',
          content: 'Thread: Why your DeFi portfolio needs a cross-chain strategy',
          topic: 'Portfolio Strategy',
          hook: 'If you\'re only on one chain, you\'re ngmi. Here\'s why...',
          score: 86,
          reasoning: 'Actionable advice with urgency',
          createdAt: new Date().toISOString(),
          _mock: true,
        },
      ]);
    }

    // Get current context for better suggestions
    const context = {
      trends: ['ETH ETF', 'L2 adoption', 'Restaking'],
      marketSentiment: 'bullish',
      recentTopics: ['DeFi yields', 'cross-chain'],
    };

    const suggestions = await generateDailySuggestions(context);

    return NextResponse.json(
      suggestions.map((s) => ({
        ...s,
        createdAt: new Date().toISOString(),
      }))
    );
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { regenerate } = await request.json();

    if (!regenerate) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI API not configured' },
        { status: 503 }
      );
    }

    // Force regeneration with fresh context
    const context = {
      trends: ['ETH ETF', 'L2 adoption', 'Restaking', 'AI agents'],
      marketSentiment: 'bullish',
      recentTopics: [],
    };

    const suggestions = await generateDailySuggestions(context);

    return NextResponse.json(
      suggestions.map((s) => ({
        ...s,
        createdAt: new Date().toISOString(),
      }))
    );
  } catch (error) {
    console.error('Regenerate suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate suggestions' },
      { status: 500 }
    );
  }
}
