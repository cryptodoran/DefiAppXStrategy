import { NextResponse } from 'next/server';
import {
  enhanceContent,
  analyzeContent,
  generateTweets,
  generateThread,
  suggestMedia,
  isClaudeConfigured,
  DEFAULT_DEFI_APP_VOICE,
  type BrandVoiceProfile,
} from '@/lib/claude';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, content, options = {} } = body;

    if (!content || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: content, action' },
        { status: 400 }
      );
    }

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      return NextResponse.json(
        {
          error: 'Claude API not configured',
          _demo: true,
          result: getFallbackResult(action, content),
        },
        { status: 200 }
      );
    }

    // Get brand voice (could be from database in future)
    const brandVoice: BrandVoiceProfile = options.brandVoice || DEFAULT_DEFI_APP_VOICE;

    let result;

    switch (action) {
      case 'spicier':
      case 'context':
      case 'shorten':
      case 'hook':
        result = await enhanceContent(content, action, brandVoice);
        break;

      case 'analyze':
        result = await analyzeContent(content, brandVoice);
        break;

      case 'variations':
        result = await generateTweets(content, brandVoice, {
          count: options.count || 3,
          tone: options.tone || 'standard',
        });
        break;

      case 'thread':
        result = await generateThread(
          options.topic || 'this topic',
          content,
          brandVoice,
          options.targetLength || 5
        );
        break;

      case 'media':
        result = await suggestMedia(content);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ result, action });
  } catch (error) {
    console.error('Content enhance API error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content', details: String(error) },
      { status: 500 }
    );
  }
}

// Fallback results when Claude is not configured
function getFallbackResult(action: string, content: string) {
  switch (action) {
    case 'spicier':
      return {
        enhanced: content + '\n\n[Claude API needed for real enhancement]',
        changes: ['Would add controversial angle', 'Would strengthen opinion', 'Would add engagement hook'],
        reasoning: 'Configure ANTHROPIC_API_KEY for real AI-powered enhancement',
      };

    case 'context':
      return {
        enhanced: '[Market context would be added here]\n\n' + content,
        changes: ['Would add relevant data', 'Would include market context'],
        reasoning: 'Configure ANTHROPIC_API_KEY for real context addition',
      };

    case 'shorten':
      return {
        enhanced: content.split('.').slice(0, 2).join('.') + '.',
        changes: ['Basic shortening applied', 'AI would do intelligent compression'],
        reasoning: 'Configure ANTHROPIC_API_KEY for intelligent shortening',
      };

    case 'hook':
      return {
        enhanced: 'Thread: 🧵\n\n' + content,
        changes: ['Basic hook added', 'AI would generate compelling opening'],
        reasoning: 'Configure ANTHROPIC_API_KEY for real hook generation',
      };

    case 'analyze':
      return {
        overallScore: 70,
        spiceLevel: 50,
        controversyScore: 30,
        engagementPotential: 60,
        voiceAlignment: 75,
        hookStrength: 55,
        clarity: 80,
        issues: [{ type: 'suggestion', description: 'Configure Claude API for real analysis', fix: 'Add ANTHROPIC_API_KEY to .env' }],
        strengths: ['Content is present'],
        improvements: ['Configure Claude for detailed feedback'],
      };

    case 'variations':
      return [
        { content: content + ' (Variation 1 - configure Claude)', voiceAlignment: 70, predictedEngagement: { likes: [50, 200], retweets: [10, 50] }, reasoning: 'Demo variation' },
        { content: content + ' (Variation 2 - configure Claude)', voiceAlignment: 70, predictedEngagement: { likes: [50, 200], retweets: [10, 50] }, reasoning: 'Demo variation' },
        { content: content + ' (Variation 3 - configure Claude)', voiceAlignment: 70, predictedEngagement: { likes: [50, 200], retweets: [10, 50] }, reasoning: 'Demo variation' },
      ];

    case 'media':
      return [
        { type: 'meme', description: 'Configure Claude for real suggestions', imagePrompt: 'N/A', reasoning: 'Demo' },
      ];

    default:
      return { message: 'Configure ANTHROPIC_API_KEY for full functionality' };
  }
}
