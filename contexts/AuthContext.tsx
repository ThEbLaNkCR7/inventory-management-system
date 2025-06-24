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
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fallback users if API is not available (for development only)
const fallbackUsers = [
  { id: "1", email: "admin@sheelwaterproofing.com", password: "loltheblank@CR7", name: "Admin User", role: "admin" as const },
  { id: "2", email: "user@sheelwaterproofing.com", password: "user@sheel", name: "Regular User", role: "user" as const },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user session is valid
  const isSessionValid = (userData: any): userData is User => {
    return userData && 
           typeof userData === 'object' && 
           userData.id && 
           userData.email && 
           userData.name && 
           userData.role &&
           ['admin', 'user'].includes(userData.role)
  }

  useEffect(() => {
    // Restore user session from localStorage on page reload
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        if (isSessionValid(userData)) {
          setUser(userData)
        } else {
          console.warn("Invalid user data in localStorage, clearing...")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to connect to API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user && isSessionValid(data.user)) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
          return true
        } else {
          console.error("Invalid user data received from API")
          return false
        }
      } else {
        // If API fails, fall back to local authentication (development only)
        console.log("API login failed, trying fallback authentication")
        const foundUser = fallbackUsers.find((u) => u.email === email && u.password === password)
        if (foundUser) {
          const userData = { 
            id: foundUser.id, 
            email: foundUser.email, 
            name: foundUser.name, 
            role: foundUser.role 
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          return true
        }
      }
    } catch (error) {
      console.log("API not available, using fallback authentication")
      // Fallback to local authentication (development only)
      const foundUser = fallbackUsers.find((u) => u.email === email && u.password === password)
      if (foundUser) {
        const userData = { 
          id: foundUser.id, 
          email: foundUser.email, 
          name: foundUser.name, 
          role: foundUser.role 
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return true
      }
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("currentSystem")
    // Clear any other auth-related data
    localStorage.removeItem("sidebarOpen")
    localStorage.removeItem("employeeSidebarOpen")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
