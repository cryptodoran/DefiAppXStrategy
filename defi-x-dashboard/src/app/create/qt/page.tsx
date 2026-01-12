'use client';

import { useState } from 'react';
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

const mockOriginalTweet = {
  author: '@vikivinik',
  authorName: 'Vik Vink',
  content: 'The biggest mistake in DeFi is chasing yield instead of building utility. Protocols that focus on real use cases will outlast the yield farms.',
  likes: 12500,
  retweets: 3400,
  followers: 1200000,
  isHighValue: true,
};

const mockQTOptions: QTOption[] = [
  {
    id: '1',
    type: 'agree',
    content: '100% this.\n\nWe built Defi App with this exact philosophy. Sustainable utility > temporary APYs.\n\nThe protocols still standing after the bear market all have one thing in common: they solved real problems.',
    predictedEngagement: 85,
    reasoning: 'Agrees while adding brand perspective. High engagement from original tweet audience.',
  },
  {
    id: '2',
    type: 'hot_take',
    content: 'Counterpoint: the "yield vs utility" framing is a false dichotomy.\n\nThe best protocols do both - they create utility THROUGH well-designed incentive mechanisms.\n\nYield isn\'t the enemy. Unsustainable tokenomics are.',
    predictedEngagement: 92,
    reasoning: 'Contrarian take that adds nuance. Will spark debate and higher engagement.',
  },
  {
    id: '3',
    type: 'add_context',
    content: 'To add context:\n\n• DeFi protocols that focused on yield farming: 90% defunct\n• DeFi protocols that focused on utility: 65% still operating\n\nThe data speaks for itself. Build for users, not mercenary capital.',
    predictedEngagement: 78,
    reasoning: 'Adds data and specificity. Educational angle performs well.',
  },
  {
    id: '4',
    type: 'humor',
    content: 'DeFi devs watching their 10,000% APY pool go to zero:\n\n"But the utility was the friends we made along the way" 💀\n\n(jokes aside, this is exactly right)',
    predictedEngagement: 88,
    reasoning: 'Humor + agreement combo. High shareability factor.',
  },
];

export default function QTOptimizerPage() {
  const [tweetUrl, setTweetUrl] = useState('');
  const [originalTweet, setOriginalTweet] = useState<typeof mockOriginalTweet | null>(null);
  const [options, setOptions] = useState<QTOption[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<QTOption | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setOriginalTweet(mockOriginalTweet);
      setOptions(mockQTOptions);
      setIsAnalyzing(false);
    }, 2000);
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
