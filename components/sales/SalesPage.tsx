"use client"

import React, { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, CheckCircle, AlertTriangle, Clock, Loader2, Eye, TrendingUp, Package, Calendar, DollarSign, Users, Building2 } from "lucide-react"
import { formatNepaliDateForTable, getNepaliYear, getCurrentNepaliYear } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function SalesPage() {
  const { user } = useAuth()
  const { products, sales, clients, purchases, addSale, updateSale, deleteSale } = useInventory()
  const { submitChange } = useApproval()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isProductHistoryDialogOpen, setIsProductHistoryDialogOpen] = useState(false)
  const [isClientHistoryDialogOpen, setIsClientHistoryDialogOpen] = useState(false)
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<string>("")
  const [editingSale, setEditingSale] = useState<any>(null)
  const [deletingSale, setDeletingSale] = useState<any>(null)
  const [viewingSale, setViewingSale] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    productId: "",
    client: "",
    clientType: "Company", // Default to Company
    customClient: "",
    quantitySold: 0,
    salePrice: 0,
    saleDate: new Date().toISOString().split("T")[0],
  })
  const [editReason, setEditReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
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

  // Filter sales based on search term and active tab
  const getFilteredSales = () => {
    let filtered = sales.filter(
      (sale) =>
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply tab filter
    if (activeTab === "individual") {
      filtered = filtered.filter(sale => sale.clientType === "Individual")
    } else if (activeTab === "company") {
      filtered = filtered.filter(sale => sale.clientType === "Company")
    }

    return filtered
  }

  const filteredSales = getFilteredSales()

  // Get counts for each tab
  const getSalesCounts = () => {
    const allCount = sales.length
    const individualCount = sales.filter(sale => sale.clientType === "Individual").length
    const companyCount = sales.filter(sale => sale.clientType === "Company").length
    return { allCount, individualCount, companyCount }
  }

  const salesCounts = getSalesCounts()

  const resetForm = () => {
    setFormData({
      productId: "",
      client: "",
      clientType: "Company",
      customClient: "",
      quantitySold: 0,
      salePrice: 0,
      saleDate: new Date().toISOString().split("T")[0],
    })
    setEditReason("")
  }

  const showAlert = (message: string, isSuccess = true) => {
    setAlertMessage(message)
    setShowSuccessAlert(isSuccess)
  }

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
    setTotalSteps(total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Close form instantly
    setIsAddDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating sale data...", duration: 2000 })
      updateProgress("Validating sale data...", 1, 5)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const product = products.find((p) => p.id === formData.productId)
      if (product && product.stockQuantity >= formData.quantitySold) {
        updateProgress("Checking stock availability...", 2, 5)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (user?.role === "admin") {
          updateProgress("Recording sale transaction...", 3, 5)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Updating inventory levels...", 4, 5)
          const clientName = formData.client === "custom" ? formData.customClient : formData.client
          const { customClient, ...saleData } = formData
          await addSale({ ...saleData, productName: product.name, client: clientName })
          
          updateProgress("Operation completed!", 5, 5)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          toast({ title: "Success", description: "Sale recorded successfully!", })
        } else {
          updateProgress("Preparing approval request...", 3, 4)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Submitting for approval...", 4, 4)
          const clientName = formData.client === "custom" ? formData.customClient : formData.client
          const { customClient, ...saleData } = formData
          submitChange({ type: "sale", action: "create", proposedData: { ...saleData, productName: product.name, client: clientName }, requestedBy: user?.email || "", reason: editReason || "New sale record", })
          toast({ title: "Submitted", description: "Sale submitted for admin approval." })
        }
        
        resetForm()
        showAlert("Sale added successfully!", true)
      } else {
        toast({ title: "Error", description: "Insufficient stock for this sale.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to record sale.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleEdit = (sale: any) => {
    setEditingSale(sale)
    const product = products.find((p) => p.name === sale.productName)
    
    // Convert date to YYYY-MM-DD format for HTML date input
    const formattedDate = new Date(sale.saleDate).toISOString().split('T')[0]
    
    setFormData({
      productId: product?.id || "",
      client: sale.client,
      clientType: sale.clientType,
      customClient: "",
      quantitySold: sale.quantitySold,
      salePrice: sale.salePrice,
      saleDate: formattedDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Close form instantly
    setIsEditDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating changes...", duration: 2000 })
      updateProgress("Validating changes...", 1, 5)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const product = products.find((p) => p.id === formData.productId)
      if (product && editingSale && (user?.role === "admin" || editReason.trim())) {
        updateProgress("Checking stock availability...", 2, 5)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (user?.role === "admin") {
          updateProgress("Updating sale record...", 3, 5)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Adjusting inventory...", 4, 5)
          const clientName = formData.client === "custom" ? formData.customClient : formData.client
          const { customClient, ...saleData } = formData
          await updateSale(editingSale.id, { ...saleData, productName: product.name, client: clientName })
          
          updateProgress("Operation completed!", 5, 5)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          toast({ title: "Success", description: "Sale updated successfully!", })
        } else {
          updateProgress("Preparing approval request...", 3, 4)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Submitting for approval...", 4, 4)
          const clientName = formData.client === "custom" ? formData.customClient : formData.client
          const { customClient, ...saleData } = formData
          submitChange({ type: "sale", action: "update", entityId: editingSale.id, originalData: { productName: editingSale.productName, client: editingSale.client, quantitySold: editingSale.quantitySold, salePrice: editingSale.salePrice, saleDate: editingSale.saleDate, }, proposedData: { ...saleData, productName: product.name, client: clientName }, requestedBy: user?.email || "", reason: editReason, })
          toast({ title: "Submitted", description: "Sale changes submitted for admin approval." })
        }
        
        resetForm()
        showAlert("Sale updated successfully!", true)
      } else if (user?.role !== "admin" && !editReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for the changes.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update sale.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleDelete = (sale: any) => {
    setDeletingSale(sale)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (sale: any) => {
    setViewingSale(sale)
    setIsViewDialogOpen(true)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsProductHistoryDialogOpen(true)
  }

  const handleClientClick = (client: string) => {
    setSelectedClientForHistory(client)
    setIsClientHistoryDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    // Close dialog instantly
    setIsDeleteDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating deletion...", duration: 2000 })
      updateProgress("Validating deletion...", 1, 3)
      
      if (deletingSale && (user?.role === "admin" || deleteReason.trim())) {
        if (user?.role === "admin") {
          updateProgress("Removing sale record...", 2, 3)
          await deleteSale(deletingSale.id)
          updateProgress("Operation completed!", 3, 3)
          toast({ title: "Success", description: "Sale deleted successfully!", })
          setDeletingSale(null)
          showAlert("Sale deleted successfully!", true)
        } else {
          updateProgress("Submitting for approval...", 2, 3)
          submitChange({ 
            type: "sale", 
            action: "delete", 
            entityId: deletingSale.id, 
            originalData: { 
              productName: deletingSale.productName, 
              client: deletingSale.client, 
              quantitySold: deletingSale.quantitySold, 
              salePrice: deletingSale.salePrice, 
              saleDate: deletingSale.saleDate, 
            }, 
            proposedData: {}, 
            requestedBy: user?.email || "", 
            reason: deleteReason, 
          })
          toast({ title: "Submitted", description: "Sale deletion submitted for admin approval." })
          setDeletingSale(null)
          setDeleteReason("")
        }
      } else if (user?.role !== "admin" && !deleteReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for deleting this sale.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete sale.", variant: "destructive" })
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
                Processing Sale...
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
            Sales
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage sales transactions and revenue tracking</p>
          {user?.role !== "admin" && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                Changes require admin approval
              </Badge>
            </div>
          )}
        </div>
        <div className="absolute top-6 right-0 flex space-x-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="neutral"
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Sale</DialogTitle>
                <DialogDescription>
                  Enter sale information to record a new sale
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
                  <Label htmlFor="product">Product *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stockQuantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.client}
                      onValueChange={(value) => setFormData({ ...formData, client: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client or enter custom name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">+ Add Custom Client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.client === "custom" && (
                      <Input
                        placeholder="Enter custom client name"
                        value={formData.customClient || ""}
                        onChange={(e) => setFormData({ ...formData, customClient: e.target.value })}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientType">Client Type *</Label>
                  <Select
                    value={formData.clientType}
                    onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantitySold}
                      onChange={(e) => setFormData({ ...formData, quantitySold: Number.parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Unit Price (Rs) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: Number.parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Sale Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="neutralOutline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {user?.role === "admin" ? "Add Sale" : "Submit for Approval"}
                  </Button>
                </div>
              </form>
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
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table with Tabs */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
          <CardDescription>Track all sales transactions and revenue by client type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl h-14">
              <TabsTrigger 
                value="all" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <TrendingUp className="h-4 w-4" />
                <span>All Sales</span>
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs px-1.5 py-0.5">{salesCounts.allCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="individual" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <Users className="h-4 w-4" />
                <span>Individual</span>
                <Badge variant="secondary" className="ml-1 bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 text-xs px-1.5 py-0.5">{salesCounts.individualCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <Building2 className="h-4 w-4" />
                <span>Company</span>
                <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 text-xs px-1.5 py-0.5">{salesCounts.companyCount}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Client Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === sale.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {sale.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            onClick={() => {
                              handleClientClick(sale.client)
                            }}
                          >
                            {sale.client}
                          </span>
                        </TableCell>
                        <TableCell>{sale.clientType || "Company"}</TableCell>
                        <TableCell>{sale.quantitySold}</TableCell>
                        <TableCell>Rs {sale.salePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          Rs {(sale.quantitySold * sale.salePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(sale.saleDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(sale)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(sale)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(sale)}
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
                {filteredSales.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No sales found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === sale.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {sale.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            onClick={() => {
                              handleClientClick(sale.client)
                            }}
                          >
                            {sale.client}
                          </span>
                        </TableCell>
                        <TableCell>{sale.quantitySold}</TableCell>
                        <TableCell>Rs {sale.salePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          Rs {(sale.quantitySold * sale.salePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(sale.saleDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(sale)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(sale)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(sale)}
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
                {filteredSales.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No individual sales found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === sale.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {sale.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            onClick={() => {
                              handleClientClick(sale.client)
                            }}
                          >
                            {sale.client}
                          </span>
                        </TableCell>
                        <TableCell>{sale.quantitySold}</TableCell>
                        <TableCell>Rs {sale.salePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          Rs {(sale.quantitySold * sale.salePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(sale.saleDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(sale)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(sale)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(sale)}
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
                {filteredSales.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No company sales found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Sale Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Sale Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete information about the selected sale transaction
            </DialogDescription>
          </DialogHeader>
          
          {viewingSale && (
            <div className="space-y-6">
              {/* Sale Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Sale Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSale.productName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Client</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingSale.client}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Sale Date</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingSale.saleDate)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Transaction ID</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-base">{viewingSale.id}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Transaction Details</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quantity Sold</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{viewingSale.quantitySold} units</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {viewingSale.salePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-green-600 dark:text-green-400">
                      Rs {(viewingSale.quantitySold * viewingSale.salePrice).toLocaleString()}
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
                      {formatNepaliDateForTable(viewingSale.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Updated</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingSale.updatedAt || viewingSale.createdAt)}
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
                    <div className={`w-4 h-4 rounded-full ${viewingSale.isActive !== false ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {viewingSale.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-4 py-2 text-sm font-medium">
                    Completed
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
                handleEdit(viewingSale)
              }}
              className="px-6 py-2"
            >
              Edit Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Sale</span>
            </DialogTitle>
            <DialogDescription>
              {user?.role === "admin" ? "Edit sale transaction" : "Submit sale changes for admin approval"}
            </DialogDescription>
          </DialogHeader>
          {user?.role !== "admin" && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your changes will be submitted for admin approval before being applied.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stockQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client *</Label>
              <Select
                value={formData.client}
                onValueChange={(value) => setFormData({ ...formData, client: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client or enter custom name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">+ Add Custom Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.client === "custom" && (
                <Input
                  placeholder="Enter custom client name"
                  value={formData.customClient || ""}
                  onChange={(e) => setFormData({ ...formData, customClient: e.target.value })}
                  className="mt-2"
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clientType">Client Type *</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantitySold}
                  onChange={(e) => setFormData({ ...formData, quantitySold: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Unit Price (Rs) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Sale Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{user?.role === "admin" ? "Update Sale" : "Submit Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Sale</span>
            </DialogTitle>
            <DialogDescription>
              {user?.role === "admin" ? "Confirm sale deletion" : "Submit sale deletion for admin approval"}
            </DialogDescription>
          </DialogHeader>
          {user?.role !== "admin" && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your changes will be submitted for admin approval before being applied.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleDeleteConfirm() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for Deletion {user?.role !== "admin" && "*"}</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why you're deleting this sale..."
                rows={3}
                required={user?.role !== "admin"}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{user?.role === "admin" ? "Delete Sale" : "Submit Deletion"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product History Dialog */}
      <Dialog open={isProductHistoryDialogOpen} onOpenChange={setIsProductHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Product Transaction History</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete transaction history for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (() => {
            const currentYear = getCurrentNepaliYear()
            const productSales = sales.filter(sale => 
              sale.productName === selectedProduct.name && 
              getNepaliYear(sale.saleDate) === currentYear
            )
            const productPurchases = purchases.filter(purchase => 
              purchase.productName === selectedProduct.name && 
              getNepaliYear(purchase.purchaseDate) === currentYear
            )
            
            const totalSalesQuantity = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0)
            const totalSalesValue = productSales.reduce((sum, sale) => sum + (sale.quantitySold * sale.salePrice), 0)
            const totalPurchaseQuantity = productPurchases.reduce((sum, purchase) => sum + purchase.quantityPurchased, 0)
            const totalPurchaseValue = productPurchases.reduce((sum, purchase) => sum + (purchase.quantityPurchased * purchase.purchasePrice), 0)
            
            return (
              <div className="space-y-6">
                {/* Product Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Product Summary</span>
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product Name</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{selectedProduct.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current Stock</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{selectedProduct.stockQuantity} units</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Rs {selectedProduct.unitPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Year Statistics */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{currentYear} Statistics</span>
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Sales</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-green-600 dark:text-green-400">
                        {totalSalesQuantity} units
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Rs {totalSalesValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Purchases</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-blue-600 dark:text-blue-400">
                        {totalPurchaseQuantity} units
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Rs {totalPurchaseValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Net Movement</Label>
                      <p className={`font-semibold text-lg ${totalPurchaseQuantity - totalSalesQuantity >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalPurchaseQuantity - totalSalesQuantity} units
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {totalPurchaseQuantity - totalSalesQuantity >= 0 ? 'Net Inflow' : 'Net Outflow'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Profit Margin</Label>
                      <p className={`font-semibold text-lg ${totalSalesValue - totalPurchaseValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        Rs {(totalSalesValue - totalPurchaseValue).toLocaleString()}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {totalPurchaseValue > 0 ? `${(((totalSalesValue - totalPurchaseValue) / totalPurchaseValue) * 100).toFixed(1)}% margin` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sales Transactions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sales Transactions ({productSales.length})</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quantity</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSales.length > 0 ? (
                          productSales.map((sale) => (
                            <TableRow key={sale.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(sale.saleDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {sale.client}
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
                              No sales transactions found for this product in {currentYear}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Purchase Transactions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Purchase Transactions ({productPurchases.length})</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Supplier</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quantity</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productPurchases.length > 0 ? (
                          productPurchases.map((purchase) => (
                            <TableRow key={purchase.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(purchase.purchaseDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {purchase.supplier}
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
                              No purchase transactions found for this product in {currentYear}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="neutralOutline" 
              onClick={() => setIsProductHistoryDialogOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
