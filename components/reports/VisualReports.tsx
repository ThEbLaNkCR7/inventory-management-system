"use client"

import { useInventory } from "@/contexts/InventoryContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]
const GRADIENT_COLORS = [
  { id: "salesGradient", color1: "#3B82F6", color2: "#1D4ED8" },
  { id: "purchasesGradient", color1: "#10B981", color2: "#059669" },
  { id: "profitGradient", color1: "#F59E0B", color2: "#D97706" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: Rs {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">Rs {value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function VisualReports() {
  const { products, sales, purchases, getTotalSales, getTotalPurchases, getProfit } = useInventory()

  const totalSales = getTotalSales()
  const totalPurchases = getTotalPurchases()
  const totalProfit = getProfit()
  const totalProducts = products.length

  // Enhanced sales vs purchases data
  const salesVsPurchasesData = [
    {
      name: "Revenue",
      Sales: totalSales,
      Purchases: totalPurchases,
      Profit: totalProfit,
    },
  ]

  // Stock distribution by category with enhanced data
  const categoryData = products.reduce(
    (acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0, percentage: 0 }
      }
      acc[category].value += product.stockQuantity * product.unitPrice
      acc[category].count += product.stockQuantity
      return acc
    },
    {} as Record<string, { name: string; value: number; count: number; percentage: number }>,
  )

  const stockDistributionData = Object.values(categoryData).map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    percentage: ((item.value / Object.values(categoryData).reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1),
  }))

  // Enhanced monthly trends with more realistic data
  const monthlyTrendsData = [
    { month: "Jan", sales: 45000, purchases: 32000, profit: 13000 },
    { month: "Feb", sales: 52000, purchases: 38000, profit: 14000 },
    { month: "Mar", sales: 48000, purchases: 35000, profit: 13000 },
    { month: "Apr", sales: 61000, purchases: 42000, profit: 19000 },
    { month: "May", sales: 55000, purchases: 40000, profit: 15000 },
    { month: "Jun", sales: 67000, purchases: 45000, profit: 22000 },
  ]

  // Top products with enhanced visualization
  const topProductsData = products
    .map((product) => ({
      name: product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name,
      value: product.stockQuantity * product.unitPrice,
      stock: product.stockQuantity,
      category: product.category,
      fill: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Performance metrics for radial chart
  const performanceData = [
    { name: "Sales Target", value: 75, fill: "#3B82F6" },
    { name: "Inventory Turnover", value: 60, fill: "#10B981" },
    { name: "Profit Margin", value: 45, fill: "#F59E0B" },
    { name: "Customer Satisfaction", value: 85, fill: "#EF4444" },
  ]

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Visual Analytics Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Real-time insights and performance metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={totalSales}
          icon={DollarSign}
          trend="up"
          trendValue="12.5"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Purchases"
          value={totalPurchases}
          icon={ShoppingCart}
          trend="up"
          trendValue="8.2"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Net Profit"
          value={totalProfit}
          icon={TrendingUp}
          trend="up"
          trendValue="15.3"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          trend="up"
          trendValue="5.1"
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales vs Purchases - Enhanced Bar Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Revenue Overview</CardTitle>
                <CardDescription className="text-gray-600">Sales, purchases, and profit comparison</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesVsPurchasesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  {GRADIENT_COLORS.map((gradient) => (
                    <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradient.color1} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={gradient.color2} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Sales" fill="url(#salesGradient)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Purchases" fill="url(#purchasesGradient)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="url(#profitGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Distribution - Enhanced Pie Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Inventory Distribution</CardTitle>
                <CardDescription className="text-gray-600">Stock value by category</CardDescription>
              </div>
              <div className="flex gap-2">
                {stockDistributionData.slice(0, 3).map((entry, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {entry.name}: {entry.percentage}%
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stockDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`Rs ${value.toLocaleString()}`, "Value"]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => <span style={{ color: entry.color }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends - Enhanced Area Chart */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Monthly Performance Trends</CardTitle>
              <CardDescription className="text-gray-600">6-month sales, purchases, and profit analysis</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Purchases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Profit</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="purchasesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stackId="1"
                stroke="#3B82F6"
                fill="url(#salesArea)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="purchases"
                stackId="2"
                stroke="#10B981"
                fill="url(#purchasesArea)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="3"
                stroke="#8B5CF6"
                fill="url(#profitArea)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products - Horizontal Bar Chart */}
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Top Products by Value</CardTitle>
            <CardDescription className="text-gray-600">Highest inventory value products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`Rs ${value.toLocaleString()}`, "Value"]}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics - Donut Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Performance Metrics</CardTitle>
            <CardDescription className="text-gray-600">Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Performance"]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color, fontSize: "12px" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Performance Indicators */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {performanceData.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.fill }} />
                    <span className="text-xs text-gray-600">{metric.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{metric.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
