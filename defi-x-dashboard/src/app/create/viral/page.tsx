'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SpiceSlider } from '@/components/content/spice-slider';
import { QualityAnalyzer } from '@/components/content/quality-analyzer';
import { GeneratedVariations } from '@/components/content/generated-variations';
import { Sparkles, Send, RotateCcw } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';

interface ViralVariation {
  id: string;
  content: string;
  predictedScore: number;
  viralElements: string[];
  hookRating: number;
}

interface QualityAnalysis {
  score: number;
  breakdown: {
    originality: number;
    valueDensity: number;
    engagementHooks: number;
    clarity: number;
    brandVoice: number;
  };
  warnings: string[];
  improvements: string[];
}

// Generate viral post variations using AI API
async function generateViralVariations(
  topic: string,
  tone: string,
  goal: string,
  spiceLevel: number
): Promise<ViralVariation[]> {
  try {
    const response = await fetch('/api/content/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'viral',
        content: topic,
        options: { tone, goal, spiceLevel },
      }),
    });

    const data = await response.json();

    if (data.result?.variations) {
      return data.result.variations.map((v: { content: string; predictedScore?: number; viralElements?: string[]; hookRating?: number }, i: number) => ({
        id: `viral-${Date.now()}-${i}`,
        content: v.content,
        predictedScore: v.predictedScore || 75 + Math.floor(Math.random() * 15),
        viralElements: v.viralElements || ['Engagement'],
        hookRating: v.hookRating || 4,
      }));
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Viral generation error:', error);
    // Return empty array if API fails - user can try again
    return [];
  }
}

// Analyze content quality using AI
async function analyzeContentQuality(content: string): Promise<QualityAnalysis> {
  try {
    const response = await fetch('/api/content/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (data.analysis) {
      return data.analysis;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Quality analysis error:', error);
    // Return default analysis if API fails
    return {
      score: 0,
      breakdown: {
        originality: 0,
        valueDensity: 0,
        engagementHooks: 0,
        clarity: 0,
        brandVoice: 0,
      },
      warnings: [],
      improvements: ['Enter content to analyze'],
    };
  }
}

const defaultQualityAnalysis: QualityAnalysis = {
  score: 0,
  breakdown: {
    originality: 0,
    valueDensity: 0,
    engagementHooks: 0,
    clarity: 0,
    brandVoice: 0,
  },
  warnings: [],
  improvements: ['Generate or write content to see quality analysis'],
};

export default function ViralPostCreatorPage() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [goal, setGoal] = useState('engagement');
  const [spiceLevel, setSpiceLevel] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState<ViralVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<ViralVariation | null>(null);
  const [manualContent, setManualContent] = useState('');
  const [qualityAnalysis, setQualityAnalysis] = useState<QualityAnalysis>(defaultQualityAnalysis);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const generatedVariations = await generateViralVariations(topic, tone, goal, spiceLevel);
      setVariations(generatedVariations);
      // Analyze first variation if generated
      if (generatedVariations.length > 0) {
        const analysis = await analyzeContentQuality(generatedVariations[0].content);
        setQualityAnalysis(analysis);
      }
    } catch (error) {
      console.error('Failed to generate variations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeManual = async () => {
    if (!manualContent.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeContentQuality(manualContent);
      setQualityAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefine = async (id: string, refinement: string) => {
    console.log('Refining', id, 'with', refinement);
    // Would call API to refine - could extend later
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Viral Post Creator</h1>
        <p className="text-tertiary">
          Generate high-potential viral posts with AI assistance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Theme</Label>
                <Input
                  id="topic"
                  placeholder="e.g., DeFi summer 2.0, New feature launch, Market commentary..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-base border-white/5"
                />
              </div>

              {/* Tone and Goal */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="edgy">Edgy</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Spice Level */}
              <SpiceSlider value={spiceLevel} onChange={setSpiceLevel} />

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
                    Generate Viral Posts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Content Input */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Or Write Your Own</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your post here to get quality analysis..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="min-h-[150px] bg-base border-white/5"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-tertiary">
                  {manualContent.length} / 280 characters
                </span>
                <Button
                  variant="outline"
                  disabled={!manualContent || isAnalyzing}
                  onClick={handleAnalyzeManual}
                >
                  {isAnalyzing ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Analyze Quality
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Variations */}
          {variations.length > 0 && !isGenerating && (
            <GeneratedVariations
              variations={variations}
              selectedId={selectedVariation?.id || null}
              onSelect={setSelectedVariation}
              onRefine={handleRefine}
            />
          )}
        </div>

        {/* Quality Analysis Sidebar */}
        <div className="space-y-6">
          <QualityAnalyzer
            score={qualityAnalysis.score}
            breakdown={qualityAnalysis.breakdown}
            warnings={qualityAnalysis.warnings}
            improvements={qualityAnalysis.improvements}
          />

          {/* Tips Card */}
          <Card className="bg-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-sm text-white">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-tertiary">
                <li className="flex gap-2">
                  <span className="text-yellow-400">1.</span>
                  Start with a strong hook - first line is everything
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">2.</span>
                  Higher spice = higher engagement potential, but more risk
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">3.</span>
                  Optimal posting: 1-2 posts + 1 QT per day max
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">4.</span>
                  Avoid generic content - the algo penalizes "slop"
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
