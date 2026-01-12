import { create } from 'zustand';
import type { PostType, GeneratedContent, QualityAnalysis } from '@/types';

interface ContentState {
  // Current content being created
  currentContent: string;
  contentType: PostType;
  topic: string;
  tone: 'professional' | 'casual' | 'edgy' | 'educational' | 'humorous';
  goal: 'engagement' | 'growth' | 'awareness';
  spiceLevel: number;
  keyPoints: string[];

  // Generated content
  generatedVariations: GeneratedContent[];
  selectedVariation: GeneratedContent | null;

  // Quality analysis
  qualityAnalysis: QualityAnalysis | null;

  // Thread specific
  threadPosts: string[];

  // UI state
  isGenerating: boolean;
  isAnalyzing: boolean;
  previewMode: boolean;

  // Actions
  setCurrentContent: (content: string) => void;
  setContentType: (type: PostType) => void;
  setTopic: (topic: string) => void;
  setTone: (tone: ContentState['tone']) => void;
  setGoal: (goal: ContentState['goal']) => void;
  setSpiceLevel: (level: number) => void;
  setKeyPoints: (points: string[]) => void;
  addKeyPoint: (point: string) => void;
  removeKeyPoint: (index: number) => void;
  setGeneratedVariations: (variations: GeneratedContent[]) => void;
  selectVariation: (variation: GeneratedContent | null) => void;
  setQualityAnalysis: (analysis: QualityAnalysis | null) => void;
  setThreadPosts: (posts: string[]) => void;
  addThreadPost: (post: string) => void;
  updateThreadPost: (index: number, content: string) => void;
  removeThreadPost: (index: number) => void;
  reorderThreadPosts: (fromIndex: number, toIndex: number) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  resetContent: () => void;
}

const initialState = {
  currentContent: '',
  contentType: 'SINGLE' as PostType,
  topic: '',
  tone: 'professional' as const,
  goal: 'engagement' as const,
  spiceLevel: 5,
  keyPoints: [],
  generatedVariations: [],
  selectedVariation: null,
  qualityAnalysis: null,
  threadPosts: [],
  isGenerating: false,
  isAnalyzing: false,
  previewMode: false,
};

export const useContentStore = create<ContentState>((set) => ({
  ...initialState,

  setCurrentContent: (content) => set({ currentContent: content }),
  setContentType: (type) => set({ contentType: type }),
  setTopic: (topic) => set({ topic }),
  setTone: (tone) => set({ tone }),
  setGoal: (goal) => set({ goal }),
  setSpiceLevel: (level) => set({ spiceLevel: Math.max(1, Math.min(10, level)) }),
  setKeyPoints: (points) => set({ keyPoints: points }),

  addKeyPoint: (point) => set((state) => ({
    keyPoints: [...state.keyPoints, point],
  })),

  removeKeyPoint: (index) => set((state) => ({
    keyPoints: state.keyPoints.filter((_, i) => i !== index),
  })),

  setGeneratedVariations: (variations) => set({ generatedVariations: variations }),
  selectVariation: (variation) => set({ selectedVariation: variation }),
  setQualityAnalysis: (analysis) => set({ qualityAnalysis: analysis }),
  setThreadPosts: (posts) => set({ threadPosts: posts }),

  addThreadPost: (post) => set((state) => ({
    threadPosts: [...state.threadPosts, post],
  })),

  updateThreadPost: (index, content) => set((state) => ({
    threadPosts: state.threadPosts.map((p, i) => (i === index ? content : p)),
  })),

  removeThreadPost: (index) => set((state) => ({
    threadPosts: state.threadPosts.filter((_, i) => i !== index),
  })),

  reorderThreadPosts: (fromIndex, toIndex) => set((state) => {
    const posts = [...state.threadPosts];
    const [removed] = posts.splice(fromIndex, 1);
    posts.splice(toIndex, 0, removed);
    return { threadPosts: posts };
  }),

  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setPreviewMode: (preview) => set({ previewMode: preview }),
  resetContent: () => set(initialState),
}));
