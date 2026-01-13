'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { PremiumTextarea } from '@/components/ui/premium-input';
import { MarketMoodBadge } from '@/components/ui/premium-badge';
import { useToast } from '@/components/ui/toast';
import {
  Sparkles,
  Wand2,
  Flame,
  Scissors,
  ArrowUp,
  Eye,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Copy,
  RefreshCw,
  Target,
} from 'lucide-react';
import { VoiceMatchIndicator } from '@/components/ui/voice-match-indicator';
import { MediaGenerator } from '@/components/media/media-generator';
import { ContextInput, formatContextForAI, type ContextSource } from './context-input';

interface ContentAnalysis {
  overallScore: number;
  spiceLevel: number;
  controversyScore: number;
  engagementPotential: number;
  voiceAlignment: number;
  hookStrength: number;
  clarity: number;
  issues: {
    type: 'critical' | 'warning' | 'suggestion';
    description: string;
    fix: string;
  }[];
  strengths: string[];
  improvements: string[];
}

interface EnhanceResult {
  enhanced: string;
  changes: string[];
  reasoning: string;
}

interface GeneratedVariation {
  content: string;
  voiceAlignment: number;
  predictedEngagement: { likes: [number, number]; retweets: [number, number] };
  reasoning: string;
  hook?: string;
}

interface ContentCreatorProps {
  initialTopic?: string;
  initialContent?: string;
}

export function ContentCreator({ initialTopic, initialContent }: ContentCreatorProps) {
  const [content, setContent] = React.useState('');
  const [analysis, setAnalysis] = React.useState<ContentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [enhancingAction, setEnhancingAction] = React.useState<string | null>(null);
  const [variations, setVariations] = React.useState<GeneratedVariation[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = React.useState(false);
  const [contextSources, setContextSources] = React.useState<ContextSource[]>([]);
  const { addToast } = useToast();

  // Pre-fill with initialContent if provided (from dashboard Edit button)
  React.useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Pre-fill content with topic if provided - using @defiapp voice style
  React.useEffect(() => {
    // Only use topic if no initialContent was provided
    if (initialTopic && !content && !initialContent) {
      // Generate a few starting hooks in @defiapp's voice
      const hooks = [
        `${initialTopic.toLowerCase()} -`,
        `hot take on ${initialTopic.toLowerCase()}:`,
        `everyone's talking about ${initialTopic.toLowerCase()}. here's the thing:`,
        `${initialTopic.toLowerCase()}? let's talk about it.`,
      ];
      // Pick a random hook style
      const hook = hooks[Math.floor(Math.random() * hooks.length)];
      setContent(`${hook} `);

      // Show toast to inform user
      addToast({
        type: 'info',
        title: 'Topic loaded',
        description: `Writing about: ${initialTopic}`,
      });
    }
  }, [initialTopic, initialContent]);

  // Opens Twitter/X with pre-filled content for manual posting
  const handleOpenInTwitter = () => {
    if (!content.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty post',
        description: 'Please write something first',
      });
      return;
    }
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
    window.open(twitterIntentUrl, '_blank');
    addToast({
      type: 'success',
      title: 'Opened in Twitter',
      description: 'Complete your post on Twitter/X',
    });
  };

  // Copy content to clipboard
  const handleCopyContent = () => {
    if (!content.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty post',
        description: 'Please write something first',
      });
      return;
    }
    navigator.clipboard.writeText(content);
    addToast({
      type: 'success',
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  // Real AI enhancement
  const handleAiAssist = async (action: 'spicier' | 'context' | 'shorten' | 'hook' | 'cta') => {
    if (!content.trim()) {
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
      const contextString = formatContextForAI(contextSources);
      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content, context: contextString }),
      });

      const data = await response.json();

      if (data.error && !data._demo) {
        throw new Error(data.error);
      }

      const result: EnhanceResult = data.result;
      setContent(result.enhanced);

      addToast({
        type: 'success',
        title: 'Content enhanced!',
        description: result.changes[0] || 'Applied AI enhancement',
      });

      // Clear variations since content changed
      setVariations([]);
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

  // Generate variations
  const handleGenerateVariations = async () => {
    if (!content.trim()) {
      addToast({
        type: 'warning',
        title: 'No content',
        description: 'Write something first to generate variations',
      });
      return;
    }

    setIsGeneratingVariations(true);

    try {
      const response = await fetch('/api/content/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'variations', content, options: { count: 3 } }),
      });

      const data = await response.json();

      if (data.error && !data._demo) {
        throw new Error(data.error);
      }

      setVariations(data.result);

      addToast({
        type: 'success',
        title: 'Variations generated!',
        description: '3 alternative versions created',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Generation failed',
        description: String(error),
      });
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // Real AI analysis (debounced)
  React.useEffect(() => {
    if (!content.trim() || content.length < 20) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/content/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'analyze', content }),
        });

        const data = await response.json();
        if (data.result) {
          setAnalysis(data.result);
        }
      } catch {
        // Silent fail for analysis
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (score >= 70) return { grade: 'B', color: 'bg-lime-500/20 text-lime-400 border-lime-500/30' };
    if (score >= 55) return { grade: 'C', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    if (score >= 40) return { grade: 'D', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { grade: 'F', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-4">
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Create Post</h2>
            <div className="flex items-center gap-2">
              <PremiumButton
                size="sm"
                variant="ghost"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={handleCopyContent}
              >
                Copy
              </PremiumButton>
              <PremiumButton
                size="sm"
                variant="primary"
                leftIcon={<Send className="h-4 w-4" />}
                onClick={handleOpenInTwitter}
              >
                Open in Twitter
              </PremiumButton>
            </div>
          </div>

          {/* Context Input - Add reference material for AI */}
          <ContextInput
            context={contextSources}
            onContextChange={setContextSources}
            className="mb-4"
          />

          {/* Voice Match Indicator - Real-time feedback */}
          <VoiceMatchIndicator
            score={analysis?.voiceAlignment ?? null}
            isLoading={isAnalyzing}
            showSuggestions={true}
            suggestions={analysis?.improvements || []}
            className="mb-4"
          />

          {/* Textarea */}
          <PremiumTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Write something that adds value..."
            characterCount
            maxCharacters={280}
            className="min-h-[160px]"
          />

          {/* Analysis Issues */}
          {analysis && analysis.issues.length > 0 && (
            <div className="mt-4 space-y-2">
              {analysis.issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-lg text-sm',
                    issue.type === 'critical' && 'bg-red-500/10 text-red-400',
                    issue.type === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                    issue.type === 'suggestion' && 'bg-blue-500/10 text-blue-400'
                  )}
                >
                  {issue.type === 'critical' ? (
                    <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : issue.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{issue.description}</p>
                    <p className="text-xs opacity-80 mt-0.5">{issue.fix}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 p-4 rounded-lg bg-elevated border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-tertiary" />
              <span className="text-xs text-tertiary">Preview</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">Defi App</span>
                  <span className="text-tertiary">@defiapp</span>
                </div>
                <p className="text-secondary mt-1 whitespace-pre-wrap">
                  {content || 'Your post will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Media Generation - Prominently placed */}
        {content.length >= 20 && (
          <MediaGenerator
            tweetContent={content}
            onImageGenerated={(imageUrl) => {
              addToast({
                type: 'success',
                title: 'image ready!',
                description: 'your media is ready to use with this tweet',
              });
            }}
          />
        )}

        {/* Generated Variations */}
        {variations.length > 0 && (
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">AI Variations</h3>
              <PremiumButton
                size="sm"
                variant="ghost"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={handleGenerateVariations}
                disabled={isGeneratingVariations}
              >
                Regenerate
              </PremiumButton>
            </div>
            <div className="space-y-3">
              {variations.map((variation, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-elevated border border-white/5 hover:border-violet-500/30 cursor-pointer transition-colors"
                  onClick={() => {
                    setContent(variation.content);
                    addToast({ type: 'info', title: 'Variation applied', description: 'Content updated with selected variation' });
                  }}
                >
                  <p className="text-sm text-secondary">{variation.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className={cn('font-medium', getScoreColor(variation.voiceAlignment))}>
                      {variation.voiceAlignment}% voice match
                    </span>
                    <span className="text-tertiary">
                      Est. {variation.predictedEngagement.likes[0]}-{variation.predictedEngagement.likes[1]} likes
                    </span>
                  </div>
                  {variation.reasoning && (
                    <p className="text-xs text-tertiary mt-1">{variation.reasoning}</p>
                  )}
                </div>
              ))}
            </div>
          </PremiumCard>
        )}
      </div>

      {/* Assistance Panel */}
      <div className="space-y-4">
        {/* Quality Score */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">Quality Score</h3>
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-tertiary" />}
            {analysis && (
              <span className={cn('px-2 py-1 rounded-lg border text-lg font-bold font-mono', getGrade(analysis.overallScore).color)}>
                {getGrade(analysis.overallScore).grade}
              </span>
            )}
          </div>

          {analysis ? (
            <div className="space-y-4">
              {/* Overall score */}
              <div className="text-center">
                <motion.div
                  key={analysis.overallScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn('text-4xl font-bold font-mono', getScoreColor(analysis.overallScore))}
                >
                  {analysis.overallScore}
                </motion.div>
                <p className="text-xs text-tertiary mt-1">out of 100</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                {[
                  { key: 'hookStrength', label: 'Hook' },
                  { key: 'engagementPotential', label: 'Engagement' },
                  { key: 'voiceAlignment', label: 'Voice' },
                  { key: 'spiceLevel', label: 'Spice' },
                ].map(({ key, label }) => {
                  const value = analysis[key as keyof ContentAnalysis] as number;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-secondary">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-elevated rounded-full overflow-hidden">
                          <motion.div
                            className={cn('h-full rounded-full', value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-tertiary w-8">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-green-400 font-medium mb-1">Strengths:</p>
                  <ul className="text-xs text-tertiary space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i}>+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-tertiary">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start typing to see AI analysis</p>
            </div>
          )}
        </PremiumCard>

        {/* AI Assist */}
        <PremiumCard>
          <h3 className="font-semibold text-primary mb-3">AI Assist</h3>
          <div className="grid grid-cols-2 gap-2">
            <AssistButton
              icon={isEnhancing && enhancingAction === 'spicier' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
              label="Make Spicier"
              onClick={() => handleAiAssist('spicier')}
              disabled={isEnhancing}
            />
            <AssistButton
              icon={isEnhancing && enhancingAction === 'context' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              label="Add Context"
              onClick={() => handleAiAssist('context')}
              disabled={isEnhancing}
            />
            <AssistButton
              icon={isEnhancing && enhancingAction === 'shorten' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              label="Shorten"
              onClick={() => handleAiAssist('shorten')}
              disabled={isEnhancing}
            />
            <AssistButton
              icon={isEnhancing && enhancingAction === 'hook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              label="Suggest Hook"
              onClick={() => handleAiAssist('hook')}
              disabled={isEnhancing}
            />
          </div>

          {/* CTA Improvement Button */}
          <button
            onClick={() => handleAiAssist('cta')}
            disabled={isEnhancing}
            className="w-full mt-3 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isEnhancing && enhancingAction === 'cta' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
            Improve CTA
          </button>

          <button
            onClick={handleGenerateVariations}
            disabled={isGeneratingVariations}
            className="w-full mt-2 p-2.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingVariations ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate 3 Variations
          </button>
        </PremiumCard>
      </div>
    </div>
  );
}

function AssistButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 p-2 rounded-lg bg-elevated text-secondary hover:text-primary hover:bg-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {label}
    </button>
  );
}
