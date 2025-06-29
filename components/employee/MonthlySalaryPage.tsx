"use client"

import { useState, useEffect } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Plus, Search, Edit, Trash2, Calendar, User, TrendingUp, TrendingDown } from "lucide-react"
import { NepaliDatePicker } from '../ui/nepali-date-picker'
import { formatNepaliDateForTable } from '../../lib/nepaliDateUtils'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: string
  basicSalary: number
  allowances: number
  deductions: number
  overtime: number
  bonus: number
  netSalary: number
  paymentStatus: "pending" | "paid" | "partial"
  paymentDate?: string
  notes?: string
}

export default function MonthlySalaryPage() {
  const { employees } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null)
  
  // Mock salary data - in real app, this would come from context/API
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    year: new Date().getFullYear().toString(),
    basicSalary: "",
    allowances: "",
    deductions: "",
    overtime: "",
    bonus: "",
    paymentStatus: "pending" as "pending" | "paid" | "partial",
    paymentDate: "",
    notes: ""
  })

  const filteredRecords = salaryRecords.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = selectedMonth === "all" || record.month === selectedMonth
    const matchesYear = record.year === selectedYear
    return matchesSearch && matchesMonth && matchesYear
  })

  const calculateNetSalary = (basic: number, allowances: number, deductions: number, overtime: number, bonus: number) => {
    return basic + allowances + overtime + bonus - deductions
  }

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
  }

  const updateSalary = (id: string, data: SalaryRecord) => {
    setSalaryRecords(prev => prev.map(record => record.id === id ? data : record))
  }

  const addSalary = (data: SalaryRecord) => {
    setSalaryRecords(prev => [...prev, data])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProgress(0)
    
    try {
      updateProgress("Validating salary data...", 1, 4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const bonus = parseFloat(formData.bonus)
      const netSalary = calculateNetSalary(
        parseFloat(formData.basicSalary),
        parseFloat(formData.allowances),
        parseFloat(formData.deductions),
        parseFloat(formData.overtime),
        bonus
      )

      const salaryData: SalaryRecord = {
        id: editingSalary?.id || Date.now().toString(),
        employeeId: formData.employeeId,
        employeeName: employees.find(emp => emp.id === formData.employeeId)?.name || "Unknown",
        month: formData.month,
        year: formData.year,
        basicSalary: parseFloat(formData.basicSalary),
        allowances: parseFloat(formData.allowances),
        deductions: parseFloat(formData.deductions),
        overtime: parseFloat(formData.overtime),
        bonus,
        netSalary,
        paymentStatus: formData.paymentStatus,
        paymentDate: formData.paymentDate || undefined,
        notes: formData.notes
      }

      updateProgress("Processing salary data...", 2, 4)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingSalary) {
        updateProgress("Updating salary record in database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        updateSalary(editingSalary.id, salaryData)
        setEditingSalary(null)
      } else {
        updateProgress("Adding salary record to database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addSalary(salaryData)
      }
      
      updateProgress("Operation completed!", 4, 4)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      toast({ title: "Success", description: editingSalary ? "Salary record updated successfully!" : "Salary record added successfully!" })
      resetForm()
      setIsAddDialogOpen(false)
      setShowSuccessAlert(true)
      setAlertMessage(editingSalary ? "Salary record updated successfully!" : "Salary record added successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save salary record."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleEdit = (salary: SalaryRecord) => {
    setEditingSalary(salary)
    setFormData({
      employeeId: salary.employeeId,
      month: salary.month,
      year: salary.year,
      basicSalary: salary.basicSalary.toString(),
      allowances: salary.allowances.toString(),
      deductions: salary.deductions.toString(),
      overtime: salary.overtime.toString(),
      bonus: salary.bonus.toString(),
      paymentStatus: salary.paymentStatus,
      paymentDate: salary.paymentDate || "",
      notes: salary.notes || ""
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this salary record?")) {
      setIsLoading(true)
      setProgress(0)
      
      try {
        updateProgress("Validating deletion...", 1, 3)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        updateProgress("Removing salary record from database...", 2, 3)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setSalaryRecords(prev => prev.filter(record => record.id !== id))
        
        updateProgress("Operation completed!", 3, 3)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        toast({ title: "Success", description: "Salary record deleted successfully!" })
        setShowSuccessAlert(true)
        setAlertMessage("Salary record deleted successfully!")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete salary record."
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      } finally {
        setIsLoading(false)
        setProgress(0)
        setCurrentStep("")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: "",
      year: new Date().getFullYear().toString(),
      basicSalary: "",
      allowances: "",
      deductions: "",
      overtime: "",
      bonus: "",
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

  const getMonthName = (month: string) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return months[parseInt(month) - 1] || month
  }

  const totalSalary = filteredRecords.reduce((sum, record) => sum + record.netSalary, 0)
  const paidSalary = filteredRecords.filter(r => r.paymentStatus === "paid").reduce((sum, record) => sum + record.netSalary, 0)
  const pendingSalary = filteredRecords.filter(r => r.paymentStatus === "pending").reduce((sum, record) => sum + record.netSalary, 0)

  return (
    <div className="space-y-6 p-6">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Processing...
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{currentStep}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Step {Math.ceil((progress / 100) * 4)} of 4
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Info Alert */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <div className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Monthly Salary Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee monthly salary records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSalary(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Salary Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSalary ? "Edit Salary Record" : "Add New Salary Record"}</DialogTitle>
              <DialogDescription>
                {editingSalary ? "Update salary information" : "Add a new salary record"}
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
                  <Label htmlFor="month">Month</Label>
                  <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                          {getMonthName(month.toString().padStart(2, '0'))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basicSalary">Basic Salary (Rs)</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="allowances">Allowances (Rs)</Label>
                  <Input
                    id="allowances"
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deductions">Deductions (Rs)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="overtime">Overtime (Rs)</Label>
                  <Input
                    id="overtime"
                    type="number"
                    value={formData.overtime}
                    onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bonus">Bonus (Rs)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
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
                  <NepaliDatePicker
                    value={formData.paymentDate}
                    onChange={(date) => setFormData({ ...formData, paymentDate: date })}
                    label="Payment Date"
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
                  {editingSalary ? "Update Salary Record" : "Add Salary Record"}
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
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs {paidSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter(r => r.paymentStatus === "paid").length} paid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">Rs {pendingSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter(r => r.paymentStatus === "pending").length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Records</CardTitle>
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
                      {getMonthName(month.toString().padStart(2, '0'))}
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Period</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Basic Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Allowances</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Deductions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Net Salary</th>
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
                      {getMonthName(record.month)} {record.year}
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {record.basicSalary.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {record.allowances.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {record.deductions.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-semibold">Rs {record.netSalary.toLocaleString()}</td>
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