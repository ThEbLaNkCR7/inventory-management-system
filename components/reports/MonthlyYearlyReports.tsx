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
} from "lucide-react"
import { exportToCSV, exportToExcel, exportMultipleSheetsAllFormats } from "@/utils/exportUtils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">
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
  <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">Rs {value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
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

  // Enhanced monthly data with gradients
  const enhancedMonthlyData = monthlyData.map((month, index) => ({
    ...month,
    monthShort: month.month.substring(0, 3),
    profitMargin: month.sales > 0 ? ((month.profit / month.sales) * 100).toFixed(1) : 0,
  }))

  const exportMonthlyData = (format: "excel" | "csv") => {
    const data = monthlyData.map((month) => ({
      Month: month.month,
      "Sales (Rs)": month.sales,
      "Purchases (Rs)": month.purchases,
      "Profit (Rs)": month.profit,
      "Sales Count": month.salesCount,
      "Purchases Count": month.purchasesCount,
    }))

    const filename = `monthly-report-${selectedYear}`

    if (format === "excel") {
      exportToExcel(data, filename)
    } else {
      exportToCSV(data, filename)
    }
  }

  const exportYearlyData = (format: "excel" | "csv") => {
    const data = yearlyData.map((year) => ({
      Year: year.year,
      "Total Sales (Rs)": year.sales,
      "Total Purchases (Rs)": year.purchases,
      "Total Profit (Rs)": year.profit,
    }))

    const filename = "yearly-summary-report"

    if (format === "excel") {
      exportToExcel(data, filename)
    } else {
      exportToCSV(data, filename)
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Financial Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Comprehensive monthly and yearly performance insights
        </p>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly Reports
          </TabsTrigger>
          <TabsTrigger value="yearly" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
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
              color="from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Total Purchases"
              value={monthlyData.reduce((sum, month) => sum + month.purchases, 0)}
              subtitle={`${selectedYear} Total`}
              icon={Activity}
              trend={{ direction: "up", value: "8.2" }}
              color="from-green-500 to-green-600"
            />
            <MetricCard
              title="Net Profit"
              value={monthlyData.reduce((sum, month) => sum + month.profit, 0)}
              subtitle={`${selectedYear} Total`}
              icon={TrendingUp}
              trend={{ direction: "up", value: "15.3" }}
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              title="Avg Monthly"
              value={Math.round(monthlyData.reduce((sum, month) => sum + month.sales, 0) / 12)}
              subtitle="Sales Average"
              icon={PieChart}
              trend={{ direction: "up", value: "5.1" }}
              color="from-orange-500 to-orange-600"
            />
          </div>

          {/* Monthly Performance Chart */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Monthly Performance - {selectedYear}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Detailed month-by-month financial analysis
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-32 bg-white/80 dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                      <DropdownMenuItem
                        onClick={() => exportMonthlyData("csv")}
                        className="dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportMonthlyData("excel")}
                        className="dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Enhanced Area Chart */}
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={enhancedMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="monthShort" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="purchases"
                      stackId="2"
                      stroke="#10B981"
                      fill="url(#purchasesGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="3"
                      stroke="#8B5CF6"
                      fill="url(#profitGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Monthly Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-700/80">
                      <TableHead className="font-semibold dark:text-gray-300">Month</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Sales</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Purchases</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Profit</TableHead>
                      <TableHead className="text-center font-semibold dark:text-gray-300">Margin %</TableHead>
                      <TableHead className="text-center font-semibold dark:text-gray-300">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enhancedMonthlyData.map((month) => (
                      <TableRow
                        key={month.month}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                      >
                        <TableCell className="font-medium dark:text-gray-200">{month.month}</TableCell>
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
                          <Badge variant={Number(month.profitMargin) >= 20 ? "default" : "secondary"}>
                            {month.profitMargin}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Badge variant="default" className="text-xs">
                              {month.salesCount}S
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {month.purchasesCount}P
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          {/* Yearly Summary */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
                    Yearly Performance Overview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Multi-year financial comparison and trends
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuItem
                      onClick={() => exportYearlyData("csv")}
                      className="dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportYearlyData("excel")}
                      className="dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {/* Yearly Trend Chart */}
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Sales"
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="purchases"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Purchases"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Profit"
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Yearly Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-700/80">
                      <TableHead className="font-semibold dark:text-gray-300">Year</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Total Sales</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Total Purchases</TableHead>
                      <TableHead className="text-right font-semibold dark:text-gray-300">Net Profit</TableHead>
                      <TableHead className="text-center font-semibold dark:text-gray-300">Growth</TableHead>
                      <TableHead className="text-center font-semibold dark:text-gray-300">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyData.map((year, index) => {
                      const previousYear = yearlyData[index + 1]
                      const growth = previousYear ? ((year.sales - previousYear.sales) / previousYear.sales) * 100 : 0
                      const margin = year.sales > 0 ? ((year.profit / year.sales) * 100).toFixed(1) : 0

                      return (
                        <TableRow
                          key={year.year}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                        >
                          <TableCell className="font-medium text-lg dark:text-gray-200">{year.year}</TableCell>
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
                            {previousYear && (
                              <Badge variant={growth >= 0 ? "default" : "destructive"}>
                                {growth >= 0 ? "+" : ""}
                                {growth.toFixed(1)}%
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={Number(margin) >= 20 ? "default" : "secondary"}>{margin}%</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Yearly Breakdown */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                    Detailed Analysis - {selectedYearForDetails}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Complete monthly breakdown with transaction insights
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedYearForDetails.toString()}
                    onValueChange={(value) => setSelectedYearForDetails(Number(value))}
                  >
                    <SelectTrigger className="w-32 bg-white/80 dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={exportDetailedYearlyData}
                    variant="outline"
                    className="gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    <Download className="h-4 w-4" />
                    Export Complete Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentYearData && (
                <div className="space-y-6">
                  {/* Year Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                      title="Annual Sales"
                      value={currentYearData.sales}
                      subtitle={`${selectedYearForDetails} Total`}
                      icon={DollarSign}
                      color="from-green-500 to-green-600"
                    />
                    <MetricCard
                      title="Annual Purchases"
                      value={currentYearData.purchases}
                      subtitle={`${selectedYearForDetails} Total`}
                      icon={Activity}
                      color="from-red-500 to-red-600"
                    />
                    <MetricCard
                      title="Annual Profit"
                      value={currentYearData.profit}
                      subtitle={`${selectedYearForDetails} Total`}
                      icon={TrendingUp}
                      color="from-purple-500 to-purple-600"
                    />
                  </div>

                  {/* Monthly Breakdown Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80 dark:bg-gray-700/80">
                          <TableHead className="font-semibold dark:text-gray-300">Month</TableHead>
                          <TableHead className="text-right font-semibold dark:text-gray-300">Sales</TableHead>
                          <TableHead className="text-right font-semibold dark:text-gray-300">Purchases</TableHead>
                          <TableHead className="text-right font-semibold dark:text-gray-300">Profit</TableHead>
                          <TableHead className="text-center font-semibold dark:text-gray-300">Margin</TableHead>
                          <TableHead className="text-center font-semibold dark:text-gray-300">Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentYearData.monthlyBreakdown.map((month) => {
                          const margin = month.sales > 0 ? ((month.profit / month.sales) * 100).toFixed(1) : 0
                          return (
                            <TableRow
                              key={month.month}
                              className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                            >
                              <TableCell className="font-medium dark:text-gray-200">{month.month}</TableCell>
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
                                <Badge variant={Number(margin) >= 20 ? "default" : "secondary"}>{margin}%</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center space-x-1">
                                  <Badge variant="default" className="text-xs">
                                    {month.salesCount}S
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {month.purchasesCount}P
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
