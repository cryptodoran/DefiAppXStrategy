'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  MessageCircle,
  Quote,
  Info,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AppLayout } from '@/components/layout/app-layout';

// US-005: Exposure Budget Tracker

const exposureData = {
  daily: {
    total: 100,
    used: 73,
    remaining: 27,
  },
  breakdown: {
    mainPosts: 45,
    replies: 18,
    quotes: 10,
  },
  hourlyUsage: [
    { hour: '6AM', used: 0 },
    { hour: '8AM', used: 5 },
    { hour: '10AM', used: 15 },
    { hour: '12PM', used: 25 },
    { hour: '2PM', used: 45 },
    { hour: '4PM', used: 58 },
    { hour: '6PM', used: 68 },
    { hour: '8PM', used: 73 },
  ],
  weeklyTrend: [
    { day: 'Mon', budget: 100, used: 82 },
    { day: 'Tue', budget: 100, used: 91 },
    { day: 'Wed', budget: 100, used: 78 },
    { day: 'Thu', budget: 100, used: 85 },
    { day: 'Fri', budget: 100, used: 73 },
    { day: 'Sat', budget: 100, used: 45 },
    { day: 'Sun', budget: 100, used: 38 },
  ],
  recommendations: [
    {
      type: 'warning',
      message: 'You\'ve used 73% of your daily exposure budget. Consider saving remaining budget for peak hours.',
    },
    {
      type: 'tip',
      message: 'Your replies are consuming 18% of exposure. Focus on main posts for better ROI.',
    },
    {
      type: 'insight',
      message: 'Historical data shows your best engagement window is 2-4 PM EST. You have budget remaining.',
    },
  ],
  activityLog: [
    { time: '8:15 PM', action: 'Main Post', cost: 5, content: 'DeFi isn\'t dead...' },
    { time: '6:30 PM', action: 'Quote Tweet', cost: 3, content: 'Great thread on...' },
    { time: '4:45 PM', action: 'Reply', cost: 2, content: 'Thanks for sharing...' },
    { time: '2:00 PM', action: 'Thread (5 tweets)', cost: 15, content: 'Why DeFi 2.0 will...' },
    { time: '10:30 AM', action: 'Main Post', cost: 5, content: 'Just shipped...' },
  ],
};

export default function ExposureBudgetPage() {
  const usagePercentage = (exposureData.daily.used / exposureData.daily.total) * 100;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getUsageBg = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Exposure Budget Tracker</h1>
        <p className="text-tertiary">
          Track and optimize your daily exposure allocation
        </p>
      </div>

      {/* Main Budget Display */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Daily Exposure Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className={cn('text-5xl font-bold', getUsageColor(usagePercentage))}>
                  {exposureData.daily.remaining}%
                </p>
                <p className="text-tertiary mt-1">remaining today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{exposureData.daily.used}%</p>
                <p className="text-tertiary">used</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-elevated rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r transition-all', getUsageBg(usagePercentage))}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-base rounded-lg">
                <FileText className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{exposureData.breakdown.mainPosts}%</p>
                <p className="text-xs text-tertiary">Main Posts</p>
              </div>
              <div className="text-center p-4 bg-base rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{exposureData.breakdown.replies}%</p>
                <p className="text-xs text-tertiary">Replies</p>
              </div>
              <div className="text-center p-4 bg-base rounded-lg">
                <Quote className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{exposureData.breakdown.quotes}%</p>
                <p className="text-xs text-tertiary">Quote Tweets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exposureData.recommendations.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg',
                  rec.type === 'warning' && 'bg-yellow-500/10 border border-yellow-500/20',
                  rec.type === 'tip' && 'bg-blue-500/10 border border-blue-500/20',
                  rec.type === 'insight' && 'bg-green-500/10 border border-green-500/20'
                )}
              >
                <div className="flex items-start gap-2">
                  {rec.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />}
                  {rec.type === 'tip' && <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />}
                  {rec.type === 'insight' && <TrendingUp className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />}
                  <p className="text-sm text-secondary">{rec.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Usage */}
        <Card className="bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Today's Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={exposureData.hourlyUsage}>
                  <defs>
                    <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="used"
                    stroke="#eab308"
                    fillOpacity={1}
                    fill="url(#usageGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="bg-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Weekly Usage Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureData.weeklyTrend}>
                  <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="used" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="bg-surface border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exposureData.activityLog.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-base rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-tertiary w-20">{activity.time}</span>
                  <Badge variant="outline">{activity.action}</Badge>
                  <span className="text-sm text-tertiary truncate max-w-md">
                    {activity.content}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">-{activity.cost}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}
