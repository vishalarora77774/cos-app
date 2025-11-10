import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

interface AccessibilitySettings {
  fontSizeScale: number; // Percentage scale (100 = 100%, 150 = 150%, etc.)
  isBoldTextEnabled: boolean;
  isDarkTheme: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateFontScale: (scale: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleBoldText: () => void;
  toggleTheme: () => void;
  isLoading: boolean;
  getScaledFontSize: (baseFontSize: number) => number;
  getScaledFontWeight: (baseFontWeight: number) => string;
  getThemeBaseColor: () => string;
}

const defaultSettings: AccessibilitySettings = {
  fontSizeScale: 100, // 100% = normal size
  isBoldTextEnabled: false,
  isDarkTheme: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'accessibility_settings';

// Helper function to detect if device is a tablet/iPad
const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768; // iPad starts at 768px width
};

// Get the maximum font size limit based on device type
const getMaxFontSizeLimit = () => {
  return isTablet() ? 200 : 150; // 200% for tablets/iPads, 150% for phones
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever settings change
  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [settings, isLoading]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        const maxLimit = getMaxFontSizeLimit();
        // Clamp fontSizeScale to the current device's limit
        const clampedFontSizeScale = Math.min(
          Math.max(parsedSettings.fontSizeScale || defaultSettings.fontSizeScale, 50),
          maxLimit
        );
        setSettings({ 
          ...defaultSettings, 
          ...parsedSettings,
          fontSizeScale: clampedFontSizeScale
        });
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateFontScale = (scale: number) => {
    const maxLimit = getMaxFontSizeLimit();
    setSettings(prev => ({ ...prev, fontSizeScale: Math.max(50, Math.min(maxLimit, scale)) }));
  };

  const increaseFontSize = () => {
    const maxLimit = getMaxFontSizeLimit();
    setSettings(prev => ({ 
      ...prev, 
      fontSizeScale: Math.min(prev.fontSizeScale + 10, maxLimit) 
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ 
      ...prev, 
      fontSizeScale: Math.max(prev.fontSizeScale - 10, 50) 
    }));
  };

  const getScaledFontSize = (baseFontSize: number) => {
    return Math.round((baseFontSize * settings.fontSizeScale) / 100);
  };

  const getScaledFontWeight = (baseFontWeight: number) => {
    return settings.isBoldTextEnabled ? Math.min(baseFontWeight + 200, 900).toString() : baseFontWeight.toString();
  };

  const getThemeBaseColor = () => {
    return settings.isDarkTheme ? '#000000' : '#FFFFFF';
  };

  const toggleBoldText = () => {
    setSettings(prev => ({ ...prev, isBoldTextEnabled: !prev.isBoldTextEnabled }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, isDarkTheme: !prev.isDarkTheme }));
  };

  const value: AccessibilityContextType = {
    settings,
    updateFontScale,
    increaseFontSize,
    decreaseFontSize,
    toggleBoldText,
    toggleTheme,
    isLoading,
    getScaledFontSize,
    getScaledFontWeight,
    getThemeBaseColor
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
