import { NextResponse } from 'next/server';
import {
  DOCS_STRUCTURE,
  setDocsCache,
  getDocsCache,
  getLastScrapedAt,
  type DocPage,
} from '@/lib/defi-app-knowledge';

// Scrape documentation from docs.defi.app
// This populates the knowledge base for AI-powered features

interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  success: boolean;
  error?: string;
}

// Simple HTML to text conversion
function htmlToText(html: string): string {
  return html
    // Remove script and style tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract main content from HTML
function extractMainContent(html: string): string {
  // Try to find main content areas
  const mainPatterns = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*docs[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of mainPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return htmlToText(match[1]);
    }
  }

  // Fallback to body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return htmlToText(bodyMatch[1]);
  }

  return htmlToText(html);
}

// Extract title from HTML
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    return htmlToText(titleMatch[1]).replace(/\s*\|.*$/, '').replace(/\s*-.*$/, '');
  }

  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return htmlToText(h1Match[1]);
  }

  return 'Untitled';
}

// Generate summary from content
function generateSummary(content: string, maxLength: number = 200): string {
  const cleaned = content.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Try to cut at a sentence boundary
  const truncated = cleaned.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength / 2) {
    return truncated.slice(0, lastPeriod + 1);
  }

  return truncated + '...';
}

// Scrape a single page
async function scrapePage(url: string, category: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DefiApp-KnowledgeBot/1.0 (Internal Use)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        url,
        title: '',
        content: '',
        summary: '',
        category,
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const title = extractTitle(html);
    const content = extractMainContent(html);
    const summary = generateSummary(content);

    return {
      url,
      title,
      content,
      summary,
      category,
      success: true,
    };
  } catch (error) {
    return {
      url,
      title: '',
      content: '',
      summary: '',
      category,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// POST - Trigger docs scraping
export async function POST() {
  try {
    console.log('[Docs Scraper] Starting documentation scrape...');

    const results: ScrapeResult[] = [];

    // Scrape all documentation pages
    for (const doc of DOCS_STRUCTURE) {
      console.log(`[Docs Scraper] Scraping ${doc.url}...`);
      const result = await scrapePage(doc.url, doc.category);
      results.push(result);

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Filter successful results and update cache
    const successfulDocs: DocPage[] = results
      .filter(r => r.success)
      .map(r => ({
        url: r.url,
        title: r.title,
        content: r.content,
        summary: r.summary,
        category: r.category,
      }));

    setDocsCache(successfulDocs);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[Docs Scraper] Completed: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Scraped ${successCount} of ${results.length} pages`,
      results: results.map(r => ({
        url: r.url,
        title: r.title,
        success: r.success,
        error: r.error,
        contentLength: r.content.length,
      })),
      totalPages: successfulDocs.length,
    });
  } catch (error) {
    console.error('[Docs Scraper] Error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape documentation', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get current docs status
export async function GET() {
  const cache = getDocsCache();
  const lastScraped = getLastScrapedAt();

  return NextResponse.json({
    status: cache.size > 0 ? 'cached' : 'empty',
    pagesCount: cache.size,
    lastScraped: lastScraped?.toISOString() || null,
    pages: Array.from(cache.values()).map(d => ({
      url: d.url,
      title: d.title,
      category: d.category,
      summaryLength: d.summary.length,
      contentLength: d.content.length,
    })),
  });
}
