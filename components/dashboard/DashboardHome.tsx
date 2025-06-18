"use client"

import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Users, Truck } from "lucide-react"

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

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-[#165e6c]",
      bgColor: "bg-[#165e6c]/10",
      hoverColor: "hover:bg-[#44b388]/20",
    },
    {
      title: "Total Sales",
      value: `Rs ${totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-[#44b388]",
      bgColor: "bg-[#44b388]/10",
      hoverColor: "hover:bg-[#44b388]/20",
    },
    {
      title: "Total Purchases",
      value: `Rs ${totalPurchases.toLocaleString()}`,
      icon: ShoppingCart,
      color: "text-[#165e6c]",
      bgColor: "bg-[#165e6c]/10",
      hoverColor: "hover:bg-[#165e6c]/20",
    },
    {
      title: "Profit/Loss",
      value: `Rs ${profit.toLocaleString()}`,
      icon: DollarSign,
      color: profit >= 0 ? "text-[#44b388]" : "text-red-600",
      bgColor: profit >= 0 ? "bg-[#44b388]/10" : "bg-red-100",
      hoverColor: profit >= 0 ? "hover:bg-[#44b388]/20" : "hover:bg-red-200",
    },
    {
      title: "Clients",
      value: clients.length,
      icon: Users,
      color: "text-[#243642]",
      bgColor: "bg-[#243642]/10",
      hoverColor: "hover:bg-[#243642]/20",
    },
    {
      title: "Suppliers",
      value: suppliers.length,
      icon: Truck,
      color: "text-[#165e6c]",
      bgColor: "bg-[#165e6c]/10",
      hoverColor: "hover:bg-[#165e6c]/20",
    },
  ]

  return (
    <div
      className="space-y-8 p-6 min-h-screen transition-colors duration-300"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, rgba(22, 94, 108, 0.05) 100%)",
      }}
    >
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#243642] to-[#165e6c] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Overview of your inventory management system</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-105 ${stat.hoverColor}`}
              style={{
                border: "1px solid rgba(22, 94, 108, 0.1)",
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-[#243642]">{stat.title}</CardTitle>
                <div
                  className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card
          className="border-0 bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-sm"
          style={{
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-[#243642]">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-gray-600">The following products are running low on stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  style={{
                    border: "1px solid rgba(22, 94, 108, 0.1)",
                  }}
                >
                  <div>
                    <p className="font-medium text-[#243642]">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <Badge variant="destructive" className="bg-red-500 text-white">
                    {product.stockQuantity} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="bg-white/90 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            border: "1px solid rgba(22, 94, 108, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-[#243642]">Recent Sales</CardTitle>
            <CardDescription className="text-gray-600">Latest sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sales
                .slice(-5)
                .reverse()
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                    style={{
                      background: "linear-gradient(135deg, rgba(68, 179, 136, 0.05) 0%, rgba(22, 94, 108, 0.05) 100%)",
                      border: "1px solid rgba(68, 179, 136, 0.1)",
                    }}
                  >
                    <div>
                      <p className="font-medium text-[#243642]">{sale.productName}</p>
                      <p className="text-sm text-gray-600">{sale.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#44b388]">
                        Rs {(sale.quantitySold * sale.salePrice).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(sale.saleDate).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              {sales.length === 0 && <p className="text-gray-500 text-center py-4">No sales recorded yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-white/90 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            border: "1px solid rgba(22, 94, 108, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-[#243642]">Recent Purchases</CardTitle>
            <CardDescription className="text-gray-600">Latest purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases
                .slice(-5)
                .reverse()
                .map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                    style={{
                      background: "linear-gradient(135deg, rgba(22, 94, 108, 0.05) 0%, rgba(36, 54, 66, 0.05) 100%)",
                      border: "1px solid rgba(22, 94, 108, 0.1)",
                    }}
                  >
                    <div>
                      <p className="font-medium text-[#243642]">{purchase.productName}</p>
                      <p className="text-sm text-gray-600">{purchase.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#165e6c]">
                        Rs {(purchase.quantityPurchased * purchase.purchasePrice).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{purchase.purchaseDate}</p>
                    </div>
                  </div>
                ))}
              {purchases.length === 0 && <p className="text-gray-500 text-center py-4">No purchases recorded yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
