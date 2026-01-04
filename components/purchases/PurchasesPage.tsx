"use client"

import React, { useState, useEffect } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { useApproval } from "@/contexts/ApprovalContext"
import { usePersistentForm } from "@/contexts/FormPersistenceContext"
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
import { MaterialDatePicker } from "@/components/ui/MaterialDatePicker"

export default function PurchasesPage() {
  const { user } = useInventory()
  const { products, purchases, suppliers, sales, addPurchase, updatePurchase, deletePurchase } = useInventory()
  const { submitChange } = useApproval()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isProductHistoryDialogOpen, setIsProductHistoryDialogOpen] = useState(false)
  const [isSupplierHistoryDialogOpen, setIsSupplierHistoryDialogOpen] = useState(false)
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState<string>("")
  const [editingPurchase, setEditingPurchase] = useState<any>(null)
  const [deletingPurchase, setDeletingPurchase] = useState<any>(null)
  const [viewingPurchase, setViewingPurchase] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const initialFormData = {
    productId: "",
    supplier: "",
    supplierType: "Company",
    customSupplier: "",
    quantityPurchased: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    netWeight: 0,
  }

  const { formData, updateForm, resetForm } = usePersistentForm('purchases-form', initialFormData)
  const [editReason, setEditReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [totalSteps, setTotalSteps] = useState(0)
  const [customNetWeight, setCustomNetWeight] = useState(0)
  const uniqueNetWeights = React.useMemo(() => {
    const weights = products.map((p) => p.netWeight).filter((w) => typeof w === "number" && !isNaN(w))
    return Array.from(new Set(weights)).sort((a, b) => (a as number) - (b as number)) as number[]
  }, [products])

  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessAlert])

  // Filter purchases based on search term and active tab
  const getFilteredPurchases = () => {
    let filtered = purchases.filter(
      (purchase) =>
        purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply tab filter
    if (activeTab === "individual") {
      filtered = filtered.filter(purchase => purchase.supplierType === "Individual")
    } else if (activeTab === "company") {
      filtered = filtered.filter(purchase => purchase.supplierType === "Company")
    }

    return filtered
  }

  const filteredPurchases = getFilteredPurchases()

  // Get counts for each tab
  const getPurchasesCounts = () => {
    const allCount = purchases.length
    const individualCount = purchases.filter(purchase => purchase.supplierType === "Individual").length
    const companyCount = purchases.filter(purchase => purchase.supplierType === "Company").length
    return { allCount, individualCount, companyCount }
  }

  const purchasesCounts = getPurchasesCounts()

  const clearForm = () => {
    resetForm()
    setEditReason("")
    setIsAddDialogOpen(false)
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
      toast({ title: "Processing...", description: "Validating purchase data...", duration: 2000 })
      updateProgress("Validating purchase data...", 1, 5)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const product = products.find((p) => p.id === formData.productId)
      if (product) {
        updateProgress("Checking product availability...", 2, 5)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (user?.role === "admin") {
          updateProgress("Recording purchase transaction...", 3, 5)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Updating inventory levels...", 4, 5)
          const supplierName = formData.supplier === "custom" ? formData.customSupplier : formData.supplier
          const { customSupplier, ...purchaseData } = formData
          await addPurchase({ ...purchaseData, productName: product.name, supplier: supplierName })
          
          updateProgress("Operation completed!", 5, 5)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          toast({ title: "Success", description: "Purchase recorded successfully!", })
        } else {
          updateProgress("Preparing approval request...", 3, 4)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Submitting for approval...", 4, 4)
          const supplierName = formData.supplier === "custom" ? formData.customSupplier : formData.supplier
          const { customSupplier, ...purchaseData } = formData
          submitChange({ type: "purchase", action: "create", proposedData: { ...purchaseData, productName: product.name, supplier: supplierName }, requestedBy: user?.email || "", reason: editReason || "New purchase record", })
          toast({ title: "Submitted", description: "Purchase submitted for admin approval." })
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to record purchase.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleEdit = (purchase: any) => {
    setEditingPurchase(purchase)
    const product = products.find((p) => p.name === purchase.productName)
    
    // Convert date to YYYY-MM-DD format for HTML date input
    const formattedDate = new Date(purchase.purchaseDate).toISOString().split('T')[0]
    
    updateForm({
      productId: product?.id || "",
      supplier: purchase.supplier,
      supplierType: purchase.supplierType,
      customSupplier: "",
      quantityPurchased: purchase.quantityPurchased,
      purchasePrice: purchase.purchasePrice,
      purchaseDate: formattedDate,
      netWeight: product?.netWeight ?? 0,
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
      if (product && editingPurchase && (user?.role === "admin" || editReason.trim())) {
        updateProgress("Checking product availability...", 2, 5)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (user?.role === "admin") {
          updateProgress("Updating purchase record...", 3, 5)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Adjusting inventory...", 4, 5)
          const supplierName = formData.supplier === "custom" ? formData.customSupplier : formData.supplier
          const { customSupplier, ...purchaseData } = formData
          await updatePurchase(editingPurchase.id, { ...purchaseData, productName: product.name, supplier: supplierName })
          
          updateProgress("Operation completed!", 5, 5)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          toast({ title: "Success", description: "Purchase updated successfully!", })
        } else {
          updateProgress("Preparing approval request...", 3, 4)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          updateProgress("Submitting for approval...", 4, 4)
          const supplierName = formData.supplier === "custom" ? formData.customSupplier : formData.supplier
          const { customSupplier, ...purchaseData } = formData
          submitChange({ type: "purchase", action: "update", entityId: editingPurchase.id, originalData: { productName: editingPurchase.productName, supplier: editingPurchase.supplier, quantityPurchased: editingPurchase.quantityPurchased, purchasePrice: editingPurchase.purchasePrice, purchaseDate: editingPurchase.purchaseDate }, proposedData: { ...purchaseData, productName: product.name, supplier: supplierName }, requestedBy: user?.email || "", reason: editReason, })
          toast({ title: "Submitted", description: "Purchase changes submitted for admin approval." })
        }
      } else if (user?.role !== "admin" && !editReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for the changes.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update purchase.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleDelete = (purchase: any) => {
    setDeletingPurchase(purchase)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (purchase: any) => {
    setViewingPurchase(purchase)
    setIsViewDialogOpen(true)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsProductHistoryDialogOpen(true)
  }

  const handleSupplierClick = (supplier: string) => {
    setSelectedSupplierForHistory(supplier)
    setIsSupplierHistoryDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating deletion...", duration: 2000 })
      updateProgress("Validating deletion...", 1, 3)
      
      if (deletingPurchase && (user?.role === "admin" || deleteReason.trim())) {
        if (user?.role === "admin") {
          updateProgress("Removing purchase record...", 2, 3)
          await deletePurchase(deletingPurchase.id)
          updateProgress("Operation completed!", 3, 3)
          toast({ title: "Success", description: "Purchase deleted successfully!", })
          setDeletingPurchase(null)
          setShowSuccessAlert(true)
          setAlertMessage("Purchase deleted successfully!")
        } else {
          updateProgress("Submitting for approval...", 2, 3)
          submitChange({ 
            type: "purchase", 
            action: "delete", 
            entityId: deletingPurchase.id, 
            originalData: { 
              productName: deletingPurchase.productName, 
              supplier: deletingPurchase.supplier, 
              quantityPurchased: deletingPurchase.quantityPurchased, 
              purchasePrice: deletingPurchase.purchasePrice, 
              purchaseDate: deletingPurchase.purchaseDate 
            }, 
            proposedData: {}, 
            requestedBy: user?.email || "", 
            reason: deleteReason, 
          })
          toast({ title: "Submitted", description: "Purchase deletion submitted for admin approval." })
          setDeletingPurchase(null)
          setDeleteReason("")
        }
      } else if (user?.role !== "admin" && !deleteReason.trim()) {
        toast({ title: "Error", description: "Please provide a reason for deleting this purchase.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete purchase.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  React.useEffect(() => {
    if (formData.productId) {
      const product = products.find((p) => p.id === formData.productId)
      if (product && typeof product.netWeight === "number") {
        updateForm({ netWeight: product.netWeight ?? 0 })
      }
    }
  }, [formData.productId, products])

  return (
    <div className="space-y-6 p-6 min-h-screen transition-colors duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Processing Purchase...
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
            Purchases
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage purchase orders and inventory restocking</p>
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
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Purchase</DialogTitle>
                <DialogDescription>
                  Enter purchase information to record a new purchase
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
                    onValueChange={(value) => updateForm({ ...formData, productId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.netWeight}kg (Stock: {product.stockQuantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) => updateForm({ ...formData, supplier: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier or enter custom name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">+ Add Custom Supplier</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.supplier === "custom" && (
                      <Input
                        placeholder="Enter custom supplier name"
                        value={formData.customSupplier || ""}
                        onChange={(e) => updateForm({ ...formData, customSupplier: e.target.value })}
                        className="mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierType">Supplier Type *</Label>
                  <Select
                    value={formData.supplierType}
                    onValueChange={(value) => updateForm({ ...formData, supplierType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier type" />
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
                      value={formData.quantityPurchased}
                      onChange={(e) =>
                        updateForm({ ...formData, quantityPurchased: Number.parseInt(e.target.value) || 0 })
                      }
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
                      value={formData.purchasePrice}
                      onChange={(e) => updateForm({ ...formData, purchasePrice: Number.parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Purchase Date *</Label>
                  <MaterialDatePicker
                    value={formData.purchaseDate ? new Date(formData.purchaseDate) : undefined}
                    onChange={(date: Date | undefined) => updateForm({ ...formData, purchaseDate: date ? date.toISOString().split("T")[0] : "" })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="neutralOutline" onClick={clearForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {user?.role === "admin" ? "Add Purchase" : "Submit for Approval"}
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
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table with Tabs */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Track all purchase orders and inventory restocking by supplier type</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl h-14">
              <TabsTrigger 
                value="all" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <TrendingUp className="h-4 w-4" />
                <span>All Purchases</span>
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs px-1.5 py-0.5">{purchasesCounts.allCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="individual" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <Users className="h-4 w-4" />
                <span>Individual</span>
                <Badge variant="secondary" className="ml-1 bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 text-xs px-1.5 py-0.5">{purchasesCounts.individualCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:font-semibold transition-all duration-300 ease-in-out rounded-lg px-3 py-2.5 h-full"
              >
                <Building2 className="h-4 w-4" />
                <span>Company</span>
                <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 text-xs px-1.5 py-0.5">{purchasesCounts.companyCount}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Supplier Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === purchase.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {purchase.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            onClick={() => {
                              handleSupplierClick(purchase.supplier)
                            }}
                          >
                            {purchase.supplier}
                          </span>
                        </TableCell>
                        <TableCell>{purchase.supplierType || "Company"}</TableCell>
                        <TableCell>{purchase.quantityPurchased}</TableCell>
                        <TableCell>Rs {purchase.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          Rs {(purchase.quantityPurchased * purchase.purchasePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(purchase.purchaseDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(purchase)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(purchase)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(purchase)}
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
                {filteredPurchases.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No purchases found</p>
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === purchase.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {purchase.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            onClick={() => {
                              handleSupplierClick(purchase.supplier)
                            }}
                          >
                            {purchase.supplier}
                          </span>
                        </TableCell>
                        <TableCell>{purchase.quantityPurchased}</TableCell>
                        <TableCell>Rs {purchase.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          Rs {(purchase.quantityPurchased * purchase.purchasePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(purchase.purchaseDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(purchase)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(purchase)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(purchase)}
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
                {filteredPurchases.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No individual purchases found</p>
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => {
                              const product = products.find(p => p.name === purchase.productName)
                              if (product) handleProductClick(product)
                            }}
                          >
                            {purchase.productName}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            onClick={() => {
                              handleSupplierClick(purchase.supplier)
                            }}
                          >
                            {purchase.supplier}
                          </span>
                        </TableCell>
                        <TableCell>{purchase.quantityPurchased}</TableCell>
                        <TableCell>Rs {purchase.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          Rs {(purchase.quantityPurchased * purchase.purchasePrice).toFixed(2)}
                        </TableCell>
                        <TableCell>{formatNepaliDateForTable(purchase.purchaseDate)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleView(purchase)}
                              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleEdit(purchase)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => handleDelete(purchase)}
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
                {filteredPurchases.length === 0 && (
                  <div className="text-center py-8 animate-in fade-in-0 duration-300">
                    <p className="text-gray-500">No company purchases found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Purchase Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Purchase Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete information about the selected purchase transaction
            </DialogDescription>
          </DialogHeader>
          
          {viewingPurchase && (
            <div className="space-y-6">
              {/* Purchase Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Purchase Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingPurchase.productName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Supplier</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingPurchase.supplier}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Purchase Date</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingPurchase.purchaseDate)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Transaction ID</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-base">{viewingPurchase.id}</p>
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
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quantity Purchased</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{viewingPurchase.quantityPurchased} units</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {viewingPurchase.purchasePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-blue-600 dark:text-blue-400">
                      Rs {(viewingPurchase.quantityPurchased * viewingPurchase.purchasePrice).toLocaleString()}
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
                      {formatNepaliDateForTable(viewingPurchase.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Updated</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingPurchase.updatedAt || viewingPurchase.createdAt)}
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
                    <div className={`w-4 h-4 rounded-full ${viewingPurchase.isActive !== false ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {viewingPurchase.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-4 py-2 text-sm font-medium">
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
                handleEdit(viewingPurchase)
              }}
              className="px-6 py-2"
            >
              Edit Purchase
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
              <span>Edit Purchase</span>
            </DialogTitle>
            <DialogDescription>
              {user?.role === "admin" ? "Edit purchase order" : "Submit purchase changes for admin approval"}
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
                onValueChange={(value) => updateForm({ ...formData, productId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.netWeight}kg (Stock: {product.stockQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier *</Label>
              <div className="space-y-2">
                <Select
                  value={formData.supplier}
                  onValueChange={(value) => updateForm({ ...formData, supplier: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier or enter custom name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">+ Add Custom Supplier</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.supplier === "custom" && (
                  <Input
                    placeholder="Enter custom supplier name"
                    value={formData.customSupplier || ""}
                    onChange={(e) => updateForm({ ...formData, customSupplier: e.target.value })}
                    className="mt-2"
                    required
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplierType">Supplier Type *</Label>
              <Select
                value={formData.supplierType}
                onValueChange={(value) => updateForm({ ...formData, supplierType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier type" />
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
                  value={formData.quantityPurchased}
                  onChange={(e) =>
                    updateForm({ ...formData, quantityPurchased: Number.parseInt(e.target.value) || 0 })
                  }
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
                  value={formData.purchasePrice}
                  onChange={(e) => updateForm({ ...formData, purchasePrice: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Purchase Date *</Label>
              <MaterialDatePicker
                value={formData.purchaseDate ? new Date(formData.purchaseDate) : undefined}
                onChange={(date: Date | undefined) => updateForm({ ...formData, purchaseDate: date ? date.toISOString().split("T")[0] : "" })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => {
                clearForm()
                setIsEditDialogOpen(false)
              }}>
                Cancel
              </Button>
              <Button type="submit">{user?.role === "admin" ? "Update Purchase" : "Submit Changes"}</Button>
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
              <span>Delete Purchase</span>
            </DialogTitle>
            <DialogDescription>
              {user?.role === "admin" ? "Delete purchase order" : "Submit purchase deletion for admin approval"}
            </DialogDescription>
          </DialogHeader>
          {user?.role !== "admin" && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your deletion will be submitted for admin approval before being applied.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for Deletion {user?.role !== "admin" && "*"}</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why you're deleting this purchase..."
                rows={3}
                required={user?.role !== "admin"}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{user?.role === "admin" ? "Delete Purchase" : "Submit Deletion"}</Button>
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
            const currentYear = getNepaliYear(new Date().toISOString())
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
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Weight</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Unit Weight: {selectedProduct.netWeight ?? '-'} kg</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Weight</Label>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Total Weight: {selectedProduct.netWeight && selectedProduct.stockQuantity ? (selectedProduct.netWeight * selectedProduct.stockQuantity).toFixed(2) : '-'} kg</p>
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}