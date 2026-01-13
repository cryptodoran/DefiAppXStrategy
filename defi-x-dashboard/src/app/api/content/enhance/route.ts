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

// Fallback results when Claude is not configured - matching @defiapp voice
function getFallbackResult(action: string, content: string) {
  switch (action) {
    case 'spicier':
      // Make it more @defiapp style - casual, direct, slightly confrontational
      const spicyContent = content
        .replace(/^We /i, 'we ')
        .replace(/\.$/, '') + '. but seriously, why is this still a problem in 2026?';
      return {
        enhanced: spicyContent,
        changes: ['Lowercased for casual tone', 'Added rhetorical question', 'Made it more direct'],
        reasoning: 'Applied @defiapp style - casual, direct, slightly confrontational',
      };

    case 'context':
      return {
        enhanced: 'context: users saved $2.1m on swaps last month alone.\n\n' + content.toLowerCase(),
        changes: ['Added data point for credibility', 'Lowercased for brand voice'],
        reasoning: '@defiapp leads with data when adding context',
      };

    case 'shorten':
      // Actually shorten and make punchier
      const words = content.split(' ');
      const shortened = words.slice(0, Math.min(words.length, 15)).join(' ')
        .toLowerCase()
        .replace(/\.$/, '');
      return {
        enhanced: shortened,
        changes: ['Trimmed to core message', 'Lowercased for brand voice'],
        reasoning: '@defiapp keeps it short and punchy',
      };

    case 'hook':
      return {
        enhanced: 'hot take: ' + content.toLowerCase(),
        changes: ['Added hook opener', 'Lowercased for brand voice'],
        reasoning: '@defiapp uses direct openers like "hot take:", questions, or bold statements',
      };

    case 'analyze':
      // More realistic analysis based on content
      const hasLowercase = content === content.toLowerCase();
      const hasQuestion = content.includes('?');
      const isShort = content.length < 100;
      const voiceScore = (hasLowercase ? 25 : 0) + (hasQuestion ? 20 : 10) + (isShort ? 20 : 10) + 30;

      return {
        overallScore: Math.min(voiceScore + 10, 95),
        spiceLevel: hasQuestion ? 60 : 40,
        controversyScore: 35,
        engagementPotential: voiceScore,
        voiceAlignment: voiceScore,
        hookStrength: content.startsWith('hot take') || hasQuestion ? 75 : 50,
        clarity: isShort ? 85 : 70,
        issues: [
          ...(!hasLowercase ? [{ type: 'warning' as const, description: '@defiapp uses lowercase for casual tone', fix: 'Lowercase the content' }] : []),
          ...(content.includes('!') ? [{ type: 'warning' as const, description: 'Too many exclamation marks feels generic', fix: 'Remove excess punctuation' }] : []),
        ],
        strengths: [
          ...(hasQuestion ? ['Good use of rhetorical question'] : []),
          ...(isShort ? ['Concise messaging'] : []),
          ...(hasLowercase ? ['Matches @defiapp casual tone'] : []),
        ].filter(Boolean),
        improvements: [
          ...(!hasLowercase ? ['Use lowercase for more casual tone'] : []),
          ...(!hasQuestion ? ['Consider adding a rhetorical question for engagement'] : []),
          'Add ANTHROPIC_API_KEY for full AI analysis',
        ],
      };

    case 'variations':
      const base = content.toLowerCase().replace(/\.$/, '');
      return [
        {
          content: base + '. we do this every day.',
          voiceAlignment: 78,
          predictedEngagement: { likes: [80, 300], retweets: [20, 80] },
          reasoning: 'Added confidence without being arrogant',
          hook: 'Statement of fact',
        },
        {
          content: 'hot take: ' + base,
          voiceAlignment: 82,
          predictedEngagement: { likes: [100, 400], retweets: [30, 100] },
          reasoning: '@defiapp style opener drives engagement',
          hook: 'Hot take format',
        },
        {
          content: 'why is this still a thing in 2026? ' + base,
          voiceAlignment: 85,
          predictedEngagement: { likes: [120, 500], retweets: [40, 150] },
          reasoning: 'Rhetorical question + statement performs well',
          hook: 'Rhetorical question',
        },
      ];

    case 'media':
      return [
        {
          type: 'comparison',
          description: 'Side-by-side fee comparison showing savings',
          imagePrompt: 'Clean infographic showing fee comparison across DeFi platforms',
          reasoning: 'Data visualizations perform well for @defiapp',
        },
        {
          type: 'screenshot',
          description: 'App screenshot showing the actual savings',
          imagePrompt: 'Screenshot of DeFi app interface showing transaction savings',
          reasoning: 'Product screenshots add credibility',
        },
      ];

    default:
      return { message: 'Configure ANTHROPIC_API_KEY for full functionality' };
  }
}
