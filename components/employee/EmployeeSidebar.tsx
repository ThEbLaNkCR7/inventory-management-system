"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, DollarSign, X, ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"

interface EmployeeSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function EmployeeSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: EmployeeSidebarProps) {
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
      
      // Auto-close sidebar on mobile when screen size changes
      if (window.innerWidth < 1024 && isOpen) {
        setIsOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isOpen, setIsOpen])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, adminOnly: false },
    { id: "employee-details", label: "Employee Details", icon: Users, adminOnly: false },
    { id: "monthly-salary", label: "Monthly Salary Details", icon: DollarSign, adminOnly: false },
    { id: "wages", label: "Wages Details", icon: DollarSign, adminOnly: false },
    { id: "report", label: "Report", icon: BarChart3, adminOnly: true },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || user?.role === "admin")

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId)
    // Close sidebar on mobile after menu item click
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out
          bg-gray-900 dark:bg-gray-950 flex flex-col
          ${isMobile 
            ? (isOpen ? "translate-x-0" : "-translate-x-full") 
            : (isOpen ? "translate-x-0" : "-translate-x-full")
          }
        `}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 dark:border-gray-600 flex-shrink-0">
          <h1 className="text-xl text-modern-bold text-white">
            Sheel Employment Pro
          </h1>
          <div className="flex items-center gap-2">
            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            {/* Desktop collapse button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={() => setIsOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
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
                  onClick={() => handleMenuItemClick(item.id)}
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