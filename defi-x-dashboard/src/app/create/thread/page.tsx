'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Edit,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

interface ThreadPost {
  id: string;
  content: string;
  isHook: boolean;
  isCTA: boolean;
  engagementHook: boolean;
}

// Generate thread using AI API
async function generateThreadWithAI(topic: string, keyPoints: string[], length: number): Promise<ThreadPost[]> {
  try {
    const response = await fetch('/api/content/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'thread',
        content: topic,
        options: { keyPoints: keyPoints.filter(p => p.trim()), length }
      }),
    });

    const data = await response.json();

    if (data.result && Array.isArray(data.result)) {
      return data.result.map((post: { content: string; isHook?: boolean; isCTA?: boolean }, i: number) => ({
        id: `thread-${Date.now()}-${i}`,
        content: post.content,
        isHook: i === 0,
        isCTA: i === data.result.length - 1,
        engagementHook: post.isHook || post.isCTA || false,
      }));
    }

    // If result is not in expected format, create posts from text
    if (data.result?.enhanced) {
      const posts = data.result.enhanced.split('\n\n---\n\n').filter((p: string) => p.trim());
      return posts.map((content: string, i: number) => ({
        id: `thread-${Date.now()}-${i}`,
        content: content.trim(),
        isHook: i === 0,
        isCTA: i === posts.length - 1,
        engagementHook: i === 0 || i === posts.length - 1,
      }));
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Thread generation error:', error);
    // Return a starter thread if API fails
    return [
      {
        id: `thread-${Date.now()}-0`,
        content: `${topic}\n\nHere's what you need to know:\n\n🧵`,
        isHook: true,
        isCTA: false,
        engagementHook: true,
      },
      ...keyPoints.filter(p => p.trim()).map((point, i) => ({
        id: `thread-${Date.now()}-${i + 1}`,
        content: point,
        isHook: false,
        isCTA: false,
        engagementHook: false,
      })),
      {
        id: `thread-${Date.now()}-final`,
        content: `That's it!\n\nLike + RT if this helped.\n\nFollow @DefiApp for more.`,
        isHook: false,
        isCTA: true,
        engagementHook: true,
      },
    ];
  }
}

export default function ThreadBuilderPage() {
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);
  const [targetLength, setTargetLength] = useState('5');
  const [thread, setThread] = useState<ThreadPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, '']);
  };

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const generatedThread = await generateThreadWithAI(
        topic,
        keyPoints,
        parseInt(targetLength)
      );
      setThread(generatedThread);
    } catch (error) {
      console.error('Failed to generate thread:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateThreadPost = (id: string, content: string) => {
    setThread(thread.map((post) => (post.id === id ? { ...post, content } : post)));
  };

  const removeThreadPost = (id: string) => {
    setThread(thread.filter((post) => post.id !== id));
  };

  const addThreadPost = (afterId: string) => {
    const index = thread.findIndex((post) => post.id === afterId);
    const newPost: ThreadPost = {
      id: `new-${Date.now()}`,
      content: '',
      isHook: false,
      isCTA: false,
      engagementHook: false,
    };
    const updated = [...thread];
    updated.splice(index + 1, 0, newPost);
    setThread(updated);
    setEditingId(newPost.id);
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thread Builder</h1>
          <p className="text-tertiary">
            Create high-quality threads that the algorithm loves
          </p>
        </div>
        {thread.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Thread Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Why DeFi 2.0 will be massive..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-base border-white/5"
                />
              </div>

              {/* Key Points */}
              <div className="space-y-2">
                <Label>Key Points</Label>
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Point ${index + 1}...`}
                      value={point}
                      onChange={(e) => updateKeyPoint(index, e.target.value)}
                      className="bg-base border-white/5"
                    />
                    {keyPoints.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <Trash2 className="h-4 w-4 text-tertiary" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addKeyPoint}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Point
                </Button>
              </div>

              {/* Target Length */}
              <div className="space-y-2">
                <Label>Thread Length</Label>
                <Select value={targetLength} onValueChange={setTargetLength}>
                  <SelectTrigger className="bg-base border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 tweets (Short)</SelectItem>
                    <SelectItem value="8">8 tweets (Medium)</SelectItem>
                    <SelectItem value="12">12 tweets (Long)</SelectItem>
                    <SelectItem value="15">15 tweets (Epic)</SelectItem>
                    <SelectItem value="20">20+ tweets (Mega)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500"
                onClick={handleGenerate}
                disabled={!topic || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Thread
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white">Thread Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-tertiary">
                <li className="flex gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                  Threads with 5+ tweets get algorithmic boost
                </li>
                <li className="flex gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                  Each tweet should stand alone for engagement
                </li>
                <li className="flex gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                  Place engagement hooks every 3-4 tweets
                </li>
                <li className="flex gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
                  End with a clear CTA (like, RT, follow)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Thread Editor */}
        <div className="lg:col-span-2">
          {thread.length === 0 && !isGenerating ? (
            <Card className="bg-surface border-white/5">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-elevated flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-tertiary" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No thread yet
                </h3>
                <p className="text-sm text-tertiary text-center max-w-md">
                  Enter a topic and key points, then click generate to create your thread
                </p>
              </CardContent>
            </Card>
          ) : isGenerating ? (
            <Card className="bg-surface border-white/5">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
                <p className="mt-4 text-tertiary">Generating your thread...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {thread.map((post, index) => (
                <Card
                  key={post.id}
                  className={cn(
                    'bg-surface border-white/5 transition-all',
                    editingId === post.id && 'ring-2 ring-blue-500'
                  )}
                >
                  <CardContent className="pt-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-elevated">
                          <GripVertical className="h-3 w-3 text-tertiary" />
                        </div>
                        <span className="text-sm font-medium text-tertiary">
                          {index + 1} / {thread.length}
                        </span>
                        {post.isHook && (
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            Hook
                          </Badge>
                        )}
                        {post.isCTA && (
                          <Badge className="bg-green-500/20 text-green-400">
                            CTA
                          </Badge>
                        )}
                        {post.engagementHook && !post.isHook && !post.isCTA && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            Engagement Hook
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingId(editingId === post.id ? null : post.id)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addThreadPost(post.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {thread.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeThreadPost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {editingId === post.id ? (
                      <Textarea
                        value={post.content}
                        onChange={(e) => updateThreadPost(post.id, e.target.value)}
                        className="min-h-[120px] bg-base border-white/5"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-secondary whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}

                    {/* Character count */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <span
                        className={cn(
                          'text-xs',
                          post.content.length > 280
                            ? 'text-red-400'
                            : 'text-tertiary'
                        )}
                      >
                        {post.content.length} / 280
                      </span>
                      {previewMode && (
                        <div className="text-xs text-tertiary">
                          Preview mode
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
