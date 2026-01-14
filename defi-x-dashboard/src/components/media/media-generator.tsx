'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
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
  ExternalLink,
  Download,
  Wand2,
  X,
  RefreshCw,
  Upload,
  Bot,
  Figma,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface MediaSuggestion {
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

interface FigmaTemplate {
  id: string;
  name: string;
  page: string;
  fileId: string;
  fileType: 'templates' | 'campaigns';
}

interface FigmaPage {
  name: string;
  templates: FigmaTemplate[];
}

interface MediaGeneratorProps {
  tweetContent: string;
  onPromptSelect?: (prompt: string) => void;
  onImageGenerated?: (imageUrl: string) => void;
  className?: string;
}

// Single AI suggestion style (simplified from multiple types)

// Style type for type safety
type StyleOption = {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
};

// Claude HTML Design Styles (on-brand, rendered locally)
const CLAUDE_STYLES: StyleOption[] = [
  { id: 'claude-dark', label: 'Dark', recommended: true, description: 'Dark bg, white text, blue accent' },
  { id: 'claude-gold', label: 'Gold', description: 'Dark bg, gold/amber accents' },
  { id: 'claude-green', label: 'Green', description: 'Dark bg, emerald/mint accents' },
  { id: 'claude-red', label: 'Red', description: 'Dark bg, red/coral accents' },
  { id: 'claude-blue', label: 'Blue', description: 'Dark bg, cyan/electric blue' },
  { id: 'claude-purple', label: 'Purple', description: 'Dark bg, violet/purple accents' },
  { id: 'claude-gradient', label: 'Gradient', description: 'Multi-color gradient background' },
  { id: 'claude-minimal', label: 'Minimal', description: 'Clean, lots of whitespace' },
  { id: 'claude-bold', label: 'Bold', description: 'Large typography, high contrast' },
  { id: 'claude-data', label: 'Data', description: 'Stats/metrics focused layout' },
];

// Flux/Replicate AI Styles (generated images)
const FLUX_STYLES: StyleOption[] = [
  { id: 'gradient-abstract', label: 'Gradient', recommended: true, description: 'Smooth color gradients' },
  { id: 'neon-tech', label: 'Neon', description: 'Cyberpunk neon lights' },
  { id: 'digital-art', label: 'Digital Art', description: 'Modern digital illustration' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean, simple shapes' },
  { id: 'data-viz', label: 'Data Viz', description: 'Charts/analytics aesthetic' },
  { id: 'cinematic', label: 'Cinematic', description: 'Movie poster style' },
  { id: 'futuristic', label: 'Futuristic', description: 'Sci-fi tech aesthetic' },
  { id: 'glassmorphism', label: 'Glass', description: 'Frosted glass effects' },
  { id: 'brutalist', label: 'Brutalist', description: 'Raw, bold, stark design' },
  { id: '3d-render', label: '3D Render', description: 'Rendered 3D objects' },
];

// Combined for backwards compatibility
const IMAGE_STYLES = [
  ...CLAUDE_STYLES.map(s => ({ ...s, claude: true })),
  ...FLUX_STYLES,
];

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
  const [editedPrompts, setEditedPrompts] = React.useState<Record<number, string>>({});

  // Edit Template section state (separate from design-from-scratch)
  const [editTemplateImage, setEditTemplateImage] = React.useState<string | null>(null);
  const [editTemplatePrompt, setEditTemplatePrompt] = React.useState<string>('');
  const [isEditingTemplate, setIsEditingTemplate] = React.useState(false);
  const [editModelChoice, setEditModelChoice] = React.useState<'claude' | 'gemini'>('claude');
  const editTemplateFileRef = React.useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Figma state
  const [figmaTemplates, setFigmaTemplates] = React.useState<FigmaPage[]>([]);
  const [figmaCampaigns, setFigmaCampaigns] = React.useState<FigmaPage[]>([]);
  const [isFigmaLoading, setIsFigmaLoading] = React.useState(false);
  const [figmaError, setFigmaError] = React.useState<string | null>(null);
  const [expandedPages, setExpandedPages] = React.useState<Set<string>>(new Set());
  const [selectedFigmaTemplate, setSelectedFigmaTemplate] = React.useState<FigmaTemplate | null>(null);
  const [figmaExporting, setFigmaExporting] = React.useState(false);
  const [showFigmaSection, setShowFigmaSection] = React.useState(false);
  const [figmaTab, setFigmaTab] = React.useState<'templates' | 'campaigns'>('templates');
  const [figmaThumbnails, setFigmaThumbnails] = React.useState<Record<string, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = React.useState<Set<string>>(new Set());
  const [figmaViewMode, setFigmaViewMode] = React.useState<'thumbnails' | 'list'>('thumbnails');

  // Get the prompt for a suggestion (edited or original)
  const getPrompt = (index: number, suggestion: MediaSuggestion) => {
    return editedPrompts[index] ?? suggestion.imagePrompt;
  };

  // Update edited prompt
  const updatePrompt = (index: number, value: string) => {
    setEditedPrompts(prev => ({ ...prev, [index]: value }));
  };

  // Handle edit template image upload
  const handleEditTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditTemplateImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear edit template image
  const clearEditTemplateImage = () => {
    setEditTemplateImage(null);
    setEditTemplatePrompt('');
    if (editTemplateFileRef.current) {
      editTemplateFileRef.current.value = '';
    }
  };

  // Generate edited template using canvas-based text replacement
  // Preserves original image quality, only replaces text
  const generateEditedTemplate = async () => {
    if (!editTemplateImage || !editTemplatePrompt.trim()) {
      addToast({
        type: 'error',
        title: 'Missing input',
        description: 'Upload an image and enter edit instructions',
      });
      return;
    }

    setIsEditingTemplate(true);

    try {
      // Validate image first
      const isValidImage = await validateImage(editTemplateImage);
      if (!isValidImage) {
        throw new Error('Invalid image format. Please upload a valid PNG, JPG, or WebP image.');
      }

      addToast({
        type: 'info',
        title: 'Compressing image...',
        description: 'Optimizing for API',
      });

      // Compress image before sending to API (fixes 413 Payload Too Large)
      let imageToSend = editTemplateImage;
      if (editTemplateImage.startsWith('data:image/')) {
        try {
          imageToSend = await compressImage(editTemplateImage, 1200, 0.85);
        } catch (compressError) {
          console.warn('Image compression failed, using original:', compressError);
        }
      }

      addToast({
        type: 'info',
        title: `Analyzing with ${editModelChoice === 'claude' ? 'Claude' : 'Gemini'}...`,
        description: 'Identifying text regions to edit',
      });

      // Choose API endpoint based on model
      const apiEndpoint = editModelChoice === 'gemini'
        ? '/api/media/edit-text-gemini'
        : '/api/media/edit-text';

      // Step 1: Get text regions to modify from AI
      let response;
      try {
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageToSend,
            instruction: editTemplatePrompt,
          }),
        });
      } catch (fetchError) {
        throw new Error('Network error - could not reach server');
      }

      if (!response.ok) {
        let errorMessage = 'Failed to analyze image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      if (!data.regions || data.regions.length === 0) {
        throw new Error('No text regions found to edit. Try a different instruction.');
      }

      console.log('Text regions to edit:', data.regions);

      addToast({
        type: 'info',
        title: 'Editing text...',
        description: `Replacing ${data.regions.length} text region(s)`,
      });

      // Step 2: Use canvas to edit the image
      const imageUrl = await editImageWithCanvas(editTemplateImage, data.regions);

      const newImage: GeneratedImage = {
        imageUrl,
        prompt: `Edit: ${editTemplatePrompt}`,
        style: `${editModelChoice}-edit`,
      };

      setGeneratedImages((prev) => [...prev, newImage]);
      setShowImageModal(newImage);

      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }

      addToast({
        type: 'success',
        title: 'Edit complete!',
        description: 'Text replaced successfully',
      });
    } catch (error) {
      console.error('Template edit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not edit template';
      addToast({
        type: 'error',
        title: 'Edit failed',
        description: errorMessage,
      });
    } finally {
      setIsEditingTemplate(false);
    }
  };

  // Validate image can be loaded
  const validateImage = (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if it's a valid base64 or URL
      if (!imageSrc) {
        resolve(false);
        return;
      }

      // For base64, check format
      if (imageSrc.startsWith('data:image/')) {
        const formatMatch = imageSrc.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/);
        if (!formatMatch) {
          resolve(false);
          return;
        }
        // For valid base64, try to load it
        const img = new window.Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = imageSrc;
        return;
      }

      // For HTTP URLs, trust the server-side API to handle them
      // (client-side loading may fail due to CORS, but server-side will work)
      if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
        resolve(true);
        return;
      }

      // Invalid format
      resolve(false);
    });
  };

  // Compress image to reduce size for API (fixes 413 Payload Too Large)
  const compressImage = (imageSrc: string, maxSize: number = 1200, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions (max 1200px on longest side)
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with compression (smaller than PNG)
          const compressed = canvas.toDataURL('image/jpeg', quality);
          console.log(`Image compressed: ${imageSrc.length} -> ${compressed.length} bytes (${Math.round((compressed.length / imageSrc.length) * 100)}%)`);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = imageSrc;
    });
  };

  // Canvas-based image editing - preserves original image, replaces text
  const editImageWithCanvas = async (
    imageSrc: string,
    regions: Array<{
      originalText: string;
      newText: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      fontWeight: string;
      color: string;
      backgroundColor: string;
      textAlign: 'left' | 'center' | 'right';
      letterSpacing?: number;
      textTransform?: 'uppercase' | 'lowercase' | 'none';
    }>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      // Only set crossOrigin for HTTP URLs, not for data URLs (base64)
      // Setting crossOrigin on data URLs can cause loading issues
      if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;

          console.log('Canvas created:', canvas.width, 'x', canvas.height);

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Process each text region
          for (const region of regions) {
            // Convert percentages to pixels
            const x = (region.x / 100) * canvas.width;
            const y = (region.y / 100) * canvas.height;
            const width = (region.width / 100) * canvas.width;
            const height = (region.height / 100) * canvas.height;

            // Scale font size based on actual image dimensions
            const scaleFactor = canvas.width / 1024;
            const fontSize = region.fontSize * scaleFactor;

            // Paint over original text with background color
            ctx.fillStyle = region.backgroundColor;
            ctx.fillRect(x, y, width, height);

            // Set up text styling
            ctx.fillStyle = region.color;
            // Use simpler font string for better browser compatibility
            const fontWeight = region.fontWeight === '900' || region.fontWeight === 'bold' ? 'bold' : 'normal';
            ctx.font = `${fontWeight} ${Math.round(fontSize)}px sans-serif`;
            ctx.textBaseline = 'middle';

            // Apply text transform
            let text = region.newText;
            if (region.textTransform === 'uppercase') {
              text = text.toUpperCase();
            } else if (region.textTransform === 'lowercase') {
              text = text.toLowerCase();
            }

            // Calculate text position based on alignment
            // Add small padding from left edge for left-aligned text
            const textPadding = 15 * scaleFactor;
            let textX = x + (region.textAlign === 'left' ? textPadding : 0);
            if (region.textAlign === 'center') {
              ctx.textAlign = 'center';
              textX = x + width / 2;
            } else if (region.textAlign === 'right') {
              ctx.textAlign = 'right';
              textX = x + width - textPadding;
            } else {
              ctx.textAlign = 'left';
            }

            const textY = y + height / 2;

            // Draw text
            ctx.fillText(text, textX, textY);
          }

          // Export as PNG
          const result = canvas.toDataURL('image/png', 1.0);
          console.log('Canvas export successful, length:', result.length);
          resolve(result);
        } catch (canvasError) {
          console.error('Canvas operation error:', canvasError);
          reject(new Error('Failed to edit image: ' + (canvasError instanceof Error ? canvasError.message : 'Unknown error')));
        }
      };

      img.onerror = (e) => {
        console.error('Image load error:', e);
        reject(new Error('Failed to load image for editing. Please try uploading again.'));
      };

      // Set src after event handlers are attached
      img.src = imageSrc;
    });
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

  // Render HTML to image - direct DOM approach with fixed dimensions
  const renderHtmlToImage = async (html: string): Promise<string> => {
    // Create an off-screen container with exact dimensions
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 1024px;
      height: 1024px;
      overflow: hidden;
      background: #000;
      z-index: -1;
    `;

    // Create a wrapper div with fixed dimensions that we'll capture
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: 1024px;
      height: 1024px;
      position: relative;
      overflow: hidden;
      background: #000;
    `;

    // Parse HTML and inject content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract and inject styles
    const styleEl = document.createElement('style');
    const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join('\n');
    styleEl.textContent = styles;
    wrapper.appendChild(styleEl);

    // Get body content and inject it
    const content = doc.body.innerHTML;
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      width: 1024px;
      height: 1024px;
      position: relative;
    `;
    contentDiv.innerHTML = content;
    wrapper.appendChild(contentDiv);

    container.appendChild(wrapper);
    document.body.appendChild(container);

    try {
      // Wait for any fonts/styles to apply
      await new Promise(r => setTimeout(r, 300));

      console.log('Capturing element:', wrapper.offsetWidth, 'x', wrapper.offsetHeight);

      // Capture the wrapper with fixed dimensions
      const dataUrl = await toPng(wrapper, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#000',
        cacheBust: true,
        width: 1024,
        height: 1024,
        style: {
          transform: 'none',
        },
      });

      console.log('Capture successful, URL length:', dataUrl.length);
      return dataUrl;
    } catch (err) {
      console.error('toPng error:', err);
      throw err;
    } finally {
      document.body.removeChild(container);
    }
  };

  // Generate actual image from prompt (Design from scratch - no reference image)
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
          style: `claude-${claudeStyle}`,
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
        // Use Flux/Replicate AI image generation
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

  // Fetch Figma templates
  const fetchFigmaTemplates = async () => {
    setIsFigmaLoading(true);
    setFigmaError(null);

    try {
      const response = await fetch('/api/figma/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch Figma templates');
      }
      const data = await response.json();
      setFigmaTemplates(data.templates || []);
      setFigmaCampaigns(data.campaigns || []);

      // Auto-expand first page with content
      if (data.templates?.length > 0 && data.templates[0].templates.length > 0) {
        setExpandedPages(new Set([`templates-${data.templates[0].name}`]));
      }
    } catch (error) {
      console.error('Figma templates error:', error);
      setFigmaError(String(error));
      addToast({
        type: 'error',
        title: 'Failed to load Figma templates',
        description: 'Check your Figma API configuration',
      });
    } finally {
      setIsFigmaLoading(false);
    }
  };

  // Fetch thumbnails for a page
  const fetchThumbnailsForPage = async (page: FigmaPage, fileId: string) => {
    const pageKey = `${page.name}-${fileId}`;

    // Skip if already loading or already have thumbnails for most templates
    if (loadingThumbnails.has(pageKey)) return;

    const missingThumbnails = page.templates.filter(t => !figmaThumbnails[t.id]);
    if (missingThumbnails.length === 0) return;

    setLoadingThumbnails(prev => new Set(prev).add(pageKey));

    try {
      const nodeIds = missingThumbnails.map(t => t.id);
      const response = await fetch('/api/figma/thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, nodeIds }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnails) {
          setFigmaThumbnails(prev => ({ ...prev, ...data.thumbnails }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch thumbnails:', error);
    } finally {
      setLoadingThumbnails(prev => {
        const next = new Set(prev);
        next.delete(pageKey);
        return next;
      });
    }
  };

  // Toggle page expansion and fetch thumbnails
  const togglePageExpansion = (pageKey: string, page?: FigmaPage, fileId?: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else {
        next.add(pageKey);
        // Fetch thumbnails when expanding
        if (page && fileId) {
          fetchThumbnailsForPage(page, fileId);
        }
      }
      return next;
    });
  };

  // Export Figma template (download)
  const exportFigmaTemplate = async (template: FigmaTemplate) => {
    setFigmaExporting(true);
    setSelectedFigmaTemplate(template);

    try {
      const response = await fetch(
        `/api/figma/export?fileId=${template.fileId}&nodeId=${encodeURIComponent(template.id)}&scale=2&format=png`
      );

      if (!response.ok) {
        throw new Error('Failed to export Figma template');
      }

      const data = await response.json();

      if (data.imageUrl) {
        // Add to generated images gallery
        const newImage: GeneratedImage = {
          imageUrl: data.imageUrl,
          prompt: `Figma: ${template.name}`,
          style: 'figma',
        };
        setGeneratedImages(prev => [...prev, newImage]);

        addToast({
          type: 'success',
          title: 'Template exported!',
          description: `${template.name} added to gallery`,
        });
      }
    } catch (error) {
      console.error('Figma export error:', error);
      addToast({
        type: 'error',
        title: 'Export failed',
        description: 'Could not export template',
      });
    } finally {
      setFigmaExporting(false);
      setSelectedFigmaTemplate(null);
    }
  };

  // Convert URL to base64 (for CORS-protected URLs like Figma CDN)
  const urlToBase64 = async (url: string): Promise<string> => {
    // Fetch the image through our API proxy to avoid CORS
    const response = await fetch('/api/media/proxy-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to load image');
    }

    const data = await response.json();
    return data.base64;
  };

  // Use Figma template for AI editing (loads into Edit Template section)
  const useFigmaAsReference = async (template: FigmaTemplate) => {
    setFigmaExporting(true);
    setSelectedFigmaTemplate(template);

    try {
      const response = await fetch(
        `/api/figma/export?fileId=${template.fileId}&nodeId=${encodeURIComponent(template.id)}&scale=2&format=png`
      );

      if (!response.ok) {
        throw new Error('Failed to export Figma template');
      }

      const data = await response.json();

      if (data.imageUrl) {
        addToast({
          type: 'info',
          title: 'Loading template...',
          description: 'Converting image for AI editing',
        });

        // Convert URL to base64 to avoid CORS issues
        const base64Image = await urlToBase64(data.imageUrl);

        // Set as edit template image (not the old referenceImage)
        setEditTemplateImage(base64Image);
        // Pre-fill a helpful prompt
        setEditTemplatePrompt(`Edit this ${template.name} template: `);

        addToast({
          type: 'success',
          title: 'Template loaded!',
          description: 'Add your edit instructions below',
        });
      }
    } catch (error) {
      console.error('Figma export error:', error);
      addToast({
        type: 'error',
        title: 'Failed to load template',
        description: 'Could not load template',
      });
    } finally {
      setFigmaExporting(false);
      setSelectedFigmaTemplate(null);
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
          {/* Single AI Suggestion - simplified from multiple types */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg border bg-elevated border-white/5"
          >
            <div className="flex items-start gap-3">
              {/* AI Icon */}
              <div className="p-2 rounded-lg text-violet-400 bg-violet-500/10">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary">AI Suggestion</span>
                  <button
                    onClick={() => copyPrompt(suggestions[0].imagePrompt, 0)}
                    className="text-tertiary hover:text-secondary transition-colors"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary mb-2">{suggestions[0].description}</p>

                {/* Reasoning */}
                <p className="text-xs text-tertiary italic mb-3">
                  {suggestions[0].reasoning}
                </p>

                {/* Editable Prompt */}
                <div>
                  <label className="text-[10px] text-tertiary mb-1 block">Image prompt (editable):</label>
                  <textarea
                    value={getPrompt(0, suggestions[0])}
                    onChange={(e) => updatePrompt(0, e.target.value)}
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
                      isGeneratingImage && generatingIndex === 0 ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3" />
                      )
                    }
                    onClick={() => generateImage(getPrompt(0, suggestions[0]), 0)}
                    disabled={isGeneratingImage}
                    className="flex-1"
                  >
                    {isGeneratingImage && generatingIndex === 0
                      ? 'generating...'
                      : 'Generate Image'}
                  </PremiumButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Style Selector - Design from Scratch */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs font-medium text-primary mb-3">Design from Scratch</p>

            {/* Claude HTML Styles */}
            <div className="mb-4">
              <p className="text-[10px] text-emerald-400 mb-2 flex items-center gap-1">
                <Bot className="h-3 w-3" /> Claude HTML (on-brand, rendered locally)
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {CLAUDE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'px-2 py-1.5 rounded text-[11px] font-medium transition-colors relative text-center',
                      selectedStyle === style.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-elevated text-tertiary hover:text-secondary border border-white/5'
                    )}
                    title={style.description}
                  >
                    {style.label}
                    {style.recommended && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Flux/Replicate AI Styles */}
            <div>
              <p className="text-[10px] text-violet-400 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Flux AI (generated images)
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {FLUX_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'px-2 py-1.5 rounded text-[11px] font-medium transition-colors relative text-center',
                      selectedStyle === style.id
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-elevated text-tertiary hover:text-secondary border border-white/5'
                    )}
                    title={style.description}
                  >
                    {style.label}
                    {style.recommended && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500" />
                    )}
                  </button>
                ))}
              </div>
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
                        setEditTemplateImage(img.imageUrl);
                        setEditTemplatePrompt('Edit this image: ');
                        addToast({
                          type: 'success',
                          title: 'Template loaded',
                          description: 'Add edit instructions in the Edit Template section',
                        });
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      title="Edit with AI"
                    >
                      <Wand2 className="h-4 w-4 text-white" />
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
