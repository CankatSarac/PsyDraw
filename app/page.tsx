"use client"

import dynamic from "next/dynamic"
import { StyleSheet, View } from "react-native"

// Disable SSR for React Native components
const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <View style={styles.loadingContainer}>
      <div>Loading...</div>
    </View>
  ),
})

export default function Home() {
  return (
    <View style={styles.container}>
      <App />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
    width: '100vw',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
})
