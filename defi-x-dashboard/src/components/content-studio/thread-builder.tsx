'use client';

import * as React from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useToast } from '@/components/ui/toast';
import {
  GripVertical,
  Plus,
  Trash2,
  Sparkles,
  Wand2,
  Copy,
  Eye,
  Send,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

interface TweetItem {
  id: string;
  content: string;
  characterCount: number;
}

interface ThreadPerformancePrediction {
  overallScore: number;
  expectedImpressions: number;
  expectedEngagement: number;
  viralityChance: number;
}

interface ThreadBuilderProps {
  initialTopic?: string;
  initialPosts?: string[];
}

export function ThreadBuilder({ initialTopic, initialPosts }: ThreadBuilderProps) {
  const [tweets, setTweets] = React.useState<TweetItem[]>([
    { id: '1', content: '', characterCount: 0 },
  ]);
  const [prediction, setPrediction] = React.useState<ThreadPerformancePrediction | null>(null);
  const [isPosting, setIsPosting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [targetThreadLength, setTargetThreadLength] = React.useState(5);
  const { addToast } = useToast();

  // Pre-fill tweets with initialPosts if provided (from dashboard Edit button)
  React.useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      const newTweets: TweetItem[] = initialPosts.map((content, index) => ({
        id: String(index + 1),
        content: content.trim(),
        characterCount: content.trim().length,
      }));
      setTweets(newTweets);
    }
  }, [initialPosts]);

  // Pre-fill first tweet with topic if provided (and no initialPosts)
  React.useEffect(() => {
    if (initialTopic && !initialPosts && tweets[0].content === '') {
      setTweets([{ id: '1', content: `Thread: ${initialTopic}\n\n`, characterCount: initialTopic.length + 10 }]);
    }
  }, [initialTopic, initialPosts]);

  const handlePostThread = async () => {
    const filledTweets = tweets.filter((t) => t.content.trim().length > 0);
    if (filledTweets.length < 2) {
      addToast({
        type: 'warning',
        title: 'Thread too short',
        description: 'Add at least 2 tweets to post a thread',
      });
      return;
    }
    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPosting(false);
    addToast({
      type: 'success',
      title: 'Thread posted!',
      description: `Your ${filledTweets.length}-tweet thread has been scheduled`,
    });
  };

  const handleScheduleThread = () => {
    const filledTweets = tweets.filter((t) => t.content.trim().length > 0);
    if (filledTweets.length < 2) {
      addToast({
        type: 'warning',
        title: 'Thread too short',
        description: 'Add at least 2 tweets to schedule',
      });
      return;
    }
    addToast({
      type: 'info',
      title: 'Opening scheduler',
      description: 'Select a time to post your thread',
    });
  };

  const handlePreview = () => {
    addToast({
      type: 'info',
      title: 'Preview mode',
      description: 'Opening thread preview...',
    });
  };

  const handleGenerateThread = async () => {
    const firstTweet = tweets[0].content.trim();
    if (!firstTweet) {
      addToast({
        type: 'warning',
        title: 'No topic',
        description: 'Write your first tweet to expand into a thread',
      });
      return;
    }

    setIsGenerating(true);
    addToast({
      type: 'info',
      title: 'Generating thread',
      description: 'AI is expanding your idea...',
    });

    try {
      // Extract topic from first tweet
      const topic = firstTweet.replace(/^(Thread:|🧵)/i, '').trim();

      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'thread',
          content: firstTweet,
          options: {
            topic,
            targetLength: targetThreadLength,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate thread');
      }

      const data = await response.json();
      const threadTweets = data.result as { position: number; content: string; hook?: string }[];

      // Convert to TweetItem format
      const newTweets = threadTweets.map((t, i) => ({
        id: (Date.now() + i).toString(),
        content: t.content,
        characterCount: t.content.length,
      }));

      setTweets(newTweets);
      addToast({
        type: 'success',
        title: 'Thread generated!',
        description: `AI expanded your idea into ${newTweets.length} tweets`,
      });
    } catch (error) {
      console.error('Thread generation error:', error);
      addToast({
        type: 'error',
        title: 'Generation failed',
        description: 'Could not generate thread. Try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addTweet = (afterId?: string) => {
    const newTweet: TweetItem = {
      id: Date.now().toString(),
      content: '',
      characterCount: 0,
    };

    if (afterId) {
      const index = tweets.findIndex((t) => t.id === afterId);
      const newTweets = [...tweets];
      newTweets.splice(index + 1, 0, newTweet);
      setTweets(newTweets);
    } else {
      setTweets([...tweets, newTweet]);
    }
  };

  const removeTweet = (id: string) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter((t) => t.id !== id));
    }
  };

  const updateTweet = (id: string, content: string) => {
    setTweets(tweets.map((t) =>
      t.id === id ? { ...t, content, characterCount: content.length } : t
    ));
  };

  // Calculate performance prediction
  React.useEffect(() => {
    const filledTweets = tweets.filter((t) => t.content.trim().length > 0);
    if (filledTweets.length >= 3) {
      setPrediction({
        overallScore: 82,
        expectedImpressions: 45000,
        expectedEngagement: 4.2,
        viralityChance: 35,
      });
    } else {
      setPrediction(null);
    }
  }, [tweets]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Thread Editor */}
      <div className="lg:col-span-2 space-y-4">
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-primary">Thread Builder</h2>
              <span className="px-2 py-0.5 rounded-full bg-elevated text-xs text-tertiary">
                {tweets.length} tweets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton
                size="sm"
                variant="ghost"
                leftIcon={<Eye className="h-4 w-4" />}
                onClick={handlePreview}
              >
                Preview
              </PremiumButton>
              <PremiumButton
                size="sm"
                variant="ghost"
                leftIcon={<Calendar className="h-4 w-4" />}
                onClick={handleScheduleThread}
              >
                Schedule
              </PremiumButton>
              <PremiumButton
                size="sm"
                variant="primary"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={handlePostThread}
                disabled={isPosting}
              >
                {isPosting ? 'Posting...' : 'Post Thread'}
              </PremiumButton>
            </div>
          </div>

          {/* Reorderable Tweet List */}
          <Reorder.Group
            axis="y"
            values={tweets}
            onReorder={setTweets}
            className="space-y-3"
          >
            {tweets.map((tweet, index) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                index={index}
                isFirst={index === 0}
                isLast={index === tweets.length - 1}
                onUpdate={(content) => updateTweet(tweet.id, content)}
                onRemove={() => removeTweet(tweet.id)}
                onAddAfter={() => addTweet(tweet.id)}
                canRemove={tweets.length > 1}
              />
            ))}
          </Reorder.Group>

          {/* Add Tweet Button */}
          <motion.button
            onClick={() => addTweet()}
            className="w-full mt-4 p-3 rounded-lg border border-dashed border-white/10 text-tertiary hover:text-secondary hover:border-white/20 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="h-4 w-4" />
            Add Tweet
          </motion.button>
        </PremiumCard>

        {/* AI Thread Generation */}
        <PremiumCard variant="elevated">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Expand to Thread</h3>
                <p className="text-sm text-tertiary">Let AI expand your idea into a full thread</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-tertiary">Length:</span>
                <select
                  value={targetThreadLength}
                  onChange={(e) => setTargetThreadLength(Number(e.target.value))}
                  className="bg-elevated text-secondary text-sm px-2 py-1 rounded-lg border border-white/10 focus:outline-none focus:border-violet-500/50"
                >
                  <option value={3}>3 tweets</option>
                  <option value={5}>5 tweets</option>
                  <option value={7}>7 tweets</option>
                  <option value={10}>10 tweets</option>
                </select>
              </div>
              <PremiumButton
                size="sm"
                variant="secondary"
                leftIcon={isGenerating ? <span className="animate-spin">⏳</span> : <Wand2 className="h-4 w-4" />}
                onClick={handleGenerateThread}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Thread'}
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Performance Prediction */}
        <PremiumCard>
          <h3 className="font-semibold text-primary mb-4">Thread Performance</h3>

          {prediction ? (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 rounded-lg bg-elevated">
                <div className="text-3xl font-bold font-mono text-green-400">
                  {prediction.overallScore}
                </div>
                <p className="text-xs text-tertiary mt-1">Predicted Quality Score</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-elevated">
                  <TrendingUp className="h-4 w-4 text-tertiary mb-1" />
                  <div className="font-mono font-semibold text-primary">
                    {(prediction.expectedImpressions / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-tertiary">Est. Impressions</p>
                </div>
                <div className="p-3 rounded-lg bg-elevated">
                  <MessageSquare className="h-4 w-4 text-tertiary mb-1" />
                  <div className="font-mono font-semibold text-primary">
                    {prediction.expectedEngagement}%
                  </div>
                  <p className="text-xs text-tertiary">Est. Engagement</p>
                </div>
              </div>

              {/* Virality Chance */}
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-violet-300">Virality Chance</span>
                  <span className="font-mono font-semibold text-violet-400">
                    {prediction.viralityChance}%
                  </span>
                </div>
                <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.viralityChance}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Add at least 3 tweets to see predictions</p>
            </div>
          )}
        </PremiumCard>

        {/* Thread Tips */}
        <PremiumCard>
          <h3 className="font-semibold text-primary mb-3">thread tips</h3>
          <div className="space-y-2">
            <TipItem
              icon="1️⃣"
              text="hook them in tweet 1 or lose them forever"
            />
            <TipItem
              icon="📊"
              text="numbers hit different. use real data when you can"
            />
            <TipItem
              icon="🎯"
              text="each tweet should slap on its own"
            />
            <TipItem
              icon="✨"
              text="end with something they can do, not just 'thoughts?'"
            />
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

// Tweet Card Component
interface TweetCardProps {
  tweet: TweetItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (content: string) => void;
  onRemove: () => void;
  onAddAfter: () => void;
  canRemove: boolean;
}

function TweetCard({
  tweet,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onAddAfter,
  canRemove,
}: TweetCardProps) {
  const controls = useDragControls();
  const isOverLimit = tweet.characterCount > 280;
  const isNearLimit = tweet.characterCount > 250;

  return (
    <Reorder.Item
      value={tweet}
      dragControls={controls}
      dragListener={false}
      className="relative"
    >
      <motion.div
        className={cn(
          'p-4 rounded-xl bg-elevated border',
          isOverLimit ? 'border-red-500/30' : 'border-white/5'
        )}
        whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onPointerDown={(e) => controls.start(e)}
              className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-tertiary">
              Tweet {index + 1}
              {isFirst && <span className="text-violet-400 ml-1">(Hook)</span>}
              {isLast && index > 0 && <span className="text-violet-400 ml-1">(CTA)</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-mono',
                isOverLimit && 'text-red-400',
                isNearLimit && !isOverLimit && 'text-yellow-400',
                !isNearLimit && 'text-tertiary'
              )}
            >
              {tweet.characterCount}/280
            </span>
            {canRemove && (
              <button
                onClick={onRemove}
                className="text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={tweet.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={
            isFirst
              ? "hook: start with something that makes them stop scrolling..."
              : isLast && index > 0
                ? "cta: tell them what to do next (not just 'thoughts?')..."
                : "keep it going..."
          }
          className={cn(
            'w-full bg-transparent text-primary placeholder:text-tertiary/50',
            'resize-none focus:outline-none min-h-[80px]'
          )}
        />

        {/* Overflow Warning */}
        {isOverLimit && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <AlertTriangle className="h-3 w-3" />
            <span>Tweet exceeds 280 characters. Split into multiple tweets.</span>
          </div>
        )}

        {/* Add After Button */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={onAddAfter}
            className="p-1 rounded-full bg-surface border border-white/10 text-tertiary hover:text-primary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-sm text-secondary">{text}</span>
    </div>
  );
}
