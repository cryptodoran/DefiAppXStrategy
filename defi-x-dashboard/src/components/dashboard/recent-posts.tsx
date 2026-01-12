'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Repeat2, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  content: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  publishedAt: Date;
  qualityScore: number;
  isViral?: boolean;
}

interface RecentPostsProps {
  posts: Post[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-surface border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-white/5 bg-base p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="line-clamp-2 text-sm text-secondary">
                  {post.content}
                </p>
                {post.isViral && (
                  <Badge className="shrink-0 bg-gradient-to-r from-orange-500 to-red-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Viral
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-tertiary">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatNumber(post.impressions)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {formatNumber(post.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {formatNumber(post.retweets)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {formatNumber(post.replies)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-medium', getQualityColor(post.qualityScore))}>
                    Quality: {post.qualityScore}
                  </span>
                  <span className="text-xs text-tertiary">
                    {formatDistanceToNow(post.publishedAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
