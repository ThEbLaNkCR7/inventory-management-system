"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import DashboardHome from "@/components/dashboard/DashboardHome"
import ProductsPage from "./products/ProductsPage"
import PurchasesPage from "@/components/purchases/PurchasesPage"
import SalesPage from "@/components/sales/SalesPage"
import ClientsPage from "@/components/clients/ClientsPage"
import SuppliersPage from "@/components/suppliers/SuppliersPage"
import ReportsPage from "@/components/reports/ReportsPage"
import BatchesPage from "@/components/batches/BatchesPage"
import StockViewPage from "@/components/stock/StockViewPage"
import ApprovalsPage from "@/components/approvals/ApprovalsPage"
import VisualReports from "@/components/reports/VisualReports"
import PaymentsPage from "@/components/payments/PaymentsPage"
import { ChevronRight, Menu } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "dashboard"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isMobile, setIsMobile] = useState(false)
  
  // Initialize sidebar state from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarOpen')
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
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
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
        return <DashboardHome />
      case "products":
        return <ProductsPage />
      case "stock-view":
        return <StockViewPage />
      case "batches":
        return <BatchesPage />
      case "purchases":
        return <PurchasesPage />
      case "sales":
        return <SalesPage />
      case "clients":
        return <ClientsPage />
      case "suppliers":
        return <SuppliersPage />
      case "approvals":
        return <ApprovalsPage />
      case "reports":
        return <ReportsPage />
      case "visual-reports":
        return <VisualReports />
      case "payments":
        return <PaymentsPage />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        isMobile={isMobile}
      />
      
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
        
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        
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
