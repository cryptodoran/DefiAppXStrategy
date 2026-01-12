'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  CheckCircle,
  Circle,
  ArrowRight,
  Trophy,
} from 'lucide-react';

// Mock data
const currentRanking = {
  position: 12,
  totalDeFiAccounts: 50,
  followerCount: 47832,
  leadingAccount: '@uniswap',
  leadingFollowers: 1200000,
  gap: 1152168,
};

const milestones = [
  { followers: 50000, label: '50K', achieved: false, daysAway: 5 },
  { followers: 75000, label: '75K', achieved: false, daysAway: 35 },
  { followers: 100000, label: '100K', achieved: false, daysAway: 65 },
  { followers: 250000, label: '250K', achieved: false, daysAway: 150 },
  { followers: 500000, label: '500K', achieved: false, daysAway: 280 },
  { followers: 1000000, label: '1M', achieved: false, daysAway: 450 },
];

const strategies = [
  {
    category: 'Content',
    recommendations: [
      {
        action: 'Increase thread output to 3-4 per week',
        impact: 'High',
        effort: 'Medium',
        status: 'in_progress',
      },
      {
        action: 'Create viral "DeFi explained" series',
        impact: 'High',
        effort: 'High',
        status: 'planned',
      },
      {
        action: 'Develop signature content format',
        impact: 'Medium',
        effort: 'Medium',
        status: 'planned',
      },
    ],
  },
  {
    category: 'Engagement',
    recommendations: [
      {
        action: 'Strategic QTs on trending DeFi topics',
        impact: 'High',
        effort: 'Low',
        status: 'in_progress',
      },
      {
        action: 'Build relationships with top 20 CT accounts',
        impact: 'High',
        effort: 'High',
        status: 'planned',
      },
      {
        action: 'Host weekly Twitter Spaces',
        impact: 'Medium',
        effort: 'Medium',
        status: 'not_started',
      },
    ],
  },
  {
    category: 'Viral Campaigns',
    recommendations: [
      {
        action: 'Launch "DeFi Challenge" campaign',
        impact: 'Very High',
        effort: 'High',
        status: 'planned',
      },
      {
        action: 'Create shareable infographics',
        impact: 'Medium',
        effort: 'Medium',
        status: 'in_progress',
      },
      {
        action: 'Controversial takes on industry trends',
        impact: 'High',
        effort: 'Low',
        status: 'not_started',
      },
    ],
  },
  {
    category: 'Partnerships',
    recommendations: [
      {
        action: 'Collaborate with DeFi influencers',
        impact: 'High',
        effort: 'Medium',
        status: 'planned',
      },
      {
        action: 'Cross-promote with complementary projects',
        impact: 'Medium',
        effort: 'Low',
        status: 'not_started',
      },
      {
        action: 'Sponsor DeFi content creators',
        impact: 'Medium',
        effort: 'Medium',
        status: 'not_started',
      },
    ],
  },
];

const weeklyProgress = [
  { week: 'Week 1', followers: 45230, growth: 1200 },
  { week: 'Week 2', followers: 46100, growth: 870 },
  { week: 'Week 3', followers: 47200, growth: 1100 },
  { week: 'Week 4', followers: 47832, growth: 632 },
];

export default function PathTo1Page() {
  const requiredGrowthRate = 12.5; // % per month to reach #1 in 6 months

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Planned</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      default:
        return <Badge className="bg-white/5 text-tertiary">Not Started</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High':
        return 'text-red-400';
      case 'High':
        return 'text-orange-400';
      case 'Medium':
        return 'text-yellow-400';
      default:
        return 'text-tertiary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Path to #1
        </h1>
        <p className="text-tertiary">
          Strategic roadmap to become the #1 DeFi account on Crypto Twitter
        </p>
      </div>

      {/* Current Position */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Current Ranking</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">#{currentRanking.position}</span>
              <span className="text-tertiary">/ {currentRanking.totalDeFiAccounts}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Current Followers</p>
            <p className="text-3xl font-bold text-white">
              {currentRanking.followerCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Gap to #1</p>
            <p className="text-3xl font-bold text-red-400">
              {currentRanking.gap.toLocaleString()}
            </p>
            <p className="text-xs text-tertiary">{currentRanking.leadingAccount}</p>
          </CardContent>
        </Card>
        <Card className="bg-surface border-white/5">
          <CardContent className="pt-4">
            <p className="text-sm text-tertiary">Required Growth Rate</p>
            <p className="text-3xl font-bold text-yellow-400">{requiredGrowthRate}%</p>
            <p className="text-xs text-tertiary">per month to reach #1 in 6mo</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Growth Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-0 top-4 h-0.5 w-full bg-elevated" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"
              style={{ width: `${(currentRanking.followerCount / 1000000) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {milestones.map((milestone) => (
                <div key={milestone.label} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full border-2 flex items-center justify-center z-10',
                      currentRanking.followerCount >= milestone.followers
                        ? 'bg-green-500 border-green-500'
                        : 'bg-surface border-white/10'
                    )}
                  >
                    {currentRanking.followerCount >= milestone.followers ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-tertiary" />
                    )}
                  </div>
                  <span className="mt-2 text-sm font-medium text-white">{milestone.label}</span>
                  {!milestone.achieved && (
                    <span className="text-xs text-tertiary">~{milestone.daysAway}d</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {strategies.map((strategy) => (
          <Card key={strategy.category} className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">{strategy.category} Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strategy.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg bg-base"
                >
                  <div className="flex-1">
                    <p className="text-sm text-secondary">{rec.action}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={getImpactColor(rec.impact)}>
                        Impact: {rec.impact}
                      </span>
                      <span className="text-tertiary">Effort: {rec.effort}</span>
                    </div>
                  </div>
                  {getStatusBadge(rec.status)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Progress */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={week.week} className="flex items-center gap-4">
                <span className="text-sm text-tertiary w-20">{week.week}</span>
                <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                    style={{ width: `${(week.followers / 100000) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-20 text-right">
                  {week.followers.toLocaleString()}
                </span>
                <span
                  className={cn(
                    'text-sm w-16 text-right',
                    week.growth >= 1000 ? 'text-green-400' : 'text-yellow-400'
                  )}
                >
                  +{week.growth}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 border-white/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Ready to accelerate growth?</h3>
              <p className="text-sm text-tertiary">
                Generate a detailed weekly action plan based on these strategies
              </p>
            </div>
            <Button className="bg-white text-black hover:bg-white/90">
              Generate Action Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
