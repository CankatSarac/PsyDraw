"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Lucide } from "@/components/ui/lucide"
import { useApp } from "@/context/AppContext"
import * as MediaLibrary from "expo-media-library"
import { v4 as uuidv4 } from "uuid"

type AnalysisRouteParams = {
  imageUri: string
}

const AnalysisScreen: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, AnalysisRouteParams>, string>>()
  const navigation = useNavigation()
  const { imageUri } = route.params
  const { addAnalysis } = useApp()

  const [isLoading, setIsLoading] = useState(true)
  const [analysis, setAnalysis] = useState<{
    headline: string
    mood: string
    insights: string[]
  } | null>(null)
  const [savePermission, setSavePermission] = useState<boolean | null>(null)

  useEffect(() => {
    // Request permission to save images
    ;(async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      setSavePermission(status === "granted")
    })()

    // Simulate AI analysis
    const analyzeImage = async () => {
      try {
        // In a real app, this would be an API call to OpenAI Vision
        // For demo purposes, we'll simulate a response after a delay
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Mock analysis result
        const mockAnalysis = {
          headline: "Expressive and Creative",
          mood: "happy",
          insights: [
            "Shows strong imagination and creativity through vibrant colors",
            "Balanced composition indicates emotional stability",
            "Details suggest attention and focus capabilities",
          ],
        }

        setAnalysis(mockAnalysis)

        // Save the analysis to the app context
        const newAnalysis = {
          id: uuidv4(),
          imageUri,
          headline: mockAnalysis.headline,
          mood: mockAnalysis.mood,
          insights: mockAnalysis.insights,
          createdAt: new Date().toISOString(),
        }

        addAnalysis(newAnalysis)
      } catch (error) {
        console.error("Error analyzing image:", error)
        Alert.alert("Error", "Failed to analyze the drawing. Please try again.")
        navigation.goBack()
      } finally {
        setIsLoading(false)
      }
    }

    analyzeImage()
  }, [imageUri, addAnalysis, navigation])

  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      calm: "😌",
      excited: "😃",
      confused: "😕",
      neutral: "😐",
    }

    return moods[mood] || "😊"
  }

  const handleShare = async () => {
    try {
      await Share.share({
        url: imageUri,
        message: `Drawing Analysis: ${analysis?.headline}\n\nInsights:\n${analysis?.insights.join("\n")}`,
      })
    } catch (error) {
      console.error("Error sharing analysis:", error)
      Alert.alert("Error", "Failed to share the analysis.")
    }
  }

  const handleSave = async () => {
    if (!savePermission) {
      Alert.alert("Permission Required", "Please grant permission to save images to your gallery.")
      return
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri)
      await MediaLibrary.createAlbumAsync("DrawInsight", asset, false)
      Alert.alert("Success", "Analysis saved to gallery.")
    } catch (error) {
      console.error("Error saving analysis:", error)
      Alert.alert("Error", "Failed to save the analysis to gallery.")
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB88E" />
        <Text style={styles.loadingText}>Analyzing drawing...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <View style={styles.contentContainer}>
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>{analysis?.headline}</Text>
          <Text style={styles.moodEmoji}>{getMoodEmoji(analysis?.mood || "neutral")}</Text>
        </View>

        <Text style={styles.insightsTitle}>Key Insights</Text>

        {analysis?.insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Lucide name="save" size={20} color="#4A4A4A" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Lucide name="share" size={20} color="#4A4A4A" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <Lucide name="alert-triangle" size={16} color="#4A4A4A" />
          <Text style={styles.disclaimerText}>
            This analysis is not a diagnostic tool. For professional advice, please consult a child psychologist.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCEBD1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCEBD1",
  },
  loadingText: {
    fontSize: 18,
    color: "#4A4A4A",
    marginTop: 20,
    fontWeight: "bold",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#4A4A4A",
    marginTop: 10,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  headlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    flex: 1,
  },
  moodEmoji: {
    fontSize: 32,
    marginLeft: 10,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 15,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFB88E",
    marginTop: 6,
    marginRight: 10,
  },
  insightText: {
    fontSize: 16,
    color: "#4A4A4A",
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 16,
    color: "#4A4A4A",
    marginLeft: 8,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#4A4A4A",
    marginLeft: 10,
    flex: 1,
  },
})

export default AnalysisScreen
