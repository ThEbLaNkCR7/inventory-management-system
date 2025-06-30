"use client"

import { useState, useEffect } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Search, Edit, Trash2, Users, DollarSign, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export default function DepartmentsPage() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    budget: "",
    location: "",
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const { toast } = useToast()

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEmployeeCount = (departmentName: string) => {
    return employees.filter(emp => emp.department === departmentName).length
  }

  const getAverageSalary = (departmentName: string) => {
    const deptEmployees = employees.filter(emp => emp.department === departmentName)
    if (deptEmployees.length === 0) return 0
    const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0)
    return totalSalary / deptEmployees.length
  }

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Close form immediately when submit is clicked
    setIsAddDialogOpen(false)
    
    setIsLoading(true)
    setProgress(0)
    
    try {
      // Show live progress messages
      toast({ 
        title: "Processing...", 
        description: "Validating department data...",
        duration: 2000
      })
      
      updateProgress("Validating department data...", 1, 4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const departmentData = {
        ...formData,
        budget: parseFloat(formData.budget),
        employeeCount: getEmployeeCount(formData.name),
      }

      toast({ 
        title: "Processing...", 
        description: "Processing department data...",
        duration: 2000
      })
      
      updateProgress("Processing department data...", 2, 4)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingDepartment) {
        toast({ 
          title: "Processing...", 
          description: "Updating department in database...",
          duration: 2000
        })
        
        updateProgress("Updating department in database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        await updateDepartment(editingDepartment.id, departmentData)
        setEditingDepartment(null)
      } else {
        toast({ 
          title: "Processing...", 
          description: "Adding department to database...",
          duration: 2000
        })
        
        updateProgress("Adding department to database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        await addDepartment(departmentData)
      }
      
      updateProgress("Operation completed!", 4, 4)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      resetForm()
      
      toast({ title: "Success", description: editingDepartment ? "Department updated successfully!" : "Department added successfully!" })
      setShowSuccessAlert(true)
      setAlertMessage(editingDepartment ? "Department updated successfully!" : "Department added successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save department."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleEdit = (department: any) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      manager: department.manager,
      budget: department.budget.toString(),
      location: department.location,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      setIsLoading(true)
      setProgress(0)
      
      try {
        updateProgress("Validating deletion...", 1, 3)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        updateProgress("Removing department from database...", 2, 3)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        deleteDepartment(id)
        
        updateProgress("Operation completed!", 3, 3)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        toast({ title: "Success", description: "Department deleted successfully!" })
        setShowSuccessAlert(true)
        setAlertMessage("Department deleted successfully!")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete department."
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
      name: "",
      manager: "",
      budget: "",
      location: "",
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Departments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your company departments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingDepartment(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? "Update department information" : "Add a new department to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">Annual Budget (Rs)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDepartment ? "Update Department" : "Add Department"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>
            {filteredDepartments.length} department{filteredDepartments.length !== 1 ? "s" : ""} found
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Manager</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Employees</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Budget</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Avg Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((department) => {
                  const employeeCount = getEmployeeCount(department.name)
                  const avgSalary = getAverageSalary(department.name)
                  
                  return (
                    <tr key={department.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{department.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{department.manager}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-gray-100">{employeeCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {department.budget.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {avgSalary.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-gray-100">{department.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(department.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 