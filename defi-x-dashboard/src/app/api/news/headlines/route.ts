import { NextResponse } from 'next/server';

// News headline from RSS feed
interface NewsHeadline {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

// RSS feed URLs for crypto news sources
const RSS_FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml' },
  { name: 'Blockworks', url: 'https://blockworks.co/feed/' },
];

// Simple RSS parser - extracts title and link from RSS XML
function parseRSSItem(itemXml: string): { title: string; link: string; pubDate: string } | null {
  // Replace newlines with spaces for simpler matching
  const normalized = itemXml.replace(/\n/g, ' ');

  const titleMatch = normalized.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
  const linkMatch = normalized.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
  const pubDateMatch = normalized.match(/<pubDate>(.*?)<\/pubDate>/);

  if (!titleMatch || !linkMatch) return null;

  return {
    title: titleMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, ''),
    link: linkMatch[1].trim().replace(/<!\[CDATA\[|\]\]>/g, ''),
    pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
  };
}

// Fetch and parse RSS feed
async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<NewsHeadline[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'DefiAppDashboard/1.0' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${sourceName}: ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Extract items from RSS
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g);
    if (!itemMatches) return [];

    const headlines: NewsHeadline[] = [];
    for (const itemXml of itemMatches.slice(0, 3)) { // Get top 3 from each source
      const parsed = parseRSSItem(itemXml);
      if (parsed) {
        headlines.push({
          title: parsed.title,
          link: parsed.link,
          source: sourceName,
          pubDate: parsed.pubDate,
        });
      }
    }

    return headlines;
  } catch (error) {
    console.error(`Error fetching ${sourceName} RSS:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch from all RSS feeds in parallel
    const results = await Promise.allSettled(
      RSS_FEEDS.map(feed => fetchRSSFeed(feed.url, feed.name))
    );

    // Combine all headlines
    const allHeadlines: NewsHeadline[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allHeadlines.push(...result.value);
      }
    }

    // Sort by date (newest first) and limit to 8 headlines
    const sortedHeadlines = allHeadlines
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 8);

    // If no headlines fetched, return fallback
    if (sortedHeadlines.length === 0) {
      return NextResponse.json([
        {
          title: 'Check crypto news sources for latest updates',
          link: 'https://www.coindesk.com/',
          source: 'CoinDesk',
          pubDate: new Date().toISOString(),
          _fallback: true,
        },
      ]);
    }

    return NextResponse.json(sortedHeadlines);
  } catch (error) {
    console.error('News headlines API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news headlines' },
      { status: 500 }
    );
  }
}
