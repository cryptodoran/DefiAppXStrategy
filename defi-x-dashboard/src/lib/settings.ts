// Settings persistence using localStorage
// This provides a simple, client-side settings storage system

export interface UserSettings {
  // Account
  displayName: string;
  xHandle: string;
  email: string;
  timezone: string;

  // Integrations (API keys should be in env vars, but we track UI state)
  xApiKeySet: boolean;
  claudeApiKeySet: boolean;

  // Notifications
  pushNotifications: boolean;
  engagementAlerts: boolean;
  competitorActivity: boolean;
  trendAlerts: boolean;
  scheduleReminders: boolean;
  emailDigestFrequency: 'realtime' | 'daily' | 'weekly' | 'never';

  // Preferences
  darkMode: boolean;
  compactView: boolean;
  dashboardLayout: 'default' | 'analytics' | 'content' | 'research';
  autoSchedule: boolean;
  spiceWarnings: boolean;
  defaultSpiceLevel: 'mild' | 'warm' | 'medium' | 'hot';
  aiModel: 'claude' | 'claude-haiku';
}

const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Defi App',
  xHandle: '@defi_app',
  email: 'team@defiapp.com',
  timezone: 'utc',

  xApiKeySet: false,
  claudeApiKeySet: false,

  pushNotifications: true,
  engagementAlerts: true,
  competitorActivity: true,
  trendAlerts: true,
  scheduleReminders: true,
  emailDigestFrequency: 'daily',

  darkMode: true,
  compactView: false,
  dashboardLayout: 'default',
  autoSchedule: false,
  spiceWarnings: true,
  defaultSpiceLevel: 'medium',
  aiModel: 'claude',
};

const STORAGE_KEY = 'defi-app-settings';

// Load settings from localStorage
export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all keys exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }

  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
export function saveSettings(settings: UserSettings): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

// Save a single setting
export function saveSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): boolean {
  const current = loadSettings();
  current[key] = value;
  return saveSettings(current);
}

// Reset settings to defaults
export function resetSettings(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to reset settings:', e);
    return false;
  }
}

// React hook for settings
import { useState, useEffect, useCallback } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
    setIsLoaded(true);
  }, []);

  // Update a single setting and save
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Update multiple settings at once
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    resetSettings();
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
    reset,
  };
}
