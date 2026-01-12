import { NextResponse } from 'next/server';

export interface MarketPulse {
  btc: { price: number; change24h: number };
  eth: { price: number; change24h: number };
  fearGreed: { value: number; label: string };
  trending: string[];
  lastUpdated: string;
}

export async function GET() {
  try {
    const [priceData, fearGreedData] = await Promise.all([
      fetchPrices(),
      fetchFearGreed(),
    ]);

    const pulse: MarketPulse = {
      btc: priceData.btc,
      eth: priceData.eth,
      fearGreed: fearGreedData,
      trending: ['DeFi', 'L2s', 'Airdrops', 'Yield'],
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(pulse);
  } catch (error) {
    console.error('Market pulse error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

async function fetchPrices(): Promise<{
  btc: { price: number; change24h: number };
  eth: { price: number; change24h: number };
}> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 60 } }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        btc: {
          price: data.bitcoin?.usd || 0,
          change24h: data.bitcoin?.usd_24h_change || 0,
        },
        eth: {
          price: data.ethereum?.usd || 0,
          change24h: data.ethereum?.usd_24h_change || 0,
        },
      };
    }
  } catch (e) {
    console.error('Price fetch error:', e);
  }

  // Fallback
  return {
    btc: { price: 97500, change24h: 1.2 },
    eth: { price: 3350, change24h: 2.1 },
  };
}

async function fetchFearGreed(): Promise<{ value: number; label: string }> {
  try {
    const response = await fetch('https://api.alternative.me/fng/', {
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      const value = parseInt(data.data?.[0]?.value || '50');
      return {
        value,
        label: getFearGreedLabel(value),
      };
    }
  } catch (e) {
    console.error('Fear & Greed fetch error:', e);
  }

  return { value: 65, label: 'Greed' };
}

function getFearGreedLabel(value: number): string {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 45) return 'Fear';
  if (value <= 55) return 'Neutral';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
}
