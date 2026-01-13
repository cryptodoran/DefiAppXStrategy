'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { useToast } from '@/components/ui/toast';
import {
  Image,
  Sparkles,
  Copy,
  Check,
  Loader2,
  BarChart3,
  Laugh,
  Smartphone,
  Palette,
  ExternalLink,
  Download,
  Wand2,
  X,
  RefreshCw,
} from 'lucide-react';

interface MediaSuggestion {
  type: 'meme' | 'infographic' | 'chart' | 'screenshot' | 'custom';
  description: string;
  imagePrompt: string;
  reasoning: string;
}

interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  style: string;
}

interface MediaGeneratorProps {
  tweetContent: string;
  onPromptSelect?: (prompt: string) => void;
  onImageGenerated?: (imageUrl: string) => void;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  meme: <Laugh className="h-4 w-4" />,
  infographic: <BarChart3 className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  screenshot: <Smartphone className="h-4 w-4" />,
  custom: <Palette className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  meme: 'text-yellow-400 bg-yellow-500/10',
  infographic: 'text-blue-400 bg-blue-500/10',
  chart: 'text-green-400 bg-green-500/10',
  screenshot: 'text-purple-400 bg-purple-500/10',
  custom: 'text-violet-400 bg-violet-500/10',
};

const IMAGE_STYLES = [
  { id: 'digital-art', label: 'Digital Art' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'anime', label: 'Anime' },
  { id: 'cinematic', label: 'Cinematic' },
] as const;

export function MediaGenerator({ tweetContent, onPromptSelect, onImageGenerated, className }: MediaGeneratorProps) {
  const [suggestions, setSuggestions] = React.useState<MediaSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = React.useState<GeneratedImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatingIndex, setGeneratingIndex] = React.useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = React.useState<string>('digital-art');
  const [showImageModal, setShowImageModal] = React.useState<GeneratedImage | null>(null);
  const { addToast } = useToast();

  // Generate suggestions when content changes
  const generateSuggestions = React.useCallback(async () => {
    if (!tweetContent.trim() || tweetContent.length < 20) {
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/media/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tweetContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Media suggestion error:', error);
      addToast({
        type: 'error',
        title: 'Failed to generate suggestions',
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tweetContent, addToast]);

  const copyPrompt = async (prompt: string, index: number) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    addToast({
      type: 'success',
      title: 'Prompt copied!',
      description: 'Use this prompt with any image generator',
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectPrompt = (suggestion: MediaSuggestion, index: number) => {
    setSelectedIndex(index);
    if (onPromptSelect) {
      onPromptSelect(suggestion.imagePrompt);
    }
  };

  // Generate actual image from prompt
  const generateImage = async (prompt: string, index: number) => {
    setIsGeneratingImage(true);
    setGeneratingIndex(index);

    try {
      const response = await fetch('/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        imageUrl: data.imageUrl,
        prompt: data.originalPrompt,
        style: data.style,
      };

      setGeneratedImages((prev) => [...prev, newImage]);
      setShowImageModal(newImage);

      if (onImageGenerated) {
        onImageGenerated(data.imageUrl);
      }

      addToast({
        type: 'success',
        title: 'image generated!',
        description: 'your image is ready to use',
      });
    } catch (error) {
      console.error('Image generation error:', error);
      addToast({
        type: 'error',
        title: 'generation failed',
        description: 'could not generate image. try again',
      });
    } finally {
      setIsGeneratingImage(false);
      setGeneratingIndex(null);
    }
  };

  // Download image
  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast({
        type: 'success',
        title: 'downloaded!',
        description: 'image saved to your device',
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        type: 'error',
        title: 'download failed',
        description: 'could not download image',
      });
    }
  };

  return (
    <PremiumCard className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-violet-400" />
          <h3 className="font-semibold text-primary">Media Suggestions</h3>
        </div>
        <PremiumButton
          size="sm"
          variant="secondary"
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          onClick={generateSuggestions}
          disabled={isLoading || tweetContent.length < 20}
        >
          {isLoading ? 'Generating...' : 'Suggest Media'}
        </PremiumButton>
      </div>

      {tweetContent.length < 20 && (
        <div className="text-center py-6 text-tertiary">
          <Image className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Write at least 20 characters to get media suggestions</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-elevated">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface" />
                <div className="h-4 bg-surface rounded w-24" />
              </div>
              <div className="h-3 bg-surface rounded w-full mb-2" />
              <div className="h-3 bg-surface rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-lg border transition-colors cursor-pointer',
                  selectedIndex === index
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : 'bg-elevated border-white/5 hover:border-white/10'
                )}
                onClick={() => selectPrompt(suggestion, index)}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={cn('p-2 rounded-lg', TYPE_COLORS[suggestion.type])}>
                    {TYPE_ICONS[suggestion.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary capitalize">{suggestion.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(suggestion.imagePrompt, index);
                        }}
                        className="text-tertiary hover:text-secondary transition-colors"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-secondary mb-2">{suggestion.description}</p>

                    {/* Reasoning */}
                    <p className="text-xs text-tertiary italic">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      {suggestion.reasoning}
                    </p>

                    {/* Prompt Preview */}
                    <div className="mt-3 p-2 rounded bg-surface text-xs text-tertiary font-mono line-clamp-2">
                      {suggestion.imagePrompt}
                    </div>

                    {/* Generate Image Button */}
                    <div className="mt-3 flex items-center gap-2">
                      <PremiumButton
                        size="sm"
                        variant="primary"
                        leftIcon={
                          isGeneratingImage && generatingIndex === index ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="h-3 w-3" />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          generateImage(suggestion.imagePrompt, index);
                        }}
                        disabled={isGeneratingImage}
                        className="flex-1"
                      >
                        {isGeneratingImage && generatingIndex === index
                          ? 'generating...'
                          : 'generate image'}
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Style Selector */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-tertiary mb-2">image style:</p>
            <div className="flex flex-wrap gap-2">
              {IMAGE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    selectedStyle === style.id
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-elevated text-tertiary hover:text-secondary border border-white/5'
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-tertiary">generated images ({generatedImages.length})</p>
            <button
              onClick={() => setGeneratedImages([])}
              className="text-xs text-tertiary hover:text-red-400 transition-colors"
            >
              clear all
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {generatedImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-elevated cursor-pointer group"
                onClick={() => setShowImageModal(img)}
              >
                <img
                  src={img.imageUrl}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(img.imageUrl, `defiapp-media-${index}`);
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* External Tools (fallback) */}
      {!isLoading && suggestions.length > 0 && generatedImages.length === 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-tertiary mb-3">
            or use prompts with external tools:
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://midjourney.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              Midjourney <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://openai.com/dall-e-3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-elevated text-xs text-tertiary hover:text-secondary transition-colors"
            >
              DALL-E 3 <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-surface rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowImageModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={showImageModal.imageUrl}
                  alt="Generated image"
                  className="w-full h-full object-contain bg-black"
                />
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-white/5">
                <p className="text-xs text-tertiary mb-3 line-clamp-2">
                  {showImageModal.prompt}
                </p>
                <div className="flex items-center gap-2">
                  <PremiumButton
                    size="sm"
                    variant="primary"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => downloadImage(showImageModal.imageUrl, 'defiapp-media')}
                    className="flex-1"
                  >
                    download
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="secondary"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => {
                      setShowImageModal(null);
                      generateImage(showImageModal.prompt, -1);
                    }}
                  >
                    regenerate
                  </PremiumButton>
                  <PremiumButton
                    size="sm"
                    variant="ghost"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => {
                      navigator.clipboard.writeText(showImageModal.imageUrl);
                      addToast({
                        type: 'success',
                        title: 'copied!',
                        description: 'image url copied to clipboard',
                      });
                    }}
                  >
                    copy url
                  </PremiumButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumCard>
  );
}
