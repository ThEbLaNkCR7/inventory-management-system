"use client"

import { useAuth } from "@/contexts/AuthContext"
import SwitchableLoginForm from "@/components/auth/SwitchableLoginForm"
import Dashboard from "@/components/Dashboard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ) : (
        <SwitchableLoginForm />
      )}
    </div>
  )
}
