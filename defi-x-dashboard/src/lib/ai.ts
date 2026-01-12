import Anthropic from '@anthropic-ai/sdk';

// AI client singleton
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    anthropicClient = new Anthropic({ apiKey });
  }

  return anthropicClient;
}

// Types for AI generation
export interface ContentSuggestion {
  id: string;
  type: 'single' | 'thread' | 'qt' | 'take';
  content: string;
  topic: string;
  hook: string;
  score: number;
  reasoning: string;
}

export interface HotTake {
  id: string;
  content: string;
  angle: string;
  spiciness: 'mild' | 'medium' | 'spicy' | 'nuclear';
  targetAudience: string;
}

export interface NarrativeAnalysis {
  narrative: string;
  lifecycle: 'emerging' | 'growing' | 'dominant' | 'fading' | 'dead';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyAccounts: string[];
  contentAngles: string[];
  relevanceScore: number;
}

// System prompts
const CONTENT_SYSTEM_PROMPT = `You are an expert crypto/DeFi Twitter content strategist for Defi App (@defiapp).
Your job is to generate engaging, viral-worthy content that builds brand awareness and thought leadership.
Focus on: DeFi education, market insights, product features, and crypto culture.
Always write in a confident, slightly irreverent but professional tone.
Never use excessive emojis. Be concise and punchy.`;

const TAKE_SYSTEM_PROMPT = `You are a provocative crypto thought leader who generates hot takes.
Your takes should be:
- Contrarian but defensible
- Thought-provoking
- Engagement-driving
- On-brand for a DeFi aggregator
Never be offensive or attack individuals. Focus on ideas and trends.`;

const ANALYSIS_SYSTEM_PROMPT = `You are a crypto Twitter analyst specializing in narrative detection and trend analysis.
Analyze content objectively and provide actionable insights for content strategy.`;

// Generate daily content suggestions
export async function generateDailySuggestions(
  context: {
    trends: string[];
    marketSentiment: string;
    recentTopics: string[];
  }
): Promise<ContentSuggestion[]> {
  const client = getAnthropicClient();

  const prompt = `Generate 5 tweet content suggestions for today.

Current context:
- Trending topics: ${context.trends.join(', ')}
- Market sentiment: ${context.marketSentiment}
- Recent topics we've covered: ${context.recentTopics.join(', ')}

For each suggestion, provide:
1. Type (single tweet, thread idea, or quote tweet angle)
2. The actual content/hook
3. Topic category
4. Predicted engagement score (1-100)
5. Brief reasoning

Format as JSON array with fields: type, content, topic, hook, score, reasoning`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: CONTENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return suggestions.map((s: ContentSuggestion, i: number) => ({
        ...s,
        id: `suggestion-${Date.now()}-${i}`,
      }));
    }
  } catch (error) {
    console.error('Error parsing AI suggestions:', error);
  }

  return [];
}

// Generate hot takes
export async function generateHotTakes(
  topic: string,
  count = 3
): Promise<HotTake[]> {
  const client = getAnthropicClient();

  const prompt = `Generate ${count} hot takes about: "${topic}"

For each take, provide:
1. The take itself (max 280 chars)
2. The angle/perspective
3. Spiciness level (mild/medium/spicy/nuclear)
4. Target audience

Format as JSON array with fields: content, angle, spiciness, targetAudience`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: TAKE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const takes = JSON.parse(jsonMatch[0]);
      return takes.map((t: HotTake, i: number) => ({
        ...t,
        id: `take-${Date.now()}-${i}`,
      }));
    }
  } catch (error) {
    console.error('Error parsing AI takes:', error);
  }

  return [];
}

// Analyze narratives from tweets
export async function analyzeNarratives(
  tweets: { content: string; author: string; engagement: number }[]
): Promise<NarrativeAnalysis[]> {
  const client = getAnthropicClient();

  const tweetSummary = tweets
    .slice(0, 20)
    .map(t => `@${t.author}: "${t.content}" (${t.engagement} engagements)`)
    .join('\n');

  const prompt = `Analyze these crypto Twitter posts and identify the top narratives:

${tweetSummary}

For each narrative found, provide:
1. Narrative name
2. Lifecycle stage (emerging/growing/dominant/fading/dead)
3. Overall sentiment (bullish/bearish/neutral)
4. Key accounts driving it
5. Content angles Defi App could take
6. Relevance score for Defi App (1-100)

Format as JSON array with fields: narrative, lifecycle, sentiment, keyAccounts, contentAngles, relevanceScore`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing narrative analysis:', error);
  }

  return [];
}

// Generate thread content
export async function generateThread(
  topic: string,
  style: 'educational' | 'hot-take' | 'analysis' | 'story',
  length: number = 5
): Promise<string[]> {
  const client = getAnthropicClient();

  const prompt = `Generate a ${length}-tweet thread about: "${topic}"
Style: ${style}

Requirements:
- First tweet must be a strong hook
- Each tweet should be <280 characters
- Include a clear takeaway
- End with a call to action or summary

Format as JSON array of strings (each string is one tweet)`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: CONTENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing thread:', error);
  }

  return [];
}

// Score content quality
export async function scoreContent(content: string): Promise<{
  score: number;
  feedback: string[];
  suggestions: string[];
}> {
  const client = getAnthropicClient();

  const prompt = `Score this crypto Twitter content and provide feedback:

"${content}"

Evaluate on:
1. Hook strength (does it grab attention?)
2. Value (does it provide insight/value?)
3. Engagement potential (will people reply/RT?)
4. Brand alignment (fits DeFi thought leader?)
5. Clarity (is it easy to understand?)

Provide:
- Overall score (1-100)
- Specific feedback points
- Improvement suggestions

Format as JSON: { score: number, feedback: string[], suggestions: string[] }`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: CONTENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing content score:', error);
  }

  return { score: 50, feedback: [], suggestions: [] };
}
