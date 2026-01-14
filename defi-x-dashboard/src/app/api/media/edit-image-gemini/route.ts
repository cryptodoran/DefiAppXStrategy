import { NextRequest, NextResponse } from 'next/server';

// Image editing using Replicate's img2img models
// Supports adding effects, glow, enhancements, style changes

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, instructions } = await request.json();

    console.log('[Image Edit] Received request with instructions:', instructions);

    if (!imageBase64 || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields: imageBase64, instructions' },
        { status: 400 }
      );
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    console.log('[Image Edit] Starting Replicate img2img generation...');

    // Convert data URL to just base64 if needed
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageDataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${base64Data}`;

    // Create enhanced prompt for image editing
    const enhancedPrompt = `${instructions}. Maintain the original composition and layout. High quality, professional result, 4K, detailed.`;

    console.log('[Image Edit] Enhanced prompt:', enhancedPrompt);

    // Use Flux Dev for img2img (good balance of quality and speed)
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '6e4a938f85952bdabcc15aa329178c4d681c52bf25a0342403287dc26944661d',
        input: {
          prompt: enhancedPrompt,
          image: imageDataUrl,
          prompt_strength: 0.8, // How much to follow the prompt vs preserve original
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_outputs: 1,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Image Edit] Replicate create error:', createResponse.status, errorText);
      throw new Error(`Replicate API error: ${errorText.substring(0, 200)}`);
    }

    const prediction: ReplicatePrediction = await createResponse.json();
    console.log('[Image Edit] Prediction created:', prediction.id);

    // Poll for completion
    let result: ReplicatePrediction = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to poll prediction status');
      }

      result = await pollResponse.json();
      attempts++;
      console.log(`[Image Edit] Poll attempt ${attempts}, status: ${result.status}`);
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Image generation failed');
    }

    if (result.status !== 'succeeded') {
      throw new Error('Image generation timed out');
    }

    // Extract image URL
    const outputImage = Array.isArray(result.output) ? result.output[0] : result.output;

    if (!outputImage) {
      throw new Error('No output image from Replicate');
    }

    console.log('[Image Edit] Success! Image generated:', outputImage);

    // Return the image URL (Replicate returns a URL, not base64)
    return NextResponse.json({
      editedImageUrl: outputImage,
      success: true,
      provider: 'replicate-flux',
    });

  } catch (error) {
    console.error('[Image Edit] Error:', error);
    console.error('[Image Edit] Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        error: 'Failed to edit image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
