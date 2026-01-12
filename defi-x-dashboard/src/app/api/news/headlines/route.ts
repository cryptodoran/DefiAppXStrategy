import { NextResponse } from 'next/server';

// News headline from RSS feed
interface NewsHeadline {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

// RSS feed URLs for crypto news sources - using reliable feeds
const RSS_FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/' },
];

// Better RSS parser - handles various RSS formats
function parseRSSItem(itemXml: string): { title: string; link: string; pubDate: string } | null {
  // Replace newlines with spaces for simpler matching
  const normalized = itemXml.replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ');

  // Try multiple patterns for title
  let title = '';
  const titlePatterns = [
    /<title><!\[CDATA\[(.*?)\]\]><\/title>/i,
    /<title>(.*?)<\/title>/i,
  ];
  for (const pattern of titlePatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }

  // Try multiple patterns for link
  let link = '';
  const linkPatterns = [
    /<link><!\[CDATA\[(.*?)\]\]><\/link>/i,
    /<link>(.*?)<\/link>/i,
    /<link href="(.*?)"/i,
    /<guid.*?>(.*?)<\/guid>/i,
  ];
  for (const pattern of linkPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1] && match[1].startsWith('http')) {
      link = match[1].trim();
      break;
    }
  }

  // Get pubDate
  const pubDateMatch = normalized.match(/<pubDate>(.*?)<\/pubDate>/i) ||
    normalized.match(/<published>(.*?)<\/published>/i);
  const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

  if (!title || !link) return null;

  return { title, link, pubDate };
}

// Fetch and parse RSS feed with timeout
async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<NewsHeadline[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DefiAppBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${sourceName}: ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Extract items from RSS (try both <item> and <entry> tags)
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) ||
      xml.match(/<entry>([\s\S]*?)<\/entry>/gi);
    if (!itemMatches) return [];

    const headlines: NewsHeadline[] = [];
    for (const itemXml of itemMatches.slice(0, 3)) {
      const parsed = parseRSSItem(itemXml);
      if (parsed && parsed.title && parsed.link) {
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

// Fallback headlines with REAL links to news sites
function getFallbackHeadlines(): NewsHeadline[] {
  return [
    {
      title: 'Latest crypto news and market updates',
      link: 'https://www.coindesk.com/markets/',
      source: 'CoinDesk',
      pubDate: new Date().toISOString(),
    },
    {
      title: 'DeFi ecosystem and protocol news',
      link: 'https://cointelegraph.com/tags/defi',
      source: 'Cointelegraph',
      pubDate: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      title: 'Bitcoin and cryptocurrency analysis',
      link: 'https://bitcoinmagazine.com/markets',
      source: 'Bitcoin Magazine',
      pubDate: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      title: 'Ethereum ecosystem developments',
      link: 'https://www.coindesk.com/tech/',
      source: 'CoinDesk',
      pubDate: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
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
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allHeadlines.push(...result.value);
      }
    }

    // Sort by date (newest first) and limit to 8 headlines
    let sortedHeadlines = allHeadlines
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 8);

    // If no headlines fetched, return real fallback links
    if (sortedHeadlines.length === 0) {
      sortedHeadlines = getFallbackHeadlines();
    }

    return NextResponse.json(sortedHeadlines);
  } catch (error) {
    console.error('News headlines API error:', error);
    // Return fallback instead of error
    return NextResponse.json(getFallbackHeadlines());
  }
}
