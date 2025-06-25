"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Users, Building2, Clock, DollarSign, BarChart3, X, ChevronLeft, UserCheck, Calendar } from "lucide-react"

interface EmployeeSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function EmployeeSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: EmployeeSidebarProps) {
  const { user } = useAuth()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, adminOnly: false },
    { id: "employee-details", label: "Employee Details", icon: Users, adminOnly: false },
    { id: "monthly-salary", label: "Monthly Salary Details", icon: DollarSign, adminOnly: false },
    { id: "wages", label: "Wages Details", icon: DollarSign, adminOnly: false },
    { id: "report", label: "Report", icon: BarChart3, adminOnly: true },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || user?.role === "admin")

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        bg-gray-900 dark:bg-gray-950 flex flex-col
      `}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 dark:border-gray-600 flex-shrink-0">
          <h1 className="text-xl text-modern-bold text-white">
            Sheel Employment Pro
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              onClick={() => setIsOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-3 py-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start mb-2 transition-all duration-200 text-modern ${
                    activeTab === item.id
                      ? "text-white shadow-lg bg-gray-700 hover:bg-gray-600"
                      : "text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id)
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      setIsOpen(false)
                    }
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* User Profile - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700 dark:border-gray-600">
          <div className="bg-gray-800 dark:bg-gray-700 backdrop-blur-sm rounded-lg p-4 border border-gray-600 dark:border-gray-500">
            <p className="text-sm text-modern-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-300 capitalize text-modern">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  )
} 