import { NextResponse } from 'next/server';

// Simple test endpoint to verify API configuration
export async function GET() {
  const checks = {
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  // Test if we can actually make an API call
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = require('@anthropic-ai/sdk').default;
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // Simple test call
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Say "API working" and nothing else.' }],
      });

      const textContent = response.content.find((c: { type: string }) => c.type === 'text');
      checks.apiTest = textContent?.text || 'No response';
      checks.apiWorking = true;
    } catch (error) {
      checks.apiTest = error instanceof Error ? error.message : 'Unknown error';
      checks.apiWorking = false;
    }
  }

  return NextResponse.json(checks);
}
