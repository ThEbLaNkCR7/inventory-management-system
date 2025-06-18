"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import DashboardHome from "@/components/dashboard/DashboardHome"
import ProductsPage from "@/components/products/ProductsPage"
import PurchasesPage from "@/components/purchases/PurchasesPage"
import SalesPage from "@/components/sales/SalesPage"
import ClientsPage from "@/components/clients/ClientsPage"
import SuppliersPage from "@/components/suppliers/SuppliersPage"
import ReportsPage from "@/components/reports/ReportsPage"
import BatchesPage from "@/components/batches/BatchesPage"
import StockViewPage from "@/components/stock/StockViewPage"
import ApprovalsPage from "@/components/approvals/ApprovalsPage"
import VisualReports from "@/components/reports/VisualReports"

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
