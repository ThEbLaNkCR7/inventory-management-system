"use client"

import { useEmployee } from "@/contexts/EmployeeContext"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, DollarSign, TrendingUp, UserCheck, Clock, Calendar, BarChart3, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const {
    employees,
    departments,
    attendance,
    payroll,
    getTotalEmployees,
    getTotalSalary,
    getAverageSalary,
    getActiveEmployees,
    getDepartmentStats,
  } = useEmployee()

  const totalEmployees = getTotalEmployees()
  const totalSalary = getTotalSalary()
  const averageSalary = getAverageSalary()
  const activeEmployees = getActiveEmployees()
  const departmentStats = getDepartmentStats()

  // Calculate additional metrics
  const totalDepartments = departments.length
  const todayAttendance = attendance.filter(att => att.date === new Date().toISOString().split('T')[0])
  const presentToday = todayAttendance.filter(att => att.status === "present").length
  const absentToday = todayAttendance.filter(att => att.status === "absent").length
  const lateToday = todayAttendance.filter(att => att.status === "late").length

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "All employees",
    },
    {
      title: "Active Employees",
      value: activeEmployees.length,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Currently active",
    },
    {
      title: "Total Salary",
      value: `Rs ${totalSalary.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Monthly payroll",
    },
    {
      title: "Average Salary",
      value: `Rs ${averageSalary.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Per employee",
    },
    {
      title: "Departments",
      value: totalDepartments,
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Active departments",
    },
    {
      title: "Today's Attendance",
      value: `${presentToday}/${totalEmployees}`,
      icon: Calendar,
      color: presentToday >= totalEmployees * 0.8 ? "text-green-600" : "text-amber-600",
      bgColor: "bg-white dark:bg-gray-800",
      description: "Present today",
    },
  ]

  const quickStats = [
    {
      title: "Present Today",
      value: presentToday,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Absent Today",
      value: absentToday,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Late Today",
      value: lateToday,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "This Month Payroll",
      value: payroll.filter(p => p.status === "paid").length,
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="space-y-8 p-6 min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      <div className="space-y-2">
        <h1 className="section-title text-modern-bold">
          Employee Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg text-modern">Comprehensive overview of your employee management system</p>
      </div>

      {/* Employee Stats Section */}
      <div className="space-y-4 mt-10">
        <h2 className="text-2xl text-modern-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-900/20">Employee Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-modern-semibold text-gray-900 dark:text-gray-200">{stat.title}</CardTitle>
                  <div className={`p-3 rounded-full ${stat.bgColor} shadow-md transition-all duration-300 hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl text-modern-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-modern">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl text-modern-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-green-500 bg-green-50/60 dark:bg-green-900/20">Today's Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-modern-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className={`text-2xl text-modern-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Department Stats Section */}
      <div className="space-y-4 mt-12">
        <h2 className="text-2xl text-modern-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 tracking-tight pl-4 border-l-4 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20">Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departmentStats.map((dept, index) => (
            <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-modern-semibold text-gray-900 dark:text-gray-200">
                  <Building2 className="mr-2 h-5 w-5 text-indigo-500" />
                  {dept.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-modern">
                  {dept.count} employees • Avg: Rs {dept.avgSalary.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 text-modern">Employees:</span>
                    <span className="text-modern-semibold text-gray-900 dark:text-gray-200">{dept.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 text-modern">Avg Salary:</span>
                    <span className="text-modern-semibold text-gray-900 dark:text-gray-200">Rs {dept.avgSalary.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-200">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Recent Attendance
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Today's attendance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAttendance.length > 0 ? (
              <div className="space-y-3">
                {todayAttendance.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200">{record.employeeName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {record.checkIn} - {record.checkOut || "Not checked out"}
                      </p>
                    </div>
                    <Badge 
                      variant={record.status === "present" ? "default" : record.status === "late" ? "secondary" : "destructive"}
                      className="bg-green-500 text-white"
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No attendance records for today</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payroll */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-200">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              Recent Payroll
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Latest payroll transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payroll.length > 0 ? (
              <div className="space-y-3">
                {payroll.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200">{record.employeeName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {record.month} {record.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-200">
                        Rs {record.netSalary.toLocaleString()}
                      </p>
                      <Badge 
                        variant={record.status === "paid" ? "default" : record.status === "pending" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payroll records found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 