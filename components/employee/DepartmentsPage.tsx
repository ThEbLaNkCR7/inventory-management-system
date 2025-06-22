"use client"

import { useState } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Search, Edit, Trash2, Users, DollarSign, MapPin } from "lucide-react"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const departmentData = {
      ...formData,
      budget: parseFloat(formData.budget),
      employeeCount: getEmployeeCount(formData.name),
    }

    if (editingDepartment) {
      updateDepartment(editingDepartment.id, departmentData)
      setEditingDepartment(null)
    } else {
      addDepartment(departmentData)
    }

    resetForm()
    setIsAddDialogOpen(false)
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteDepartment(id)
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