import { NextResponse } from 'next/server';

// News headline from RSS feed
interface NewsHeadline {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  score?: number; // Importance score for ranking
}

// RSS feed URLs for crypto news sources - using reliable feeds
// More feeds = more article variety across timeframes
const RSS_FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'DeFi Pulse', url: 'https://defipulse.com/blog/feed/' },
  { name: 'Blockworks', url: 'https://blockworks.co/feed/' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
];

// In-memory article cache for longer timeframe coverage
interface ArticleCache {
  articles: NewsHeadline[];
  lastUpdated: number;
}
let articleCache: ArticleCache | null = null;
const ARTICLE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Decode HTML entities in titles
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
    '&nbsp;': ' ',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&hellip;': '\u2026',
  };

  // First replace named/numeric entities
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }

  // Handle remaining numeric entities (&#NNN; or &#xHHH;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return decoded;
}

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
      title = decodeHtmlEntities(match[1].trim());
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
    // Fetch up to 15 items per feed for better timeframe coverage
    for (const itemXml of itemMatches.slice(0, 15)) {
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

// Source priority for ranking (higher = more authoritative)
const SOURCE_PRIORITY: Record<string, number> = {
  'CoinDesk': 10,
  'Cointelegraph': 9,
  'The Block': 9,
  'Bitcoin Magazine': 8,
  'Decrypt': 7,
  'Blockworks': 7,
  'CryptoSlate': 6,
  'DeFi Pulse': 5,
};

// Keywords that indicate major/important news
const IMPORTANCE_KEYWORDS = [
  { pattern: /breaking|exclusive|just in/i, score: 15 },
  { pattern: /\$\d+\s*(billion|million|B|M)/i, score: 12 }, // Money amounts
  { pattern: /SEC|ETF|regulation|approved|lawsuit/i, score: 10 },
  { pattern: /hack|exploit|stolen|breach/i, score: 10 },
  { pattern: /bitcoin|BTC|ethereum|ETH/i, score: 5 },
  { pattern: /partnership|acquisition|merger|launch/i, score: 8 },
  { pattern: /all-time high|ATH|record|surge|crash|plunge/i, score: 8 },
  { pattern: /Coinbase|Binance|BlackRock|Fidelity/i, score: 7 },
];

// Score an article based on source and content
function scoreArticle(headline: NewsHeadline): number {
  let score = 0;

  // Source priority
  score += SOURCE_PRIORITY[headline.source] || 3;

  // Keyword matching
  for (const { pattern, score: keywordScore } of IMPORTANCE_KEYWORDS) {
    if (pattern.test(headline.title)) {
      score += keywordScore;
    }
  }

  // Bonus for longer, more substantive titles (not too short, not clickbait)
  const titleLength = headline.title.length;
  if (titleLength > 40 && titleLength < 120) {
    score += 3;
  }

  return score;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    // Calculate time range
    const now = new Date();
    const hoursBack: Record<string, number> = {
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };
    const cutoffTime = new Date(now.getTime() - (hoursBack[timeframe] || 24) * 60 * 60 * 1000);

    // Check if we need to refresh the article cache
    const shouldRefreshCache = !articleCache ||
      (Date.now() - articleCache.lastUpdated) > ARTICLE_CACHE_DURATION;

    let allHeadlines: NewsHeadline[];

    if (shouldRefreshCache) {
      // Fetch from all RSS feeds in parallel
      const results = await Promise.allSettled(
        RSS_FEEDS.map(feed => fetchRSSFeed(feed.url, feed.name))
      );

      // Combine all headlines
      allHeadlines = [];
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          allHeadlines.push(...result.value);
        }
      }

      // Sort by date and deduplicate
      allHeadlines.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      // Update cache - combine with existing if available for more history
      if (articleCache) {
        const existingTitles = new Set(allHeadlines.map(h => h.title.toLowerCase().slice(0, 50)));
        const oldArticles = articleCache.articles.filter(
          h => !existingTitles.has(h.title.toLowerCase().slice(0, 50))
        );
        allHeadlines = [...allHeadlines, ...oldArticles].slice(0, 200); // Keep 200 max
      }

      articleCache = {
        articles: allHeadlines,
        lastUpdated: Date.now(),
      };
    } else {
      allHeadlines = articleCache!.articles;
    }

    // Show DIFFERENT top articles for each timeframe
    // Partition articles first, then rank by importance within each partition
    let finalHeadlines: NewsHeadline[];
    let isTimeframeSpecific = true;

    if (allHeadlines.length > 0) {
      // Score all articles for importance ranking
      const scoredArticles = allHeadlines.map(h => ({
        ...h,
        score: scoreArticle(h),
      }));

      // Sort by score first to get importance ranking
      scoredArticles.sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      });

      const totalArticles = scoredArticles.length;

      // Partition: Each timeframe gets a different slice of top articles
      // This ensures switching timeframes shows DIFFERENT content
      let partition: NewsHeadline[];

      if (timeframe === '24h') {
        // 24h: Top third of scored articles (the very best)
        const endIndex = Math.max(Math.ceil(totalArticles / 3), limit);
        partition = scoredArticles.slice(0, endIndex);
      } else if (timeframe === '7d') {
        // 7d: Middle third of scored articles (good but different)
        const startIndex = Math.ceil(totalArticles / 3);
        const endIndex = Math.ceil(totalArticles * 2 / 3);
        partition = scoredArticles.slice(startIndex, Math.max(endIndex, startIndex + limit));
      } else {
        // 30d: Last third of scored articles (still relevant, different content)
        const startIndex = Math.ceil(totalArticles * 2 / 3);
        partition = scoredArticles.slice(startIndex);
      }

      // If partition is too small, expand it
      if (partition.length < limit) {
        const needed = limit - partition.length;
        const used = new Set(partition.map(p => p.title));
        const additional = scoredArticles.filter(a => !used.has(a.title)).slice(0, needed);
        partition = [...partition, ...additional];
      }

      // Already sorted by score within partition
      finalHeadlines = partition.slice(0, limit);
      isTimeframeSpecific = true;
    } else {
      // No headlines at all, use fallback
      finalHeadlines = getFallbackHeadlines();
      isTimeframeSpecific = false;
    }

    // Deduplicate by title (some feeds may have same story)
    const seen = new Set<string>();
    finalHeadlines = finalHeadlines.filter(h => {
      const key = h.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      headlines: finalHeadlines,
      timeframe,
      count: finalHeadlines.length,
      _timeframeMatch: isTimeframeSpecific,
      _cachedArticles: articleCache?.articles.length || 0,
    });
  } catch (error) {
    console.error('News headlines API error:', error);
    // Return fallback instead of error
    return NextResponse.json({
      headlines: getFallbackHeadlines(),
      timeframe: '24h',
      count: 4,
      _fallback: true,
    });
  }
}
