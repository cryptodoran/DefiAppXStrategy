import { NextRequest, NextResponse } from 'next/server';

// Image generation using Flux via Replicate API
// Requires REPLICATE_API_TOKEN environment variable

interface GenerateRequest {
  prompt: string;
  style?: 'realistic' | 'anime' | 'digital-art' | 'cinematic';
  width?: number;
  height?: number;
  referenceImage?: string; // Base64 data URL or image URL for img2img
  imageStrength?: number; // 0-1, how much to preserve original image (default 0.75)
}

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, style = 'digital-art', width = 1024, height = 1024, referenceImage, imageStrength = 0.75 } = body;

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: 'Prompt must be at least 5 characters' },
        { status: 400 }
      );
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;

    // Style modifiers to enhance prompts
    const styleModifiers: Record<string, string> = {
      'realistic': 'photorealistic, high detail, 8k resolution, professional photography',
      'anime': 'anime style, vibrant colors, clean lines, studio ghibli inspired',
      'digital-art': 'digital art, modern design, clean aesthetic, trending on artstation',
      'cinematic': 'cinematic, dramatic lighting, movie poster style, epic composition',
    };

    // Build enhanced prompt
    const enhancedPrompt = `${prompt}, ${styleModifiers[style] || styleModifiers['digital-art']}`;

    // If no Replicate token, fall back to Pollinations
    if (!replicateToken) {
      console.warn('REPLICATE_API_TOKEN not set, falling back to Pollinations.ai');
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;

      return NextResponse.json({
        imageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        style,
        width,
        height,
        provider: 'pollinations.ai',
        _fallback: true,
        _note: 'Add REPLICATE_API_TOKEN for Flux quality',
      });
    }

    // Use Flux Pro for highest quality
    // Remove any text/word instructions from prompt - AI is bad at rendering text
    const cleanPrompt = enhancedPrompt
      .replace(/with text ['"][^'"]*['"]/gi, '')
      .replace(/text overlay[^,.]*/gi, '')
      .replace(/labeled ['"][^'"]*['"]/gi, '')
      .replace(/saying ['"][^'"]*['"]/gi, '')
      .replace(/caption[^,.]*/gi, '')
      .replace(/words? ['"][^'"]*['"]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Add instruction to avoid text
    const finalPrompt = `${cleanPrompt}, no text, no words, no letters, no labels, clean image`;

    // Build input parameters
    const inputParams: Record<string, unknown> = {
      prompt: finalPrompt,
      num_outputs: 1,
      aspect_ratio: width === height ? '1:1' : width > height ? '16:9' : '9:16',
      output_format: 'webp',
      output_quality: 95,
      guidance: 3.5,
      steps: 50,
    };

    // If reference image provided, use img2img mode
    // Flux supports image input for style transfer/variations
    if (referenceImage) {
      inputParams.image = referenceImage;
      inputParams.prompt_strength = 1 - imageStrength; // Lower = more like original
      inputParams.guidance = 4.0; // Slightly higher guidance for img2img
    }

    // Create prediction with Flux Pro
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-pro',
        input: inputParams,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Replicate API error:', errorData);
      throw new Error(errorData.detail || 'Failed to create prediction');
    }

    let prediction: ReplicatePrediction = await createResponse.json();

    // Poll for completion (max 60 seconds)
    const maxAttempts = 30;
    let attempts = 0;

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction status');
      }

      prediction = await pollResponse.json();
      attempts++;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Image generation failed');
    }

    if (prediction.status !== 'succeeded') {
      throw new Error('Image generation timed out');
    }

    // Get the output URL
    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      style,
      width,
      height,
      provider: 'flux-pro',
      predictionId: prediction.id,
      mode: referenceImage ? 'img2img' : 'txt2img',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  const hasToken = !!process.env.REPLICATE_API_TOKEN;

  return NextResponse.json({
    status: hasToken ? 'available' : 'fallback',
    provider: hasToken ? 'flux-schnell (Replicate)' : 'pollinations.ai (fallback)',
    features: hasToken
      ? ['high-quality', 'flux-model', 'fast-generation']
      : ['free', 'no-api-key', 'lower-quality'],
    supportedStyles: ['realistic', 'anime', 'digital-art', 'cinematic'],
    _note: hasToken ? 'Using Flux via Replicate' : 'Add REPLICATE_API_TOKEN for Flux quality',
  });
}
