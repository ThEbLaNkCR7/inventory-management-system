"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Handle initial theme loading with better hydration
  useEffect(() => {
    setMounted(true)

    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme)
    } else {
      // Default to light mode
      setTheme("light")
      localStorage.setItem("theme", "light")
    }
  }, [])

  // Apply theme changes with improved consistency
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    let effectiveTheme: "light" | "dark"

    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } else {
      effectiveTheme = theme
    }

    // Apply theme class and update state
    root.classList.add(effectiveTheme)
    setActualTheme(effectiveTheme)

    // Update data attribute for better CSS targeting
    root.setAttribute("data-theme", effectiveTheme)

    // Save to localStorage
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const effectiveTheme = mediaQuery.matches ? "dark" : "light"
      const root = document.documentElement
      
      root.classList.remove("light", "dark")
      root.classList.add(effectiveTheme)
      root.setAttribute("data-theme", effectiveTheme)
      setActualTheme(effectiveTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, mounted])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div 
        className="min-h-screen bg-background text-foreground"
        style={{ visibility: "hidden" }}
      >
        {children}
      </div>
    )
  }

  return <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
