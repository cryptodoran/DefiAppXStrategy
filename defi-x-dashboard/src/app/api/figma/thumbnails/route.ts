import { NextResponse } from 'next/server';

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, nodeIds } = body;

    if (!fileId || !nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: fileId, nodeIds (array)' },
        { status: 400 }
      );
    }

    if (!FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma API not configured' },
        { status: 500 }
      );
    }

    // Fetch thumbnails at low resolution for fast loading (scale=0.5)
    // Max 50 nodes per request
    const batchSize = 50;
    const allThumbnails: Record<string, string> = {};

    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batch = nodeIds.slice(i, i + batchSize);
      const ids = batch.join(',');

      const response = await fetch(
        `https://api.figma.com/v1/images/${fileId}?ids=${encodeURIComponent(ids)}&scale=0.5&format=png`,
        {
          headers: {
            'X-Figma-Token': FIGMA_ACCESS_TOKEN,
          },
        }
      );

      if (!response.ok) {
        console.error(`Figma thumbnail batch error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.images) {
        Object.assign(allThumbnails, data.images);
      }
    }

    return NextResponse.json({
      thumbnails: allThumbnails,
      fileId,
    });
  } catch (error) {
    console.error('Figma thumbnails API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Figma thumbnails', details: String(error) },
      { status: 500 }
    );
  }
}
