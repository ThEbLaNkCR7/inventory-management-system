"use client"

import { useState } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Plus, Search, Edit, Trash2, Clock, User, Calendar, TrendingUp } from "lucide-react"
import { formatNepaliDateForTable } from "@/lib/utils"

interface WageRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  regularHours: number
  overtimeHours: number
  hourlyRate: number
  overtimeRate: number
  regularWage: number
  overtimeWage: number
  totalWage: number
  paymentStatus: "pending" | "paid" | "partial"
  paymentDate?: string
  notes?: string
}

export default function WagesPage() {
  const { employees } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingWage, setEditingWage] = useState<WageRecord | null>(null)
  
  // Mock wage data - in real app, this would come from context/API
  const [wageRecords, setWageRecords] = useState<WageRecord[]>([])

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    regularHours: "",
    overtimeHours: "",
    hourlyRate: "",
    overtimeRate: "",
    paymentStatus: "pending" as "pending" | "paid" | "partial",
    paymentDate: "",
    notes: ""
  })

  const filteredRecords = wageRecords.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const recordMonth = new Date(record.date).getMonth() + 1
    const recordYear = new Date(record.date).getFullYear().toString()
    const matchesMonth = selectedMonth === "all" || recordMonth.toString().padStart(2, '0') === selectedMonth
    const matchesYear = recordYear === selectedYear
    return matchesSearch && matchesMonth && matchesYear
  })

  const calculateWages = (regularHours: number, overtimeHours: number, hourlyRate: number, overtimeRate: number) => {
    const regularWage = regularHours * hourlyRate
    const overtimeWage = overtimeHours * overtimeRate
    return { regularWage, overtimeWage, totalWage: regularWage + overtimeWage }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const regularHours = parseFloat(formData.regularHours)
    const overtimeHours = parseFloat(formData.overtimeHours)
    const hourlyRate = parseFloat(formData.hourlyRate)
    const overtimeRate = parseFloat(formData.overtimeRate)
    
    const { regularWage, overtimeWage, totalWage } = calculateWages(regularHours, overtimeHours, hourlyRate, overtimeRate)

    const employee = employees.find(emp => emp.id === formData.employeeId)
    
    const wageData: WageRecord = {
      id: editingWage?.id || Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: employee?.name || "",
      date: formData.date,
      regularHours,
      overtimeHours,
      hourlyRate,
      overtimeRate,
      regularWage,
      overtimeWage,
      totalWage,
      paymentStatus: formData.paymentStatus,
      paymentDate: formData.paymentDate || undefined,
      notes: formData.notes
    }

    if (editingWage) {
      setWageRecords(prev => prev.map(record => 
        record.id === editingWage.id ? wageData : record
      ))
      setEditingWage(null)
      resetForm()
      setIsAddDialogOpen(false)
      setShowSuccessAlert(true)
      setAlertMessage("Wage record updated successfully!")
    } else {
      setWageRecords(prev => [...prev, wageData])
      resetForm()
      setIsAddDialogOpen(false)
      setShowSuccessAlert(true)
      setAlertMessage("Wage record added successfully!")
    }
  }

  const handleEdit = (wage: WageRecord) => {
    setEditingWage(wage)
    setFormData({
      employeeId: wage.employeeId,
      date: wage.date,
      regularHours: wage.regularHours.toString(),
      overtimeHours: wage.overtimeHours.toString(),
      hourlyRate: wage.hourlyRate.toString(),
      overtimeRate: wage.overtimeRate.toString(),
      paymentStatus: wage.paymentStatus,
      paymentDate: wage.paymentDate || "",
      notes: wage.notes || ""
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this wage record?")) {
      setWageRecords(prev => prev.filter(record => record.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: "",
      regularHours: "",
      overtimeHours: "",
      hourlyRate: "",
      overtimeRate: "",
      paymentStatus: "pending",
      paymentDate: "",
      notes: ""
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Pending</Badge>
      case "partial":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return formatNepaliDateForTable(dateString)
  }

  const totalWages = filteredRecords.reduce((sum, record) => sum + record.totalWage, 0)
  const totalHours = filteredRecords.reduce((sum, record) => sum + record.regularHours + record.overtimeHours, 0)
  const paidWages = filteredRecords.filter(r => r.paymentStatus === "paid").reduce((sum, record) => sum + record.totalWage, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Wages Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee daily wages and overtime</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingWage(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Wage Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWage ? "Edit Wage Record" : "Add New Wage Record"}</DialogTitle>
              <DialogDescription>
                {editingWage ? "Update wage information" : "Add a new wage record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Employee</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regularHours">Regular Hours</Label>
                  <Input
                    id="regularHours"
                    type="number"
                    step="0.5"
                    value={formData.regularHours}
                    onChange={(e) => setFormData({ ...formData, regularHours: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="overtimeHours">Overtime Hours</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    step="0.5"
                    value={formData.overtimeHours}
                    onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (Rs)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="overtimeRate">Overtime Rate (Rs)</Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    value={formData.overtimeRate}
                    onChange={(e) => setFormData({ ...formData, overtimeRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value: "pending" | "paid" | "partial") => setFormData({ ...formData, paymentStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingWage ? "Update Wage Record" : "Add Wage Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wages</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalWages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground">
              Regular + Overtime
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {paidWages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter(r => r.paymentStatus === "paid").length} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Wage Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} found
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Regular Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Overtime Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Hourly Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Total Wage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{record.employeeName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{record.regularHours} hrs</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{record.overtimeHours} hrs</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {record.hourlyRate}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-semibold">Rs {record.totalWage.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(record.paymentStatus)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 