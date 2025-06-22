"use client"

import { EmployeeProvider } from "@/contexts/EmployeeContext"
import EmployeeDashboardLayout from "@/components/employee/EmployeeDashboardLayout"

export default function EmployeeDashboardPage() {
  return (
    <EmployeeProvider>
      <EmployeeDashboardLayout />
    </EmployeeProvider>
  )
} 