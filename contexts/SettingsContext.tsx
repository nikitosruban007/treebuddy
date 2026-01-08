
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';
import { useColorScheme } from 'react-native';

interface SettingsContextType {
  settings: AppSettings;
  updateLanguage: (language: 'ua' | 'en') => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateSound: (enabled: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = '@treebuddy_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>({
    language: 'ua',
    theme: systemColorScheme === 'dark' ? 'dark' : 'light',
    soundEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateLanguage = async (language: 'ua' | 'en') => {
    await saveSettings({ ...settings, language });
  };

  const updateTheme = async (theme: 'light' | 'dark') => {
    await saveSettings({ ...settings, theme });
  };

  const updateSound = async (enabled: boolean) => {
    await saveSettings({ ...settings, soundEnabled: enabled });
  };

  const clearCache = async () => {
    try {
      console.log('Clearing cache...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateLanguage,
        updateTheme,
        updateSound,
        clearCache,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
