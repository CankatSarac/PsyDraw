"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Lucide } from "@/components/ui/lucide"

const { width } = Dimensions.get("window")

interface OnboardingScreenProps {
  onComplete: () => void
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const slides = [
    {
      id: "1",
      title: "Welcome to DrawInsight",
      description: "Turn your child's drawings into psychological insights with just a tap.",
      image: { uri: "/onboarding-1.png" },
    },
    {
      id: "2",
      title: "How It Works",
      description: "Take a photo of any drawing, our AI analyzes it and provides meaningful insights.",
      image: { uri: "/onboarding-2.png" },
    },
    {
      id: "3",
      title: "Privacy First",
      description: "Your child's data is encrypted and never shared. We prioritize safety and privacy.",
      image: { uri: "/onboarding-3.png" },
    },
  ]

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete()
    }
  }

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    )
  }

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.dot, { backgroundColor: index === currentIndex ? "#FFB88E" : "#D9D9D9" }]} />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
          <Text style={styles.nextButtonText}>{currentIndex === slides.length - 1 ? "Get Started" : "Next"}</Text>
          {currentIndex < slides.length - 1 && <Lucide name="chevron-right" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCEBD1",
  },
  slide: {
    width,
    alignItems: "center",
    padding: 40,
    paddingTop: 60,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: "contain",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: "#4A4A4A",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
})

export default OnboardingScreen
