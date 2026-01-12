'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Quote,
  Bell,
  CheckCircle,
  Star,
  TrendingUp,
  Filter,
  Pause,
  Play,
} from 'lucide-react';

// US-002: Real-Time Engagement Feed

interface Engagement {
  id: string;
  type: 'like' | 'retweet' | 'reply' | 'quote';
  postContent: string;
  userHandle: string;
  userName: string;
  userFollowers: number;
  isVerified: boolean;
  timestamp: Date;
  isHighValue: boolean;
}

// Mock real-time engagements
const generateMockEngagement = (): Engagement => {
  const types: Engagement['type'][] = ['like', 'retweet', 'reply', 'quote'];
  const handles = ['@whale_alert', '@defi_chad', '@crypto_trader', '@eth_maxi', '@sol_degen', '@btc_bull'];
  const names = ['Whale Alert', 'DeFi Chad', 'Crypto Trader', 'ETH Maximalist', 'SOL Degen', 'BTC Bull'];
  const posts = [
    'DeFi isn\'t dead. It\'s evolving...',
    'Just shipped a massive update...',
    'Hot take: 90% of protocols will fail...',
    'The DeFi summer 2.0 narrative is real...',
  ];
  const followers = [1200000, 450000, 89000, 234000, 12000, 567000];

  const idx = Math.floor(Math.random() * handles.length);
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    id: `eng-${Date.now()}-${Math.random()}`,
    type,
    postContent: posts[Math.floor(Math.random() * posts.length)],
    userHandle: handles[idx],
    userName: names[idx],
    userFollowers: followers[idx],
    isVerified: Math.random() > 0.5,
    timestamp: new Date(),
    isHighValue: followers[idx] > 100000,
  };
};

const initialEngagements: Engagement[] = Array.from({ length: 20 }, generateMockEngagement);

export default function RealTimeEngagementPage() {
  const [engagements, setEngagements] = useState<Engagement[]>(initialEngagements);
  const [filter, setFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [viralAlert, setViralAlert] = useState<string | null>(null);

  // Simulate real-time engagements
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newEngagement = generateMockEngagement();
      setEngagements((prev) => [newEngagement, ...prev].slice(0, 100));

      // Check for viral threshold
      if (newEngagement.isHighValue && newEngagement.type === 'retweet') {
        setViralAlert(`${newEngagement.userName} just retweeted! Potential viral moment.`);
        setTimeout(() => setViralAlert(null), 5000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getEngagementIcon = (type: Engagement['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'retweet':
        return <Repeat2 className="h-4 w-4 text-green-400" />;
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
      case 'quote':
        return <Quote className="h-4 w-4 text-purple-400" />;
    }
  };

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredEngagements = filter === 'all'
    ? engagements
    : filter === 'high_value'
    ? engagements.filter((e) => e.isHighValue)
    : engagements.filter((e) => e.type === filter);

  const stats = {
    total: engagements.length,
    likes: engagements.filter((e) => e.type === 'like').length,
    retweets: engagements.filter((e) => e.type === 'retweet').length,
    replies: engagements.filter((e) => e.type === 'reply').length,
    quotes: engagements.filter((e) => e.type === 'quote').length,
    highValue: engagements.filter((e) => e.isHighValue).length,
  };

  return (
    <div className="space-y-6">
      {/* Viral Alert */}
      {viralAlert && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-white font-medium">{viralAlert}</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Real-Time Engagement Feed</h1>
          <p className="text-zinc-400">Live engagement stream as it happens</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engagements</SelectItem>
              <SelectItem value="high_value">High Value Only</SelectItem>
              <SelectItem value="like">Likes</SelectItem>
              <SelectItem value="retweet">Retweets</SelectItem>
              <SelectItem value="reply">Replies</SelectItem>
              <SelectItem value="quote">Quotes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-zinc-500">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.likes}</p>
            <p className="text-xs text-zinc-500">Likes</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.retweets}</p>
            <p className="text-xs text-zinc-500">Retweets</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.replies}</p>
            <p className="text-xs text-zinc-500">Replies</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.quotes}</p>
            <p className="text-xs text-zinc-500">Quotes</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.highValue}</p>
            <p className="text-xs text-zinc-500">High Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Feed
            {!isPaused && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredEngagements.map((engagement) => (
              <div
                key={engagement.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-all',
                  engagement.isHighValue
                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                    : 'bg-zinc-950'
                )}
              >
                {/* Engagement Type Icon */}
                <div className="shrink-0">{getEngagementIcon(engagement.type)}</div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{engagement.userName}</span>
                    {engagement.isVerified && (
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                    )}
                    {engagement.isHighValue && (
                      <Star className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-zinc-500 text-sm">{engagement.userHandle}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatFollowers(engagement.userFollowers)} followers
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 truncate mt-1">
                    {engagement.type === 'like' && 'liked'}
                    {engagement.type === 'retweet' && 'retweeted'}
                    {engagement.type === 'reply' && 'replied to'}
                    {engagement.type === 'quote' && 'quoted'}: "{engagement.postContent}"
                  </p>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-zinc-500 shrink-0">
                  {engagement.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
