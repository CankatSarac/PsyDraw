"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

type ThemeType = "light" | "dark"

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  colors: {
    background: string
    text: string
    accent: string
    card: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const colors = {
    background: theme === "light" ? "#FCEBD1" : "#2D2D2D",
    text: theme === "light" ? "#4A4A4A" : "#F5F5F5",
    accent: "#FFB88E",
    card: theme === "light" ? "#FFFFFF" : "#3D3D3D",
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
