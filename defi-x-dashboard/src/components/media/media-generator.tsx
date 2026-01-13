'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
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
  Upload,
  ImagePlus,
  Bot,
} from 'lucide-react';
import { toPng } from 'html-to-image';

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
  loaded?: boolean;
}

interface ImageLoadState {
  [index: number]: boolean;
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
  { id: 'claude-dark', label: 'Dark', recommended: true, claude: true },
  { id: 'claude-gold', label: 'Gold', claude: true },
  { id: 'claude-green', label: 'Green', claude: true },
  { id: 'claude-red', label: 'Red', claude: true },
  { id: 'claude-data', label: 'Data', claude: true },
  { id: 'gradient-abstract', label: 'AI Gradient' },
  { id: 'neon-tech', label: 'AI Neon' },
  { id: 'digital-art', label: 'AI Digital' },
] as const;

export function MediaGenerator({ tweetContent, onPromptSelect, onImageGenerated, className }: MediaGeneratorProps) {
  const [suggestions, setSuggestions] = React.useState<MediaSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = React.useState<GeneratedImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [generatingIndex, setGeneratingIndex] = React.useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = React.useState<string>('claude-dark');
  const [showImageModal, setShowImageModal] = React.useState<GeneratedImage | null>(null);
  const [imageLoadStates, setImageLoadStates] = React.useState<ImageLoadState>({});
  const [referenceImage, setReferenceImage] = React.useState<string | null>(null);
  const [referenceImageFile, setReferenceImageFile] = React.useState<File | null>(null);
  const [editedPrompts, setEditedPrompts] = React.useState<Record<number, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Get the prompt for a suggestion (edited or original)
  const getPrompt = (index: number, suggestion: MediaSuggestion) => {
    return editedPrompts[index] ?? suggestion.imagePrompt;
  };

  // Update edited prompt
  const updatePrompt = (index: number, value: string) => {
    setEditedPrompts(prev => ({ ...prev, [index]: value }));
  };

  // Handle reference image upload
  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File too large',
          description: 'Please use an image under 10MB',
        });
        return;
      }
      setReferenceImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear reference image
  const clearReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Track image load state
  const handleImageLoad = (index: number) => {
    setImageLoadStates(prev => ({ ...prev, [index]: true }));
  };

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

  // Render HTML to image using html-to-image
  const renderHtmlToImage = async (html: string): Promise<string> => {
    // Create a container that's visible but off-screen (some browsers handle this better)
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '1024px';
    container.style.height = '1024px';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#000';

    // Parse the HTML and extract just the body content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Copy styles from the parsed document
    const styles = doc.querySelectorAll('style');
    styles.forEach(style => {
      const newStyle = document.createElement('style');
      newStyle.textContent = style.textContent;
      container.appendChild(newStyle);
    });

    // Copy the body content
    const bodyContent = doc.body.innerHTML;
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = bodyContent;
    container.appendChild(contentDiv);

    document.body.appendChild(container);

    try {
      // Find the main design element
      const designElement = container.querySelector('.container') ||
                           container.querySelector('div[style*="width"]') ||
                           contentDiv.firstElementChild ||
                           contentDiv;

      if (!designElement) {
        throw new Error('No design element found');
      }

      // Wait for any rendering to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Convert to PNG with high quality
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

  // Generate actual image from prompt
  const generateImage = async (prompt: string, index: number) => {
    setIsGeneratingImage(true);
    setGeneratingIndex(index);

    try {
      // Check if using Claude HTML design
      const isClaudeStyle = selectedStyle.startsWith('claude-');

      if (isClaudeStyle) {
        // Use Claude to generate HTML design
        const claudeStyle = selectedStyle.replace('claude-', '');
        const response = await fetch('/api/media/design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            style: claudeStyle,
            width: 1024,
            height: 1024,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate design');
        }

        const data = await response.json();

        // Render HTML to image
        addToast({
          type: 'info',
          title: 'rendering design...',
          description: 'converting HTML to image',
        });

        const imageUrl = await renderHtmlToImage(data.html);

        const newImage: GeneratedImage = {
          imageUrl,
          prompt: data.prompt,
          style: `claude-${data.style}`,
        };

        setGeneratedImages((prev) => [...prev, newImage]);
        setShowImageModal(newImage);

        if (onImageGenerated) {
          onImageGenerated(imageUrl);
        }

        addToast({
          type: 'success',
          title: 'design created!',
          description: 'professional Claude design ready',
        });
      } else {
        // Use traditional AI image generation
        const response = await fetch('/api/media/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            style: selectedStyle,
            width: 1024,
            height: 1024,
            referenceImage: referenceImage || undefined,
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
      }
    } catch (error) {
      console.error('Image generation error:', error);
      addToast({
        type: 'error',
        title: 'generation failed',
        description: String(error) || 'could not generate image. try again',
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

                    {/* Editable Prompt */}
                    <div className="mt-3">
                      <label className="text-[10px] text-tertiary mb-1 block">image prompt (editable):</label>
                      <textarea
                        value={getPrompt(index, suggestion)}
                        onChange={(e) => {
                          e.stopPropagation();
                          updatePrompt(index, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full p-2 rounded bg-surface text-xs text-secondary font-mono resize-none border border-white/5 focus:border-violet-500/50 focus:outline-none"
                        rows={3}
                        placeholder="Edit the prompt before generating..."
                      />
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
                          generateImage(getPrompt(index, suggestion), index);
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
            <p className="text-xs text-tertiary mb-2">design style:</p>
            <div className="mb-2">
              <p className="text-[10px] text-emerald-400 mb-1 flex items-center gap-1">
                <Bot className="h-3 w-3" /> Defi App Brand (on-brand designs with official colors)
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {IMAGE_STYLES.filter(s => 'claude' in s && s.claude).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative',
                      selectedStyle === style.id
                        ? 'bg-[#5b8cff]/20 text-[#5b8cff] border border-[#5b8cff]/30'
                        : 'bg-elevated text-tertiary hover:text-secondary border border-white/5'
                    )}
                  >
                    {style.label.replace('Brand ', '').replace('Defi App ', '')}
                    {'recommended' in style && style.recommended && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded text-[9px] bg-[#5b8cff]/20 text-[#5b8cff] border border-[#5b8cff]/30">
                        ★
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-tertiary mb-1">AI Generated (Flux/Replicate)</p>
              <div className="flex flex-wrap gap-2">
                {IMAGE_STYLES.filter(s => !('claude' in s) || !s.claude).map((style) => (
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
                    {style.label.replace('AI ', '')}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-tertiary mt-2 opacity-70">
              Brand designs use official Defi App colors (#5b8cff accent, #0b0d10 background). AI styles use external image models.
            </p>
          </div>

          {/* Reference Image (img2img) */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-tertiary">reference image (optional):</p>
              {referenceImage && (
                <button
                  onClick={clearReferenceImage}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  remove
                </button>
              )}
            </div>

            {referenceImage ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-elevated border border-violet-500/30">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <p className="text-[10px] text-white/80 text-center">starting point</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-white/5 hover:border-white/10 transition-colors text-xs text-tertiary hover:text-secondary"
                >
                  <Upload className="h-3.5 w-3.5" />
                  upload image
                </button>
                <span className="text-[10px] text-tertiary">or hover a generated image and click +</span>
              </div>
            )}
            <p className="text-[10px] text-tertiary mt-2 opacity-70">
              use a reference image to guide the style and composition of generated images
            </p>
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
                className="group relative aspect-square rounded-lg overflow-hidden bg-elevated cursor-pointer"
                onClick={() => setShowImageModal(img)}
              >
                {/* Loading placeholder */}
                {!imageLoadStates[index] && (
                  <div className="absolute inset-0 bg-elevated flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-tertiary animate-spin" />
                  </div>
                )}
                <img
                  src={img.imageUrl}
                  alt={`Generated ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-200",
                    imageLoadStates[index] ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => handleImageLoad(index)}
                />
                {/* Hover overlay - CSS-based hover for stability */}
                {imageLoadStates[index] && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(img.imageUrl, `defiapp-media-${index}`);
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReferenceImage(img.imageUrl);
                        addToast({
                          type: 'success',
                          title: 'Reference set',
                          description: 'This image will be used as a starting point',
                        });
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      title="Use as reference"
                    >
                      <ImagePlus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
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

      {/* Image Modal - Portal to isolate from parent re-renders */}
      {showImageModal && typeof document !== 'undefined' && createPortal(
        <ImageModal
          image={showImageModal}
          onClose={() => setShowImageModal(null)}
          onDownload={downloadImage}
          onRegenerate={(prompt) => {
            setShowImageModal(null);
            generateImage(prompt, -1);
          }}
          onCopyUrl={(url) => {
            navigator.clipboard.writeText(url);
            addToast({
              type: 'success',
              title: 'copied!',
              description: 'image url copied to clipboard',
            });
          }}
        />,
        document.body
      )}
    </PremiumCard>
  );
}

// Memoized modal component to prevent re-renders from parent
interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
  onRegenerate: (prompt: string) => void;
  onCopyUrl: (url: string) => void;
}

const ImageModal = React.memo(function ImageModal({
  image,
  onClose,
  onDownload,
  onRegenerate,
  onCopyUrl,
}: ImageModalProps) {
  // Prevent any mouse events from bubbling and causing parent re-renders
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      style={{ isolation: 'isolate' }}
    >
      <div
        className="relative max-w-2xl w-full bg-[#0a0a0a] rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image - completely static */}
        <div className="aspect-square bg-black">
          <img
            src={image.imageUrl}
            alt="Generated image"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">
            {image.prompt}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(image.imageUrl, 'defiapp-media')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-200"
            >
              <Download className="h-4 w-4" />
              download
            </button>
            <button
              onClick={() => onRegenerate(image.prompt)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
              regenerate
            </button>
            <button
              onClick={() => onCopyUrl(image.imageUrl)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20"
            >
              <Copy className="h-4 w-4" />
              copy url
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
