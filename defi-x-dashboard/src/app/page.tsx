'use client';

import { Users, Eye, TrendingUp, Zap, Target, Flame } from 'lucide-react';
import { MetricsCard } from '@/components/dashboard/metrics-card';
import { AlgorithmPanel } from '@/components/dashboard/algorithm-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentPosts } from '@/components/dashboard/recent-posts';

// Mock data for demonstration
const mockMetrics = {
  followerCount: 47832,
  followerChange: 12.5,
  impressions: 2340000,
  impressionsChange: 23.4,
  engagementRate: 4.8,
  engagementChange: -2.1,
  exposureBudget: 73,
  viralPosts: 3,
  algorithmHealth: 82,
};

const mockAlgorithmInsights = [
  {
    id: '1',
    factorName: 'Exposure Allocation',
    currentUnderstanding: 'Limited daily exposure budget. Reply-guying cannibalizes main post reach. Optimal: 1-2 main posts + 1 QT per day.',
    confidenceLevel: 0.85,
    category: 'EXPOSURE_ALLOCATION',
    impactRating: 5,
  },
  {
    id: '2',
    factorName: 'Content Quality Signals',
    currentUnderstanding: 'Higher-effort content (threads, articles) receives preferential treatment. Low-effort "slop" now penalized.',
    confidenceLevel: 0.9,
    category: 'CONTENT_QUALITY',
    impactRating: 5,
  },
  {
    id: '3',
    factorName: 'Thread Boost Factor',
    currentUnderstanding: 'Threads with 5+ tweets receive algorithmic boost. Each tweet should stand alone for engagement.',
    confidenceLevel: 0.75,
    category: 'THREAD_BOOST',
    impactRating: 4,
  },
  {
    id: '4',
    factorName: 'Penalty Triggers',
    currentUnderstanding: 'Generic content, excessive hashtags, and link-only posts trigger reduced reach. Spammy behavior severely penalized.',
    confidenceLevel: 0.8,
    category: 'PENALTY_TRIGGERS',
    impactRating: 4,
  },
];

const mockRecentPosts = [
  {
    id: '1',
    content: 'Just shipped a massive update to DeFi App. Your favorite features just got 10x better. Thread incoming...',
    impressions: 156000,
    likes: 2340,
    retweets: 890,
    replies: 234,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    qualityScore: 87,
    isViral: true,
  },
  {
    id: '2',
    content: 'The DeFi summer 2.0 narrative is real. Here\'s why DeFi App is positioned to capture the most value...',
    impressions: 89000,
    likes: 1230,
    retweets: 456,
    replies: 167,
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    qualityScore: 92,
  },
  {
    id: '3',
    content: 'CT hot take: Most "DeFi" projects are just yield farms with extra steps. Real DeFi = permissionless, composable, transparent.',
    impressions: 234000,
    likes: 4560,
    retweets: 1890,
    replies: 567,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    qualityScore: 78,
    isViral: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">
          Track your X performance and optimize for CT domination
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <MetricsCard
          title="Followers"
          value={mockMetrics.followerCount}
          change={mockMetrics.followerChange}
          changeLabel="vs last week"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricsCard
          title="Impressions"
          value={mockMetrics.impressions}
          change={mockMetrics.impressionsChange}
          changeLabel="vs last week"
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricsCard
          title="Engagement Rate"
          value={mockMetrics.engagementRate}
          format="percent"
          change={mockMetrics.engagementChange}
          changeLabel="vs last week"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricsCard
          title="Exposure Budget"
          value={`${mockMetrics.exposureBudget}%`}
          icon={<Zap className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricsCard
          title="Viral Posts"
          value={mockMetrics.viralPosts}
          icon={<Flame className="h-4 w-4" />}
          trend="up"
        />
        <MetricsCard
          title="Algorithm Health"
          value={mockMetrics.algorithmHealth}
          icon={<Target className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Algorithm Intelligence - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AlgorithmPanel
            insights={mockAlgorithmInsights}
            healthScore={mockMetrics.algorithmHealth}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Posts */}
      <RecentPosts posts={mockRecentPosts} />
    </div>
  );
}
