'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Shield,
  Plus,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  Save,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

// US-015: Brand Voice Enforcer
// US-026: Topic Blacklist/Whitelist Manager

interface TopicItem {
  id: string;
  text: string;
}

const initialBrandVoice = {
  tone: ['Professional', 'Confident', 'Educational', 'Slightly edgy'],
  vocabulary: ['DeFi', 'Protocol', 'Yield', 'TVL', 'Liquidity', 'Smart contracts'],
  avoidWords: ['Moon', 'Wagmi', 'Ngmi', 'Ape', 'Degen'],
};

const initialLists = {
  blacklist: [
    { id: '1', text: 'Specific competitor mentions by name' },
    { id: '2', text: 'Political topics unrelated to crypto regulation' },
    { id: '3', text: 'Personal attacks on individuals' },
    { id: '4', text: 'Unverified security claims' },
    { id: '5', text: 'Price predictions or financial advice' },
  ],
  whitelist: [
    { id: '1', text: 'DeFi regulation and compliance' },
    { id: '2', text: 'Self-custody importance' },
    { id: '3', text: 'Chain comparisons (factual)' },
    { id: '4', text: 'Security best practices' },
    { id: '5', text: 'Protocol mechanics explanations' },
  ],
  graylist: [
    { id: '1', text: 'Competitor product comparisons' },
    { id: '2', text: 'Market predictions' },
    { id: '3', text: 'Controversial industry figures' },
    { id: '4', text: 'Regulatory speculation' },
  ],
};

export default function BrandVoicePage() {
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice);
  const [lists, setLists] = useState(initialLists);
  const { addToast } = useToast();
  const [newTone, setNewTone] = useState('');
  const [newWord, setNewWord] = useState('');
  const [newAvoid, setNewAvoid] = useState('');
  const [newBlacklist, setNewBlacklist] = useState('');
  const [newWhitelist, setNewWhitelist] = useState('');
  const [newGraylist, setNewGraylist] = useState('');
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<null | {
    passes: boolean;
    issues: string[];
    suggestions: string[];
  }>(null);

  const addToList = (list: 'tone' | 'vocabulary' | 'avoidWords', value: string) => {
    if (!value.trim()) return;
    setBrandVoice({
      ...brandVoice,
      [list]: [...brandVoice[list], value.trim()],
    });
  };

  const removeFromList = (list: 'tone' | 'vocabulary' | 'avoidWords', index: number) => {
    setBrandVoice({
      ...brandVoice,
      [list]: brandVoice[list].filter((_, i) => i !== index),
    });
  };

  const addTopic = (list: 'blacklist' | 'whitelist' | 'graylist', text: string) => {
    if (!text.trim()) return;
    setLists({
      ...lists,
      [list]: [...lists[list], { id: Date.now().toString(), text: text.trim() }],
    });
  };

  const removeTopic = (list: 'blacklist' | 'whitelist' | 'graylist', id: string) => {
    setLists({
      ...lists,
      [list]: lists[list].filter((item) => item.id !== id),
    });
  };

  const testBrandVoice = () => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const lowerContent = testContent.toLowerCase();

    // Check for avoided words
    brandVoice.avoidWords.forEach((word) => {
      if (lowerContent.includes(word.toLowerCase())) {
        issues.push(`Contains avoided word: "${word}"`);
      }
    });

    // Check for blacklisted topics
    lists.blacklist.forEach((item) => {
      if (lowerContent.includes(item.text.toLowerCase().split(' ')[0])) {
        issues.push(`May contain blacklisted topic: "${item.text}"`);
      }
    });

    // Suggestions
    if (testContent.length < 50) {
      suggestions.push('Content seems short. Consider adding more substance.');
    }
    if (!testContent.includes('DeFi') && !testContent.includes('defi')) {
      suggestions.push('Consider mentioning DeFi for brand relevance.');
    }

    setTestResult({
      passes: issues.length === 0,
      issues,
      suggestions,
    });
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Brand Voice & Guidelines</h1>
        <p className="text-tertiary">
          Configure brand voice parameters and topic guidelines
        </p>
      </div>

      <Tabs defaultValue="voice" className="space-y-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="voice">Brand Voice</TabsTrigger>
          <TabsTrigger value="topics">Topic Lists</TabsTrigger>
          <TabsTrigger value="test">Test Content</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Tone */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Tone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {brandVoice.tone.map((tone, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-400 pr-1">
                      {tone}
                      <button
                        onClick={() => removeFromList('tone', index)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tone..."
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value)}
                    className="bg-base border-white/5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addToList('tone', newTone);
                        setNewTone('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addToList('tone', newTone);
                      setNewTone('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vocabulary */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Key Vocabulary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {brandVoice.vocabulary.map((word, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-400 pr-1">
                      {word}
                      <button
                        onClick={() => removeFromList('vocabulary', index)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add word..."
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="bg-base border-white/5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addToList('vocabulary', newWord);
                        setNewWord('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addToList('vocabulary', newWord);
                      setNewWord('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Avoid Words */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Words to Avoid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {brandVoice.avoidWords.map((word, index) => (
                    <Badge key={index} className="bg-red-500/20 text-red-400 pr-1">
                      {word}
                      <button
                        onClick={() => removeFromList('avoidWords', index)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add word..."
                    value={newAvoid}
                    onChange={(e) => setNewAvoid(e.target.value)}
                    className="bg-base border-white/5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addToList('avoidWords', newAvoid);
                        setNewAvoid('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addToList('avoidWords', newAvoid);
                      setNewAvoid('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Blacklist */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <X className="h-5 w-5 text-red-400" />
                  Blacklist (Never Touch)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {lists.blacklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <span className="text-sm text-secondary">{item.text}</span>
                      <button
                        onClick={() => removeTopic('blacklist', item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add topic..."
                    value={newBlacklist}
                    onChange={(e) => setNewBlacklist(e.target.value)}
                    className="bg-base border-white/5"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addTopic('blacklist', newBlacklist);
                      setNewBlacklist('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Whitelist */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  Whitelist (Encouraged)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {lists.whitelist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <span className="text-sm text-secondary">{item.text}</span>
                      <button
                        onClick={() => removeTopic('whitelist', item.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add topic..."
                    value={newWhitelist}
                    onChange={(e) => setNewWhitelist(e.target.value)}
                    className="bg-base border-white/5"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addTopic('whitelist', newWhitelist);
                      setNewWhitelist('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Graylist */}
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow-400" />
                  Graylist (Approval Needed)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {lists.graylist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                    >
                      <span className="text-sm text-secondary">{item.text}</span>
                      <button
                        onClick={() => removeTopic('graylist', item.id)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add topic..."
                    value={newGraylist}
                    onChange={(e) => setNewGraylist(e.target.value)}
                    className="bg-base border-white/5"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addTopic('graylist', newGraylist);
                      setNewGraylist('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Test Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste or write content to test against brand guidelines..."
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  className="min-h-[200px] bg-base border-white/5"
                />
                <Button onClick={testBrandVoice} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Check Brand Compliance
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-4">
                    <div className={cn(
                      'p-4 rounded-lg',
                      testResult.passes
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    )}>
                      <div className="flex items-center gap-2">
                        {testResult.passes ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        )}
                        <span className={testResult.passes ? 'text-green-400' : 'text-red-400'}>
                          {testResult.passes ? 'Content passes brand guidelines' : 'Issues detected'}
                        </span>
                      </div>
                    </div>

                    {testResult.issues.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-400 mb-2">Issues:</p>
                        <ul className="space-y-1">
                          {testResult.issues.map((issue, i) => (
                            <li key={i} className="text-sm text-tertiary flex items-center gap-2">
                              <X className="h-3 w-3 text-red-400" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-400 mb-2">Suggestions:</p>
                        <ul className="space-y-1">
                          {testResult.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-sm text-tertiary flex items-center gap-2">
                              <HelpCircle className="h-3 w-3 text-yellow-400" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-tertiary">
                    Enter content and click check to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-violet-500 to-indigo-600" onClick={() => addToast({ type: 'success', title: 'Settings saved', description: 'All brand voice and topic settings have been saved.' })}>
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
    </AppLayout>
  );
}
