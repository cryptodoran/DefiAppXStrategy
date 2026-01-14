import { NextResponse } from 'next/server';
import {
  suggestMedia,
  isClaudeConfigured,
  type MediaSuggestion,
} from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      return NextResponse.json({
        _demo: true,
        suggestions: getFallbackSuggestions(content),
      });
    }

    // Generate media suggestions using Claude
    const suggestions = await suggestMedia(content);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Media suggest API error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest media', details: String(error) },
      { status: 500 }
    );
  }
}

// Fallback suggestion when Claude is not configured - returns single AI suggestion
function getFallbackSuggestions(content: string): MediaSuggestion[] {
  const contentLower = content.toLowerCase();

  // Detect content type for relevant suggestion
  const isAboutData = contentLower.includes('data') || contentLower.includes('stats') || contentLower.includes('%');
  const isHumor = contentLower.includes('lol') || contentLower.includes('funny') || contentLower.includes('😂');
  const isAnnouncement = contentLower.includes('announce') || contentLower.includes('launching') || contentLower.includes('new');

  // Generate single best suggestion based on content analysis
  let description: string;
  let imagePrompt: string;
  let reasoning: string;

  if (isAboutData) {
    description = 'Data visualization showing the metrics in your tweet';
    imagePrompt = `Create a clean, professional chart or infographic about: ${content.slice(0, 100)}. Dark theme, gradient accents in purple and blue. Modern crypto/DeFi aesthetic.`;
    reasoning = 'Data-driven content performs 2x better with visual charts';
  } else if (isHumor) {
    description = 'Engaging visual that matches the humor of your tweet';
    imagePrompt = `Create a crypto/DeFi visual related to: ${content.slice(0, 100)}. Popular format, relatable to crypto twitter audience.`;
    reasoning = 'Visual humor gets 3x more engagement on Crypto Twitter';
  } else if (isAnnouncement) {
    description = 'Professional announcement graphic with key details';
    imagePrompt = `Create a sleek announcement graphic for: ${content.slice(0, 100)}. Dark background, modern typography, subtle gradients. Professional DeFi protocol style.`;
    reasoning = 'Announcements with custom graphics get 4x more reach';
  } else {
    description = 'Visual that complements and enhances your tweet';
    imagePrompt = `Create an engaging visual for: ${content.slice(0, 100)}. Dark theme, clean design, DeFi aesthetic.`;
    reasoning = 'Tweets with images get 2x more engagement';
  }

  // Return single suggestion (array for backwards compatibility)
  return [{
    description,
    imagePrompt,
    reasoning,
  }];
}
