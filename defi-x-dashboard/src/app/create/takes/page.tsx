'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Flame,
  Zap,
  Target,
  MessageSquare,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

// US-027: Opinionated Take Generator

interface GeneratedTake {
  id: string;
  content: string;
  spiceLevel: number;
  stance: 'bullish' | 'bearish' | 'contrarian' | 'neutral';
  riskLevel: 'safe' | 'moderate' | 'spicy' | 'nuclear';
  engagementPotential: number;
  controversyScore: number;
}

const topicSuggestions = [
  'ETH vs SOL',
  'L2 dominance',
  'Airdrop farming',
  'VC tokens',
  'DeFi yields',
  'CEX vs DEX',
  'NFT utility',
  'Memecoins',
  'Regulation',
  'Bitcoin dominance',
];

const generatedTakes: GeneratedTake[] = [
  {
    id: '1',
    content: 'The biggest alpha in crypto right now isn\'t a token - it\'s building a product that people actually want to use. Every successful protocol started by solving a real problem, not by launching a governance token.',
    spiceLevel: 4,
    stance: 'contrarian',
    riskLevel: 'moderate',
    engagementPotential: 78,
    controversyScore: 35,
  },
  {
    id: '2',
    content: 'Hot take: 90% of "DeFi protocols" are just yield farming schemes with extra steps. The 10% building real infrastructure will be worth more than the other 90% combined.',
    spiceLevel: 7,
    stance: 'bearish',
    riskLevel: 'spicy',
    engagementPotential: 89,
    controversyScore: 65,
  },
  {
    id: '3',
    content: 'Unpopular opinion: ETH L2s are the most undervalued play in crypto right now. While everyone\'s chasing alt L1s, the L2 ecosystem is quietly building the future of scalable finance.',
    spiceLevel: 5,
    stance: 'bullish',
    riskLevel: 'moderate',
    engagementPotential: 72,
    controversyScore: 40,
  },
  {
    id: '4',
    content: 'The next billion-dollar protocol won\'t come from crypto-native founders. It\'ll come from someone who\'s never posted "gm" but understands real user problems.',
    spiceLevel: 8,
    stance: 'contrarian',
    riskLevel: 'spicy',
    engagementPotential: 85,
    controversyScore: 72,
  },
];

const riskConfig = {
  safe: { color: 'bg-green-500/20 text-green-400', description: 'Widely agreeable, low controversy' },
  moderate: { color: 'bg-yellow-500/20 text-yellow-400', description: 'Some may disagree, sparks discussion' },
  spicy: { color: 'bg-orange-500/20 text-orange-400', description: 'Controversial, high engagement potential' },
  nuclear: { color: 'bg-red-500/20 text-red-400', description: 'Maximum controversy, proceed with caution' },
};

const stanceConfig = {
  bullish: { color: 'bg-green-500/20 text-green-400' },
  bearish: { color: 'bg-red-500/20 text-red-400' },
  contrarian: { color: 'bg-purple-500/20 text-purple-400' },
  neutral: { color: 'bg-white/5 text-tertiary' },
};

export default function TakeGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [spiceLevel, setSpiceLevel] = useState([5]);
  const [stance, setStance] = useState('contrarian');
  const [takes, setTakes] = useState(generatedTakes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({});
  const { addToast } = useToast();
  const router = useRouter();

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast({
        type: 'success',
        title: 'Takes generated',
        description: `Generated ${takes.length} takes for "${topic}"`,
      });
    }, 1500);
  };

  const handleThumbsUp = (takeId: string) => {
    setFeedback(prev => ({ ...prev, [takeId]: prev[takeId] === 'up' ? null : 'up' }));
    addToast({
      type: 'success',
      title: 'Feedback recorded',
      description: 'This take has been marked as good',
    });
  };

  const handleThumbsDown = (takeId: string) => {
    setFeedback(prev => ({ ...prev, [takeId]: prev[takeId] === 'down' ? null : 'down' }));
    addToast({
      type: 'info',
      title: 'Feedback recorded',
      description: 'This take has been marked for improvement',
    });
  };

  const handleRefreshTake = (takeId: string) => {
    addToast({
      type: 'info',
      title: 'Regenerating take',
      description: 'Generating a new variation...',
    });
    // In a real app, this would call the AI to regenerate just this take
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    addToast({
      type: 'success',
      title: 'Copied to clipboard',
      description: 'Take copied and ready to paste',
    });
  };

  const handlePolishAndPost = (content: string) => {
    router.push(`/create?topic=${encodeURIComponent(content)}`);
  };

  const getSpiceEmoji = (level: number) => {
    if (level <= 2) return '🌶️';
    if (level <= 4) return '🌶️🌶️';
    if (level <= 6) return '🌶️🌶️🌶️';
    if (level <= 8) return '🔥';
    return '☢️';
  };

  const getSpiceLabel = (level: number) => {
    if (level <= 2) return 'Mild';
    if (level <= 4) return 'Medium';
    if (level <= 6) return 'Hot';
    if (level <= 8) return 'Very Hot';
    return 'Nuclear';
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Opinionated Take Generator</h1>
        <p className="text-tertiary">
          Generate spicy, engagement-driving takes that spark conversation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator Controls */}
        <div className="space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Take Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm text-tertiary">Topic</label>
                <Input
                  placeholder="Enter a topic or trend..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-base border-white/5"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {topicSuggestions.slice(0, 5).map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setTopic(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-tertiary">Spice Level</label>
                  <span className="text-sm">
                    {getSpiceEmoji(spiceLevel[0])} {getSpiceLabel(spiceLevel[0])}
                  </span>
                </div>
                <Slider
                  value={spiceLevel}
                  onValueChange={setSpiceLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-tertiary">
                  <span>Safe</span>
                  <span>Nuclear</span>
                </div>
              </div>

              {/* Stance */}
              <div className="space-y-2">
                <label className="text-sm text-tertiary">Stance</label>
                <Select value={stance} onValueChange={setStance}>
                  <SelectTrigger className="bg-base border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullish">Bullish</SelectItem>
                    <SelectItem value="bearish">Bearish</SelectItem>
                    <SelectItem value="contrarian">Contrarian</SelectItem>
                    <SelectItem value="neutral">Neutral Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Flame className="mr-2 h-4 w-4" />
                    Generate Takes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-400 font-medium">Spice Responsibly</p>
                  <p className="text-xs text-tertiary mt-1">
                    Higher spice levels may drive engagement but also controversy.
                    Review all takes before posting to ensure they align with brand voice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Level Guide */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white">Risk Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(riskConfig).map(([key, config]) => (
                <div key={key} className="flex items-start gap-2">
                  <Badge className={config.color}>{key}</Badge>
                  <p className="text-xs text-tertiary">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Generated Takes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Generated Takes</h2>
          {takes.map((take) => (
            <Card key={take.id} className="bg-surface border-white/5">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={stanceConfig[take.stance].color}>{take.stance}</Badge>
                    <Badge className={riskConfig[take.riskLevel].color}>{take.riskLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getSpiceEmoji(take.spiceLevel)}</span>
                    <span className="text-xs text-tertiary">{take.spiceLevel}/10</span>
                  </div>
                </div>

                <div className="p-4 bg-base rounded-lg mb-4">
                  <p className="text-primary">{take.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-base rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-tertiary">Engagement Potential</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${take.engagementPotential}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white">{take.engagementPotential}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-base rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-xs text-tertiary">Controversy Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            take.controversyScore > 70
                              ? 'bg-red-500'
                              : take.controversyScore > 40
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          )}
                          style={{ width: `${take.controversyScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white">{take.controversyScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleThumbsUp(take.id)}
                      className={cn(feedback[take.id] === 'up' && 'bg-green-500/20 text-green-400')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleThumbsDown(take.id)}
                      className={cn(feedback[take.id] === 'down' && 'bg-red-500/20 text-red-400')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshTake(take.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(take.content)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-violet-500 to-indigo-600"
                      onClick={() => handlePolishAndPost(take.content)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Polish & Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
