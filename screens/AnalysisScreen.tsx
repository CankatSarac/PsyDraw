"use client"

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Lucide } from '@/components/ui/lucide';
import { useApp } from '@/context/AppContext';
import AIService from '@/lib/aiService';

const AnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addAnalysis } = useApp();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const { imageUri } = route.params as { imageUri: string };
        const aiService = AIService.getInstance();
        const result = await aiService.analyzeDrawing(imageUri);
        setAnalysis(result);
        addAnalysis(result);
      } catch (error) {
        console.error('Error analyzing image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeImage();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB88E" />
        <Text style={styles.loadingText}>Analyzing drawing...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to analyze the drawing</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Lucide name="arrow-left" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.title}>Analysis Results</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: analysis.imageUri }} style={styles.image} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.headline}>{analysis.headline}</Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodLabel}>Mood:</Text>
            <Text style={styles.moodValue}>{analysis.mood}</Text>
            <Text style={styles.moodEmoji}>
              {analysis.mood === 'happy' ? '😊' : 
               analysis.mood === 'sad' ? '😢' : 
               analysis.mood === 'angry' ? '😠' : '😐'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developmental Stage</Text>
          <Text style={styles.stageText}>{analysis.developmentalStage}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotional State</Text>
          <Text style={styles.emotionalState}>{analysis.emotionalState}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {analysis.insights.map((insight: string, index: number) => (
            <View key={index} style={styles.insightItem}>
              <Lucide name="check-circle" size={16} color="#FFB88E" />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {analysis.recommendations.map((recommendation: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Lucide name="lightbulb" size={16} color="#FFB88E" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Analysis Confidence:</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${analysis.confidenceScore * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceValue}>
            {Math.round(analysis.confidenceScore * 100)}%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCEBD1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCEBD1',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A4A4A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCEBD1',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFB88E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginLeft: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  headline: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 16,
    color: '#4A4A4A',
    marginRight: 8,
  },
  moodValue: {
    fontSize: 16,
    color: '#4A4A4A',
    textTransform: 'capitalize',
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 20,
  },
  stageText: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
  },
  emotionalState: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 12,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 12,
    flex: 1,
  },
  confidenceContainer: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#FFB88E',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'right',
  },
});

export default AnalysisScreen;
