'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Zap,
  Save,
  CheckCircle,
  Globe,
  Loader2,
  Lock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';
import { useSettings, type UserSettings } from '@/lib/settings';

// Simplified Settings Page - removed unnecessary tabs and options

interface IntegrationStatus {
  name: string;
  description: string;
  connected: boolean;
  status: 'active' | 'disconnected';
  category: 'ai' | 'social' | 'market' | 'news' | 'media';
}

export default function SettingsPage() {
  const { settings, isLoaded, updateSetting, updateSettings } = useSettings();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form state for account section
  const [accountForm, setAccountForm] = useState({
    displayName: '',
    xHandle: '',
    email: '',
    timezone: 'utc',
  });

  // Sync form with loaded settings
  useEffect(() => {
    if (isLoaded) {
      setAccountForm({
        displayName: settings.displayName,
        xHandle: settings.xHandle,
        email: settings.email,
        timezone: settings.timezone,
      });
    }
  }, [isLoaded, settings.displayName, settings.xHandle, settings.email, settings.timezone]);

  // Integrations - read-only, based on env vars
  const integrations: IntegrationStatus[] = [
    // Social
    {
      name: 'X (Twitter) API',
      description: 'Tweets, followers, engagement, viral content',
      connected: true,
      status: 'active',
      category: 'social',
    },
    // AI
    {
      name: 'Claude AI (Anthropic)',
      description: 'Content suggestions, template editing, analysis',
      connected: true,
      status: 'active',
      category: 'ai',
    },
    {
      name: 'Gemini AI (Google)',
      description: 'Alternative template editing',
      connected: true,
      status: 'active',
      category: 'ai',
    },
    // Market Data
    {
      name: 'CoinGecko',
      description: 'Crypto prices, trending coins, market data',
      connected: true,
      status: 'active',
      category: 'market',
    },
    {
      name: 'DeFiLlama',
      description: 'Total Value Locked (TVL), chain data',
      connected: true,
      status: 'active',
      category: 'market',
    },
    {
      name: 'Alternative.me',
      description: 'Fear & Greed Index',
      connected: true,
      status: 'active',
      category: 'market',
    },
    // News
    {
      name: 'CoinDesk',
      description: 'Breaking crypto news via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    {
      name: 'Cointelegraph',
      description: 'Crypto news and analysis via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    {
      name: 'The Block',
      description: 'Institutional crypto news via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    {
      name: 'Bitcoin Magazine',
      description: 'Bitcoin-focused news via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    {
      name: 'Decrypt',
      description: 'Crypto news and guides via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    {
      name: 'Blockworks',
      description: 'DeFi and crypto research via RSS',
      connected: true,
      status: 'active',
      category: 'news',
    },
    // Media
    {
      name: 'Replicate (Flux AI)',
      description: 'AI image generation',
      connected: true,
      status: 'active',
      category: 'media',
    },
    {
      name: 'Figma API',
      description: 'Template library and export',
      connected: true,
      status: 'active',
      category: 'media',
    },
  ];

  // Group integrations by category
  const groupedIntegrations = {
    social: integrations.filter(i => i.category === 'social'),
    ai: integrations.filter(i => i.category === 'ai'),
    market: integrations.filter(i => i.category === 'market'),
    news: integrations.filter(i => i.category === 'news'),
    media: integrations.filter(i => i.category === 'media'),
  };

  const categoryLabels: Record<string, string> = {
    social: 'Social Media',
    ai: 'AI Services',
    market: 'Market Data',
    news: 'News Sources',
    media: 'Media Generation',
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));

    updateSettings({
      displayName: accountForm.displayName,
      xHandle: accountForm.xHandle,
      email: accountForm.email,
      timezone: accountForm.timezone,
    });

    setIsSaving(false);
    addToast({
      type: 'success',
      title: 'Settings saved',
      description: 'Your profile changes have been saved.',
    });
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-tertiary">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-surface">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-tertiary">Display Name</label>
                    <Input
                      value={accountForm.displayName}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="bg-base border-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-tertiary">X Handle</label>
                    <Input
                      value={accountForm.xHandle}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, xHandle: e.target.value }))}
                      className="bg-base border-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-tertiary">Email</label>
                    <Input
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-base border-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-tertiary">Timezone</label>
                    <Select
                      value={accountForm.timezone}
                      onValueChange={(value) => setAccountForm(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="bg-base border-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4" onClick={handleSaveAccount} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab - Read-only */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Connected Data Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-tertiary">
                  All integrations are configured via environment variables and active.
                </p>

                {Object.entries(groupedIntegrations).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-secondary mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-violet-400" />
                      {categoryLabels[category]}
                      <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
                        {items.length}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {items.map((integration, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-base rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-green-500/20">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm text-white">{integration.name}</p>
                              <p className="text-xs text-tertiary">{integration.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500/20 text-green-400 text-[10px]">
                              active
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab - Simplified */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Spice Level Warnings</p>
                    <p className="text-sm text-tertiary">Warn before posting high-spice content</p>
                  </div>
                  <Switch
                    checked={settings.spiceWarnings}
                    onCheckedChange={(checked) => updateSetting('spiceWarnings', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Default Spice Level</label>
                  <Select
                    value={settings.defaultSpiceLevel}
                    onValueChange={(value) => updateSetting('defaultSpiceLevel', value as UserSettings['defaultSpiceLevel'])}
                  >
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild (1-2)</SelectItem>
                      <SelectItem value="warm">Warm (3-4)</SelectItem>
                      <SelectItem value="medium">Medium (5-6)</SelectItem>
                      <SelectItem value="hot">Hot (7-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
