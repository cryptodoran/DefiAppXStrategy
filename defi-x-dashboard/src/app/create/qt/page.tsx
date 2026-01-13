'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Quote,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ThumbsUp,
  Zap,
  MessageCircle,
  Laugh,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

// US-010: Quote Tweet Optimizer

interface QTOption {
  id: string;
  type: 'agree' | 'hot_take' | 'add_context' | 'humor';
  content: string;
  predictedEngagement: number;
  reasoning: string;
}

interface OriginalTweet {
  author: string;
  authorName: string;
  content: string;
  likes: number;
  retweets: number;
  followers: number;
  isHighValue: boolean;
}

// Fetch QT angles from API
async function fetchQTAngles(tweetContent: string, authorHandle: string): Promise<{ tweet: OriginalTweet; options: QTOption[] }> {
  try {
    const response = await fetch('/api/content/qt-angles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweetContent, authorHandle }),
    });

    const data = await response.json();

    if (data.angles) {
      return {
        tweet: {
          author: `@${authorHandle}`,
          authorName: authorHandle,
          content: tweetContent,
          likes: 0,
          retweets: 0,
          followers: 0,
          isHighValue: true,
        },
        options: data.angles.map((angle: { type: string; content: string; reasoning: string; predictedEngagement: number }, i: number) => ({
          id: `qt-${Date.now()}-${i}`,
          type: angle.type as QTOption['type'],
          content: angle.content,
          predictedEngagement: angle.predictedEngagement || 75,
          reasoning: angle.reasoning,
        })),
      };
    }

    throw new Error('No angles returned');
  } catch (error) {
    console.error('QT angles error:', error);
    // Return placeholder if API fails
    return {
      tweet: {
        author: `@${authorHandle}`,
        authorName: authorHandle,
        content: tweetContent,
        likes: 0,
        retweets: 0,
        followers: 0,
        isHighValue: true,
      },
      options: [
        {
          id: 'fallback-1',
          type: 'agree',
          content: `Great point by ${authorHandle}. This aligns with what we're building at DeFi App.`,
          predictedEngagement: 70,
          reasoning: 'Agreement builds rapport with original author',
        },
        {
          id: 'fallback-2',
          type: 'add_context',
          content: `To add some context here...\n\n[Add your perspective on: ${tweetContent.slice(0, 50)}...]`,
          predictedEngagement: 65,
          reasoning: 'Adding context shows expertise',
        },
      ],
    };
  }
}

// Extract tweet info from URL (basic parsing)
function parseTweetUrl(url: string): { handle: string } | null {
  try {
    const match = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status/);
    if (match) return { handle: match[1] };
    return null;
  } catch {
    return null;
  }
}

function QTOptimizerContent() {
  const searchParams = useSearchParams();
  const [tweetUrl, setTweetUrl] = useState('');
  const [tweetContent, setTweetContent] = useState('');
  const [originalTweet, setOriginalTweet] = useState<OriginalTweet | null>(null);
  const [options, setOptions] = useState<QTOption[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<QTOption | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);

  // Read URL from search params and auto-analyze
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && !autoAnalyzed) {
      setTweetUrl(urlParam);
      setAutoAnalyzed(true);

      // Auto-fetch tweet data and generate QT angles
      (async () => {
        setIsAnalyzing(true);
        try {
          // First, try to fetch the actual tweet content from our API
          const parsed = parseTweetUrl(urlParam);
          const handle = parsed?.handle || 'unknown';

          // Try to get tweet from viral API
          const tweetIdMatch = urlParam.match(/status\/(\d+)/);
          const tweetId = tweetIdMatch?.[1];

          let content = '';
          let fetchedTweet: OriginalTweet | null = null;

          if (tweetId) {
            try {
              const viralResponse = await fetch(`/api/viral/tweets?tweetId=${tweetId}`);
              if (viralResponse.ok) {
                const viralData = await viralResponse.json();
                if (viralData.tweet) {
                  content = viralData.tweet.content;
                  fetchedTweet = {
                    author: `@${viralData.tweet.author.handle}`,
                    authorName: viralData.tweet.author.name,
                    content: viralData.tweet.content,
                    likes: viralData.tweet.metrics.likes,
                    retweets: viralData.tweet.metrics.retweets,
                    followers: viralData.tweet.author.followers,
                    isHighValue: viralData.tweet.author.followers > 10000,
                  };
                }
              }
            } catch (e) {
              console.log('Could not fetch tweet details:', e);
            }
          }

          if (fetchedTweet) {
            setOriginalTweet(fetchedTweet);
            setTweetContent(fetchedTweet.content);
          }

          // Generate QT angles
          const result = await fetchQTAngles(content || 'Analyzing tweet...', handle);
          if (!fetchedTweet) {
            setOriginalTweet(result.tweet);
          }
          setOptions(result.options);
        } catch (error) {
          console.error('Auto-analysis failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      })();
    }
  }, [searchParams, autoAnalyzed]);

  const handleAnalyze = async () => {
    if (!tweetUrl && !tweetContent) return;

    setIsAnalyzing(true);
    try {
      const parsed = parseTweetUrl(tweetUrl);
      const handle = parsed?.handle || 'unknown';
      const content = tweetContent || 'Paste the tweet content here for analysis';

      const result = await fetchQTAngles(content, handle);
      setOriginalTweet(result.tweet);
      setOptions(result.options);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: QTOption['type']) => {
    switch (type) {
      case 'agree':
        return <ThumbsUp className="h-4 w-4" />;
      case 'hot_take':
        return <Zap className="h-4 w-4" />;
      case 'add_context':
        return <MessageCircle className="h-4 w-4" />;
      case 'humor':
        return <Laugh className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: QTOption['type']) => {
    switch (type) {
      case 'agree':
        return 'bg-green-500/20 text-green-400';
      case 'hot_take':
        return 'bg-orange-500/20 text-orange-400';
      case 'add_context':
        return 'bg-blue-500/20 text-blue-400';
      case 'humor':
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quote Tweet Optimizer</h1>
        <p className="text-tertiary">
          Create optimal quote tweets to maximize your daily QT allocation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Tweet to Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tweet URL</Label>
                <Input
                  placeholder="https://twitter.com/user/status/..."
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  className="bg-base border-white/5"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600"
                onClick={handleAnalyze}
                disabled={!tweetUrl || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze & Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Original Tweet Preview */}
          {originalTweet && (
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-sm">Original Tweet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
                    <div>
                      <p className="font-medium text-white">{originalTweet.authorName}</p>
                      <p className="text-sm text-tertiary">{originalTweet.author}</p>
                    </div>
                    {originalTweet.isHighValue && (
                      <Badge className="ml-auto bg-yellow-500/20 text-yellow-400">
                        High Value
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-secondary">{originalTweet.content}</p>
                  <div className="flex items-center gap-4 text-xs text-tertiary">
                    <span>{formatNumber(originalTweet.likes)} likes</span>
                    <span>{formatNumber(originalTweet.retweets)} RTs</span>
                    <span>{formatNumber(originalTweet.followers)} followers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white">QT Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-tertiary">
              <p>• QTs get more reach than RTs</p>
              <p>• Add substantive commentary</p>
              <p>• Only 1 QT per day recommended</p>
              <p>• Quote high-value accounts for visibility</p>
            </CardContent>
          </Card>
        </div>

        {/* QT Options */}
        <div className="lg:col-span-2 space-y-4">
          {options.length === 0 && !isAnalyzing ? (
            <Card className="bg-surface border-white/5">
              <CardContent className="py-16 text-center">
                <Quote className="h-12 w-12 text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No tweet analyzed yet</h3>
                <p className="text-sm text-tertiary">
                  Enter a tweet URL to generate optimal QT options
                </p>
              </CardContent>
            </Card>
          ) : isAnalyzing ? (
            <Card className="bg-surface border-white/5">
              <CardContent className="py-16 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-blue-500 mx-auto" />
                <p className="mt-4 text-tertiary">Analyzing tweet and generating options...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Exposure Warning */}
              {originalTweet && !originalTweet.isHighValue && (
                <Card className="bg-yellow-500/10 border-yellow-500/20">
                  <CardContent className="py-3 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <p className="text-sm text-yellow-400">
                      This tweet has low reach. QTing may not be the best use of your daily exposure budget.
                    </p>
                  </CardContent>
                </Card>
              )}

              <h3 className="text-lg font-medium text-white">Generated QT Options</h3>

              {options.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    'bg-surface border-white/5 cursor-pointer transition-all',
                    selectedOption?.id === option.id && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => setSelectedOption(option)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('p-1.5 rounded', getTypeColor(option.type))}>
                          {getTypeIcon(option.type)}
                        </div>
                        <Badge className={getTypeColor(option.type)}>
                          {option.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            {option.predictedEngagement}
                          </p>
                          <p className="text-xs text-tertiary">predicted</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(option.content, option.id);
                          }}
                        >
                          {copiedId === option.id ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-secondary whitespace-pre-line mb-3">
                      {option.content}
                    </p>

                    <div className="pt-3 border-t border-white/5">
                      <p className="text-xs text-tertiary">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        {option.reasoning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}

export default function QTOptimizerPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
        </div>
      </AppLayout>
    }>
      <QTOptimizerContent />
    </Suspense>
  );
}
