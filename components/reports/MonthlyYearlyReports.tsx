"use client"

import { useState } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Info,
} from "lucide-react"
import { exportToCSV, exportToExcel, exportMultipleSheetsAllFormats } from "@/utils/exportUtils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const SimpleTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {entry.name}: <span className="font-semibold">Rs {entry.value.toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color }: any) => (
  <Card className="border border-gray-200 dark:border-gray-700">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rs {value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {trend.direction === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend.value}% vs last period
          </span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function MonthlyYearlyReports() {
  const { getMonthlyData, getYearlyData, getSalesData, getPurchasesData } = useInventory()
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedYearForDetails, setSelectedYearForDetails] = useState<number>(new Date().getFullYear())

  const monthlyData = getMonthlyData(selectedYear)
  const yearlyData = getYearlyData()
  const currentYearData = yearlyData.find((y) => y.year === selectedYearForDetails)

  // Available years for selection
  const availableYears = yearlyData.map((y) => y.year)

  // Simple monthly data for charts
  const chartMonthlyData = monthlyData.map((month) => ({
    month: month.month.substring(0, 3),
    sales: month.sales,
    purchases: month.purchases,
    profit: month.profit,
  }))

  const exportMonthlyData = (format: "excel" | "csv") => {
    console.log("Monthly export triggered:", format)
    
    const data = monthlyData.map((month) => ({
      Month: month.month,
      "Sales (Rs)": month.sales,
      "Purchases (Rs)": month.purchases,
      "Profit (Rs)": month.profit,
      "Sales Count": month.salesCount,
      "Purchases Count": month.purchasesCount,
    }))

    const filename = `monthly-report-${selectedYear}`

    try {
      if (format === "excel") {
        exportToExcel(data, filename)
        console.log("Monthly Excel export completed")
      } else {
        exportToCSV(data, filename)
        console.log("Monthly CSV export completed")
      }
    } catch (error) {
      console.error("Monthly export error:", error)
    }
  }

  const exportYearlyData = (format: "excel" | "csv") => {
    console.log("Yearly export triggered:", format)
    
    const data = yearlyData.map((year) => ({
      Year: year.year,
      "Total Sales (Rs)": year.sales,
      "Total Purchases (Rs)": year.purchases,
      "Total Profit (Rs)": year.profit,
    }))

    const filename = "yearly-summary-report"

    try {
      if (format === "excel") {
        exportToExcel(data, filename)
        console.log("Yearly Excel export completed")
      } else {
        exportToCSV(data, filename)
        console.log("Yearly CSV export completed")
      }
    } catch (error) {
      console.error("Yearly export error:", error)
    }
  }

  const exportDetailedYearlyData = () => {
    if (!currentYearData) return

    const sheets = [
      {
        name: "Yearly Summary",
        data: [
          {
            Year: currentYearData.year,
            "Total Sales (Rs)": currentYearData.sales,
            "Total Purchases (Rs)": currentYearData.purchases,
            "Total Profit (Rs)": currentYearData.profit,
          },
        ],
      },
      {
        name: "Monthly Breakdown",
        data: currentYearData.monthlyBreakdown.map((month) => ({
          Month: month.month,
          "Sales (Rs)": month.sales,
          "Purchases (Rs)": month.purchases,
          "Profit (Rs)": month.profit,
          "Sales Count": month.salesCount,
          "Purchases Count": month.purchasesCount,
        })),
      },
      {
        name: "Sales Details",
        data: getSalesData("yearly", selectedYearForDetails).map((sale) => ({
          Date: formatDate(sale.saleDate),
          Product: sale.productName,
          Client: sale.client,
          Quantity: sale.quantitySold,
          "Unit Price (Rs)": sale.salePrice,
          "Total (Rs)": sale.quantitySold * sale.salePrice,
        })),
      },
      {
        name: "Purchase Details",
        data: getPurchasesData("yearly", selectedYearForDetails).map((purchase) => ({
          Date: formatDate(purchase.purchaseDate),
          Product: purchase.productName,
          Supplier: purchase.supplier,
          Quantity: purchase.quantityPurchased,
          "Unit Price (Rs)": purchase.purchasePrice,
          "Total (Rs)": purchase.quantityPurchased * purchase.purchasePrice,
        })),
      },
    ]

    exportMultipleSheetsAllFormats(sheets, `detailed-yearly-report-${selectedYearForDetails}`)
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="space-y-2">
        <h1 className="section-title">
          Monthly & Yearly Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Simple period-based reporting</p>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly Reports
          </TabsTrigger>
          <TabsTrigger value="yearly">
            <BarChart3 className="h-4 w-4 mr-2" />
            Yearly Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Sales"
              value={monthlyData.reduce((sum, month) => sum + month.sales, 0)}
              subtitle={`${selectedYear} Total`}
              icon={DollarSign}
              trend={{ direction: "up", value: "12.5" }}
              color="bg-blue-500"
            />
            <MetricCard
              title="Total Purchases"
              value={monthlyData.reduce((sum, month) => sum + month.purchases, 0)}
              subtitle={`${selectedYear} Total`}
              icon={Activity}
              trend={{ direction: "up", value: "8.2" }}
              color="bg-green-500"
            />
            <MetricCard
              title="Net Profit"
              value={monthlyData.reduce((sum, month) => sum + month.profit, 0)}
              subtitle={`${selectedYear} Total`}
              icon={TrendingUp}
              trend={{ direction: "up", value: "15.3" }}
              color="bg-purple-500"
            />
            <MetricCard
              title="Avg Monthly"
              value={Math.round(monthlyData.reduce((sum, month) => sum + month.sales, 0) / 12)}
              subtitle="Sales Average"
              icon={PieChart}
              trend={{ direction: "up", value: "5.1" }}
              color="bg-gray-500"
            />
          </div>

          {/* Monthly Performance Chart */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Monthly Trends - {selectedYear}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    How your business performed each month
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Line Chart */}
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<SimpleTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Sales"
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="purchases" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Purchases"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      name="Profit"
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Simple Monthly Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Month</TableHead>
                      <TableHead className="text-right font-semibold">Sales</TableHead>
                      <TableHead className="text-right font-semibold">Purchases</TableHead>
                      <TableHead className="text-right font-semibold">Profit</TableHead>
                      <TableHead className="text-center font-semibold">Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((month) => {
                      const profitMargin = month.sales > 0 ? ((month.profit / month.sales) * 100).toFixed(1) : 0
                      return (
                        <TableRow key={month.month} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium">{month.month}</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                            Rs {month.sales.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                            Rs {month.purchases.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${month.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            Rs {month.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={Number(profitMargin) >= 20 ? "default" : "secondary"}>
                              {profitMargin}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          {/* Yearly Summary */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Yearly Performance Overview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Compare performance across different years
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Yearly Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="text-right font-semibold">Total Sales</TableHead>
                      <TableHead className="text-right font-semibold">Total Purchases</TableHead>
                      <TableHead className="text-right font-semibold">Total Profit</TableHead>
                      <TableHead className="text-center font-semibold">Profit Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyData.map((year) => {
                      const profitMargin = year.sales > 0 ? ((year.profit / year.sales) * 100).toFixed(1) : 0
                      return (
                        <TableRow key={year.year} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium">{year.year}</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                            Rs {year.sales.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                            Rs {year.purchases.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${year.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            Rs {year.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={Number(profitMargin) >= 20 ? "default" : "secondary"}>
                              {profitMargin}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Year Report */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Detailed Year Report
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Get detailed breakdown for a specific year
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedYearForDetails.toString()} onValueChange={(value) => setSelectedYearForDetails(Number(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentYearData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">Total Sales</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        Rs {currentYearData.sales.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Total Purchases</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        Rs {currentYearData.purchases.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-800 dark:text-purple-200">Total Profit</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        Rs {currentYearData.profit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Year Summary</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      In {currentYearData.year}, you had {currentYearData.monthlyBreakdown.length} months of data with an average monthly profit of Rs {Math.round(currentYearData.profit / currentYearData.monthlyBreakdown.length).toLocaleString()}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available for the selected year</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
