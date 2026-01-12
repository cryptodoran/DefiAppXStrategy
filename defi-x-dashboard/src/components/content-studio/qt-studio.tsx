'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
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
} from 'lucide-react';

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
}

interface QTAngle {
  type: 'agree' | 'add-context' | 'contrarian' | 'humor';
  label: string;
  icon: React.ReactNode;
  description: string;
  suggestedContent: string;
  predictedEngagement: number;
}

// Mock data
const mockOriginalPost: OriginalPost = {
  id: '1',
  authorUsername: 'vitalikbuterin',
  authorDisplayName: 'vitalik.eth',
  authorAvatar: '',
  content: 'Announcing a major update to Ethereum\'s roadmap. The focus on L2 scaling and account abstraction will fundamentally change how we interact with the blockchain. Thread on the implications...',
  publishedAt: new Date(Date.now() - 30 * 60 * 1000),
  likes: 15600,
  retweets: 5200,
  replies: 1890,
  quotes: 2100,
};

export function QTStudio() {
  const [selectedAngle, setSelectedAngle] = React.useState<QTAngle | null>(null);
  const [qtContent, setQtContent] = React.useState('');
  const [originalPost] = React.useState<OriginalPost>(mockOriginalPost);
  const [isPosting, setIsPosting] = React.useState(false);
  const { addToast } = useToast();

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
      title: 'Quote tweet posted!',
      description: 'Your QT has been published',
    });
    setQtContent('');
    setSelectedAngle(null);
  };

  const handleGenerateVariations = () => {
    if (!qtContent.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write something first to generate variations',
      });
      return;
    }
    addToast({
      type: 'info',
      title: 'Generating variations',
      description: 'Creating alternative versions...',
    });
  };

  const qtAngles: QTAngle[] = [
    {
      type: 'agree',
      label: 'Agree & Expand',
      icon: <ThumbsUp className="h-4 w-4" />,
      description: 'Support the take and add your perspective',
      suggestedContent: 'This is exactly why the future of Ethereum is so exciting. Here\'s what this means for DeFi protocols and why DeFi App is positioned perfectly for this transition...',
      predictedEngagement: 72,
    },
    {
      type: 'add-context',
      label: 'Add Context',
      icon: <MessageCircle className="h-4 w-4" />,
      description: 'Provide additional information or data',
      suggestedContent: 'For those wondering what this means in practice:\n\n• L2 tx costs will drop 90%+\n• Account abstraction = no more seed phrases\n• EIP-4844 enables 100x more data\n\nHere\'s how DeFi App is already building for this...',
      predictedEngagement: 85,
    },
    {
      type: 'contrarian',
      label: 'Contrarian Take',
      icon: <Zap className="h-4 w-4" />,
      description: 'Respectfully disagree or offer alternative view',
      suggestedContent: 'Unpopular opinion: While I respect the vision, I think the timeline is too optimistic.\n\nHere\'s why the real adoption bottleneck isn\'t technical, it\'s UX...',
      predictedEngagement: 92,
    },
    {
      type: 'humor',
      label: 'Humor',
      icon: <Laugh className="h-4 w-4" />,
      description: 'Add a witty or humorous comment',
      suggestedContent: 'Me explaining Ethereum\'s new roadmap to my parents:\n\n"So it\'s like... the internet, but you actually own your stuff, and it\'s getting faster and cheaper."',
      predictedEngagement: 78,
    },
  ];

  const handleSelectAngle = (angle: QTAngle) => {
    setSelectedAngle(angle);
    setQtContent(angle.suggestedContent);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Original Post */}
      <div className="space-y-4">
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Original Post</h2>
            <PremiumBadge variant="hot" size="sm">High QT Potential</PremiumBadge>
          </div>

          {/* Post Preview */}
          <div className="p-4 rounded-lg bg-elevated border border-white/5">
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-primary">
                    {originalPost.authorDisplayName}
                  </span>
                  <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                </div>
                <span className="text-sm text-tertiary">@{originalPost.authorUsername}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-secondary leading-relaxed mb-4">{originalPost.content}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-tertiary text-sm">
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                {formatNumber(originalPost.likes)}
              </span>
              <span className="flex items-center gap-1.5">
                <Repeat2 className="h-4 w-4" />
                {formatNumber(originalPost.retweets)}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
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
              <span>30 minutes ago</span>
            </div>
          </div>

          {/* QT Value Assessment */}
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-300 font-medium">QT Opportunity Score</span>
              <span className="font-mono font-bold text-green-400">88/100</span>
            </div>
            <p className="text-xs text-green-400/80">
              High engagement velocity + relevant topic = strong QT potential
            </p>
          </div>
        </PremiumCard>
      </div>

      {/* QT Composer */}
      <div className="space-y-4">
        {/* Angle Selection */}
        <PremiumCard>
          <h3 className="font-semibold text-primary mb-4">Choose Your Angle</h3>
          <div className="grid grid-cols-2 gap-2">
            {qtAngles.map((angle) => (
              <motion.button
                key={angle.type}
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
                <p className="text-xs text-tertiary">{angle.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">{angle.predictedEngagement}% predicted</span>
                </div>
              </motion.button>
            ))}
          </div>
        </PremiumCard>

        {/* QT Content */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Your Quote Tweet</h3>
            {selectedAngle && (
              <button
                onClick={() => {
                  setQtContent(selectedAngle.suggestedContent);
                  addToast({
                    type: 'success',
                    title: 'AI suggestion applied',
                    description: `Using ${selectedAngle.label} template`,
                  });
                }}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
              >
                <Sparkles className="h-3 w-3" />
                Use AI Suggestion
              </button>
            )}
          </div>

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
            <button
              onClick={handleGenerateVariations}
              className="text-sm text-tertiary hover:text-secondary transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Generate Variations
            </button>
            <PremiumButton
              variant="primary"
              leftIcon={<Send className="h-4 w-4" />}
              disabled={qtContent.length < 10 || isPosting}
              onClick={handlePostQT}
            >
              {isPosting ? 'Posting...' : 'Post Quote Tweet'}
            </PremiumButton>
          </div>
        </PremiumCard>

        {/* Best Practices */}
        <PremiumCard variant="elevated" className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
          <h3 className="font-semibold text-primary mb-3">QT Best Practices</h3>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Add value beyond the original post
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Be respectful even when disagreeing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Include your unique perspective or data
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              Don't just say "this" or "agree"
            </li>
          </ul>
        </PremiumCard>
      </div>
    </div>
  );
}
