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
  Key,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';
import { useSettings, type UserSettings } from '@/lib/settings';

// Settings Page with full persistence

interface IntegrationStatus {
  name: string;
  connected: boolean;
  lastSync: string | null;
  status: 'active' | 'error' | 'disconnected';
}

export default function SettingsPage() {
  const { settings, isLoaded, updateSetting, updateSettings, reset } = useSettings();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form state for account section (saved on button click)
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

  // Dynamic integrations based on settings
  const integrations: IntegrationStatus[] = [
    {
      name: 'X (Twitter) API',
      connected: !!process.env.NEXT_PUBLIC_TWITTER_ENABLED || settings.xApiKeySet,
      lastSync: settings.xApiKeySet ? '2 minutes ago' : null,
      status: settings.xApiKeySet ? 'active' : 'disconnected',
    },
    {
      name: 'Claude AI',
      connected: !!process.env.NEXT_PUBLIC_CLAUDE_ENABLED || settings.claudeApiKeySet,
      lastSync: settings.claudeApiKeySet ? '1 minute ago' : null,
      status: settings.claudeApiKeySet ? 'active' : 'disconnected',
    },
    {
      name: 'Analytics Provider',
      connected: false,
      lastSync: null,
      status: 'disconnected',
    },
  ];

  const handleSaveAccount = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500)); // Simulate save

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
      description: 'Your profile changes have been saved successfully.',
    });
  };

  const handleResetSettings = () => {
    reset();
    addToast({
      type: 'success',
      title: 'Settings Reset',
      description: 'All settings have been restored to defaults.',
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
            Manage your account, integrations, and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-surface">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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

            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-tertiary">Add an extra layer of security</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">API Access</p>
                    <p className="text-sm text-tertiary">Manage API keys and tokens</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'API Keys', description: 'API keys are managed in your .env file for security.' })}>
                    <Key className="mr-2 h-4 w-4" />
                    Manage Keys
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Login Sessions</p>
                    <p className="text-sm text-tertiary">1 active session (this browser)</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'Sessions', description: 'You have 1 active session on this device.' })}>
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Connected Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.map((integration, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-base rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          integration.status === 'active'
                            ? 'bg-green-500/20'
                            : integration.status === 'error'
                            ? 'bg-red-500/20'
                            : 'bg-elevated'
                        )}
                      >
                        {integration.status === 'active' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : integration.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Globe className="h-5 w-5 text-tertiary" />
                        )}
                      </div>
                      <div>
                        <p className="text-white">{integration.name}</p>
                        <p className="text-sm text-tertiary">
                          {integration.lastSync
                            ? `Last sync: ${integration.lastSync}`
                            : 'Not connected - add API key to .env'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          integration.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : integration.status === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/5 text-tertiary'
                        )}
                      >
                        {integration.status}
                      </Badge>
                      {integration.connected ? (
                        <Button variant="outline" size="sm" onClick={() => addToast({ type: 'success', title: 'Syncing', description: `Refreshing ${integration.name}...` })}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => addToast({ type: 'info', title: 'Setup Required', description: `Add ${integration.name} credentials to your .env file.` })}>
                          Setup
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white">API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    For security, API keys should be stored in environment variables (.env.local).
                    The keys entered here are for UI reference only.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">X API Status</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="password"
                      placeholder="Set in TWITTER_BEARER_TOKEN env var"
                      disabled
                      className="bg-base border-white/5"
                    />
                    <Button variant="outline" onClick={() => window.open('https://developer.x.com', '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-tertiary">
                    Status: {settings.xApiKeySet || process.env.NEXT_PUBLIC_TWITTER_ENABLED ? '✓ Configured' : '✗ Not configured'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Claude API Status</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="password"
                      placeholder="Set in ANTHROPIC_API_KEY env var"
                      disabled
                      className="bg-base border-white/5"
                    />
                    <Button variant="outline" onClick={() => window.open('https://console.anthropic.com', '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-tertiary">
                    Status: {settings.claudeApiKeySet || process.env.NEXT_PUBLIC_CLAUDE_ENABLED ? '✓ Configured' : '✗ Not configured'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Push Notifications</p>
                    <p className="text-sm text-tertiary">Receive alerts for important events</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Engagement Alerts</p>
                    <p className="text-sm text-tertiary">When posts hit engagement milestones</p>
                  </div>
                  <Switch
                    checked={settings.engagementAlerts}
                    onCheckedChange={(checked) => updateSetting('engagementAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Competitor Activity</p>
                    <p className="text-sm text-tertiary">When tracked competitors post viral content</p>
                  </div>
                  <Switch
                    checked={settings.competitorActivity}
                    onCheckedChange={(checked) => updateSetting('competitorActivity', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Trend Alerts</p>
                    <p className="text-sm text-tertiary">When relevant topics start trending</p>
                  </div>
                  <Switch
                    checked={settings.trendAlerts}
                    onCheckedChange={(checked) => updateSetting('trendAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Schedule Reminders</p>
                    <p className="text-sm text-tertiary">Before scheduled posts go live</p>
                  </div>
                  <Switch
                    checked={settings.scheduleReminders}
                    onCheckedChange={(checked) => updateSetting('scheduleReminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-sm text-white">Email Digest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Frequency</label>
                  <Select
                    value={settings.emailDigestFrequency}
                    onValueChange={(value) => updateSetting('emailDigestFrequency', value as UserSettings['emailDigestFrequency'])}
                  >
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Dark Mode</p>
                    <p className="text-sm text-tertiary">Use dark theme throughout the app</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Compact View</p>
                    <p className="text-sm text-tertiary">Show more content in less space</p>
                  </div>
                  <Switch
                    checked={settings.compactView}
                    onCheckedChange={(checked) => updateSetting('compactView', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Dashboard Layout</label>
                  <Select
                    value={settings.dashboardLayout}
                    onValueChange={(value) => updateSetting('dashboardLayout', value as UserSettings['dashboardLayout'])}
                  >
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="analytics">Analytics Focus</SelectItem>
                      <SelectItem value="content">Content Focus</SelectItem>
                      <SelectItem value="research">Research Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Content Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                  <div>
                    <p className="text-white">Auto-Schedule Posts</p>
                    <p className="text-sm text-tertiary">Automatically schedule for optimal times</p>
                  </div>
                  <Switch
                    checked={settings.autoSchedule}
                    onCheckedChange={(checked) => updateSetting('autoSchedule', checked)}
                  />
                </div>
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
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">AI Model Preference</label>
                  <Select
                    value={settings.aiModel}
                    onValueChange={(value) => updateSetting('aiModel', value as UserSettings['aiModel'])}
                  >
                    <SelectTrigger className="bg-base border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude (Recommended)</SelectItem>
                      <SelectItem value="claude-haiku">Claude Haiku (Faster)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Reset All Settings</p>
                    <p className="text-sm text-tertiary">Restore default configuration</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={handleResetSettings}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Delete Account</p>
                    <p className="text-sm text-tertiary">Permanently delete your account and data</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => addToast({ type: 'info', title: 'Delete Account', description: 'Please contact support to delete your account.' })}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
