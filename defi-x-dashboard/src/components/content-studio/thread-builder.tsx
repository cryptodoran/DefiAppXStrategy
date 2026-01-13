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
  Flame,
  Scissors,
  ArrowUp,
  Loader2,
  RefreshCw,
  Target,
  Image,
  X,
  Download,
  Twitter,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { VoiceMatchIndicator } from '@/components/ui/voice-match-indicator';

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

interface TweetAnalysis {
  overallScore: number;
  voiceAlignment: number;
  hookStrength: number;
  improvements: string[];
  _contentHash?: string; // For tracking if content changed
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
  const [selectedTweetId, setSelectedTweetId] = React.useState<string | null>('1');
  const [tweetAnalysis, setTweetAnalysis] = React.useState<Record<string, TweetAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [enhancingAction, setEnhancingAction] = React.useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imageForTweet, setImageForTweet] = React.useState<string | null>(null);
  const { addToast } = useToast();

  // Open first tweet on Twitter (threads can only be started via intent)
  const openOnTwitter = () => {
    const firstTweet = tweets[0]?.content.trim();
    if (!firstTweet) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write your first tweet to open on X',
      });
      return;
    }

    const text = encodeURIComponent(firstTweet);
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterIntentUrl, '_blank', 'width=600,height=400');

    if (tweets.length > 1) {
      addToast({
        type: 'info',
        title: 'Thread tip',
        description: 'After posting the first tweet, reply to it with the rest of your thread',
      });
    }
  };

  // Generate image for a specific tweet
  const generateImage = async (tweetContent: string, tweetId?: string) => {
    if (!tweetContent.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Select a tweet with content first',
      });
      return;
    }

    setIsGeneratingImage(true);
    setImageForTweet(tweetId || null);
    try {
      const response = await fetch('/api/media/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: tweetContent,
          style: 'dark',
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design');
      }

      const data = await response.json();
      const imageUrl = await renderHtmlToImage(data.html);
      setGeneratedImage(imageUrl);
      setShowImageModal(true);

      addToast({
        type: 'success',
        title: 'Image generated!',
        description: 'Your image is ready to download',
      });
    } catch (error) {
      console.error('Image generation error:', error);
      addToast({
        type: 'error',
        title: 'Generation failed',
        description: 'Could not generate image',
      });
    } finally {
      setIsGeneratingImage(false);
      setImageForTweet(null);
    }
  };

  // Render HTML to image
  const renderHtmlToImage = async (html: string): Promise<string> => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '1024px';
    container.style.height = '1024px';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#000';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const styles = doc.querySelectorAll('style');
    styles.forEach(style => {
      const newStyle = document.createElement('style');
      newStyle.textContent = style.textContent;
      container.appendChild(newStyle);
    });

    const bodyContent = doc.body.innerHTML;
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = bodyContent;
    container.appendChild(contentDiv);

    document.body.appendChild(container);

    try {
      const designElement = container.querySelector('.container') ||
                           container.querySelector('div[style*="width"]') ||
                           contentDiv.firstElementChild ||
                           contentDiv;

      if (!designElement) {
        throw new Error('No design element found');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(designElement as HTMLElement, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#000',
        cacheBust: true,
      });

      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'thread-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-fill first tweet only with initialPosts if provided (from dashboard Edit button)
  // User will use "Generate Thread" to expand into full thread
  React.useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      const firstPost = initialPosts[0].trim();
      setTweets([{
        id: '1',
        content: firstPost,
        characterCount: firstPost.length,
      }]);
      setSelectedTweetId('1');

      // Suggest using generate thread if there were multiple posts
      if (initialPosts.length > 1) {
        addToast({
          type: 'info',
          title: 'First post loaded',
          description: 'Use "Generate Thread" to expand into a full thread',
        });
      }
    }
  }, [initialPosts, addToast]);

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

  // Track which tweet is being enhanced
  const [enhancingTweetId, setEnhancingTweetId] = React.useState<string | null>(null);

  // AI Assist for individual tweets - can now work on any tweet
  const handleAiAssist = async (action: 'spicier' | 'context' | 'shorten' | 'hook' | 'cta', tweetId?: string) => {
    const targetId = tweetId || selectedTweetId;
    if (!targetId) {
      addToast({
        type: 'warning',
        title: 'No tweet selected',
        description: 'Click on a tweet to select it first',
      });
      return;
    }

    const targetTweet = tweets.find(t => t.id === targetId);
    if (!targetTweet || !targetTweet.content.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write something first for AI to enhance',
      });
      return;
    }

    setIsEnhancing(true);
    setEnhancingAction(action);
    setEnhancingTweetId(targetId);

    try {
      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: targetTweet.content }),
      });

      const data = await response.json();

      if (data.error && !data._demo) {
        throw new Error(data.error);
      }

      const result = data.result;
      updateTweet(targetId, result.enhanced);

      addToast({
        type: 'success',
        title: 'Tweet enhanced!',
        description: result.changes[0] || 'Applied AI enhancement',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Enhancement failed',
        description: String(error),
      });
    } finally {
      setIsEnhancing(false);
      setEnhancingAction(null);
      setEnhancingTweetId(null);
    }
  };

  // Track which tweets are being analyzed
  const [analyzingTweetIds, setAnalyzingTweetIds] = React.useState<Set<string>>(new Set());

  // Analyze ALL tweets for voice match (debounced per-tweet)
  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    tweets.forEach((tweet, index) => {
      // Skip if already analyzed with same content, or content too short
      const existingAnalysis = tweetAnalysis[tweet.id];
      if (tweet.content.length < 20) return;

      // Only re-analyze if content changed significantly
      const contentHash = tweet.content.slice(0, 50);
      const cachedHash = existingAnalysis?._contentHash;
      if (cachedHash === contentHash) return;

      const timer = setTimeout(async () => {
        setAnalyzingTweetIds(prev => new Set(prev).add(tweet.id));
        try {
          const response = await fetch('/api/content/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'analyze', content: tweet.content }),
          });

          const data = await response.json();
          if (data.result) {
            setTweetAnalysis(prev => ({
              ...prev,
              [tweet.id]: {
                overallScore: data.result.overallScore,
                voiceAlignment: data.result.voiceAlignment,
                hookStrength: data.result.hookStrength,
                improvements: data.result.improvements || [],
                _contentHash: contentHash,
              },
            }));
          }
        } catch {
          // Silent fail for analysis
        } finally {
          setAnalyzingTweetIds(prev => {
            const next = new Set(prev);
            next.delete(tweet.id);
            return next;
          });
        }
      }, 1000 + index * 500); // Stagger requests to avoid overwhelming API

      timers.push(timer);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [tweets]);

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
                leftIcon={<Twitter className="h-4 w-4" />}
                onClick={openOnTwitter}
                disabled={!tweets[0]?.content.trim()}
              >
                Open on X
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
                isSelected={selectedTweetId === tweet.id}
                analysis={tweetAnalysis[tweet.id]}
                isAnalyzing={analyzingTweetIds.has(tweet.id)}
                onSelect={() => setSelectedTweetId(tweet.id)}
                onUpdate={(content) => updateTweet(tweet.id, content)}
                onRemove={() => removeTweet(tweet.id)}
                onAddAfter={() => addTweet(tweet.id)}
                onAiAssist={(action) => handleAiAssist(action, tweet.id)}
                onGenerateImage={() => generateImage(tweet.content, tweet.id)}
                canRemove={tweets.length > 1}
                isEnhancing={isEnhancing && enhancingTweetId === tweet.id}
                enhancingAction={enhancingTweetId === tweet.id ? enhancingAction : null}
                isGeneratingImage={isGeneratingImage && imageForTweet === tweet.id}
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

        {/* AI Assist - for selected tweet */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary">AI Assist</h3>
            {selectedTweetId && (
              <span className="text-xs text-tertiary">
                Tweet {tweets.findIndex(t => t.id === selectedTweetId) + 1}
              </span>
            )}
          </div>

          {/* Voice Match Indicator */}
          {selectedTweetId && tweetAnalysis[selectedTweetId] && (
            <VoiceMatchIndicator
              score={tweetAnalysis[selectedTweetId].voiceAlignment}
              isLoading={isAnalyzing}
              showSuggestions={false}
              className="mb-3"
            />
          )}

          {/* AI Assist Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAiAssist('spicier')}
              disabled={isEnhancing || !selectedTweetId}
              className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing && enhancingAction === 'spicier' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              Make Spicier
            </button>
            <button
              onClick={() => handleAiAssist('context')}
              disabled={isEnhancing || !selectedTweetId}
              className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing && enhancingAction === 'context' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              Add Context
            </button>
            <button
              onClick={() => handleAiAssist('shorten')}
              disabled={isEnhancing || !selectedTweetId}
              className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing && enhancingAction === 'shorten' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scissors className="h-4 w-4" />
              )}
              Shorten
            </button>
            <button
              onClick={() => handleAiAssist('hook')}
              disabled={isEnhancing || !selectedTweetId}
              className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnhancing && enhancingAction === 'hook' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Better Hook
            </button>
          </div>

          {/* Improvements suggestions */}
          {selectedTweetId && tweetAnalysis[selectedTweetId]?.improvements?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-tertiary mb-2">Suggestions:</p>
              <ul className="text-xs text-secondary space-y-1">
                {tweetAnalysis[selectedTweetId].improvements.slice(0, 2).map((imp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-violet-400">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!selectedTweetId && (
            <p className="text-xs text-tertiary text-center py-4">
              Select a tweet to use AI assist
            </p>
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

      {/* Image Modal - CSS transitions to prevent flickering */}
      {showImageModal && generatedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-surface rounded-xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-square bg-black">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="sync"
              />
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <PremiumButton
                  size="sm"
                  variant="primary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={downloadImage}
                  className="flex-1"
                >
                  Download
                </PremiumButton>
                <PremiumButton
                  size="sm"
                  variant="secondary"
                  leftIcon={<Twitter className="h-4 w-4" />}
                  onClick={() => {
                    setShowImageModal(false);
                    openOnTwitter();
                  }}
                >
                  Post on X
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tweet Card Component with per-post voice scoring
interface TweetCardProps {
  tweet: TweetItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  analysis?: TweetAnalysis;
  isAnalyzing?: boolean;
  onSelect: () => void;
  onUpdate: (content: string) => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onAiAssist: (action: 'spicier' | 'context' | 'shorten' | 'hook' | 'cta') => void;
  onGenerateImage: () => void;
  canRemove: boolean;
  isEnhancing?: boolean;
  enhancingAction?: string | null;
  isGeneratingImage?: boolean;
}

function TweetCard({
  tweet,
  index,
  isFirst,
  isLast,
  isSelected,
  analysis,
  isAnalyzing,
  onSelect,
  onUpdate,
  onRemove,
  onAddAfter,
  onAiAssist,
  onGenerateImage,
  canRemove,
  isEnhancing,
  enhancingAction,
  isGeneratingImage,
}: TweetCardProps) {
  const controls = useDragControls();
  const isOverLimit = tweet.characterCount > 280;
  const isNearLimit = tweet.characterCount > 250;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/10';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <Reorder.Item
      value={tweet}
      dragControls={controls}
      dragListener={false}
      className="relative"
    >
      <motion.div
        onClick={onSelect}
        className={cn(
          'p-4 rounded-xl bg-elevated border cursor-pointer transition-colors',
          isOverLimit ? 'border-red-500/30' : isSelected ? 'border-violet-500/50 ring-1 ring-violet-500/20' : 'border-white/5'
        )}
        whileHover={{ borderColor: isSelected ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)' }}
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
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
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

        {/* Per-post Voice Score & AI Assist - shown when tweet has content */}
        {tweet.content.length >= 15 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              {/* Voice Score Badge */}
              <div className="flex items-center gap-2">
                {isAnalyzing ? (
                  <div className="flex items-center gap-1 text-xs text-tertiary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : analysis ? (
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-mono font-medium', getScoreColor(analysis.voiceAlignment))}>
                      {analysis.voiceAlignment}% voice
                    </span>
                    {analysis.hookStrength && isFirst && (
                      <span className={cn('px-2 py-0.5 rounded text-xs font-mono', getScoreColor(analysis.hookStrength))}>
                        {analysis.hookStrength}% hook
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-tertiary">Click to analyze</span>
                )}
              </div>

              {/* Inline AI Assist Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onAiAssist('spicier'); }}
                  disabled={isEnhancing}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                  title="Make Spicier"
                >
                  {isEnhancing && enhancingAction === 'spicier' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Flame className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAiAssist('context'); }}
                  disabled={isEnhancing}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                  title="Add Context"
                >
                  {isEnhancing && enhancingAction === 'context' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAiAssist('shorten'); }}
                  disabled={isEnhancing}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                  title="Shorten"
                >
                  {isEnhancing && enhancingAction === 'shorten' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Scissors className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAiAssist('hook'); }}
                  disabled={isEnhancing}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                  title="Better Hook"
                >
                  {isEnhancing && enhancingAction === 'hook' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAiAssist('cta'); }}
                  disabled={isEnhancing}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  title="Improve CTA"
                >
                  {isEnhancing && enhancingAction === 'cta' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Target className="h-3 w-3" />
                  )}
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); onGenerateImage(); }}
                  disabled={isGeneratingImage}
                  className="p-1.5 rounded bg-elevated/50 text-tertiary hover:text-pink-400 hover:bg-pink-500/10 transition-colors disabled:opacity-50"
                  title="Generate Image"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Image className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add After Button */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onAddAfter(); }}
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
