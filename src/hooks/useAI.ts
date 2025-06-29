import { useState } from 'react';
import { aiService, IdeaAnalysisRequest } from '../services/ai';
import { AIValidation } from '../types';

export const useAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeIdea = async (idea: IdeaAnalysisRequest): Promise<AIValidation | null> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const validation = await aiService.analyzeIdea(idea);
      return validation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze idea';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateTags = async (title: string, description: string): Promise<string[]> => {
    setIsGeneratingTags(true);
    setError(null);
    
    try {
      const tags = await aiService.generateTags(title, description);
      return tags;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tags';
      setError(errorMessage);
      return [];
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateImprovements = async (idea: IdeaAnalysisRequest): Promise<string[]> => {
    try {
      return await aiService.generateImprovements(idea);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate improvements';
      setError(errorMessage);
      return [];
    }
  };

  return {
    analyzeIdea,
    generateTags,
    generateImprovements,
    isAnalyzing,
    isGeneratingTags,
    error,
    isConfigured: aiService.isConfigured()
  };
};