'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FileText,
  MessageSquare,
  Flame,
  Star,
  AlertTriangle,
} from 'lucide-react';

// US-013: Content Calendar Manager

interface ScheduledPost {
  id: string;
  content: string;
  type: 'single' | 'thread' | 'qt' | 'article';
  scheduledTime: Date;
  status: 'scheduled' | 'draft' | 'published';
  qualityScore: number;
  isOptimalTime: boolean;
}

const generateMockPosts = (): ScheduledPost[] => {
  const posts: ScheduledPost[] = [];
  const types: ScheduledPost['type'][] = ['single', 'thread', 'qt', 'article'];
  const contents = [
    'DeFi isn\'t dead thread coming...',
    'Hot take on the latest SEC news',
    'Product update announcement',
    'Educational thread on L2s',
    'Quote tweet on market analysis',
    'Weekly DeFi roundup',
  ];

  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 14) - 3);
    date.setHours(Math.floor(Math.random() * 12) + 8);

    posts.push({
      id: `post-${i}`,
      content: contents[Math.floor(Math.random() * contents.length)],
      type: types[Math.floor(Math.random() * types.length)],
      scheduledTime: date,
      status: date < new Date() ? 'published' : 'scheduled',
      qualityScore: Math.floor(Math.random() * 30) + 70,
      isOptimalTime: Math.random() > 0.3,
    });
  }

  return posts;
};

const mockPosts = generateMockPosts();

const optimalTimeSlots = [
  { time: '10:00 AM', score: 85 },
  { time: '2:00 PM', score: 92 },
  { time: '6:00 PM', score: 78 },
  { time: '9:00 PM', score: 71 },
];

export default function ContentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('week');

  const getTypeIcon = (type: ScheduledPost['type']) => {
    switch (type) {
      case 'single':
        return <FileText className="h-3 w-3" />;
      case 'thread':
        return <MessageSquare className="h-3 w-3" />;
      case 'qt':
        return <Flame className="h-3 w-3" />;
      case 'article':
        return <Star className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: ScheduledPost['type']) => {
    switch (type) {
      case 'single':
        return 'bg-blue-500';
      case 'thread':
        return 'bg-purple-500';
      case 'qt':
        return 'bg-orange-500';
      case 'article':
        return 'bg-green-500';
    }
  };

  // Get week dates
  const getWeekDates = () => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getPostsForDate = (date: Date) => {
    return mockPosts.filter(
      (post) =>
        post.scheduledTime.toDateString() === date.toDateString()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const contentTypeDistribution = {
    single: mockPosts.filter((p) => p.type === 'single').length,
    thread: mockPosts.filter((p) => p.type === 'thread').length,
    qt: mockPosts.filter((p) => p.type === 'qt').length,
    article: mockPosts.filter((p) => p.type === 'article').length,
  };

  const conflictPosts = mockPosts.filter((post, index) => {
    return mockPosts.some(
      (other, otherIndex) =>
        index !== otherIndex &&
        Math.abs(post.scheduledTime.getTime() - other.scheduledTime.getTime()) < 2 * 60 * 60 * 1000 &&
        post.scheduledTime.toDateString() === other.scheduledTime.toDateString()
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-zinc-400">Plan and schedule your content strategy</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Post
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">Scheduled</p>
            <p className="text-2xl font-bold text-white">
              {mockPosts.filter((p) => p.status === 'scheduled').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">This Week</p>
            <p className="text-2xl font-bold text-blue-400">
              {mockPosts.filter((p) => {
                const start = weekDates[0];
                const end = weekDates[6];
                return p.scheduledTime >= start && p.scheduledTime <= end;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">Optimal Times</p>
            <p className="text-2xl font-bold text-green-400">
              {mockPosts.filter((p) => p.isOptimalTime).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">Avg Quality</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(mockPosts.reduce((acc, p) => acc + p.qualityScore, 0) / mockPosts.length)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm text-zinc-400">Conflicts</p>
            <p className={cn('text-2xl font-bold', conflictPosts.length > 0 ? 'text-red-400' : 'text-green-400')}>
              {conflictPosts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week View */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-zinc-500 py-2">
                    {day}
                  </div>
                ))}

                {/* Day Cells */}
                {weekDates.map((date) => {
                  const posts = getPostsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'min-h-[150px] p-2 rounded-lg border',
                        isToday
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-zinc-950 border-zinc-800'
                      )}
                    >
                      <div className={cn(
                        'text-sm font-medium mb-2',
                        isToday ? 'text-blue-400' : 'text-zinc-400'
                      )}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {posts.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            className={cn(
                              'p-1.5 rounded text-xs flex items-center gap-1.5',
                              getTypeColor(post.type),
                              'bg-opacity-20'
                            )}
                          >
                            {getTypeIcon(post.type)}
                            <span className="truncate text-white">
                              {post.scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                        {posts.length > 3 && (
                          <div className="text-xs text-zinc-500 pl-1">
                            +{posts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Distribution */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white">Content Mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-zinc-400">Single Posts</span>
                </div>
                <span className="text-sm font-medium text-white">{contentTypeDistribution.single}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-zinc-400">Threads</span>
                </div>
                <span className="text-sm font-medium text-white">{contentTypeDistribution.thread}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-zinc-400">Quote Tweets</span>
                </div>
                <span className="text-sm font-medium text-white">{contentTypeDistribution.qt}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-zinc-400">Articles</span>
                </div>
                <span className="text-sm font-medium text-white">{contentTypeDistribution.article}</span>
              </div>
            </CardContent>
          </Card>

          {/* Optimal Times */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Optimal Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimalTimeSlots.map((slot) => (
                <div key={slot.time} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{slot.time}</span>
                  <Badge className={cn(
                    slot.score >= 90 ? 'bg-green-500/20 text-green-400' :
                    slot.score >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  )}>
                    {slot.score}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conflicts */}
          {conflictPosts.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Scheduling Conflicts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">
                  {conflictPosts.length} posts are scheduled too close together.
                  Consider spacing them out for better reach.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
