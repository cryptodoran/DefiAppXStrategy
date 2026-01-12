'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';

// Settings Page

interface IntegrationStatus {
  name: string;
  connected: boolean;
  lastSync: string | null;
  status: 'active' | 'error' | 'disconnected';
}

const integrations: IntegrationStatus[] = [
  { name: 'X (Twitter) API', connected: true, lastSync: '2 minutes ago', status: 'active' },
  { name: 'Claude AI', connected: true, lastSync: '1 minute ago', status: 'active' },
  { name: 'Analytics Provider', connected: false, lastSync: null, status: 'disconnected' },
];

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [spiceWarnings, setSpiceWarnings] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { addToast } = useToast();

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
                    defaultValue="Defi App"
                    className="bg-base border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">X Handle</label>
                  <Input
                    defaultValue="@defi_app"
                    className="bg-base border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Email</label>
                  <Input
                    defaultValue="team@defiapp.com"
                    className="bg-base border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-tertiary">Timezone</label>
                  <Select defaultValue="utc">
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
              <Button className="mt-4" onClick={() => addToast({ type: 'success', title: 'Settings saved', description: 'Your profile changes have been saved successfully.' })}>
                <Save className="mr-2 h-4 w-4" />
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
                <Button variant="outline" size="sm" onClick={() => addToast({ type: 'success', title: 'API Keys', description: 'Opening API key management...' })}>
                  <Key className="mr-2 h-4 w-4" />
                  Manage Keys
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Login Sessions</p>
                  <p className="text-sm text-tertiary">2 active sessions</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => addToast({ type: 'success', title: 'Sessions', description: 'Viewing all active login sessions...' })}>
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
                          : 'Not connected'}
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
                      <Button size="sm" onClick={() => addToast({ type: 'success', title: 'Connect', description: `Connecting to ${integration.name}...` })}>Connect</Button>
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
              <div className="space-y-2">
                <label className="text-sm text-tertiary">X API Key</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    defaultValue="sk_live_xxxxxxxxxx"
                    className="bg-base border-white/5"
                  />
                  <Button variant="outline" onClick={() => window.open('https://developer.x.com', '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-tertiary">Claude API Key</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    defaultValue="sk_ant_xxxxxxxxxx"
                    className="bg-base border-white/5"
                  />
                  <Button variant="outline" onClick={() => window.open('https://console.anthropic.com', '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => addToast({ type: 'success', title: 'API Keys saved', description: 'Your API keys have been updated successfully.' })}>
                <Save className="mr-2 h-4 w-4" />
                Save API Keys
              </Button>
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
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Engagement Alerts</p>
                  <p className="text-sm text-tertiary">When posts hit engagement milestones</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Competitor Activity</p>
                  <p className="text-sm text-tertiary">When tracked competitors post viral content</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Trend Alerts</p>
                  <p className="text-sm text-tertiary">When relevant topics start trending</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Schedule Reminders</p>
                  <p className="text-sm text-tertiary">Before scheduled posts go live</p>
                </div>
                <Switch defaultChecked />
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
                <Select defaultValue="daily">
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
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Compact View</p>
                  <p className="text-sm text-tertiary">Show more content in less space</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-tertiary">Dashboard Layout</label>
                <Select defaultValue="default">
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
                  checked={autoSchedule}
                  onCheckedChange={setAutoSchedule}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-base rounded-lg">
                <div>
                  <p className="text-white">Spice Level Warnings</p>
                  <p className="text-sm text-tertiary">Warn before posting high-spice content</p>
                </div>
                <Switch
                  checked={spiceWarnings}
                  onCheckedChange={setSpiceWarnings}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-tertiary">Default Spice Level</label>
                <Select defaultValue="medium">
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
                <Select defaultValue="claude">
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
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => addToast({ type: 'success', title: 'Settings Reset', description: 'All settings have been restored to defaults.' })}>
                  Reset
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Delete Account</p>
                  <p className="text-sm text-tertiary">Permanently delete your account and data</p>
                </div>
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => addToast({ type: 'success', title: 'Delete Account', description: 'Please contact support to delete your account.' })}>
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
