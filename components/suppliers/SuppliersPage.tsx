"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { useApproval } from "@/contexts/ApprovalContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, Building, Edit, Trash2, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatNepaliDateForTable, getNepaliYear, getCurrentNepaliYear } from "@/lib/utils"

export default function SuppliersPage() {
  const { user } = useAuth()
  const { 
    suppliers, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    getSupplierTotalSpent,
    getSupplierOrderCount,
    getSupplierLastOrder,
    purchases
  } = useInventory()
  const { submitChange } = useApproval()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSupplierHistoryDialogOpen, setIsSupplierHistoryDialogOpen] = useState(false)
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState<string>("")
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [viewingSupplier, setViewingSupplier] = useState<any>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    customCompany: "",
    address: "",
    status: "Active",
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [totalSteps, setTotalSteps] = useState(0)

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessAlert])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      customCompany: "",
      address: "",
      status: "Active",
    })
    setDeleteReason("")
  }

  const showAlert = (message: string, isSuccess = true) => {
    setAlertMessage(message)
    setShowSuccessAlert(isSuccess)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
    setTotalSteps(total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating supplier data...", duration: 2000 })
      updateProgress("Validating supplier data...", 1, 3)
      
      if (user?.role === "admin") {
        updateProgress("Adding supplier to database...", 2, 3)
        const companyName = formData.company === "custom" ? formData.customCompany : formData.company
        const { customCompany, ...supplierData } = formData
        await addSupplier({ 
          ...supplierData, 
          company: companyName,
          orders: 0, 
          totalSpent: 0, 
          lastOrder: new Date().toISOString().split('T')[0] 
        })
        
        updateProgress("Operation completed!", 3, 3)
        toast({ title: "Success", description: "Supplier added successfully!", })
        resetForm()
        setShowSuccessAlert(true)
        setAlertMessage("Supplier added successfully!")
      } else {
        updateProgress("Submitting for approval...", 2, 3)
        setShowApprovalDialog(true)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to add supplier.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const submitForApproval = () => {
    const companyName = formData.company === "custom" ? formData.customCompany : formData.company
    const { customCompany, ...supplierData } = formData
    submitChange({
      type: "supplier",
      action: "create",
      proposedData: {
        ...supplierData,
        company: companyName,
        orders: 0,
        totalSpent: 0,
        lastOrder: new Date().toISOString().split('T')[0],
      },
      requestedBy: user?.email || "",
      reason: approvalReason,
    })
    resetForm()
    setIsAddDialogOpen(false)
    setShowApprovalDialog(false)
    setApprovalReason("")
    showAlert("Supplier request submitted for approval!")
  }

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      company: supplier.company,
      customCompany: supplier.customCompany,
      address: supplier.address,
      status: supplier.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating changes...", duration: 2000 })
      updateProgress("Validating changes...", 1, 3)
      
      if (editingSupplier && (user?.role === "admin" || approvalReason.trim())) {
        if (user?.role === "admin") {
          updateProgress("Updating supplier in database...", 2, 3)
          const companyName = formData.company === "custom" ? formData.customCompany : formData.company
          const { customCompany, ...supplierData } = formData
          await updateSupplier(editingSupplier.id, { ...supplierData, company: companyName })
          
          updateProgress("Operation completed!", 3, 3)
          toast({ title: "Success", description: "Supplier updated successfully!", })
          resetForm()
          setEditingSupplier(null)
          setApprovalReason("")
          setShowSuccessAlert(true)
          setAlertMessage("Supplier updated successfully!")
        } else {
          updateProgress("Submitting for approval...", 2, 3)
          const companyName = formData.company === "custom" ? formData.customCompany : formData.company
          const { customCompany, ...supplierData } = formData
          submitChange({ 
            type: "supplier", 
            action: "update", 
            entityId: editingSupplier.id, 
            originalData: { 
              name: editingSupplier.name, 
              email: editingSupplier.email, 
              phone: editingSupplier.phone, 
              company: editingSupplier.company, 
              address: editingSupplier.address, 
              status: editingSupplier.status, 
            }, 
            proposedData: { ...supplierData, company: companyName }, 
            requestedBy: user?.email || "", 
            reason: approvalReason, 
          })
          toast({ title: "Submitted", description: "Supplier changes submitted for admin approval." })
          resetForm()
          setEditingSupplier(null)
          setApprovalReason("")
        }
      } else if (user?.role !== "admin" && !approvalReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for the changes.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update supplier.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleDelete = (supplier: any) => {
    setDeletingSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (supplier: any) => {
    setViewingSupplier(supplier)
    setIsViewDialogOpen(true)
  }

  const handleSupplierClick = (supplier: any) => {
    setSelectedSupplierForHistory(supplier.name)
    setIsSupplierHistoryDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating deletion...", duration: 2000 })
      updateProgress("Validating deletion...", 1, 3)
      if (deletingSupplier && (user?.role === "admin" || deleteReason.trim())) {
        if (user?.role === "admin") {
          updateProgress("Removing supplier from database...", 2, 3)
          await deleteSupplier(deletingSupplier.id)
          updateProgress("Operation completed!", 3, 3)
          toast({ title: "Success", description: "Supplier deleted successfully!", })
          setDeletingSupplier(null)
          setShowSuccessAlert(true)
          setAlertMessage("Supplier deleted successfully!")
        } else {
          updateProgress("Submitting for approval...", 2, 3)
          submitChange({ 
            type: "supplier", 
            action: "delete", 
            entityId: deletingSupplier.id, 
            originalData: { 
              name: deletingSupplier.name, 
              email: deletingSupplier.email, 
              phone: deletingSupplier.phone, 
              company: deletingSupplier.company, 
              address: deletingSupplier.address, 
              status: deletingSupplier.status, 
            }, 
            proposedData: {}, 
            requestedBy: user?.email || "", 
            reason: deleteReason, 
          })
          toast({ title: "Submitted", description: "Supplier deletion submitted for admin approval." })
          setDeletingSupplier(null)
          setDeleteReason("")
        }
      } else if (user?.role !== "admin" && !deleteReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for deleting this supplier.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete supplier.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  return (
    <div className="space-y-6 p-6 min-h-screen transition-colors duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Processing Supplier...
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{currentStep}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Step {Math.ceil((progress / 100) * totalSteps)} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Success/Info Alert */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4 mb-4">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div className="space-y-2">
          <h1 className="section-title">
            Suppliers
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage supplier relationships and procurement</p>
        </div>
        <div className="absolute top-6 right-0 flex space-x-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
                variant="neutral"
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter supplier information to add to your database
                  {user?.role !== "admin" && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center text-amber-800 dark:text-amber-200">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Changes require admin approval</span>
                      </div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Type</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.company}
                      onValueChange={(value) => setFormData({ ...formData, company: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type or enter custom type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="custom">+ Add Custom Company Type</SelectItem>
                        {[...new Set(suppliers.map(supplier => supplier.company))].map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.company === "custom" && (
                      <Input
                        placeholder="Enter custom company type"
                        value={formData.customCompany || ""}
                        onChange={(e) => setFormData({ ...formData, customCompany: e.target.value })}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="neutralOutline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {user?.role === "admin" ? "Add Supplier" : "Submit for Approval"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Approval Reason Dialog */}
          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit for Approval</DialogTitle>
                <DialogDescription>Please provide a reason for this supplier request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder="Explain why this supplier should be added..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="neutralOutline" onClick={() => setShowApprovalDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitForApproval} disabled={!approvalReason.trim()}>
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
          <CardDescription>Manage your supplier contacts and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Company Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p 
                          className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          onClick={() => handleSupplierClick(supplier)}
                        >
                          {supplier.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getSupplierOrderCount(supplier.name)} orders
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{supplier.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{supplier.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{supplier.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                          Rs {getSupplierTotalSpent(supplier.name).toLocaleString()}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last: {getSupplierLastOrder(supplier.name) ? formatNepaliDateForTable(getSupplierLastOrder(supplier.name)!) : 'No orders'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleView(supplier)}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleEdit(supplier)}
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleDelete(supplier)}
                          className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-600 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No suppliers found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Supplier Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Supplier Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete information about the selected supplier
            </DialogDescription>
          </DialogHeader>
          
          {viewingSupplier && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Contact Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSupplier.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Company Type</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSupplier.company}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</Label>
                    <Badge 
                      variant="secondary"
                      className={`px-3 py-1 text-sm font-medium ${
                        viewingSupplier.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400' :
                        viewingSupplier.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400' :
                        viewingSupplier.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                      }`}
                    >
                      {viewingSupplier.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Supplier ID</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-base">{viewingSupplier.id}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSupplier.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSupplier.phone}</p>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Address</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      {viewingSupplier.address || "Address not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Business Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Orders</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {getSupplierOrderCount(viewingSupplier.name)} orders
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Spent</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-blue-600 dark:text-blue-400">
                      Rs {getSupplierTotalSpent(viewingSupplier.name).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Order</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {getSupplierLastOrder(viewingSupplier.name) ? formatNepaliDateForTable(getSupplierLastOrder(viewingSupplier.name)!) : 'No orders yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Timestamps</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Created</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingSupplier.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Updated</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingSupplier.updatedAt || viewingSupplier.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Status</span>
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${viewingSupplier.isActive !== false ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {viewingSupplier.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-2 text-sm font-medium">
                    Verified Supplier
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="neutralOutline" 
              onClick={() => setIsViewDialogOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEdit(viewingSupplier)
              }}
              className="px-6 py-2"
            >
              Edit Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
              {user?.role !== "admin" && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center text-amber-800 dark:text-amber-200">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Changes require admin approval</span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Contact Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Type</Label>
              <div className="space-y-2">
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData({ ...formData, company: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type or enter custom type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="custom">+ Add Custom Company Type</SelectItem>
                    {[...new Set(suppliers.map(supplier => supplier.company))].map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.company === "custom" && (
                  <Input
                    placeholder="Enter custom company type"
                    value={formData.customCompany || ""}
                    onChange={(e) => setFormData({ ...formData, customCompany: e.target.value })}
                    className="mt-2"
                    required
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {user?.role !== "admin" && (
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Reason for Changes *</Label>
                <Textarea
                  id="edit-reason"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Explain why you're making these changes..."
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => {
                setIsEditDialogOpen(false)
                setApprovalReason("")
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={user?.role !== "admin" && !approvalReason.trim()}>
                {user?.role === "admin" ? "Update Supplier" : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Supplier Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold">Delete Supplier</DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingSupplier?.name}</span>? This action cannot be undone.
              {user?.role !== "admin" && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center text-amber-800 dark:text-amber-200">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">This will be submitted for admin approval</span>
                  </div>
                </div>
              )}
            </DialogDescription>
            
            {user?.role !== "admin" && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="delete-reason">Reason for Deletion *</Label>
                <Textarea
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Explain why you want to delete this supplier..."
                  rows={3}
                  required
                />
              </div>
            )}
            
            <div className="flex justify-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="neutralOutline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeletingSupplier(null)
                  setDeleteReason("")
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                className="px-6"
                disabled={user?.role !== "admin" && !deleteReason.trim()}
              >
                {user?.role === "admin" ? "Delete Supplier" : "Submit for Approval"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Transaction History Dialog */}
      <Dialog open={isSupplierHistoryDialogOpen} onOpenChange={setIsSupplierHistoryDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span>Supplier Transaction History</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              All transactions with <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedSupplierForHistory}</span> in {getCurrentNepaliYear()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSupplierForHistory && (
            <div className="space-y-6">
              {/* Supplier Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Supplier Summary</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Supplier Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{selectedSupplierForHistory}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Purchases</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {purchases.filter(p => p.supplier === selectedSupplierForHistory && getNepaliYear(p.purchaseDate) === getCurrentNepaliYear()).length} transactions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Quantity</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {purchases.filter(p => p.supplier === selectedSupplierForHistory && getNepaliYear(p.purchaseDate) === getCurrentNepaliYear()).reduce((sum, p) => sum + p.quantityPurchased, 0)} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Value</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-orange-600 dark:text-orange-400">
                      Rs {purchases.filter(p => p.supplier === selectedSupplierForHistory && getNepaliYear(p.purchaseDate) === getCurrentNepaliYear()).reduce((sum, p) => sum + (p.quantityPurchased * p.purchasePrice), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Purchase Transactions ({purchases.filter(p => p.supplier === selectedSupplierForHistory && getNepaliYear(p.purchaseDate) === getCurrentNepaliYear()).length})</span>
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quantity</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const currentYear = getCurrentNepaliYear()
                        const supplierPurchases = purchases.filter(purchase => 
                          purchase.supplier === selectedSupplierForHistory && 
                          getNepaliYear(purchase.purchaseDate) === currentYear
                        ).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                        
                        return supplierPurchases.length > 0 ? (
                          supplierPurchases.map((purchase) => (
                            <TableRow key={purchase.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(purchase.purchaseDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {purchase.productName}
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {purchase.quantityPurchased} units
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                Rs {purchase.purchasePrice.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                                Rs {(purchase.quantityPurchased * purchase.purchasePrice).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No purchase transactions found for this supplier in {currentYear}
                            </TableCell>
                          </TableRow>
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="neutralOutline" 
              onClick={() => setIsSupplierHistoryDialogOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
