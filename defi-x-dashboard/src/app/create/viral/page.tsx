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

// Mock generated variations
const mockVariations = [
  {
    id: '1',
    content: "DeFi isn't dead. It's evolving.\n\nWhile CT argues about memecoins, we've been quietly building the infrastructure for DeFi 2.0.\n\nHere's what most people miss about where this is all heading...",
    predictedScore: 87,
    viralElements: ['FOMO', 'Educational', 'Tribal'],
    hookRating: 5,
  },
  {
    id: '2',
    content: "Hot take: 90% of \"DeFi protocols\" will be obsolete in 2 years.\n\nThe ones that survive? They're solving real problems, not chasing TVL.\n\nDeFi App is built different. Let me explain why...",
    predictedScore: 82,
    viralElements: ['Controversy', 'FOMO', 'Educational'],
    hookRating: 4,
  },
  {
    id: '3',
    content: "Everyone's talking about the next bull run.\n\nBut here's what separates winners from losers in DeFi:\n\nIt's not about timing the market. It's about using the right tools.\n\n(A thread on how DeFi App changes the game)",
    predictedScore: 79,
    viralElements: ['Educational', 'FOMO'],
    hookRating: 4,
  },
];

const mockQualityAnalysis = {
  score: 85,
  breakdown: {
    originality: 88,
    valueDensity: 82,
    engagementHooks: 90,
    clarity: 85,
    brandVoice: 78,
  },
  warnings: [],
  improvements: [
    'Consider adding a specific data point or statistic',
    'The CTA could be more compelling',
  ],
};

export default function ViralPostCreatorPage() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [goal, setGoal] = useState('engagement');
  const [spiceLevel, setSpiceLevel] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState(mockVariations);
  const [selectedVariation, setSelectedVariation] = useState<typeof mockVariations[0] | null>(null);
  const [manualContent, setManualContent] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setVariations(mockVariations);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRefine = (id: string, refinement: string) => {
    console.log('Refining', id, 'with', refinement);
    // Would call API to refine
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Viral Post Creator</h1>
        <p className="text-zinc-400">
          Generate high-potential viral posts with AI assistance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
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
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>

              {/* Tone and Goal */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
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
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
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
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Or Write Your Own</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your post here to get quality analysis..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="min-h-[150px] bg-zinc-950 border-zinc-800"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">
                  {manualContent.length} / 280 characters
                </span>
                <Button variant="outline" disabled={!manualContent}>
                  <Send className="mr-2 h-4 w-4" />
                  Analyze Quality
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
            score={mockQualityAnalysis.score}
            breakdown={mockQualityAnalysis.breakdown}
            warnings={mockQualityAnalysis.warnings}
            improvements={mockQualityAnalysis.improvements}
          />

          {/* Tips Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-white">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-zinc-400">
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
  );
}
