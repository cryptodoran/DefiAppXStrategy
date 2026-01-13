import Anthropic from '@anthropic-ai/sdk';
import { getKnowledgeSummary } from './defi-app-knowledge';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Check if Claude API is configured
export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Get product knowledge context for AI prompts
function getProductContext(): string {
  return getKnowledgeSummary();
}

// Base function to call Claude
export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  if (!isClaudeConfigured()) {
    throw new Error('Claude API key not configured');
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 1024,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textBlock.text;
}

// Parse JSON from Claude response (handles markdown code blocks)
export function parseClaudeJSON<T>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

// ============ CONTENT ENHANCEMENT ============

export interface EnhanceResult {
  enhanced: string;
  changes: string[];
  reasoning: string;
}

export async function enhanceContent(
  content: string,
  action: 'spicier' | 'context' | 'shorten' | 'hook' | 'cta',
  brandVoice?: BrandVoiceProfile
): Promise<EnhanceResult> {
  const voiceContext = brandVoice
    ? `
Brand Voice Guidelines:
- Tone: ${brandVoice.tone.join(', ')}
- Style: ${brandVoice.style.sentenceLength} sentences, ${brandVoice.style.emojiStyle} emoji use
- Preferred words: ${brandVoice.vocabulary.preferred.slice(0, 10).join(', ')}
- Avoid: ${brandVoice.vocabulary.avoid.slice(0, 10).join(', ')}
`
    : '';

  const actionPrompts: Record<string, string> = {
    spicier: `Make this tweet SPICIER and more provocative. Add controversy, strong opinions, and engagement hooks. Make it bold and attention-grabbing. Don't be generic - be specific and opinionated.`,
    context: `Add relevant market context, data, or news to this tweet. Make it more informative while keeping it engaging. Include specific numbers or facts if relevant.`,
    shorten: `Shorten this tweet while preserving the core message and impact. Make every word count. Remove filler. Keep it punchy.`,
    hook: `Rewrite with a stronger opening hook. The first 10 words should grab attention and make people stop scrolling. Consider: questions, bold statements, surprising facts, or pattern interrupts.`,
    cta: `Improve the Call-To-Action (CTA) in this tweet. Remove any generic endings like "thoughts?", "agree?", "what do you think?" and replace with a strong, actionable CTA that drives users to defi.app or gives them something specific to do. The CTA should feel natural, not salesy. Examples of good CTAs: "try it at defi.app", "compare rates yourself", "check your potential savings", "stop overpaying for swaps".`,
  };

  // Get product knowledge for context
  const productKnowledge = getProductContext();

  const systemPrompt = `You are a crypto Twitter expert who writes viral content. You understand what makes tweets perform well on Crypto Twitter.
${voiceContext}

${productKnowledge}

CRITICAL CTA RULES:
- NEVER end with generic questions like "thoughts?", "agree?", "what do you think?"
- Instead, give users a specific action related to DeFi App or DeFi in general
- Good CTAs: "try it at defi.app", "check the best rates at defi.app", "save on your next swap", "compare for yourself"
- End with value or a call to action, not a question asking for validation
- Reference specific Defi App features when relevant (aggregation, best rates, cross-chain, etc.)

You MUST respond in valid JSON format with this structure:
{
  "enhanced": "the improved tweet text",
  "changes": ["list of specific changes made"],
  "reasoning": "why these changes will improve engagement"
}`;

  const userPrompt = `${actionPrompts[action]}

Original tweet:
"${content}"

Respond with JSON only.`;

  const response = await callClaude(systemPrompt, userPrompt);
  return parseClaudeJSON<EnhanceResult>(response);
}

// ============ CONTENT GENERATION ============

export interface GeneratedTweet {
  content: string;
  type: string;
  voiceAlignment: number;
  predictedEngagement: {
    likes: [number, number];
    retweets: [number, number];
  };
  reasoning: string;
  hook: string;
}

export async function generateTweets(
  topic: string,
  brandVoice: BrandVoiceProfile,
  options: {
    count?: number;
    tone?: 'standard' | 'spicier' | 'professional' | 'educational';
    type?: 'single' | 'thread' | 'qt';
    inspiration?: string; // viral tweet to respond to
  } = {}
): Promise<GeneratedTweet[]> {
  const count = options.count || 3;
  const tone = options.tone || 'standard';

  const toneInstructions: Record<string, string> = {
    standard: 'Use the standard brand voice - confident, clear, engaging.',
    spicier: 'Be more provocative and controversial. Take bold stances. Create debate.',
    professional: 'More formal and data-driven. Focus on credibility and authority.',
    educational: 'Explain concepts clearly. Add value through teaching. Use examples.',
  };

  const exampleTweets = brandVoice.examples.great.slice(0, 5).join('\n\n');

  // Get product knowledge for context
  const productKnowledge = getProductContext();

  const systemPrompt = `You are the social media voice for ${brandVoice.name}. You write tweets that perfectly match their brand voice.

BRAND VOICE PROFILE:
- Tone: ${brandVoice.tone.join(', ')}
- Style: ${brandVoice.style.sentenceLength} sentences, ${brandVoice.style.emojiStyle} emoji use, ${brandVoice.style.punctuation} punctuation
- Signature phrases: ${brandVoice.vocabulary.signatures.join(', ')}
- Core topics: ${brandVoice.topics.core.join(', ')}
- NEVER mention: ${brandVoice.topics.avoid.join(', ')}

${productKnowledge}

CRITICAL CTA RULES:
- NEVER end with generic questions like "thoughts?", "agree?", "what do you think?"
- Instead, give users a specific action related to DeFi App
- Good CTAs: "try it at defi.app", "check the best rates", "save on your next swap", "compare for yourself"
- End with value or a call to action, not a question asking for validation
- Reference specific Defi App features and stats when relevant

EXAMPLE TWEETS (match this style exactly):
${exampleTweets}

${toneInstructions[tone]}

You MUST respond in valid JSON format as an array of tweets.`;

  const inspirationContext = options.inspiration
    ? `\nRespond to/build on this viral tweet:\n"${options.inspiration}"\n`
    : '';

  const userPrompt = `Generate ${count} tweets about: ${topic}
${inspirationContext}
Each tweet should:
1. Match the brand voice exactly
2. Have a strong hook in the first line
3. Be under 280 characters
4. Be unique and not generic

Respond with JSON array:
[{
  "content": "tweet text",
  "type": "${options.type || 'single'}",
  "voiceAlignment": 85,
  "predictedEngagement": { "likes": [100, 500], "retweets": [20, 100] },
  "reasoning": "why this works",
  "hook": "the attention-grabbing opening"
}]`;

  const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 2000 });
  return parseClaudeJSON<GeneratedTweet[]>(response);
}

// ============ THREAD GENERATION ============

export interface ThreadTweet {
  position: number;
  content: string;
  hook?: string;
}

export async function generateThread(
  topic: string,
  initialTweet: string,
  brandVoice: BrandVoiceProfile,
  targetLength: number = 5
): Promise<ThreadTweet[]> {
  const exampleTweets = brandVoice.examples.great.slice(0, 3).join('\n\n');

  const systemPrompt = `You are a crypto Twitter expert who writes viral threads. You understand narrative structure and how to keep readers engaged.

BRAND VOICE:
- Tone: ${brandVoice.tone.join(', ')}
- Style: ${brandVoice.style.sentenceLength} sentences
- Examples: ${exampleTweets}

CRITICAL CTA RULES FOR FINAL TWEET:
- NEVER end with generic questions like "thoughts?", "agree?", "what do you think?"
- The LAST tweet MUST give users a specific action related to DeFi App
- Good final CTAs: "try it at defi.app", "check the best rates at defi.app", "save on your next swap", "stop overpaying - compare at defi.app"
- End the thread with value and a clear action, not a question asking for validation

Threads should:
1. Open with a hook that promises value
2. Build tension/curiosity
3. Deliver insights progressively
4. End with a STRONG call-to-action (never "thoughts?" - give them something to DO)
5. Each tweet should work standalone but flow together

Respond in JSON array format.`;

  const userPrompt = `Create a ${targetLength}-tweet thread about: ${topic}

Starting tweet (tweet 1):
"${initialTweet}"

Generate tweets 2-${targetLength} that continue this thread. Each tweet should:
- Be under 280 characters
- Have a hook at the start (except final tweet)
- Build on previous context
- End with something that makes people want to read next tweet

JSON format:
[{
  "position": 2,
  "content": "tweet text",
  "hook": "optional transition hook"
}]`;

  const response = await callClaude(systemPrompt, userPrompt, { maxTokens: 2000 });
  const continuationTweets = parseClaudeJSON<ThreadTweet[]>(response);

  // Add the initial tweet as position 1
  return [
    { position: 1, content: initialTweet },
    ...continuationTweets,
  ];
}

// ============ CONTENT ANALYSIS ============

export interface ContentAnalysis {
  overallScore: number;
  spiceLevel: number;
  controversyScore: number;
  engagementPotential: number;
  voiceAlignment: number;
  hookStrength: number;
  clarity: number;
  issues: {
    type: 'critical' | 'warning' | 'suggestion';
    description: string;
    fix: string;
  }[];
  strengths: string[];
  improvements: string[];
}

export async function analyzeContent(
  content: string,
  brandVoice?: BrandVoiceProfile
): Promise<ContentAnalysis> {
  const voiceContext = brandVoice
    ? `Compare against brand voice: ${brandVoice.tone.join(', ')}`
    : 'Analyze for general crypto Twitter best practices';

  const systemPrompt = `You are a crypto Twitter content analyst. You evaluate tweets for viral potential and brand alignment.

${voiceContext}

Analyze content for:
1. Hook strength (does first line grab attention?)
2. Spice level (how provocative/bold?)
3. Clarity (is the message clear?)
4. Engagement potential (will people like/RT/reply?)
5. Voice alignment (matches brand?)

Be specific and actionable in feedback. Respond in JSON only.`;

  const userPrompt = `Analyze this tweet:
"${content}"

Respond with JSON:
{
  "overallScore": 75,
  "spiceLevel": 60,
  "controversyScore": 40,
  "engagementPotential": 80,
  "voiceAlignment": 85,
  "hookStrength": 70,
  "clarity": 90,
  "issues": [{"type": "warning", "description": "issue", "fix": "how to fix"}],
  "strengths": ["what works well"],
  "improvements": ["specific improvements"]
}`;

  const response = await callClaude(systemPrompt, userPrompt);
  return parseClaudeJSON<ContentAnalysis>(response);
}

// ============ IMAGE/MEDIA SUGGESTIONS ============

export interface MediaSuggestion {
  type: 'meme' | 'infographic' | 'chart' | 'screenshot' | 'custom';
  description: string;
  imagePrompt: string;
  reasoning: string;
}

export async function suggestMedia(
  tweetContent: string
): Promise<MediaSuggestion[]> {
  const systemPrompt = `You are a social media visual strategist. You know what images, memes, and visuals perform best on Crypto Twitter.

Consider:
- Memes: Popular formats, relatable humor
- Infographics: Data visualization, comparisons
- Charts: Price movements, metrics
- Screenshots: App demos, conversations
- Custom: Unique visuals that match the message

Respond in JSON array format.`;

  const userPrompt = `What visuals would make this tweet more engaging?

Tweet: "${tweetContent}"

Suggest 3 different visual approaches. For each, include:
1. Type of visual
2. Description of what to create
3. Detailed prompt for generating the image
4. Why this visual works

JSON format:
[{
  "type": "meme",
  "description": "what the visual shows",
  "imagePrompt": "detailed prompt for image generation",
  "reasoning": "why this helps the tweet"
}]`;

  const response = await callClaude(systemPrompt, userPrompt);
  return parseClaudeJSON<MediaSuggestion[]>(response);
}

// ============ QT ANGLE GENERATION ============

export interface QTAngle {
  angle: string;
  content: string;
  tone: string;
  predictedEngagement: number;
  reasoning: string;
}

export async function generateQTAngles(
  originalTweet: {
    content: string;
    author: string;
    metrics?: { likes: number; retweets: number };
  },
  brandVoice: BrandVoiceProfile,
  count: number = 3
): Promise<QTAngle[]> {
  const systemPrompt = `You are a crypto Twitter expert who writes viral quote tweets. You understand how to add value, create engagement, and build on viral content.

BRAND VOICE:
- Tone: ${brandVoice.tone.join(', ')}
- Style: ${brandVoice.style.sentenceLength} sentences

CRITICAL CTA RULES:
- NEVER end with generic questions like "thoughts?", "agree?", "what do you think?"
- Instead, give users a specific action or strong statement
- Good endings: reference defi.app, give actionable advice, make a bold claim
- End with value, not a question asking for validation

Good QT strategies:
1. Add unique insight/context
2. Agree and amplify with data
3. Respectful disagreement with reasoning
4. Make it personal/relatable
5. End with a bold statement or call to action (NEVER "thoughts?")

Respond in JSON array format.`;

  const userPrompt = `Generate ${count} quote tweet angles for this tweet:

Original by @${originalTweet.author}:
"${originalTweet.content}"
${originalTweet.metrics ? `(${originalTweet.metrics.likes} likes, ${originalTweet.metrics.retweets} RTs)` : ''}

Each QT should:
- Be under 200 characters (leave room for quoted tweet)
- Add unique value
- Match brand voice
- Have a different angle/approach

JSON format:
[{
  "angle": "Add Context",
  "content": "the QT text",
  "tone": "analytical",
  "predictedEngagement": 85,
  "reasoning": "why this angle works"
}]`;

  const response = await callClaude(systemPrompt, userPrompt);
  return parseClaudeJSON<QTAngle[]>(response);
}

// ============ BRAND VOICE TYPES ============

export interface BrandVoiceProfile {
  id: string;
  name: string;
  tone: string[];
  vocabulary: {
    preferred: string[];
    avoid: string[];
    signatures: string[];
  };
  style: {
    useEmojis: boolean;
    emojiStyle: 'minimal' | 'moderate' | 'heavy';
    sentenceLength: 'short' | 'medium' | 'varied';
    punctuation: 'formal' | 'casual' | 'dramatic';
  };
  examples: {
    great: string[];
    bad: string[];
  };
  topics: {
    core: string[];
    avoid: string[];
  };
}

// Default Defi App brand voice
export const DEFAULT_DEFI_APP_VOICE: BrandVoiceProfile = {
  id: 'defi-app-default',
  name: 'Defi App',
  tone: ['confident', 'technical-but-accessible', 'bold', 'no-bullshit', 'forward-looking'],
  vocabulary: {
    preferred: [
      'aggregation', 'optimization', 'yield', 'capital efficiency',
      'seamless', 'instant', 'best rates', 'one-click', 'defi native',
    ],
    avoid: [
      'revolutionary', 'game-changer', 'to the moon', 'wen', 'ser',
      'gm', 'wagmi', 'ngmi', 'probably nothing', 'lfg',
    ],
    signatures: [
      'Built different.',
      'This is the way.',
      'The future is aggregated.',
    ],
  },
  style: {
    useEmojis: true,
    emojiStyle: 'minimal',
    sentenceLength: 'short',
    punctuation: 'dramatic',
  },
  examples: {
    great: [
      'Stop paying more than you need to. Defi App finds the best rates across 100+ protocols in one click.',
      'The DeFi UX problem isn\'t technical. It\'s that nobody bothered to solve it. We did.',
      'Your swap just saved you $47. You\'re welcome.',
      'Thread: Why 90% of DeFi users are leaving money on the table (and how to stop)',
      'Hot take: Most "DeFi protocols" are just expensive middlemen with extra steps.',
    ],
    bad: [
      'GM frens! Exciting news coming soon! Stay tuned! 🚀🚀🚀',
      'We are pleased to announce our revolutionary new feature...',
      'HUGE announcement! This is going to be game-changing!',
    ],
  },
  topics: {
    core: [
      'DeFi aggregation', 'yield optimization', 'capital efficiency',
      'swap routing', 'cross-chain', 'gas optimization', 'user experience',
    ],
    avoid: [
      'price predictions', 'financial advice', 'token pumps',
      'competitor FUD', 'politics', 'controversial figures',
    ],
  },
};
