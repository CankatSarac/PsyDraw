"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Analysis {
  id: string
  imageUri: string
  headline: string
  mood: string
  insights: string[]
  createdAt: string
}

interface AppContextType {
  remainingCredits: number
  analyses: Analysis[]
  decrementCredits: () => Promise<boolean>
  addCredits: (amount: number) => Promise<void>
  addAnalysis: (analysis: Analysis) => void
  deleteAnalysis: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode; initialCredits: number }> = ({
  children,
  initialCredits,
}) => {
  const [remainingCredits, setRemainingCredits] = useState<number>(initialCredits)
  const [analyses, setAnalyses] = useState<Analysis[]>([])

  useEffect(() => {
    // Load saved analyses from storage
    const loadAnalyses = async () => {
      try {
        const savedAnalyses = await AsyncStorage.getItem("analyses")
        if (savedAnalyses) {
          setAnalyses(JSON.parse(savedAnalyses))
        }
      } catch (error) {
        console.error("Error loading analyses:", error)
      }
    }

    loadAnalyses()
  }, [])

  const saveAnalyses = async (updatedAnalyses: Analysis[]) => {
    try {
      await AsyncStorage.setItem("analyses", JSON.stringify(updatedAnalyses))
    } catch (error) {
      console.error("Error saving analyses:", error)
    }
  }

  const decrementCredits = async (): Promise<boolean> => {
    if (remainingCredits <= 0) {
      return false
    }

    const newCredits = remainingCredits - 1
    setRemainingCredits(newCredits)
    try {
      await AsyncStorage.setItem("remainingCredits", newCredits.toString())
      return true
    } catch (error) {
      console.error("Error saving credits:", error)
      return false
    }
  }

  const addCredits = async (amount: number): Promise<void> => {
    const newCredits = remainingCredits + amount
    setRemainingCredits(newCredits)
    try {
      await AsyncStorage.setItem("remainingCredits", newCredits.toString())
    } catch (error) {
      console.error("Error saving credits:", error)
    }
  }

  const addAnalysis = (analysis: Analysis) => {
    const updatedAnalyses = [analysis, ...analyses]
    setAnalyses(updatedAnalyses)
    saveAnalyses(updatedAnalyses)
  }

  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = analyses.filter((analysis) => analysis.id !== id)
    setAnalyses(updatedAnalyses)
    saveAnalyses(updatedAnalyses)
  }

  return (
    <AppContext.Provider
      value={{
        remainingCredits,
        analyses,
        decrementCredits,
        addCredits,
        addAnalysis,
        deleteAnalysis,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
