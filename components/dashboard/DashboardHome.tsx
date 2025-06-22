"use client"

import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Users, Truck, Calendar, BarChart3, Clock, CheckCircle, XCircle } from "lucide-react"

export default function DashboardHome() {
  const { user } = useAuth()
  const {
    products,
    purchases,
    sales,
    clients,
    suppliers,
    getLowStockProducts,
    getTotalSales,
    getTotalPurchases,
    getProfit,
  } = useInventory()

  const lowStockProducts = getLowStockProducts()
  const totalSales = getTotalSales()
  const totalPurchases = getTotalPurchases()
  const profit = getProfit()

  // Calculate additional metrics
  const totalProducts = products.length
  const totalClients = clients.length
  const totalSuppliers = suppliers.length
  const averageProductPrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.unitPrice, 0) / totalProducts : 0
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.unitPrice), 0)
  
  // Recent activity (last 7 days)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const recentSales = sales.filter(sale => new Date(sale.saleDate) >= lastWeek)
  const recentPurchases = purchases.filter(purchase => new Date(purchase.purchaseDate) >= lastWeek)

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-gray-800 dark:text-gray-100",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Items in inventory",
    },
    {
      title: "Total Sales",
      value: `Rs ${totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-gray-800 dark:text-gray-100",
      bgColor: "bg-white dark:bg-gray-800",
      description: "All time revenue",
    },
    {
      title: "Total Purchases",
      value: `Rs ${totalPurchases.toLocaleString()}`,
      icon: ShoppingCart,
      color: "text-gray-800 dark:text-gray-100",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Total spending",
    },
    {
      title: "Net Profit",
      value: `Rs ${profit.toLocaleString()}`,
      icon: DollarSign,
      color: profit >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: profit >= 0 ? "Positive balance" : "Negative balance",
    },
    {
      title: "Inventory Value",
      value: `Rs ${totalInventoryValue.toLocaleString()}`,
      icon: BarChart3,
      color: "text-gray-800 dark:text-gray-100",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Current stock value",
    },
    {
      title: "Active Clients",
      value: totalClients,
      icon: Users,
      color: "text-gray-800 dark:text-gray-100",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Registered clients",
    },
  ]

  const quickStats = [
    {
      title: "Suppliers",
      value: totalSuppliers,
      icon: Truck,
      color: "text-gray-700 dark:text-gray-200",
    },
    {
      title: "Avg. Product Price",
      value: `Rs ${averageProductPrice.toFixed(2)}`,
      icon: DollarSign,
      color: "text-gray-700 dark:text-gray-200",
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      title: "This Week Sales",
      value: recentSales.length,
      icon: Calendar,
      color: "text-gray-700 dark:text-gray-200",
    },
  ]

  return (
    <div className="space-y-8 p-6 min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      <div className="space-y-2">
        <h1 className="section-title">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Comprehensive overview of your inventory management system</p>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Total Products */}
          {stats.filter(s => s.title === "Total Products").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* Inventory Value */}
          {stats.filter(s => s.title === "Inventory Value").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* Low Stock Items (from quickStats) */}
          {quickStats.filter(q => q.title === "Low Stock Items").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sales & Purchases Section */}
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-green-500 bg-green-50/60 dark:bg-green-900/20">Sales & Purchases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Total Sales */}
          {stats.filter(s => s.title === "Total Sales").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* Total Purchases */}
          {stats.filter(s => s.title === "Total Purchases").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* Net Profit */}
          {stats.filter(s => s.title === "Net Profit").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* This Week Sales (from quickStats) */}
          {quickStats.filter(q => q.title === "This Week Sales").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* People Section */}
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20">People</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Clients */}
          {stats.filter(s => s.title === "Active Clients").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
          {/* Suppliers (from quickStats) */}
          {quickStats.filter(q => q.title === "Suppliers").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {/* Avg. Product Price (from quickStats) */}
          {quickStats.filter(q => q.title === "Avg. Product Price").map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-200">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {lowStockProducts.length > 0 ? `${lowStockProducts.length} items need attention` : "All items well stocked"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive" className="bg-amber-500 text-white">
                      {product.stockQuantity} left
                    </Badge>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    +{lowStockProducts.length - 5} more items
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">All products are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-200">Recent Sales</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sales.slice(-5).reverse().map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">{sale.productName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sale.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      Rs {(sale.quantitySold * sale.salePrice).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(sale.saleDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="text-center py-6">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No sales recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-200">Recent Purchases</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Latest orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.slice(-5).reverse().map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">{purchase.productName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{purchase.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      Rs {(purchase.quantityPurchased * purchase.purchasePrice).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-center py-6">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No purchases recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-200">This Week's Performance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Sales and purchase activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-900 dark:text-gray-200">Sales</span>
                </div>
                <span className="font-semibold text-green-600">{recentSales.length} transactions</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-900 dark:text-gray-200">Purchases</span>
                </div>
                <span className="font-semibold text-blue-600">{recentPurchases.length} orders</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-200">System Status</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Current system overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Database Status</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Last Backup</span>
                <span className="text-gray-900 dark:text-gray-200">Today</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="text-gray-900 dark:text-gray-200">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">System Version</span>
                <span className="text-gray-900 dark:text-gray-200">v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
