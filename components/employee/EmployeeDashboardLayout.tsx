"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import EmployeeSidebar from "@/components/employee/EmployeeSidebar"
import Header from "@/components/layout/Header"
import EmployeeDashboard from "@/components/employee/EmployeeDashboard"
import EmployeesPage from "@/components/employee/EmployeesPage"
import MonthlySalaryPage from "@/components/employee/MonthlySalaryPage"
import WagesPage from "@/components/employee/WagesPage"
import ReportPage from "@/components/employee/ReportPage"
import { ChevronRight } from "lucide-react"

function EmployeeDashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "dashboard"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isMobile, setIsMobile] = useState(false)
  
  // Initialize sidebar state from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('employeeSidebarOpen')
      return stored ? JSON.parse(stored) : true // Default to open
    }
    return true
  })
  
  const mainContentRef = useRef<HTMLElement>(null)

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // Auto-close sidebar on mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [sidebarOpen])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('employeeSidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  // Update URL when activeTab changes
  useEffect(() => {
    if (activeTab) {
      const params = new URLSearchParams(window.location.search)
      params.set("tab", activeTab)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, "", newUrl)
    }
  }, [activeTab])

  // Reset scroll position when activeTab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <EmployeeDashboard />
      case "employee-details":
        return <EmployeesPage />
      case "monthly-salary":
        return <MonthlySalaryPage />
      case "wages":
        return <WagesPage />
      case "report":
        return <ReportPage />
      default:
        return <EmployeeDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${
        !isMobile && sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Sidebar toggle button - only show on desktop when sidebar is closed */}
        {!isMobile && !sidebarOpen && (
          <button
            className="fixed top-4 left-4 z-50 flex items-center justify-center bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl p-2 hover:bg-gray-700 transition-all duration-300 hover:scale-110 transform"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
        
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} isMobile={isMobile} />
        
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 transition-colors duration-300"
        >
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default function EmployeeDashboardLayout() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <EmployeeDashboardContent />
    </Suspense>
  )
} 