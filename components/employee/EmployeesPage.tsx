"use client"

import { useState } from "react"
import { useEmployee } from "@/contexts/EmployeeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Edit, Trash2, UserCheck, UserX, Clock, Eye, Camera } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NepaliDatePicker } from "@/components/ui/nepali-date-picker"
import { formatNepaliDateForTable } from "@/lib/utils"

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [viewingEmployee, setViewingEmployee] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hireDate: "",
    salary: "",
    status: "active",
    manager: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  })
  const [statusFilter, setStatusFilter] = useState("all")
  const [employeePhotos, setEmployeePhotos] = useState<Record<string, string>>({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [viewingImage, setViewingImage] = useState<{ src: string; alt: string } | null>(null)

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.status === "active") ||
      (statusFilter === "inactive" && employee.status === "inactive")
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Employee name is required")
      return
    }
    
    const employeeData = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : 0,
      status: formData.status as "active" | "inactive" | "on_leave",
      email: formData.email || "Not provided",
      phone: formData.phone || "Not provided",
      position: formData.position || "Not specified",
      department: formData.department || "Not assigned",
      hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
      manager: formData.manager || "Not assigned",
      address: formData.address || "Not provided",
      emergencyContact: formData.emergencyContact || "Not provided",
      emergencyPhone: formData.emergencyPhone || "Not provided",
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData)
      setEditingEmployee(null)
    } else {
      addEmployee(employeeData)
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      salary: employee.salary.toString(),
      status: employee.status,
      manager: employee.manager || "",
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee(id)
    }
  }

  const handleView = (employee: any) => {
    setViewingEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      hireDate: "",
      salary: "",
      status: "active",
      manager: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "inactive":
        return <UserX className="h-4 w-4 text-red-500" />
      case "on_leave":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Inactive</Badge>
      case "on_leave":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">On Leave</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handlePhotoUpload = (employeeId: string, file: File) => {
    // Create a preview URL for the uploaded image
    const imageUrl = URL.createObjectURL(file)
    
    // Update the employee photos state
    setEmployeePhotos(prev => ({
      ...prev,
      [employeeId]: imageUrl
    }))
    
    // Here you would typically upload to server and update employee
    console.log('Photo upload for employee:', employeeId, file)
    
    // In a real implementation, you would:
    // 1. Upload file to server (e.g., using FormData)
    // 2. Get back the server URL
    // 3. Update the employee record with the new photo URL
    // 4. Update the employees state
  }

  const handleImageClick = (src: string, alt: string) => {
    setViewingImage({ src, alt })
    setIsImageModalOpen(true)
  }

  // Function to format date in Nepali format
  const formatNepaliDate = (dateString: string) => {
    return formatNepaliDateForTable(dateString)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your employee information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEmployee(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? "Update employee information" : "Add a new employee to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <NepaliDatePicker
                    value={formData.hireDate}
                    onChange={(value) => setFormData({ ...formData, hireDate: value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary (Rs)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Previous</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(
                            employeePhotos[employee.id] || employee.photo || `/placeholder-user.jpg`,
                            employee.name
                          )}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={employeePhotos[employee.id] || employee.photo || `/placeholder-user.jpg`} 
                              alt={employee.name} 
                            />
                            <AvatarFallback className="text-sm">
                              {employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{employee.position}</td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">{employee.department}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(employee.status)}
                        {getStatusBadge(employee.status)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Rs {employee.salary.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(employee)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
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

      {/* View Employee Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Complete information for {viewingEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              {/* Employee Photo Section */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                <div className="relative">
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(
                      employeePhotos[viewingEmployee.id] || viewingEmployee.photo || `/placeholder-user.jpg`,
                      viewingEmployee.name
                    )}
                  >
                    <Avatar className="h-40 w-40">
                      <AvatarImage 
                        src={employeePhotos[viewingEmployee.id] || viewingEmployee.photo || `/placeholder-user.jpg`} 
                        alt={viewingEmployee.name} 
                      />
                      <AvatarFallback className="text-3xl font-semibold">
                        {viewingEmployee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      // Handle photo upload
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          handlePhotoUpload(viewingEmployee.id, file)
                        }
                      }
                      input.click()
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {viewingEmployee.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{viewingEmployee.position}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{viewingEmployee.department}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                      <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</Label>
                      <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</Label>
                      <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.position}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</Label>
                      <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</Label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(viewingEmployee.status)}
                        {getStatusBadge(viewingEmployee.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Employment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Hire Date</Label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatNepaliDate(viewingEmployee.hireDate)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Salary</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold">
                        Rs {viewingEmployee.salary.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager</Label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {viewingEmployee.manager || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee ID</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">{viewingEmployee.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                  Address Information
                </h3>
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</Label>
                  <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.address}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</Label>
                    <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.emergencyContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Phone</Label>
                    <p className="text-gray-900 dark:text-gray-100">{viewingEmployee.emergencyPhone}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingEmployee)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Employee
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold">
              {viewingImage?.alt} - Photo
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4">
            <div className="flex justify-center">
              <img
                src={viewingImage?.src}
                alt={viewingImage?.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setIsImageModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 