// Defi App Knowledge Base
// This contains key information about Defi App for use in content generation,
// voice analysis, CTAs, and other AI-powered features.
// This serves as both fallback and primary knowledge source for the AI.

export interface DocPage {
  url: string;
  title: string;
  content: string;
  summary: string;
  category: string;
}

// Core product knowledge - key features and value propositions
export const DEFI_APP_CORE_KNOWLEDGE = {
  // What is Defi App
  overview: `
Defi App is the ultimate DeFi aggregator that helps users get the best rates across 100+ protocols.
It simplifies DeFi by aggregating swaps, yields, and opportunities in one seamless interface.
Users save money on every transaction by comparing rates automatically.
  `.trim(),

  // Key features
  features: [
    {
      name: 'DEX Aggregation',
      description: 'Compare and get best swap rates across 100+ DEXs automatically',
      benefit: 'Save up to 5% on every swap vs using a single DEX',
    },
    {
      name: 'Yield Optimization',
      description: 'Find and compare yields across lending protocols and farms',
      benefit: 'Maximize returns on your crypto holdings',
    },
    {
      name: 'Cross-Chain Swaps',
      description: 'Swap tokens across different chains in one transaction',
      benefit: 'No more manual bridging or multiple transactions',
    },
    {
      name: 'Gas Optimization',
      description: 'Smart routing to minimize gas costs',
      benefit: 'Lower transaction fees on every trade',
    },
    {
      name: 'Portfolio Tracking',
      description: 'Track all your DeFi positions in one dashboard',
      benefit: 'Complete visibility across chains and protocols',
    },
  ],

  // Supported chains
  chains: [
    'Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon', 'BNB Chain',
    'Avalanche', 'Solana', 'zkSync Era', 'Linea', 'Scroll',
  ],

  // Key stats (example - should be updated with real data)
  stats: {
    totalVolume: '$2B+',
    totalUsers: '500K+',
    protocolsIntegrated: '100+',
    avgSavings: '2.3%',
    chains: '10+',
  },

  // Value propositions for CTAs
  valueProps: [
    'Get the best rates automatically',
    'Save money on every swap',
    'One-click cross-chain swaps',
    'No hidden fees',
    'Compare rates across 100+ DEXs',
    'Optimize your yield',
    'Track everything in one place',
  ],

  // Good CTA examples
  ctaExamples: [
    'try it at defi.app',
    'compare rates at defi.app',
    'check your potential savings at defi.app',
    'find the best rates at defi.app',
    'stop overpaying - compare at defi.app',
    'save on your next swap at defi.app',
    'one-click swap at defi.app',
  ],
};

// Documentation pages structure (will be populated by scraper)
export const DOCS_STRUCTURE = [
  { url: 'https://docs.defi.app/', title: 'Home', category: 'Overview' },
  { url: 'https://docs.defi.app/getting-started', title: 'Getting Started', category: 'Guide' },
  { url: 'https://docs.defi.app/features/swap', title: 'Swap', category: 'Features' },
  { url: 'https://docs.defi.app/features/bridge', title: 'Bridge', category: 'Features' },
  { url: 'https://docs.defi.app/features/yield', title: 'Yield', category: 'Features' },
  { url: 'https://docs.defi.app/features/portfolio', title: 'Portfolio', category: 'Features' },
  { url: 'https://docs.defi.app/security', title: 'Security', category: 'Trust' },
  { url: 'https://docs.defi.app/faq', title: 'FAQ', category: 'Support' },
];

// In-memory cache for scraped docs
let docsCache: Map<string, DocPage> = new Map();
let lastScrapedAt: Date | null = null;

export function getDocsCache(): Map<string, DocPage> {
  return docsCache;
}

export function setDocsCache(docs: DocPage[]) {
  docsCache = new Map(docs.map(d => [d.url, d]));
  lastScrapedAt = new Date();
}

export function getLastScrapedAt(): Date | null {
  return lastScrapedAt;
}

// Get knowledge summary for AI prompts
export function getKnowledgeSummary(): string {
  const { overview, features, stats, valueProps } = DEFI_APP_CORE_KNOWLEDGE;

  const featureList = features.map(f => `- ${f.name}: ${f.description}`).join('\n');
  const valuePropList = valueProps.join(', ');

  return `
DEFI APP PRODUCT KNOWLEDGE:

${overview}

KEY FEATURES:
${featureList}

STATS: ${stats.totalVolume} volume, ${stats.protocolsIntegrated} protocols, ${stats.avgSavings} avg savings

VALUE PROPS: ${valuePropList}

When creating CTAs, always drive users to defi.app with specific actions like:
${DEFI_APP_CORE_KNOWLEDGE.ctaExamples.slice(0, 3).join(', ')}
  `.trim();
}

// Get full context for content generation
export function getFullContext(): string {
  const baseKnowledge = getKnowledgeSummary();

  // Add any scraped docs content
  const scrapedContent = Array.from(docsCache.values())
    .map(d => `[${d.title}]: ${d.summary || d.content.slice(0, 200)}`)
    .join('\n');

  if (scrapedContent) {
    return `${baseKnowledge}\n\nDOCUMENTATION PAGES:\n${scrapedContent}`;
  }

  return baseKnowledge;
}
