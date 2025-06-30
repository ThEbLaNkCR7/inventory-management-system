"use client"

import type React from "react"

import { useState } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { useApproval } from "@/contexts/ApprovalContext"
import { useToast } from "@/components/ui/use-toast"
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
import { formatNepaliDateForTable, getNepaliYear, getCurrentNepaliYear } from "@/lib/utils"

export default function ClientsPage() {
  const { user } = useAuth()
  const { 
    clients, 
    addClient, 
    updateClient, 
    deleteClient,
    getClientTotalSpent,
    getClientOrderCount,
    getClientLastOrder,
    sales
  } = useInventory()
  const { submitChange } = useApproval()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isClientHistoryDialogOpen, setIsClientHistoryDialogOpen] = useState(false)
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<string>("")
  const [editingClient, setEditingClient] = useState<any>(null)
  const [viewingClient, setViewingClient] = useState<any>(null)
  const [deletingClient, setDeletingClient] = useState<any>(null)
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
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [totalSteps, setTotalSteps] = useState(0)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalReason, setApprovalReason] = useState("")

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
    setTotalSteps(total)
  }

  const showAlert = (message: string, isSuccess = true) => {
    setAlertMessage(message)
    setShowSuccessAlert(isSuccess)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  // Helper function to safely format client address
  const formatClientAddress = (client: any) => {
    if (!client.address) {
      return 'Address not available'
    }
    
    // Handle old string address format
    if (typeof client.address === 'string') {
      return client.address || 'Address not available'
    }
    
    // Handle new object address format
    const addressParts = [
      client.address.street,
      client.address.city,
      client.address.state,
      client.address.zipCode,
      client.address.country
    ].filter(part => part && part.trim())
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'Address not available'
  }

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
        description: "Validating client data...",
        duration: 2000
      })
      
      updateProgress("Validating client data...", 1, 4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (user?.role === "admin") {
        toast({ 
          title: "Processing...", 
          description: "Adding client to database...",
          duration: 2000
        })
        
        updateProgress("Adding client to database...", 2, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        toast({ 
          title: "Processing...", 
          description: "Setting up client profile...",
          duration: 2000
        })
        
        updateProgress("Setting up client profile...", 3, 4)
        const companyName = formData.company === "custom" ? formData.customCompany : formData.company
        const { customCompany, ...clientData } = formData
        await addClient({ 
          ...clientData, 
          company: companyName,
          address: {
            street: formData.address,
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          taxId: "",
          creditLimit: 0,
          currentBalance: 0,
          totalSpent: 0, 
          orders: 0, 
          lastOrder: new Date().toISOString().split('T')[0],
          isActive: formData.status === "Active"
        })
        
        updateProgress("Operation completed!", 4, 4)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        resetForm()
        
        toast({ title: "Success", description: "Client added successfully!", })
        setShowSuccessAlert(true)
        setAlertMessage("Client added successfully!")
      } else {
        toast({ 
          title: "Processing...", 
          description: "Preparing approval request...",
          duration: 2000
        })
        
        updateProgress("Preparing approval request...", 2, 3)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        toast({ 
          title: "Processing...", 
          description: "Submitting for approval...",
          duration: 2000
        })
        
        updateProgress("Submitting for approval...", 3, 3)
        setShowApprovalDialog(true)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to add client.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const submitForApproval = () => {
    const companyName = formData.company === "custom" ? formData.customCompany : formData.company
    const { customCompany, ...clientData } = formData
    submitChange({
      type: "client",
      action: "create",
      proposedData: {
        ...clientData,
        company: companyName,
        address: {
          street: formData.address,
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        taxId: "",
        creditLimit: 0,
        currentBalance: 0,
        totalSpent: 0,
        orders: 0,
        lastOrder: new Date().toISOString().split('T')[0],
        isActive: formData.status === "Active"
      },
      requestedBy: user?.email || "",
      reason: approvalReason,
    })
    toast({ title: "Submitted", description: "Client request submitted for admin approval." })
    setShowApprovalDialog(false)
    setApprovalReason("")
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      customCompany: "",
      address: typeof client.address === 'string' ? client.address : (client.address?.street || ""),
      status: client.isActive ? "Active" : "Inactive",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Close form immediately when submit is clicked
    setIsEditDialogOpen(false)
    
    if (editingClient) {
      // Show live progress messages
      toast({ 
        title: "Processing...", 
        description: "Updating client information...",
        duration: 2000
      })
      
      const companyName = formData.company === "custom" ? formData.customCompany : formData.company
      const { customCompany, ...clientData } = formData
      const updateData = {
        ...clientData,
        company: companyName,
        address: {
          street: formData.address,
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        isActive: formData.status === "Active"
      }
      
      await updateClient(editingClient.id, updateData)
      resetForm()
      setEditingClient(null)
      
      toast({ title: "Success", description: "Client updated successfully!", })
      setShowSuccessAlert(true)
      setAlertMessage("Client updated successfully!")
    }
  }

  const handleDelete = (client: any) => {
    setDeletingClient(client)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (client: any) => {
    setViewingClient(client)
    setIsViewDialogOpen(true)
  }

  const handleClientClick = (client: any) => {
    setSelectedClientForHistory(client.name)
    setIsClientHistoryDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id)
      setIsDeleteDialogOpen(false)
      setDeletingClient(null)
      setShowSuccessAlert(true)
      setAlertMessage("Client deleted successfully!")
    }
  }

  return (
    <div className="space-y-6 p-6 min-h-screen transition-colors duration-300">
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
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage client relationships and contact information</p>
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
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Enter client information to add to your database
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
                        {[...new Set(clients.map(client => client.company))].map((company) => (
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
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="neutralOutline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {user?.role === "admin" ? "Add Client" : "Submit for Approval"}
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
                <DialogDescription>Please provide a reason for this client request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder="Explain why this client should be added..."
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

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
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
                    {[...new Set(clients.map(client => client.company))].map((company) => (
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
                placeholder="Enter full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Client Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete information about the selected client
            </DialogDescription>
          </DialogHeader>
          
          {viewingClient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Client Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingClient.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Company Type</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingClient.company}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tax ID</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-base">{viewingClient.taxId || "Not specified"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Client ID</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-base">{viewingClient.id}</p>
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
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingClient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingClient.phone}</p>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Address</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      {formatClientAddress(viewingClient)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Financial Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Credit Limit</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {viewingClient.creditLimit?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current Balance</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {viewingClient.currentBalance?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Spent</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-green-600 dark:text-green-400">
                      Rs {getClientTotalSpent(viewingClient.name).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Order Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Orders</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {getClientOrderCount(viewingClient.name)} orders
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Order</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {getClientLastOrder(viewingClient.name) ? formatNepaliDateForTable(getClientLastOrder(viewingClient.name)!) : 'No orders yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Timestamps</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Created</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingClient.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Updated</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingClient.updatedAt || viewingClient.createdAt)}
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
                    <div className={`w-4 h-4 rounded-full ${viewingClient.isActive !== false ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {viewingClient.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-2 text-sm font-medium">
                    Active Client
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {viewingClient.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Notes</span>
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 leading-relaxed text-base">
                      {viewingClient.notes}
                    </p>
                  </div>
                </div>
              )}
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
                handleEdit(viewingClient)
              }}
              className="px-6 py-2"
            >
              Edit Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-semibold mb-3">Delete Client</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingClient?.name}</span>? This action cannot be undone.
            </DialogDescription>
            <div className="flex justify-center space-x-3">
              <Button 
                type="button" 
                variant="neutralOutline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeletingClient(null)
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
                Delete Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
          <CardDescription>Manage your client contacts and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Company Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p 
                          className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          onClick={() => handleClientClick(client)}
                        >
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getClientOrderCount(client.name)} orders
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{client.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{client.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                          Rs {getClientTotalSpent(client.name).toLocaleString()}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last: {getClientLastOrder(client.name) ? formatNepaliDateForTable(getClientLastOrder(client.name)!) : 'No orders'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleView(client)}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleEdit(client)}
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => handleDelete(client)}
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
            {filteredClients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No clients found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Transaction History Dialog */}
      <Dialog open={isClientHistoryDialogOpen} onOpenChange={setIsClientHistoryDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span>Client Transaction History</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              All transactions with <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedClientForHistory}</span> in {getCurrentNepaliYear()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClientForHistory && (
            <div className="space-y-6">
              {/* Client Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>Client Summary</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Client Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{selectedClientForHistory}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Sales</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {sales.filter(s => s.client === selectedClientForHistory && getNepaliYear(s.saleDate) === getCurrentNepaliYear()).length} transactions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Quantity</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {sales.filter(s => s.client === selectedClientForHistory && getNepaliYear(s.saleDate) === getCurrentNepaliYear()).reduce((sum, s) => sum + s.quantitySold, 0)} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Value</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-teal-600 dark:text-teal-400">
                      Rs {sales.filter(s => s.client === selectedClientForHistory && getNepaliYear(s.saleDate) === getCurrentNepaliYear()).reduce((sum, s) => sum + (s.quantitySold * s.salePrice), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sales Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sales Transactions ({sales.filter(s => s.client === selectedClientForHistory && getNepaliYear(s.saleDate) === getCurrentNepaliYear()).length})</span>
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
                        const clientSales = sales.filter(sale => 
                          sale.client === selectedClientForHistory && 
                          getNepaliYear(sale.saleDate) === currentYear
                        ).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                        
                        return clientSales.length > 0 ? (
                          clientSales.map((sale) => (
                            <TableRow key={sale.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(sale.saleDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {sale.productName}
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {sale.quantitySold} units
                              </TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                Rs {sale.salePrice.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600 dark:text-green-400">
                                Rs {(sale.quantitySold * sale.salePrice).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No sales transactions found for this client in {currentYear}
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
              onClick={() => setIsClientHistoryDialogOpen(false)}
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
