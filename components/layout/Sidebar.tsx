"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Home, Package, ShoppingCart, TrendingUp, Users, Truck, BarChart3, X, CheckCircle } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, adminOnly: false },
    { id: "products", label: "Products", icon: Package, adminOnly: false },
    { id: "stock-view", label: "Stock View", icon: Package, adminOnly: false },
    { id: "batches", label: "Batches", icon: Truck, adminOnly: true },
    { id: "purchases", label: "Purchases", icon: ShoppingCart, adminOnly: false },
    { id: "sales", label: "Sales", icon: TrendingUp, adminOnly: false },
    { id: "clients", label: "Clients", icon: Users, adminOnly: false },
    { id: "suppliers", label: "Suppliers", icon: Truck, adminOnly: false },
    { id: "approvals", label: "Approvals", icon: CheckCircle, adminOnly: true },
    { id: "reports", label: "Reports", icon: BarChart3, adminOnly: true },
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
        fixed lg:static inset-y-0 left-0 z-50 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          background: "linear-gradient(180deg, #243642 0%, #165e6c 100%)",
        }}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#44b388]/30">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#44b388] to-white bg-clip-text text-transparent">
            Inventory Pro
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-[#44b388]/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start mb-2 transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-[#44b388]/20"
                  }`}
                  style={
                    activeTab === item.id
                      ? {
                          background: "linear-gradient(135deg, #165e6c 0%, #44b388 100%)",
                          boxShadow: "0 4px 12px rgba(68, 179, 136, 0.3)",
                        }
                      : {}
                  }
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsOpen(false)
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-[#243642]/50 backdrop-blur-sm rounded-lg p-4 border border-[#44b388]/30">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  )
}
