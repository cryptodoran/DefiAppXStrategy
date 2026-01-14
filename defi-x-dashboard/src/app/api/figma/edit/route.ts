import { NextRequest, NextResponse } from 'next/server';

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

interface TextEdit {
  id: string;
  newText: string;
}

interface EditRequest {
  fileId: string;
  nodeId: string;
  edits: TextEdit[];
}

export async function POST(request: NextRequest) {
  try {
    const body: EditRequest = await request.json();
    const { fileId, nodeId, edits } = body;

    if (!fileId || !nodeId || !edits) {
      return NextResponse.json(
        { error: 'Missing required fields: fileId, nodeId, edits' },
        { status: 400 }
      );
    }

    if (!FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'FIGMA_ACCESS_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Step 1: Get node details to find text layers
    const nodeDetailsResponse = await fetch(
      `${request.nextUrl.origin}/api/figma/node-details?fileId=${fileId}&nodeId=${encodeURIComponent(nodeId)}`
    );

    if (!nodeDetailsResponse.ok) {
      throw new Error('Failed to fetch node details');
    }

    const nodeDetails = await nodeDetailsResponse.json();

    // Step 2: Export the base image from Figma
    const exportResponse = await fetch(
      `${request.nextUrl.origin}/api/figma/export?fileId=${fileId}&nodeId=${encodeURIComponent(nodeId)}&scale=2`
    );

    if (!exportResponse.ok) {
      throw new Error('Failed to export Figma image');
    }

    const exportData = await exportResponse.json();
    const baseImageUrl = exportData.imageUrl;

    // Step 3: Return the data needed for client-side canvas rendering
    // (We'll do the canvas work client-side for better performance)
    return NextResponse.json({
      success: true,
      baseImageUrl,
      textNodes: nodeDetails.textNodes,
      rootBoundingBox: nodeDetails.rootBoundingBox,
      edits,
      fileId,
      nodeId,
    });
  } catch (error) {
    console.error('Figma edit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Figma edit' },
      { status: 500 }
    );
  }
}
