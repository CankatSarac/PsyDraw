"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import AIService from '@/lib/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Analysis {
  id: string;
  imageUri: string;
  createdAt: string;
  headline: string;
  mood: 'happy' | 'sad' | 'angry' | 'neutral';
  insights: string[];
  developmentalStage: string;
  emotionalState: string;
  recommendations: string[];
  confidenceScore: number;
}

interface AppContextType {
  analyses: Analysis[];
  remainingCredits: number;
  addAnalysis: (analysis: Analysis) => void;
  deleteAnalysis: (id: string) => void;
  decrementCredits: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [remainingCredits, setRemainingCredits] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedAnalyses = await AsyncStorage.getItem('analyses');
      const savedCredits = await AsyncStorage.getItem('remainingCredits');
      const savedApiKey = await AsyncStorage.getItem('chatgptVisionKey');

      if (savedAnalyses) {
        setAnalyses(JSON.parse(savedAnalyses));
      }
      if (savedCredits) {
        setRemainingCredits(JSON.parse(savedCredits));
      }
      if (savedApiKey) {
        setApiKeyState(savedApiKey);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('analyses', JSON.stringify(analyses));
      await AsyncStorage.setItem('remainingCredits', JSON.stringify(remainingCredits));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addAnalysis = (analysis: Analysis) => {
    setAnalyses(prev => [analysis, ...prev]);
    saveData();
  };

  const deleteAnalysis = (id: string) => {
    setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    saveData();
  };

  const decrementCredits = async (): Promise<boolean> => {
    if (remainingCredits <= 0) {
      return false;
    }
    setRemainingCredits(prev => prev - 1);
    await saveData();
    return true;
  };

  const setApiKey = async (key: string) => {
    try {
      await AsyncStorage.setItem('chatgptVisionKey', key);
      setApiKeyState(key);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  };

  const value = {
    analyses,
    remainingCredits,
    addAnalysis,
    deleteAnalysis,
    decrementCredits,
    isLoading,
    error,
    apiKey,
    setApiKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
