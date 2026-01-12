'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumBadge, TrendBadge } from '@/components/ui/premium-badge';
import {
  Users,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Repeat2,
  Target,
  AlertCircle,
  BarChart3,
  Zap,
} from 'lucide-react';

interface Competitor {
  id: string;
  username: string;
  displayName: string;
  followers: number;
  followersChange7d: number;
  avgEngagement: number;
  postsPerDay: number;
  topCategory: string;
  lastActive: Date;
  threat: 'high' | 'medium' | 'low';
  recentPosts: CompetitorPost[];
}

interface CompetitorPost {
  id: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  publishedAt: Date;
  performance: 'viral' | 'above-average' | 'average' | 'below-average';
}

interface ContentGap {
  topic: string;
  description: string;
  competitors: string[];
  opportunity: string;
  urgency: 'high' | 'medium' | 'low';
}

// Mock data
const mockCompetitors: Competitor[] = [
  {
    id: '1',
    username: 'aaveaave',
    displayName: 'Aave',
    followers: 892000,
    followersChange7d: 2.3,
    avgEngagement: 3.8,
    postsPerDay: 4.2,
    topCategory: 'Protocol Updates',
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    threat: 'high',
    recentPosts: [
      {
        id: 'p1',
        content: 'Aave V4 introduces native cross-chain functionality...',
        likes: 4500,
        retweets: 1200,
        replies: 340,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        performance: 'viral',
      },
    ],
  },
  {
    id: '2',
    username: 'MakerDAO',
    displayName: 'Maker',
    followers: 456000,
    followersChange7d: 0.8,
    avgEngagement: 2.4,
    postsPerDay: 2.1,
    topCategory: 'Governance',
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    threat: 'medium',
    recentPosts: [],
  },
  {
    id: '3',
    username: 'compound_labs',
    displayName: 'Compound',
    followers: 312000,
    followersChange7d: -0.5,
    avgEngagement: 1.9,
    postsPerDay: 1.5,
    topCategory: 'DeFi Education',
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
    threat: 'low',
    recentPosts: [],
  },
  {
    id: '4',
    username: 'uaboredapes',
    displayName: 'Uniswap',
    followers: 1200000,
    followersChange7d: 3.2,
    avgEngagement: 4.5,
    postsPerDay: 3.8,
    topCategory: 'Product Updates',
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    threat: 'high',
    recentPosts: [],
  },
];

const mockContentGaps: ContentGap[] = [
  {
    topic: 'Real-World Asset Integration',
    description: 'No competitors are covering RWA integration strategies',
    competitors: ['aaveaave', 'MakerDAO'],
    opportunity: 'First-mover advantage on RWA content',
    urgency: 'high',
  },
  {
    topic: 'L2 Yield Optimization',
    description: 'Limited content on yield strategies across L2s',
    competitors: ['compound_labs'],
    opportunity: 'Create definitive L2 yield guide',
    urgency: 'medium',
  },
  {
    topic: 'MEV Protection Strategies',
    description: 'Complex topic with minimal competitor coverage',
    competitors: [],
    opportunity: 'Establish expertise in MEV protection',
    urgency: 'low',
  },
];

export function CompetitorWarRoom() {
  const [selectedCompetitor, setSelectedCompetitor] = React.useState<Competitor | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Competitor War Room</h1>
          <p className="text-tertiary mt-1">Monitor and outmaneuver the competition</p>
        </div>
        <PremiumButton size="sm" variant="secondary" leftIcon={<Users className="h-4 w-4" />}>
          Add Competitor
        </PremiumButton>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Competitors Tracked"
          value={mockCompetitors.length.toString()}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Avg. Threat Level"
          value="Medium"
          icon={<AlertCircle className="h-4 w-4" />}
          color="yellow"
        />
        <StatCard
          label="Content Gaps Found"
          value={mockContentGaps.length.toString()}
          icon={<Target className="h-4 w-4" />}
          color="green"
        />
        <StatCard
          label="Recent Alerts"
          value="2"
          icon={<Zap className="h-4 w-4" />}
          color="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Competitor Grid */}
        <div className="lg:col-span-2">
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Tracked Competitors</h2>
              <span className="text-xs text-tertiary">Click for deep dive</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {mockCompetitors.map((competitor, index) => (
                <motion.div
                  key={competitor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CompetitorCard
                    competitor={competitor}
                    isSelected={selectedCompetitor?.id === competitor.id}
                    onClick={() => setSelectedCompetitor(competitor)}
                  />
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* Content Gaps */}
        <div>
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Content Gaps</h2>
              <PremiumBadge variant="success" size="sm">{mockContentGaps.length} found</PremiumBadge>
            </div>

            <div className="space-y-3">
              {mockContentGaps.map((gap, index) => (
                <motion.div
                  key={gap.topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentGapCard gap={gap} />
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Selected Competitor Deep Dive */}
      {selectedCompetitor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {selectedCompetitor.displayName[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-primary">{selectedCompetitor.displayName}</h2>
                  <a
                    href={`https://twitter.com/${selectedCompetitor.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-tertiary hover:text-secondary flex items-center gap-1"
                  >
                    @{selectedCompetitor.username}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="text-tertiary hover:text-primary"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div className="p-3 rounded-lg bg-elevated">
                <p className="text-xs text-tertiary mb-1">Followers</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-semibold text-primary">
                    {formatNumber(selectedCompetitor.followers)}
                  </span>
                  <TrendBadge value={selectedCompetitor.followersChange7d} />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-elevated">
                <p className="text-xs text-tertiary mb-1">Avg Engagement</p>
                <span className="font-mono font-semibold text-primary">
                  {selectedCompetitor.avgEngagement}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-elevated">
                <p className="text-xs text-tertiary mb-1">Posts/Day</p>
                <span className="font-mono font-semibold text-primary">
                  {selectedCompetitor.postsPerDay}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-elevated">
                <p className="text-xs text-tertiary mb-1">Top Category</p>
                <span className="font-semibold text-primary">
                  {selectedCompetitor.topCategory}
                </span>
              </div>
            </div>

            {/* Recent Posts */}
            {selectedCompetitor.recentPosts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-secondary mb-3">Recent Top Posts</h3>
                <div className="space-y-2">
                  {selectedCompetitor.recentPosts.map((post) => (
                    <div key={post.id} className="p-3 rounded-lg bg-elevated">
                      <p className="text-sm text-secondary line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-tertiary">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" />
                          {formatNumber(post.retweets)}
                        </span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                          post.performance === 'viral' && 'bg-green-500/20 text-green-400',
                          post.performance === 'above-average' && 'bg-lime-500/20 text-lime-400'
                        )}>
                          {post.performance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PremiumCard>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'violet',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: 'violet' | 'yellow' | 'green' | 'red';
}) {
  const colorClasses = {
    violet: 'text-violet-400 bg-violet-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <PremiumCard>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-tertiary">{label}</p>
          <p className="font-semibold text-primary">{value}</p>
        </div>
      </div>
    </PremiumCard>
  );
}

function CompetitorCard({
  competitor,
  isSelected,
  onClick,
}: {
  competitor: Competitor;
  isSelected: boolean;
  onClick: () => void;
}) {
  const threatColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    low: 'text-green-400 bg-green-500/10 border-green-500/20',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-colors',
        isSelected
          ? 'bg-violet-500/10 border-violet-500/30'
          : 'bg-elevated border-white/5 hover:border-white/10'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {competitor.displayName[0]}
          </div>
          <div>
            <p className="font-medium text-primary">{competitor.displayName}</p>
            <p className="text-xs text-tertiary">@{competitor.username}</p>
          </div>
        </div>
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium uppercase border', threatColors[competitor.threat])}>
          {competitor.threat}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-tertiary">Followers: </span>
          <span className="font-mono text-secondary">{formatNumber(competitor.followers)}</span>
        </div>
        <div>
          <span className="text-tertiary">Engagement: </span>
          <span className="font-mono text-secondary">{competitor.avgEngagement}%</span>
        </div>
      </div>
    </motion.button>
  );
}

function ContentGapCard({ gap }: { gap: ContentGap }) {
  const urgencyColors = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    low: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="p-3 rounded-lg bg-elevated border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-primary text-sm">{gap.topic}</h4>
        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium uppercase', urgencyColors[gap.urgency])}>
          {gap.urgency}
        </span>
      </div>
      <p className="text-xs text-tertiary mb-2">{gap.description}</p>
      <p className="text-xs text-green-400">{gap.opportunity}</p>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}
