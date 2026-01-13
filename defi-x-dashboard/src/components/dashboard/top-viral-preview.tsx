'use client';

import * as React from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/lib/utils/time';
import {
  Flame,
  Heart,
  MessageCircle,
  Repeat2,
  ExternalLink,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface ViralTweet {
  id: string;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  tweetUrl: string;
  postedAt: string;
}

export function TopViralPreview() {
  const [tweet, setTweet] = React.useState<ViralTweet | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTopViral() {
      try {
        setError(null);
        const response = await fetch('/api/viral/tweets?timeframe=6h&limit=1');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data.tweets && data.tweets.length > 0) {
          setTweet(data.tweets[0]);
        }
      } catch (e) {
        console.error('Error fetching top viral:', e);
        setError('Unable to load');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopViral();
    const interval = setInterval(fetchTopViral, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (error) {
    return (
      <PremiumCard className="p-4">
        <div className="flex items-center gap-2 text-tertiary">
          <Flame className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-primary">Top Viral Right Now</span>
        </div>
        <Link href="/viral">
          <PremiumButton size="sm" variant="ghost" rightIcon={<ArrowRight className="h-3 w-3" />}>
            View All
          </PremiumButton>
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-elevated" />
            <div className="h-4 w-24 bg-elevated rounded" />
          </div>
          <div className="h-4 bg-elevated rounded w-full mb-2" />
          <div className="h-4 bg-elevated rounded w-3/4" />
        </div>
      ) : tweet ? (
        <div>
          {/* Author */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={tweet.author.avatar}
              alt={tweet.author.name}
              className="h-8 w-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tweet.author.name)}&background=random`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-primary truncate">
                  {tweet.author.name}
                </span>
                {tweet.author.verified && (
                  <svg className="h-4 w-4 text-blue-400" viewBox="0 0 22 22" fill="currentColor">
                    <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-tertiary">@{tweet.author.handle}</span>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-secondary mb-3 line-clamp-3">
            {tweet.content}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-4 text-xs text-tertiary mb-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-400" />
              {formatNumber(tweet.metrics.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3 w-3 text-green-400" />
              {formatNumber(tweet.metrics.retweets)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 text-blue-400" />
              {formatNumber(tweet.metrics.replies)}
            </span>
            <span className="ml-auto">{getRelativeTime(new Date(tweet.postedAt))}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={tweet.tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <PremiumButton size="sm" variant="secondary" className="w-full" rightIcon={<ExternalLink className="h-3 w-3" />}>
                View on X
              </PremiumButton>
            </a>
            <Link href={`/create?tab=qt&url=${encodeURIComponent(tweet.tweetUrl)}`}>
              <PremiumButton size="sm" variant="primary">
                Quote Tweet
              </PremiumButton>
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-tertiary">No viral tweets found</p>
      )}
    </PremiumCard>
  );
}
