import { NextResponse } from 'next/server';

// Mock data - in production, this would come from the database
const mockDashboardSummary = {
  currentMetrics: {
    followerCount: 47832,
    totalImpressions: 2340000,
    engagementRate: 4.8,
    exposureBudget: 73,
    algorithmHealth: 82,
    viralPostCount: 3,
  },
  previousMetrics: {
    followerCount: 42500,
    totalImpressions: 1890000,
    engagementRate: 4.9,
  },
  recentPosts: [
    {
      id: '1',
      content: 'Just shipped a massive update...',
      impressions: 156000,
      engagements: 2340,
      publishedAt: new Date().toISOString(),
    },
  ],
  pendingSuggestions: 5,
};

export async function GET() {
  try {
    // In production, fetch from database
    // const metrics = await prisma.accountMetrics.findFirst({ orderBy: { date: 'desc' } });

    return NextResponse.json(mockDashboardSummary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
