import { NextResponse } from 'next/server';

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const nodeId = searchParams.get('nodeId');
    const scale = searchParams.get('scale') || '2'; // Default 2x for high quality
    const format = searchParams.get('format') || 'png'; // png, jpg, svg, pdf

    if (!fileId || !nodeId) {
      return NextResponse.json(
        { error: 'Missing required parameters: fileId, nodeId' },
        { status: 400 }
      );
    }

    if (!FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma API not configured' },
        { status: 500 }
      );
    }

    // Request image export from Figma
    const exportResponse = await fetch(
      `https://api.figma.com/v1/images/${fileId}?ids=${encodeURIComponent(nodeId)}&scale=${scale}&format=${format}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    if (!exportResponse.ok) {
      const errorText = await exportResponse.text();
      throw new Error(`Figma export error: ${exportResponse.status} - ${errorText}`);
    }

    const exportData = await exportResponse.json();

    if (exportData.err) {
      throw new Error(`Figma export error: ${exportData.err}`);
    }

    // Get the image URL for the node
    const imageUrl = exportData.images[nodeId];

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to get image URL from Figma' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      nodeId,
      fileId,
      format,
      scale: Number(scale),
    });
  } catch (error) {
    console.error('Figma export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export Figma image', details: String(error) },
      { status: 500 }
    );
  }
}

// POST endpoint to export multiple nodes at once
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, nodeIds, scale = 2, format = 'png' } = body;

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

    // Request image export from Figma (max 50 nodes per request)
    const ids = nodeIds.slice(0, 50).join(',');
    const exportResponse = await fetch(
      `https://api.figma.com/v1/images/${fileId}?ids=${encodeURIComponent(ids)}&scale=${scale}&format=${format}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    if (!exportResponse.ok) {
      const errorText = await exportResponse.text();
      throw new Error(`Figma export error: ${exportResponse.status} - ${errorText}`);
    }

    const exportData = await exportResponse.json();

    if (exportData.err) {
      throw new Error(`Figma export error: ${exportData.err}`);
    }

    // Return all image URLs
    const results = nodeIds.map((nodeId: string) => ({
      nodeId,
      imageUrl: exportData.images[nodeId] || null,
    }));

    return NextResponse.json({
      images: results,
      fileId,
      format,
      scale,
    });
  } catch (error) {
    console.error('Figma batch export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export Figma images', details: String(error) },
      { status: 500 }
    );
  }
}
