import { NextResponse } from 'next/server';
import {
  callClaude,
  parseClaudeJSON,
  isClaudeConfigured,
  DEFAULT_DEFI_APP_VOICE,
} from '@/lib/claude';

export interface VoiceScoreResult {
  score: number;
  breakdown: {
    toneMatch: number;
    vocabularyMatch: number;
    lengthMatch: number;
    patternMatch: number;
  };
  issues: Array<{
    type: 'ai_pattern' | 'off_brand' | 'wrong_tone';
    detail: string;
    suggestion: string;
  }>;
  suggestions: string[];
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Minimum content length for meaningful analysis
    if (content.trim().length < 10) {
      return NextResponse.json({
        score: null,
        message: 'Content too short for analysis',
      });
    }

    // Check if Claude is configured
    if (!isClaudeConfigured()) {
      // Return a heuristic-based score when Claude isn't available
      const heuristicScore = calculateHeuristicScore(content);
      return NextResponse.json({
        ...heuristicScore,
        _demo: true,
        _message: 'Using heuristic scoring (configure ANTHROPIC_API_KEY for AI scoring)',
      });
    }

    // Use Claude for proper voice scoring
    const voiceProfile = DEFAULT_DEFI_APP_VOICE;

    const systemPrompt = `You are a brand voice analyzer for DeFi App. Your job is to score how well content matches their voice.

DEFI APP VOICE PROFILE:
- Name: ${voiceProfile.name}
- Tone: ${voiceProfile.tone.join(', ')}
- Style: ${voiceProfile.style.sentenceLength} sentences, ${voiceProfile.style.emojiStyle} emoji use
- Preferred vocabulary: ${voiceProfile.vocabulary.preferred.join(', ')}
- Words to AVOID: ${voiceProfile.vocabulary.avoid.join(', ')}
- Signature phrases: ${voiceProfile.vocabulary.signatures.join(', ')}

EXAMPLES OF GREAT @defiapp TWEETS:
${voiceProfile.examples.great.map(t => `"${t}"`).join('\n')}

EXAMPLES OF BAD TWEETS (AI-sounding, off-brand):
${voiceProfile.examples.bad.map(t => `"${t}"`).join('\n')}

Score the content on a scale of 0-100 based on:
1. Tone match (casual, confident, direct)
2. Vocabulary match (uses preferred terms, avoids banned words)
3. Length match (short, punchy sentences)
4. Pattern match (matches signature style)

Return JSON only.`;

    const userPrompt = `Analyze this content for voice match:

"${content}"

Return JSON in this format:
{
  "score": 85,
  "breakdown": {
    "toneMatch": 90,
    "vocabularyMatch": 80,
    "lengthMatch": 85,
    "patternMatch": 85
  },
  "issues": [
    {
      "type": "ai_pattern",
      "detail": "Uses 'excited to announce' which is AI-typical",
      "suggestion": "Remove or rephrase the announcement style"
    }
  ],
  "suggestions": [
    "Make it more casual by removing formal language",
    "Add a signature phrase like 'we ship. you save.'"
  ]
}

Be strict about AI patterns. Common issues:
- "In this thread..."
- "Let's dive in"
- "Excited to announce"
- "Game-changing"
- "Revolutionary"
- Starting with "GM"
- Excessive emojis
- Overly formal tone`;

    const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 1000 });
    const result = parseClaudeJSON<VoiceScoreResult>(response);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice score API error:', error);
    return NextResponse.json(
      { error: 'Failed to score content', details: String(error) },
      { status: 500 }
    );
  }
}

// Heuristic-based scoring when Claude isn't available
function calculateHeuristicScore(content: string): VoiceScoreResult {
  const voiceProfile = DEFAULT_DEFI_APP_VOICE;
  const lowerContent = content.toLowerCase();
  const issues: VoiceScoreResult['issues'] = [];
  const suggestions: string[] = [];

  // Check for AI patterns
  const aiPatterns = [
    { pattern: 'in this thread', message: 'Avoid "in this thread" - too AI-typical' },
    { pattern: "let's dive", message: 'Avoid "let\'s dive in" - very AI-sounding' },
    { pattern: 'excited to announce', message: 'Too formal, sounds like corporate AI' },
    { pattern: 'game-chang', message: '"Game-changing" is overused AI language' },
    { pattern: 'revolutionary', message: '"Revolutionary" sounds like marketing AI' },
    { pattern: 'pleased to', message: '"Pleased to" is too formal' },
    { pattern: 'huge news', message: '"Huge news" is clickbaity' },
    { pattern: 'lfg', message: 'Avoid "LFG" - not part of brand voice' },
    { pattern: 'wagmi', message: 'Avoid "WAGMI" - not part of brand voice' },
    { pattern: 'ngmi', message: 'Avoid "NGMI" - not part of brand voice' },
    { pattern: 'probably nothing', message: 'Avoid "probably nothing" - overused' },
  ];

  let aiPatternCount = 0;
  for (const { pattern, message } of aiPatterns) {
    if (lowerContent.includes(pattern)) {
      aiPatternCount++;
      issues.push({
        type: 'ai_pattern',
        detail: message,
        suggestion: 'Remove or rephrase to sound more natural',
      });
    }
  }

  // Check for avoided vocabulary
  let avoidedWordCount = 0;
  for (const word of voiceProfile.vocabulary.avoid) {
    if (lowerContent.includes(word.toLowerCase())) {
      avoidedWordCount++;
      issues.push({
        type: 'off_brand',
        detail: `Contains "${word}" which is off-brand`,
        suggestion: `Remove or replace "${word}"`,
      });
    }
  }

  // Check for preferred vocabulary (bonus)
  let preferredWordCount = 0;
  for (const word of voiceProfile.vocabulary.preferred) {
    if (lowerContent.includes(word.toLowerCase())) {
      preferredWordCount++;
    }
  }

  // Check for signature phrases (big bonus)
  let signatureCount = 0;
  for (const phrase of voiceProfile.vocabulary.signatures) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      signatureCount++;
    }
  }

  // Length analysis
  const isShort = content.length <= 200;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const avgSentenceLength = content.length / Math.max(sentences.length, 1);
  const hasShortSentences = avgSentenceLength < 80;

  // Emoji count
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  const hasExcessiveEmojis = emojiCount > 3;

  if (hasExcessiveEmojis) {
    issues.push({
      type: 'wrong_tone',
      detail: 'Too many emojis (DeFi App uses minimal emojis)',
      suggestion: 'Reduce to 0-2 emojis maximum',
    });
  }

  // Calculate scores
  const toneMatch = Math.max(0, 100 - aiPatternCount * 15 - (hasExcessiveEmojis ? 10 : 0));
  const vocabularyMatch = Math.max(0, Math.min(100,
    70 + preferredWordCount * 5 + signatureCount * 10 - avoidedWordCount * 15
  ));
  const lengthMatch = (isShort ? 90 : 70) + (hasShortSentences ? 10 : -10);
  const patternMatch = Math.max(0, 100 - aiPatternCount * 20 + signatureCount * 15);

  const overallScore = Math.round(
    (toneMatch * 0.3 + vocabularyMatch * 0.25 + lengthMatch * 0.2 + patternMatch * 0.25)
  );

  // Generate suggestions
  if (toneMatch < 80) {
    suggestions.push('Make content more casual and direct');
  }
  if (vocabularyMatch < 80) {
    suggestions.push('Use more DeFi App signature phrases');
  }
  if (!isShort) {
    suggestions.push('Consider shortening - DeFi App tweets are punchy');
  }
  if (aiPatternCount > 0) {
    suggestions.push('Remove AI-typical phrases to sound more human');
  }

  return {
    score: Math.max(0, Math.min(100, overallScore)),
    breakdown: {
      toneMatch: Math.max(0, Math.min(100, toneMatch)),
      vocabularyMatch: Math.max(0, Math.min(100, vocabularyMatch)),
      lengthMatch: Math.max(0, Math.min(100, lengthMatch)),
      patternMatch: Math.max(0, Math.min(100, patternMatch)),
    },
    issues,
    suggestions,
  };
}
