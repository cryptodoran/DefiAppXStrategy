import { NextResponse } from 'next/server';
import {
  generateQTAngles,
  isClaudeConfigured,
  DEFAULT_DEFI_APP_VOICE,
  type BrandVoiceProfile,
} from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalTweet, brandVoice } = body;

    if (!originalTweet || !originalTweet.content) {
      return NextResponse.json(
        { error: 'Missing required field: originalTweet.content' },
        { status: 400 }
      );
    }

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      return NextResponse.json({
        _demo: true,
        angles: getFallbackAngles(originalTweet.content),
      });
    }

    // Get brand voice (could be from database in future)
    const voice: BrandVoiceProfile = brandVoice || DEFAULT_DEFI_APP_VOICE;

    // Generate QT angles using Claude
    const angles = await generateQTAngles(
      {
        content: originalTweet.content,
        author: originalTweet.author || 'unknown',
        metrics: originalTweet.metrics,
      },
      voice,
      4 // Generate 4 different angles
    );

    return NextResponse.json({ angles });
  } catch (error) {
    console.error('QT angles API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QT angles', details: String(error) },
      { status: 500 }
    );
  }
}

// Fallback angles when Claude is not configured
function getFallbackAngles(content: string) {
  const shortContent = content.slice(0, 50) + (content.length > 50 ? '...' : '');

  return [
    {
      angle: 'Agree & Expand',
      content: `This is exactly right. Here's why this matters for DeFi:\n\n• [Your insight here]\n• [Data point]\n• [Call to action]\n\n[Configure Claude API for real suggestions]`,
      tone: 'supportive',
      predictedEngagement: 72,
      reasoning: 'Supporting popular takes with added value builds credibility',
    },
    {
      angle: 'Add Context',
      content: `Important context:\n\n"${shortContent}"\n\nThe data shows:\n• [Stat 1]\n• [Stat 2]\n\n[Configure Claude API for real suggestions]`,
      tone: 'analytical',
      predictedEngagement: 85,
      reasoning: 'Adding data and context increases shareability',
    },
    {
      angle: 'Contrarian Take',
      content: `Respectfully disagree here.\n\nWhile ${shortContent.slice(0, 20)}... is true, there's a bigger picture:\n\n[Configure Claude API for real suggestions]`,
      tone: 'contrarian',
      predictedEngagement: 92,
      reasoning: 'Thoughtful disagreement drives engagement through debate',
    },
    {
      angle: 'Humor',
      content: `Me reading this:\n\n😂\n\n[Configure Claude API for real suggestions]`,
      tone: 'humorous',
      predictedEngagement: 78,
      reasoning: 'Humor makes content more shareable and memorable',
    },
  ];
}
