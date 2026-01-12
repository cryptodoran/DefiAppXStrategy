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

// US-009: X Article Generator

interface ArticleSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'image';
  content: string;
}

const mockGeneratedArticle: ArticleSection[] = [
  { id: '1', type: 'heading', content: 'The Future of DeFi: Why 2026 Will Be Different' },
  { id: '2', type: 'paragraph', content: 'The DeFi landscape has undergone a remarkable transformation over the past two years. What was once dismissed as "dead" has quietly evolved into something far more robust and sustainable. This article explores why the next wave of DeFi will look fundamentally different from what came before.' },
  { id: '3', type: 'heading', content: 'The Problem With DeFi 1.0' },
  { id: '4', type: 'paragraph', content: 'The first generation of DeFi protocols suffered from several critical flaws: unsustainable yield mechanics, poor user experience, and a lack of real utility beyond speculation. These issues led to the infamous "DeFi winter" that caused many to write off the entire sector.' },
  { id: '5', type: 'list', content: '• Unsustainable token emissions\n• Complex interfaces that alienated mainstream users\n• Security vulnerabilities and frequent exploits\n• Lack of regulatory clarity' },
  { id: '6', type: 'heading', content: 'What\'s Different Now' },
  { id: '7', type: 'paragraph', content: 'Defi App represents the new generation of protocols that have learned from past mistakes. By focusing on real utility, sustainable economics, and user-friendly interfaces, we\'re building infrastructure that can actually scale to mainstream adoption.' },
  { id: '8', type: 'quote', content: '"The protocols that survive won\'t be the ones with the highest yields, but the ones that solve real problems." - Defi App Team' },
  { id: '9', type: 'heading', content: 'Conclusion' },
  { id: '10', type: 'paragraph', content: 'The future of DeFi is not about recreating the hype cycles of the past. It\'s about building genuine financial infrastructure that serves real needs. Defi App is committed to being at the forefront of this transformation.' },
];

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setArticle(mockGeneratedArticle);
      setPromotionalTweet(`NEW ARTICLE: The Future of DeFi - Why 2026 Will Be Different\n\nWhat we learned from DeFi 1.0, and why the next wave will be fundamentally different.\n\nFull breakdown inside. 👇`);
      setIsGenerating(false);
    }, 3000);
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
                    <Button size="sm">
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
  );
}
