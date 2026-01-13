'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
import { getRelativeTime } from '@/lib/utils/time';
import {
  MessageSquare,
  Heart,
  Repeat2,
  Share,
  TrendingUp,
  Sparkles,
  ThumbsUp,
  MessageCircle,
  Zap,
  Laugh,
  Send,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Flame,
  Scissors,
  ArrowUp,
  Wand2,
  Target,
  Image,
  X,
  Download,
  Twitter,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { VoiceMatchIndicator } from '@/components/ui/voice-match-indicator';

interface OriginalPost {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  content: string;
  publishedAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  tweetUrl: string;
  verified: boolean;
}

interface QTAngle {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  suggestedContent: string;
  predictedEngagement: number;
  reasoning: string;
}

// Default angles as fallback
const defaultAngles: Omit<QTAngle, 'suggestedContent' | 'reasoning'>[] = [
  {
    type: 'agree',
    label: 'Agree & Expand',
    icon: <ThumbsUp className="h-4 w-4" />,
    description: 'Support the take and add your perspective',
    predictedEngagement: 72,
  },
  {
    type: 'add-context',
    label: 'Add Context',
    icon: <MessageCircle className="h-4 w-4" />,
    description: 'Provide additional information or data',
    predictedEngagement: 85,
  },
  {
    type: 'contrarian',
    label: 'Contrarian Take',
    icon: <Zap className="h-4 w-4" />,
    description: 'Respectfully disagree or offer alternative view',
    predictedEngagement: 92,
  },
  {
    type: 'humor',
    label: 'Humor',
    icon: <Laugh className="h-4 w-4" />,
    description: 'Add a witty or humorous comment',
    predictedEngagement: 78,
  },
];

interface QTStudioProps {
  initialUrl?: string;
}

export function QTStudio({ initialUrl: propUrl }: QTStudioProps) {
  const searchParams = useSearchParams();
  const paramUrl = searchParams.get('url') || '';
  const initialUrl = propUrl || paramUrl;

  const [tweetUrl, setTweetUrl] = React.useState(initialUrl);
  const [originalPost, setOriginalPost] = React.useState<OriginalPost | null>(null);
  const [qtAngles, setQtAngles] = React.useState<QTAngle[]>([]);
  const [selectedAngle, setSelectedAngle] = React.useState<QTAngle | null>(null);
  const [qtContent, setQtContent] = React.useState('');
  const [isLoadingTweet, setIsLoadingTweet] = React.useState(false);
  const [isGeneratingAngles, setIsGeneratingAngles] = React.useState(false);
  const [isPosting, setIsPosting] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [enhancingAction, setEnhancingAction] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<{
    voiceAlignment: number;
    improvements: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [imagePrompt, setImagePrompt] = React.useState('');
  const [showImagePromptInput, setShowImagePromptInput] = React.useState(false);
  const { addToast } = useToast();

  // Update image prompt when qtContent changes (as default)
  React.useEffect(() => {
    if (!imagePrompt && qtContent) {
      setImagePrompt(qtContent);
    }
  }, [qtContent, imagePrompt]);

  // Open on Twitter - creates a quote tweet with the content
  const openOnTwitter = () => {
    if (!qtContent.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write your quote tweet first',
      });
      return;
    }
    if (!originalPost) {
      addToast({
        type: 'warning',
        title: 'No tweet loaded',
        description: 'Load a tweet to quote first',
      });
      return;
    }

    const tweetUrl = originalPost.tweetUrl;
    const text = encodeURIComponent(qtContent);
    const url = encodeURIComponent(tweetUrl);
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterIntentUrl, '_blank', 'width=600,height=400');
  };

  // Generate image for the quote tweet
  const generateImage = async (prompt?: string) => {
    const promptToUse = prompt || imagePrompt || qtContent;
    if (!promptToUse.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write a prompt or quote tweet first',
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/media/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          style: 'dark',
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design');
      }

      const data = await response.json();

      // Render HTML to image
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
    link.download = 'quote-tweet-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load tweet from URL on mount if provided
  React.useEffect(() => {
    if (initialUrl && initialUrl !== tweetUrl) {
      setTweetUrl(initialUrl);
      fetchTweetData(initialUrl);
    } else if (initialUrl && !originalPost) {
      fetchTweetData(initialUrl);
    }
  }, [initialUrl]);

  // Extract tweet ID from URL
  const extractTweetId = (url: string): string | null => {
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Fetch tweet data
  const fetchTweetData = async (url: string) => {
    const tweetId = extractTweetId(url);
    if (!tweetId) {
      addToast({
        type: 'error',
        title: 'Invalid URL',
        description: 'Please enter a valid Twitter/X post URL',
      });
      return;
    }

    setIsLoadingTweet(true);
    setOriginalPost(null);
    setQtAngles([]);
    setSelectedAngle(null);
    setQtContent('');

    try {
      // Try to fetch from our viral API first
      const response = await fetch(`/api/viral/tweets?tweetId=${tweetId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.tweet) {
          setOriginalPost({
            id: data.tweet.id,
            authorUsername: data.tweet.author.handle,
            authorDisplayName: data.tweet.author.name,
            authorAvatar: data.tweet.author.avatar || '',
            content: data.tweet.content,
            publishedAt: new Date(data.tweet.postedAt),
            likes: data.tweet.metrics.likes,
            retweets: data.tweet.metrics.retweets,
            replies: data.tweet.metrics.replies,
            quotes: data.tweet.metrics.quotes,
            tweetUrl: data.tweet.tweetUrl || url,
            verified: data.tweet.author.verified,
          });
          // Generate AI angles for this tweet
          generateQTAngles(data.tweet.content, data.tweet.author.handle);
          return;
        }
      }

      // Fallback - create basic post from URL (for demo purposes)
      const usernameMatch = url.match(/(?:twitter|x)\.com\/(\w+)\/status/);
      const username = usernameMatch ? usernameMatch[1] : 'unknown';

      setOriginalPost({
        id: tweetId,
        authorUsername: username,
        authorDisplayName: username,
        authorAvatar: '',
        content: `[Tweet content not available - configure Twitter API to fetch real content]`,
        publishedAt: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0,
        quotes: 0,
        tweetUrl: url,
        verified: false,
      });

      addToast({
        type: 'info',
        title: 'Limited data',
        description: 'Configure Twitter API for full tweet data',
      });

    } catch (error) {
      console.error('Error fetching tweet:', error);
      addToast({
        type: 'error',
        title: 'Failed to fetch tweet',
        description: 'Could not load tweet data. Try again.',
      });
    } finally {
      setIsLoadingTweet(false);
    }
  };

  // Generate AI-powered QT angles
  const generateQTAngles = async (tweetContent: string, authorHandle: string) => {
    setIsGeneratingAngles(true);

    try {
      const response = await fetch('/api/content/qt-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTweet: {
            content: tweetContent,
            author: authorHandle,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.angles && data.angles.length > 0) {
          // Map API response to our QTAngle format
          const angles: QTAngle[] = data.angles.map((angle: { angle: string; content: string; tone: string; predictedEngagement: number; reasoning: string }, index: number) => ({
            type: defaultAngles[index]?.type || angle.tone,
            label: angle.angle,
            icon: defaultAngles[index]?.icon || <Sparkles className="h-4 w-4" />,
            description: `${angle.tone} approach`,
            suggestedContent: angle.content,
            predictedEngagement: angle.predictedEngagement,
            reasoning: angle.reasoning,
          }));
          setQtAngles(angles);
          return;
        }
      }

      // Fallback to default angles without suggestions
      setQtAngles(defaultAngles.map(a => ({
        ...a,
        suggestedContent: '',
        reasoning: 'Configure Claude API for AI-generated suggestions',
      })));

    } catch (error) {
      console.error('Error generating angles:', error);
      setQtAngles(defaultAngles.map(a => ({
        ...a,
        suggestedContent: '',
        reasoning: 'Error generating suggestions',
      })));
    } finally {
      setIsGeneratingAngles(false);
    }
  };

  const handleLoadTweet = () => {
    if (!tweetUrl.trim()) {
      addToast({
        type: 'warning',
        title: 'No URL',
        description: 'Please paste a tweet URL',
      });
      return;
    }
    fetchTweetData(tweetUrl);
  };

  const handlePostQT = async () => {
    if (qtContent.length < 10) {
      addToast({
        type: 'warning',
        title: 'Content too short',
        description: 'Write at least 10 characters',
      });
      return;
    }
    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPosting(false);
    addToast({
      type: 'success',
      title: 'Quote tweet ready!',
      description: 'Copy your QT and post it on X',
    });
  };

  const handleSelectAngle = (angle: QTAngle) => {
    setSelectedAngle(angle);
    if (angle.suggestedContent) {
      setQtContent(angle.suggestedContent);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qtContent);
    addToast({
      type: 'success',
      title: 'Copied!',
      description: 'QT content copied to clipboard',
    });
  };

  // AI Assist for QT content
  const handleAiAssist = async (action: 'spicier' | 'context' | 'shorten' | 'hook' | 'cta') => {
    if (!qtContent.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write something first for AI to enhance',
      });
      return;
    }

    setIsEnhancing(true);
    setEnhancingAction(action);

    try {
      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: qtContent }),
      });

      const data = await response.json();

      if (data.error && !data._demo) {
        throw new Error(data.error);
      }

      const result = data.result;
      setQtContent(result.enhanced);

      addToast({
        type: 'success',
        title: 'QT enhanced!',
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
    }
  };

  // Analyze QT content for voice match
  React.useEffect(() => {
    if (!qtContent.trim() || qtContent.length < 15) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/content/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'analyze', content: qtContent }),
        });

        const data = await response.json();
        if (data.result) {
          setAnalysis({
            voiceAlignment: data.result.voiceAlignment,
            improvements: data.result.improvements || [],
          });
        }
      } catch {
        // Silent fail for analysis
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [qtContent]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Original Post */}
      <div className="space-y-4">
        {/* URL Input */}
        <PremiumCard>
          <h2 className="text-lg font-semibold text-primary mb-4">Paste Tweet URL</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary" />
              <input
                type="text"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                placeholder="https://x.com/username/status/..."
                className="w-full pl-10 pr-4 py-2 bg-elevated border border-white/10 rounded-lg text-secondary placeholder:text-tertiary focus:outline-none focus:border-violet-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleLoadTweet()}
              />
            </div>
            <PremiumButton
              variant="primary"
              onClick={handleLoadTweet}
              disabled={isLoadingTweet}
            >
              {isLoadingTweet ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
            </PremiumButton>
          </div>
          <p className="text-xs text-tertiary mt-2">
            Paste any Twitter/X post URL to generate QT angles
          </p>
        </PremiumCard>

        {/* Loaded Post */}
        {originalPost && (
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Original Post</h2>
              <a
                href={originalPost.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
              >
                <ExternalLink className="h-3 w-3" />
                View on X
              </a>
            </div>

            {/* Post Preview */}
            <div className="p-4 rounded-lg bg-elevated border border-white/5">
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
                  {originalPost.authorAvatar && (
                    <img
                      src={originalPost.authorAvatar}
                      alt={originalPost.authorDisplayName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-primary">
                      {originalPost.authorDisplayName}
                    </span>
                    {originalPost.verified && (
                      <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-tertiary">@{originalPost.authorUsername}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-secondary leading-relaxed mb-4 whitespace-pre-wrap">{originalPost.content}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-tertiary text-sm">
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-red-400" />
                  {formatNumber(originalPost.likes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Repeat2 className="h-4 w-4 text-green-400" />
                  {formatNumber(originalPost.retweets)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  {formatNumber(originalPost.replies)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Share className="h-4 w-4" />
                  {formatNumber(originalPost.quotes)}
                </span>
              </div>

              {/* Posted time */}
              <div className="flex items-center gap-1 mt-3 text-xs text-tertiary">
                <Clock className="h-3 w-3" />
                <span>{getRelativeTime(originalPost.publishedAt)}</span>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* No tweet loaded state */}
        {!originalPost && !isLoadingTweet && (
          <PremiumCard>
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-tertiary mx-auto mb-4" />
              <p className="text-secondary font-medium mb-2">No tweet loaded</p>
              <p className="text-tertiary text-sm">
                Paste a tweet URL above to get started
              </p>
            </div>
          </PremiumCard>
        )}

        {/* Loading state */}
        {isLoadingTweet && (
          <PremiumCard>
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-violet-400 mx-auto mb-4 animate-spin" />
              <p className="text-secondary">Loading tweet data...</p>
            </div>
          </PremiumCard>
        )}
      </div>

      {/* QT Composer */}
      <div className="space-y-4">
        {/* Angle Selection */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Choose Your Angle</h3>
            {isGeneratingAngles && (
              <span className="flex items-center gap-2 text-xs text-violet-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating AI angles...
              </span>
            )}
          </div>

          {qtAngles.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {qtAngles.map((angle, index) => (
                <motion.button
                  key={angle.type + index}
                  onClick={() => handleSelectAngle(angle)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors',
                    selectedAngle?.type === angle.type
                      ? 'bg-violet-500/10 border-violet-500/30'
                      : 'bg-elevated border-white/5 hover:border-white/10'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      selectedAngle?.type === angle.type ? 'text-violet-400' : 'text-tertiary'
                    )}>
                      {angle.icon}
                    </span>
                    <span className={cn(
                      'font-medium text-sm',
                      selectedAngle?.type === angle.type ? 'text-violet-400' : 'text-primary'
                    )}>
                      {angle.label}
                    </span>
                  </div>
                  <p className="text-xs text-tertiary line-clamp-2">{angle.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">{angle.predictedEngagement}% predicted</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : originalPost ? (
            <div className="text-center py-6 text-tertiary">
              <p className="text-sm">Select an angle to start writing your QT</p>
            </div>
          ) : (
            <div className="text-center py-6 text-tertiary">
              <p className="text-sm">Load a tweet to see QT angle suggestions</p>
            </div>
          )}
        </PremiumCard>

        {/* QT Content */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Your Quote Tweet</h3>
            {selectedAngle && selectedAngle.suggestedContent && (
              <button
                onClick={() => setQtContent(selectedAngle.suggestedContent)}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
              >
                <Sparkles className="h-3 w-3" />
                Use AI Suggestion
              </button>
            )}
          </div>

          {/* Voice Match Indicator */}
          <VoiceMatchIndicator
            score={analysis?.voiceAlignment ?? null}
            isLoading={isAnalyzing}
            showSuggestions={false}
            className="mb-3"
          />

          <PremiumTextarea
            value={qtContent}
            onChange={(e) => setQtContent(e.target.value)}
            placeholder={selectedAngle
              ? `Write your ${selectedAngle.label.toLowerCase()} response...`
              : 'Select an angle above, then write your quote tweet...'
            }
            characterCount
            maxCharacters={280}
            className="min-h-[120px]"
          />

          {/* Reasoning */}
          {selectedAngle?.reasoning && (
            <div className="mt-3 p-2 rounded bg-elevated text-xs text-tertiary">
              <span className="text-violet-400 font-medium">AI tip:</span> {selectedAngle.reasoning}
            </div>
          )}

          {/* AI Assist Buttons */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-tertiary mb-2">AI Assist</p>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => handleAiAssist('spicier')}
                disabled={isEnhancing || !qtContent.trim()}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing && enhancingAction === 'spicier' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flame className="h-4 w-4" />
                )}
                Spicier
              </button>
              <button
                onClick={() => handleAiAssist('context')}
                disabled={isEnhancing || !qtContent.trim()}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing && enhancingAction === 'context' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
                Context
              </button>
              <button
                onClick={() => handleAiAssist('shorten')}
                disabled={isEnhancing || !qtContent.trim()}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isEnhancing || !qtContent.trim()}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing && enhancingAction === 'hook' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Hook
              </button>
              <button
                onClick={() => handleAiAssist('cta')}
                disabled={isEnhancing || !qtContent.trim()}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing && enhancingAction === 'cta' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                CTA
              </button>
            </div>
          </div>

          {/* Predicted Performance */}
          {selectedAngle && qtContent.length > 20 && (
            <div className="mt-4 p-3 rounded-lg bg-elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-tertiary">Predicted Engagement</span>
                <span className="font-mono font-semibold text-primary">
                  {selectedAngle.predictedEngagement}%
                </span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedAngle.predictedEngagement}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!qtContent}
                className="text-sm text-tertiary hover:text-secondary transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                Copy
              </button>
              <button
                onClick={() => setShowImagePromptInput(!showImagePromptInput)}
                disabled={isGeneratingImage}
                className={cn(
                  "text-sm transition-colors flex items-center gap-1 disabled:opacity-50",
                  showImagePromptInput ? "text-violet-400" : "text-tertiary hover:text-violet-400"
                )}
              >
                {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />}
                Image
              </button>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="secondary"
                size="sm"
                leftIcon={<Twitter className="h-4 w-4" />}
                disabled={qtContent.length < 10 || !originalPost}
                onClick={openOnTwitter}
              >
                Open on X
              </PremiumButton>
              <PremiumButton
                variant="primary"
                leftIcon={<Send className="h-4 w-4" />}
                disabled={qtContent.length < 10 || isPosting}
                onClick={handlePostQT}
              >
                {isPosting ? 'Processing...' : 'Ready'}
              </PremiumButton>
            </div>
          </div>

          {/* Image Prompt Input */}
          {showImagePromptInput && (
            <div className="mt-4 p-3 rounded-lg bg-elevated/50 border border-violet-500/20">
              <label className="text-[10px] text-tertiary mb-1 block">image prompt (editable):</label>
              <textarea
                value={imagePrompt || qtContent}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full p-2 rounded bg-surface text-xs text-secondary resize-none border border-white/5 focus:border-violet-500/50 focus:outline-none"
                rows={2}
                placeholder="Describe the image to generate..."
              />
              <button
                onClick={() => generateImage(imagePrompt || qtContent)}
                disabled={isGeneratingImage || !(imagePrompt || qtContent).trim()}
                className="mt-2 w-full py-1.5 px-3 rounded bg-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Image className="h-3 w-3" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          )}
        </PremiumCard>

        {/* Best Practices */}
        <PremiumCard variant="elevated" className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
          <h3 className="font-semibold text-primary mb-3">qt rules</h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-green-400">+</span>
              add something they didn't say. make it worth the click
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">+</span>
              disagree? cool. be spicy, not toxic
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">+</span>
              bring data or a hot take. preferably both
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">-</span>
              "this" and "agree" are not content. try harder
            </li>
          </ul>
        </PremiumCard>
      </div>

      {/* Image Modal - Portal to prevent flickering */}
      {showImageModal && generatedImage && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
          onMouseMove={(e) => e.stopPropagation()}
          style={{ isolation: 'isolate' }}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0a0a0a] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-square bg-black">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>

            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {qtContent}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    openOnTwitter();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20"
                >
                  <Twitter className="h-4 w-4" />
                  Post on X
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
