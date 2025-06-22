"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for initial setup
const demoUsers = [
  { id: "1", email: "admin@demo.com", password: "admin123", name: "Admin User", role: "admin" as const },
  { id: "2", email: "user@demo.com", password: "user123", name: "Regular User", role: "user" as const },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Don't automatically restore user session from localStorage
    // This ensures the login page always shows on startup
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const foundUser = demoUsers.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      const userData = { id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role }
      setUser(userData)
      // Still store in localStorage for the current session
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
