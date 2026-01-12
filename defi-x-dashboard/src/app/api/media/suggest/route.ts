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

// Fallback suggestions when Claude is not configured
function getFallbackSuggestions(content: string): MediaSuggestion[] {
  const contentLower = content.toLowerCase();

  // Detect content type for relevant suggestions
  const isAboutData = contentLower.includes('data') || contentLower.includes('stats') || contentLower.includes('%');
  const isHumor = contentLower.includes('lol') || contentLower.includes('funny') || contentLower.includes('😂');
  const isAnnouncement = contentLower.includes('announce') || contentLower.includes('launching') || contentLower.includes('new');

  const suggestions: MediaSuggestion[] = [];

  if (isAboutData) {
    suggestions.push({
      type: 'chart',
      description: 'Data visualization chart showing the metrics mentioned in your tweet',
      imagePrompt: `Create a clean, professional chart or infographic about: ${content.slice(0, 100)}. Use dark theme with gradient accents in purple and blue. Modern crypto/DeFi aesthetic.`,
      reasoning: 'Data-driven content performs 2x better with visual charts',
    });
  }

  if (isHumor) {
    suggestions.push({
      type: 'meme',
      description: 'Crypto meme that matches the humor of your tweet',
      imagePrompt: `Create a crypto/DeFi meme related to: ${content.slice(0, 100)}. Popular meme format, relatable to crypto twitter audience.`,
      reasoning: 'Memes get 3x more engagement on Crypto Twitter',
    });
  }

  if (isAnnouncement) {
    suggestions.push({
      type: 'custom',
      description: 'Professional announcement graphic with key details',
      imagePrompt: `Create a sleek announcement graphic for: ${content.slice(0, 100)}. Dark background, modern typography, subtle gradients. Professional DeFi protocol style.`,
      reasoning: 'Announcements with custom graphics get 4x more reach',
    });
  }

  // Always include these general options
  suggestions.push({
    type: 'infographic',
    description: 'Educational infographic breaking down your key points',
    imagePrompt: `Create an infographic explaining: ${content.slice(0, 100)}. Clear hierarchy, numbered points, dark theme with accent colors.`,
    reasoning: 'Infographics are highly shareable and establish authority',
  });

  suggestions.push({
    type: 'screenshot',
    description: 'App screenshot or UI mockup demonstrating the concept',
    imagePrompt: `Create a UI screenshot or mockup for: ${content.slice(0, 100)}. Modern dark mode interface, clean design, DeFi dashboard aesthetic.`,
    reasoning: 'Screenshots add credibility and context to your claims',
  });

  // Return top 3 suggestions
  return suggestions.slice(0, 3);
}
