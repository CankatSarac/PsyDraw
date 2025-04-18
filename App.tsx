"use client"

import { useEffect, useState } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ThemeProvider } from "@/components/theme-provider"
import OnboardingScreen from "@/screens/OnboardingScreen"
import { AppProvider } from "@/context/AppContext"
import AppNavigator from "@/navigation/AppNavigator"

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)
  const [remainingCredits, setRemainingCredits] = useState<number>(3)

  useEffect(() => {
    // Check if this is the first launch
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched")
        if (hasLaunched === null) {
          setIsFirstLaunch(true)
          await AsyncStorage.setItem("hasLaunched", "true")
          await AsyncStorage.setItem("remainingCredits", "3")
        } else {
          setIsFirstLaunch(false)
          const credits = await AsyncStorage.getItem("remainingCredits")
          if (credits !== null) {
            setRemainingCredits(Number.parseInt(credits, 10))
          }
        }
      } catch (error) {
        console.error("Error checking first launch status:", error)
        setIsFirstLaunch(false)
      }
    }

    checkFirstLaunch()
  }, [])

  if (isFirstLaunch === null) {
    // Still loading
    return null
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onComplete={() => setIsFirstLaunch(false)} />
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FCEBD1" />
        <AppProvider initialCredits={remainingCredits}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
