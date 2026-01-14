import { NextResponse } from 'next/server';

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

interface TextNode {
  id: string;
  name: string;
  characters: string;
  style: {
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    textAlignHorizontal: string;
    textAlignVertical: string;
    letterSpacing: number;
    lineHeightPx: number;
    fills: any[];
    effects?: any[];
  };
  absoluteBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const nodeId = searchParams.get('nodeId');

    if (!fileId || !nodeId) {
      return NextResponse.json(
        { error: 'Missing required parameters: fileId, nodeId' },
        { status: 400 }
      );
    }

    if (!FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma API not configured. Set FIGMA_ACCESS_TOKEN in environment.' },
        { status: 500 }
      );
    }

    // Fetch node details from Figma
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Figma API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const node = data.nodes[nodeId];

    if (!node || !node.document) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    // Recursively find all text nodes
    const textNodes: TextNode[] = [];
    const findTextNodes = (node: any) => {
      if (node.type === 'TEXT') {
        textNodes.push({
          id: node.id,
          name: node.name,
          characters: node.characters,
          style: {
            fontFamily: node.style?.fontFamily || 'Inter',
            fontWeight: node.style?.fontWeight || 400,
            fontSize: node.style?.fontSize || 16,
            textAlignHorizontal: node.style?.textAlignHorizontal || 'LEFT',
            textAlignVertical: node.style?.textAlignVertical || 'TOP',
            letterSpacing: node.style?.letterSpacing || 0,
            lineHeightPx: node.style?.lineHeightPx || node.style?.fontSize || 16,
            fills: node.fills || [],
            effects: node.effects || [],
          },
          absoluteBoundingBox: node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 },
        });
      }

      if (node.children) {
        node.children.forEach(findTextNodes);
      }
    };

    findTextNodes(node.document);

    // Get the root node's bounding box for reference
    const rootBoundingBox = node.document.absoluteBoundingBox;

    return NextResponse.json({
      nodeId,
      fileId,
      name: node.document.name,
      rootBoundingBox,
      textNodes,
      totalTextNodes: textNodes.length,
    });
  } catch (error) {
    console.error('Figma node details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Figma node details', details: String(error) },
      { status: 500 }
    );
  }
}
