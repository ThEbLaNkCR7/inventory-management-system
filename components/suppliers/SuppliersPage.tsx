"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Search, Mail, Phone, Building, Edit, Trash2, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function SuppliersPage() {
  const { user } = useAuth()
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory()
  const { submitChange } = useApproval()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "Active",
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

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
      address: "",
      status: "Active",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.role === "admin") {
      addSupplier({
        ...formData,
        orders: 0,
        totalSpent: 0,
        lastOrder: new Date().toISOString().split('T')[0],
      })
      resetForm()
      setIsAddDialogOpen(false)
      setShowSuccessAlert(true)
      setAlertMessage("Supplier added successfully!")
    } else {
      setShowApprovalDialog(true)
    }
  }

  const submitForApproval = () => {
    submitChange({
      type: "supplier",
      action: "create",
      proposedData: {
        ...formData,
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
    setShowSuccessAlert(true)
    setAlertMessage("Supplier request submitted for approval!")
  }

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      company: supplier.company,
      address: supplier.address,
      status: supplier.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData)
      resetForm()
      setIsEditDialogOpen(false)
      setEditingSupplier(null)
      setShowSuccessAlert(true)
      setAlertMessage("Supplier updated successfully!")
    }
  }

  const handleDelete = (supplier: any) => {
    setDeletingSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingSupplier) {
      deleteSupplier(deletingSupplier.id)
      setIsDeleteDialogOpen(false)
      setDeletingSupplier(null)
      setShowSuccessAlert(true)
      setAlertMessage("Supplier deleted successfully!")
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Success/Info Alert */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
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
                onClick={resetForm}
                variant="neutral"
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {supplier.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {supplier.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {supplier.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {supplier.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {supplier.orders || Math.floor(Math.random() * 50) + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Rs {(supplier.totalSpent || Math.random() * 10000 + 1000).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        supplier.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                        supplier.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {supplier.status || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.lastOrder || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update supplier information</DialogDescription>
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
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Supplier</Button>
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
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingSupplier?.name}</span>? This action cannot be undone.
            </DialogDescription>
            <div className="flex justify-center space-x-3 pt-4">
              <Button 
                type="button" 
                variant="neutralOutline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeletingSupplier(null)
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
              >
                Delete Supplier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
