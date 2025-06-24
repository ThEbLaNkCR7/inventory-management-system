"use client"

import { EmployeeProvider } from "@/contexts/EmployeeContext"
import EmployeeDashboardLayout from "@/components/employee/EmployeeDashboardLayout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function EmployeeDashboardPage() {
  return (
    <ProtectedRoute>
      <EmployeeProvider>
        <EmployeeDashboardLayout />
      </EmployeeProvider>
    </ProtectedRoute>
  )
} 