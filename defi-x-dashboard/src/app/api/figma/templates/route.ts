import { NextResponse } from 'next/server';

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_TEMPLATES_FILE_ID = process.env.FIGMA_TEMPLATES_FILE_ID;
const FIGMA_CAMPAIGNS_FILE_ID = process.env.FIGMA_CAMPAIGNS_FILE_ID;

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

interface FigmaTemplate {
  id: string;
  name: string;
  page: string;
  fileId: string;
  fileType: 'templates' | 'campaigns';
}

interface FigmaPage {
  name: string;
  templates: FigmaTemplate[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('fileType') || 'all'; // 'templates', 'campaigns', or 'all'
    const page = searchParams.get('page'); // Optional: filter by page name

    if (!FIGMA_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Figma API not configured' },
        { status: 500 }
      );
    }

    const results: { templates: FigmaPage[]; campaigns: FigmaPage[] } = {
      templates: [],
      campaigns: [],
    };

    // Fetch templates file
    if (fileType === 'templates' || fileType === 'all') {
      if (FIGMA_TEMPLATES_FILE_ID) {
        const templatesData = await fetchFigmaFile(FIGMA_TEMPLATES_FILE_ID, 'templates', page);
        results.templates = templatesData;
      }
    }

    // Fetch campaigns file
    if (fileType === 'campaigns' || fileType === 'all') {
      if (FIGMA_CAMPAIGNS_FILE_ID) {
        const campaignsData = await fetchFigmaFile(FIGMA_CAMPAIGNS_FILE_ID, 'campaigns', page);
        results.campaigns = campaignsData;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Figma templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Figma templates', details: String(error) },
      { status: 500 }
    );
  }
}

async function fetchFigmaFile(
  fileId: string,
  fileType: 'templates' | 'campaigns',
  filterPage?: string | null
): Promise<FigmaPage[]> {
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileId}`,
    {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  const data = await response.json();
  const pages: FigmaPage[] = [];

  // Process each page in the document
  for (const pageNode of data.document.children) {
    if (pageNode.type !== 'CANVAS') continue;

    // Filter by page name if specified
    if (filterPage && pageNode.name.toLowerCase() !== filterPage.toLowerCase()) {
      continue;
    }

    const templates: FigmaTemplate[] = [];

    // Get all top-level frames on this page (these are typically templates)
    if (pageNode.children) {
      for (const child of pageNode.children) {
        // Only include FRAME and COMPONENT types (skip groups, text, etc.)
        if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
          templates.push({
            id: child.id,
            name: child.name,
            page: pageNode.name,
            fileId,
            fileType,
          });
        }
      }
    }

    if (templates.length > 0) {
      pages.push({
        name: pageNode.name,
        templates,
      });
    }
  }

  return pages;
}
