import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  content: string;
}

interface QualityAnalysis {
  overallScore: number;
  breakdown: {
    originality: number;
    valueDensity: number;
    engagementHooks: number;
    clarity: number;
    brandVoice: number;
  };
  warnings: string[];
  improvements: string[];
  slopIndicators: string[];
}

function analyzeContent(content: string): QualityAnalysis {
  // In production, this would use AI for analysis
  // For now, implement basic heuristic analysis

  const words = content.split(/\s+/).length;
  const hasHook = content.includes('...') || content.includes('?') || content.includes(':');
  const hasEmoji = /[\u{1F600}-\u{1F64F}]/u.test(content);
  const hasHashtag = content.includes('#');
  const isGeneric = /^(just|check out|new|big|huge|amazing)/i.test(content);

  // Calculate scores
  let originality = 75;
  let valueDensity = 70;
  let engagementHooks = 60;
  let clarity = 80;
  let brandVoice = 75;

  const warnings: string[] = [];
  const improvements: string[] = [];
  const slopIndicators: string[] = [];

  // Adjust based on content analysis
  if (hasHook) engagementHooks += 15;
  if (content.length > 200) valueDensity += 10;
  if (content.includes('\n\n')) clarity += 5;

  // Check for slop indicators
  if (isGeneric) {
    originality -= 20;
    slopIndicators.push('Generic opening detected');
    warnings.push('The opening is too generic - consider a stronger hook');
  }

  if (hasHashtag && (content.match(/#/g) || []).length > 3) {
    originality -= 15;
    slopIndicators.push('Excessive hashtags');
    warnings.push('Too many hashtags can trigger algorithm penalties');
  }

  if (words < 15) {
    valueDensity -= 20;
    improvements.push('Consider adding more substance to your post');
  }

  if (!hasHook) {
    engagementHooks -= 20;
    improvements.push('Add an engagement hook (question, ellipsis, or bold statement)');
  }

  // Calculate overall score
  const overallScore = Math.round(
    (originality + valueDensity + engagementHooks + clarity + brandVoice) / 5
  );

  return {
    overallScore,
    breakdown: {
      originality: Math.max(0, Math.min(100, originality)),
      valueDensity: Math.max(0, Math.min(100, valueDensity)),
      engagementHooks: Math.max(0, Math.min(100, engagementHooks)),
      clarity: Math.max(0, Math.min(100, clarity)),
      brandVoice: Math.max(0, Math.min(100, brandVoice)),
    },
    warnings,
    improvements,
    slopIndicators,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const analysis = analyzeContent(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Content analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
