import type React from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Lucide } from "@/components/ui/lucide"
import { useApp } from "@/context/AppContext"
import { format } from "date-fns"

const { width } = Dimensions.get("window")

const TimelineScreen: React.FC = () => {
  const navigation = useNavigation()
  const { analyses, deleteAnalysis } = useApp()

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={{ uri: "/empty-timeline.png" }} style={styles.emptyImage} />
      <Text style={styles.emptyTitle}>No analyses yet</Text>
      <Text style={styles.emptyText}>Capture your first drawing to see the analysis here</Text>
      <TouchableOpacity style={styles.captureButton} onPress={() => navigation.navigate("Capture")}>
        <Text style={styles.captureButtonText}>Capture Drawing</Text>
      </TouchableOpacity>
    </View>
  )

  const renderAnalysisItem = ({ item }: { item: (typeof analyses)[0] }) => {
    const formattedDate = format(new Date(item.createdAt), "MMM d, yyyy")

    return (
      <TouchableOpacity
        style={styles.analysisCard}
        onPress={() => navigation.navigate("AnalysisDetail", { analysisId: item.id })}
      >
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        <View style={styles.analysisContent}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>{item.headline}</Text>
            <Text style={styles.moodEmoji}>
              {item.mood === "happy" ? "😊" : item.mood === "sad" ? "😢" : item.mood === "angry" ? "😠" : "😐"}
            </Text>
          </View>
          <Text style={styles.analysisDate}>{formattedDate}</Text>
          <View style={styles.insightPreview}>
            {item.insights.length > 0 && (
              <Text style={styles.insightText} numberOfLines={1}>
                • {item.insights[0]}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate("AnalysisDetail", { analysisId: item.id })}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAnalysis(item.id)}>
              <Lucide name="x" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={analyses}
        renderItem={renderAnalysisItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCEBD1",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  analysisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  analysisContent: {
    padding: 16,
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
    flex: 1,
  },
  moodEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  analysisDate: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 12,
  },
  insightPreview: {
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    color: "#4A4A4A",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    marginBottom: 30,
  },
  captureButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  captureButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default TimelineScreen
