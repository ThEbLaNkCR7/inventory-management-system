"use client"

import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, TrendingDown, Package, AlertTriangle, Calendar, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { getCurrentNepaliYear, getNepaliYear, getNepaliMonth, formatDateForReports } from "@/lib/utils"

const formatDate = (dateString: string) => {
  return formatDateForReports(dateString)
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { products, purchases, sales, getLowStockProducts, getTotalSales, getTotalPurchases, getProfit } =
    useInventory()
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly')

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
      </div>
    )
  }

  const totalSales = getTotalSales()
  const totalPurchases = getTotalPurchases()
  const profit = getProfit()
  const lowStockProducts = getLowStockProducts()

  // Calculate monthly data (simplified for demo)
  const currentNepaliYear = getCurrentNepaliYear()
  const currentNepaliMonth = getNepaliMonth(new Date().toISOString())

  const monthlySales = sales
    .filter((sale) => {
      const saleNepaliYear = getNepaliYear(sale.saleDate)
      const saleNepaliMonth = getNepaliMonth(sale.saleDate)
      return saleNepaliYear === currentNepaliYear && saleNepaliMonth === currentNepaliMonth
    })
    .reduce((total, sale) => total + sale.quantitySold * sale.salePrice, 0)

  const monthlyPurchases = purchases
    .filter((purchase) => {
      const purchaseNepaliYear = getNepaliYear(purchase.purchaseDate)
      const purchaseNepaliMonth = getNepaliMonth(purchase.purchaseDate)
      return purchaseNepaliYear === currentNepaliYear && purchaseNepaliMonth === currentNepaliMonth
    })
    .reduce((total, purchase) => total + purchase.quantityPurchased * purchase.purchasePrice, 0)

  const monthlyProfit = monthlySales - monthlyPurchases

  // Top selling products
  const productSales = sales.reduce(
    (acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantitySold
      return acc
    },
    {} as Record<string, number>,
  )

  const topProducts = products
    .map((product) => ({
      ...product,
      totalSold: productSales[product.id] || 0,
      revenue: sales
        .filter((sale) => sale.productId === product.id)
        .reduce((total, sale) => total + sale.quantitySold * sale.salePrice, 0),
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="relative">
        <div className="space-y-2">
          <h1 className="section-title">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Generate comprehensive reports and analytics</p>
        </div>
        <div className="absolute top-6 right-0 flex space-x-3">
          {/* Export functionality removed */}
        </div>
      </div>

      {/* Report Type Toggle */}
      <Tabs value={reportType} onValueChange={(value) => setReportType(value as 'monthly' | 'yearly')} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="monthly" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Monthly Report</span>
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center space-x-2">
            <BarChart className="h-4 w-4" />
            <span>Yearly Report</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Report Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rs {monthlySales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total sales this month</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Purchases</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Rs {monthlyPurchases.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total purchases this month</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Rs {monthlyProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Net profit this month</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{sales.length + purchases.length}</div>
                <p className="text-xs text-muted-foreground">Total transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Sales vs Purchases Trend</CardTitle>
                <CardDescription>Monthly comparison of sales and purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: "Jan", sales: monthlySales, purchases: monthlyPurchases },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Sales" />
                    <Line type="monotone" dataKey="purchases" stroke="#3B82F6" strokeWidth={2} name="Purchases" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Sales and purchases by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={[
                    { month: "Jan", sales: monthlySales, purchases: monthlyPurchases },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                    <Bar dataKey="sales" fill="#10B981" name="Sales" />
                    <Bar dataKey="purchases" fill="#3B82F6" name="Purchases" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          {/* Yearly Report Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rs {totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total sales this year</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Purchases</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Rs {totalPurchases.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total purchases this year</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Rs {profit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Net profit this year</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{sales.length + purchases.length}</div>
                <p className="text-xs text-muted-foreground">All transactions this year</p>
              </CardContent>
            </Card>
          </div>

          {/* Yearly Summary Table */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Yearly Summary</CardTitle>
              <CardDescription>Monthly breakdown for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Purchases</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Generate monthly data for the current Nepali year
                      const currentNepaliYear = getCurrentNepaliYear()
                      const nepaliMonths = [
                        "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
                        "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
                      ]
                      const monthlyData = []
                      
                      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                        const monthName = nepaliMonths[monthIndex]
                        const monthNumber = monthIndex + 1 // Convert to 1-based month number
                        const monthSales = sales.filter(sale => {
                          const saleNepaliYear = getNepaliYear(sale.saleDate)
                          const saleNepaliMonth = getNepaliMonth(sale.saleDate)
                          return saleNepaliYear === currentNepaliYear && saleNepaliMonth === monthNumber
                        })
                        const monthPurchases = purchases.filter(purchase => {
                          const purchaseNepaliYear = getNepaliYear(purchase.purchaseDate)
                          const purchaseNepaliMonth = getNepaliMonth(purchase.purchaseDate)
                          return purchaseNepaliYear === currentNepaliYear && purchaseNepaliMonth === monthNumber
                        })
                        
                        const totalSales = monthSales.reduce((sum, sale) => sum + (sale.quantitySold * sale.salePrice), 0)
                        const totalPurchases = monthPurchases.reduce((sum, purchase) => sum + (purchase.quantityPurchased * purchase.purchasePrice), 0)
                        const profit = totalSales - totalPurchases
                        const transactions = monthSales.length + monthPurchases.length
                        
                        monthlyData.push({
                          month: monthName,
                          sales: totalSales,
                          purchases: totalPurchases,
                          profit: profit,
                          transactions: transactions
                        })
                      }
                      
                      return monthlyData.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{data.month}</TableCell>
                          <TableCell>Rs {data.sales.toLocaleString()}</TableCell>
                          <TableCell>Rs {data.purchases.toLocaleString()}</TableCell>
                          <TableCell>Rs {data.profit.toLocaleString()}</TableCell>
                          <TableCell>{data.transactions}</TableCell>
                        </TableRow>
                      ))
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rs {totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              This month: Rs {monthlySales.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              Rs {totalPurchases.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              This month: Rs {monthlyPurchases.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Net Profit</CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              Rs {profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              This month: Rs {monthlyProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-gray-200">
              <BarChart3 className="mr-2 h-5 w-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Best performing products by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium dark:text-gray-200">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">HS Code: {product.hsCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium dark:text-gray-200">{product.totalSold} sold</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Rs {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-400">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div>
                    <p className="font-medium dark:text-gray-200">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">HS Code: {product.hsCode}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category: {product.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {product.stockQuantity} left
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rs {product.unitPrice}</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-green-400 mb-4" />
                  <p className="text-green-600 dark:text-green-400 font-medium">All products are well stocked!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-200">Recent Activity Summary</CardTitle>
          <CardDescription className="dark:text-gray-400">Latest transactions and inventory changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">Date</TableHead>
                  <TableHead className="dark:text-gray-300">Type</TableHead>
                  <TableHead className="dark:text-gray-300">Product</TableHead>
                  <TableHead className="dark:text-gray-300">Quantity</TableHead>
                  <TableHead className="dark:text-gray-300">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Combine and sort recent sales and purchases */}
                {[
                  ...sales.slice(-5).map((sale) => ({
                    ...sale,
                    type: "Sale",
                    date: sale.saleDate,
                    quantity: sale.quantitySold,
                    amount: sale.quantitySold * sale.salePrice,
                  })),
                  ...purchases.slice(-5).map((purchase) => ({
                    ...purchase,
                    type: "Purchase",
                    date: purchase.purchaseDate,
                    quantity: purchase.quantityPurchased,
                    amount: purchase.quantityPurchased * purchase.purchasePrice,
                  })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((activity, index) => (
                    <TableRow key={index} className="dark:border-gray-700">
                      <TableCell className="dark:text-gray-300">{formatDate(activity.date)}</TableCell>
                      <TableCell>
                        <Badge variant={activity.type === "Sale" ? "default" : "secondary"}>{activity.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium dark:text-gray-200">{activity.productName}</TableCell>
                      <TableCell className="dark:text-gray-300">{activity.quantity}</TableCell>
                      <TableCell
                        className={
                          activity.type === "Sale"
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }
                      >
                        Rs {activity.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
