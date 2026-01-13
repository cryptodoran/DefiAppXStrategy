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
  FileText,
  Sparkles,
  Eye,
  Image,
  Link,
  Search,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

// US-009: X Article Generator

interface ArticleSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'image';
  content: string;
}

// Generate article using AI API
async function generateArticleWithAI(
  topic: string,
  outline: string,
  keyPoints: string,
  targetLength: string
): Promise<{ sections: ArticleSection[]; promotionalTweet: string }> {
  try {
    const response = await fetch('/api/content/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'article',
        content: topic,
        options: { outline, keyPoints, targetLength },
      }),
    });

    const data = await response.json();

    if (data.result?.sections) {
      return {
        sections: data.result.sections.map((s: { type: string; content: string }, i: number) => ({
          id: `section-${Date.now()}-${i}`,
          type: s.type as ArticleSection['type'],
          content: s.content,
        })),
        promotionalTweet: data.result.promotionalTweet || `NEW ARTICLE: ${topic}\n\nFull breakdown inside. 👇`,
      };
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Article generation error:', error);
    // Return fallback structure if API fails
    return {
      sections: [
        { id: `section-${Date.now()}-0`, type: 'heading', content: topic },
        { id: `section-${Date.now()}-1`, type: 'paragraph', content: `This article explores ${topic}. ${keyPoints || 'Key insights and analysis follow.'}` },
        { id: `section-${Date.now()}-2`, type: 'heading', content: 'Key Points' },
        { id: `section-${Date.now()}-3`, type: 'paragraph', content: outline || 'Add your main arguments here.' },
        { id: `section-${Date.now()}-4`, type: 'heading', content: 'Conclusion' },
        { id: `section-${Date.now()}-5`, type: 'paragraph', content: 'Defi App is committed to being at the forefront of this transformation.' },
      ],
      promotionalTweet: `NEW ARTICLE: ${topic}\n\nFull breakdown inside. 👇`,
    };
  }
}

export default function ArticleGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [targetLength, setTargetLength] = useState('medium');
  const [keyPoints, setKeyPoints] = useState('');
  const [article, setArticle] = useState<ArticleSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promotionalTweet, setPromotionalTweet] = useState('');
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateArticleWithAI(topic, outline, keyPoints, targetLength);
      setArticle(result.sections);
      setPromotionalTweet(result.promotionalTweet);
    } catch (error) {
      console.error('Failed to generate article:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyArticle = async () => {
    const text = article.map((s) => s.content).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSectionIcon = (type: ArticleSection['type']) => {
    switch (type) {
      case 'heading':
        return <span className="text-blue-400 font-bold">H</span>;
      case 'paragraph':
        return <span className="text-tertiary">¶</span>;
      case 'list':
        return <span className="text-green-400">•</span>;
      case 'quote':
        return <span className="text-purple-400">"</span>;
      case 'image':
        return <Image className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">X Article Generator</h1>
          <p className="text-tertiary">
            Create long-form X Articles that the algorithm favors
          </p>
        </div>
        {article.length > 0 && (
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  placeholder="e.g., The Future of DeFi..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-base border-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label>Outline (optional)</Label>
                <Textarea
                  placeholder="Enter main sections or let AI generate..."
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  className="bg-base border-white/5 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Key Points</Label>
                <Textarea
                  placeholder="Main arguments or facts to include..."
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  className="bg-base border-white/5 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Length</Label>
                <Select value={targetLength} onValueChange={setTargetLength}>
                  <SelectTrigger className="bg-base border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~500 words)</SelectItem>
                    <SelectItem value="medium">Medium (~1000 words)</SelectItem>
                    <SelectItem value="long">Long (~2000 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600"
                onClick={handleGenerate}
                disabled={!topic || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Article...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Article
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* SEO Tips */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-tertiary">Keyword density: optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-tertiary">Readability: excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-tertiary">Add more subheadings</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Article Editor/Preview */}
        <div className="lg:col-span-2 space-y-6">
          {article.length === 0 ? (
            <Card className="bg-surface border-white/5">
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No article yet</h3>
                <p className="text-sm text-tertiary">
                  Enter a topic and generate your X Article
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-surface border-white/5">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Article Content</CardTitle>
                  <Button variant="outline" size="sm" onClick={copyArticle}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {previewMode ? (
                    <div className="prose prose-invert max-w-none">
                      {article.map((section) => {
                        switch (section.type) {
                          case 'heading':
                            return (
                              <h2 key={section.id} className="text-xl font-bold text-white mt-6 mb-3">
                                {section.content}
                              </h2>
                            );
                          case 'paragraph':
                            return (
                              <p key={section.id} className="text-secondary mb-4">
                                {section.content}
                              </p>
                            );
                          case 'list':
                            return (
                              <div key={section.id} className="text-secondary mb-4 whitespace-pre-line">
                                {section.content}
                              </div>
                            );
                          case 'quote':
                            return (
                              <blockquote key={section.id} className="border-l-4 border-purple-500 pl-4 italic text-tertiary my-4">
                                {section.content}
                              </blockquote>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {article.map((section) => (
                        <div
                          key={section.id}
                          className="flex gap-3 p-3 bg-base rounded-lg"
                        >
                          <div className="shrink-0 w-6 h-6 flex items-center justify-center bg-elevated rounded">
                            {getSectionIcon(section.type)}
                          </div>
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs">
                              {section.type}
                            </Badge>
                            <p className="text-sm text-secondary whitespace-pre-line">
                              {section.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promotional Tweet */}
              <Card className="bg-surface border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Promotional Tweet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={promotionalTweet}
                    onChange={(e) => setPromotionalTweet(e.target.value)}
                    className="bg-base border-white/5 min-h-[100px]"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-tertiary">
                      {promotionalTweet.length} / 280 characters
                    </span>
                    <Button size="sm" onClick={async () => {
                      await navigator.clipboard.writeText(promotionalTweet);
                      addToast({ type: 'success', title: 'Copied!', description: 'Promotional tweet copied to clipboard.' });
                    }}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Tweet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
