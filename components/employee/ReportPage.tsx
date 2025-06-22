"use client"

import { useState } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, TrendingDown, Calendar, Download, BarChart3, PieChart } from "lucide-react"

export default function ReportPage() {
  const { employees, departments } = useEmployee()
  const [selectedReport, setSelectedReport] = useState("overview")
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  // Mock data for reports - in real app, this would come from API
  const mockSalaryData = [
    { month: "Jan", total: 450000, paid: 420000, pending: 30000 },
    { month: "Feb", total: 480000, paid: 450000, pending: 30000 },
    { month: "Mar", total: 520000, paid: 500000, pending: 20000 },
    { month: "Apr", total: 490000, paid: 470000, pending: 20000 },
    { month: "May", total: 510000, paid: 490000, pending: 20000 },
    { month: "Jun", total: 540000, paid: 520000, pending: 20000 },
  ]

  const mockWageData = [
    { month: "Jan", regular: 380000, overtime: 70000, total: 450000 },
    { month: "Feb", regular: 400000, overtime: 80000, total: 480000 },
    { month: "Mar", regular: 420000, overtime: 100000, total: 520000 },
    { month: "Apr", regular: 410000, overtime: 80000, total: 490000 },
    { month: "May", regular: 430000, overtime: 80000, total: 510000 },
    { month: "Jun", regular: 450000, overtime: 90000, total: 540000 },
  ]

  const departmentStats = departments.map(dept => {
    const deptEmployees = employees.filter(emp => emp.department === dept.name)
    const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0)
    return {
      name: dept.name,
      employeeCount: deptEmployees.length,
      totalSalary,
      avgSalary: deptEmployees.length > 0 ? totalSalary / deptEmployees.length : 0
    }
  })

  const activeEmployees = employees.filter(emp => emp.status === "active")
  const inactiveEmployees = employees.filter(emp => emp.status === "inactive")
  const onLeaveEmployees = employees.filter(emp => emp.status === "on_leave")

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0)
  const avgSalary = employees.length > 0 ? totalSalary / employees.length : 0

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeEmployees.length} active, {inactiveEmployees.length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: Rs {avgSalary.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Across organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onLeaveEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently on leave
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Status Distribution</CardTitle>
            <CardDescription>Current employee status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{activeEmployees.length}</span>
                  <Badge variant="secondary">{((activeEmployees.length / employees.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{inactiveEmployees.length}</span>
                  <Badge variant="secondary">{((inactiveEmployees.length / employees.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>On Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{onLeaveEmployees.length}</span>
                  <Badge variant="secondary">{((onLeaveEmployees.length / employees.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Employee count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: Rs {dept.avgSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{dept.employeeCount}</span>
                    <Badge variant="secondary">
                      Rs {dept.totalSalary.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSalaryReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary Trends</CardTitle>
          <CardDescription>Salary payments over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSalaryData.map((data) => (
              <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{data.month}</p>
                  <p className="text-sm text-muted-foreground">Total: Rs {data.total.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Paid: Rs {data.paid.toLocaleString()}</p>
                    <p className="text-sm text-amber-600">Pending: Rs {data.pending.toLocaleString()}</p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(data.paid / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderWageReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Wage Breakdown</CardTitle>
          <CardDescription>Regular vs Overtime wages over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWageData.map((data) => (
              <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{data.month}</p>
                  <p className="text-sm text-muted-foreground">Total: Rs {data.total.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">Regular: Rs {data.regular.toLocaleString()}</p>
                    <p className="text-sm text-purple-600">Overtime: Rs {data.overtime.toLocaleString()}</p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(data.regular / data.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-purple-500 h-2 rounded-full -mt-2" 
                      style={{ width: `${(data.overtime / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReport = () => {
    switch (selectedReport) {
      case "overview":
        return renderOverviewReport()
      case "salary":
        return renderSalaryReport()
      case "wages":
        return renderWageReport()
      default:
        return renderOverviewReport()
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employee Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Analytics and insights for employee management</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedReport === "overview" ? "default" : "outline"}
              onClick={() => setSelectedReport("overview")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={selectedReport === "salary" ? "default" : "outline"}
              onClick={() => setSelectedReport("salary")}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Salary Report
            </Button>
            <Button
              variant={selectedReport === "wages" ? "default" : "outline"}
              onClick={() => setSelectedReport("wages")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Wage Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
} 