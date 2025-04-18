"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, Alert } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Lucide } from "@/components/ui/lucide"
import { useApp } from "@/context/AppContext"
import * as MediaLibrary from "expo-media-library"
import { format } from "date-fns"

type AnalysisDetailRouteParams = {
  analysisId: string
}

const AnalysisDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<Record<string, AnalysisDetailRouteParams>, string>>()
  const navigation = useNavigation()
  const { analysisId } = route.params
  const { analyses, deleteAnalysis } = useApp()

  const [analysis, setAnalysis] = useState<(typeof analyses)[0] | null>(null)
  const [savePermission, setSavePermission] = useState<boolean | null>(null)

  useEffect(() => {
    // Find the analysis by ID
    const foundAnalysis = analyses.find((a) => a.id === analysisId)
    if (foundAnalysis) {
      setAnalysis(foundAnalysis)
    } else {
      Alert.alert("Error", "Analysis not found")
      navigation.goBack()
    }
    // Request permission to save images
    ;(async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      setSavePermission(status === "granted")
    })()
  }, [analysisId, analyses, navigation])

  const handleShare = async () => {
    if (!analysis) return

    try {
      await Share.share({
        url: analysis.imageUri,
        message: `Drawing Analysis: ${analysis.headline}\n\nInsights:\n${analysis.insights.join("\n")}`,
      })
    } catch (error) {
      console.error("Error sharing analysis:", error)
      Alert.alert("Error", "Failed to share the analysis.")
    }
  }

  const handleSave = async () => {
    if (!analysis) return

    if (!savePermission) {
      Alert.alert("Permission Required", "Please grant permission to save images to your gallery.")
      return
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(analysis.imageUri)
      await MediaLibrary.createAlbumAsync("DrawInsight", asset, false)
      Alert.alert("Success", "Analysis saved to gallery.")
    } catch (error) {
      console.error("Error saving analysis:", error)
      Alert.alert("Error", "Failed to save the analysis to gallery.")
    }
  }

  const handleDelete = () => {
    if (!analysis) return

    Alert.alert("Delete Analysis", "Are you sure you want to delete this analysis?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteAnalysis(analysis.id)
          navigation.goBack()
        },
      },
    ])
  }

  if (!analysis) {
    return null
  }

  const formattedDate = format(new Date(analysis.createdAt), "MMMM d, yyyy")

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: analysis.imageUri }} style={styles.image} />

      <View style={styles.contentContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>{analysis.headline}</Text>
          <Text style={styles.moodEmoji}>
            {analysis.mood === "happy"
              ? "😊"
              : analysis.mood === "sad"
                ? "😢"
                : analysis.mood === "angry"
                  ? "😠"
                  : "😐"}
          </Text>
        </View>

        <Text style={styles.insightsTitle}>Key Insights</Text>

        {analysis.insights.map((insight, index) => (
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

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Lucide name="x" size={20} color="#FF6B6B" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
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
  image: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  dateContainer: {
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "#888888",
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
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    color: "#4A4A4A",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  deleteText: {
    color: "#FF6B6B",
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

export default AnalysisDetailScreen
