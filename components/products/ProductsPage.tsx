"use client"

import type React from "react"
import { Package } from "lucide-react"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useInventory } from "@/contexts/InventoryContext"
import { useApproval } from "@/contexts/ApprovalContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { usePersistentForm } from "@/contexts/FormPersistenceContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, AlertTriangle, Clock, CheckCircle, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatNepaliDateForTable, getNepaliYear, getCurrentNepaliYear } from "@/lib/utils"

export default function ProductsPage() {
  const { user } = useAuth()
  const { products, addProduct, updateProduct, deleteProduct, refreshData, suppliers, sales, purchases } = useInventory()
  const { submitChange } = useApproval()
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isViewCategoriesOpen, setIsViewCategoriesOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [pendingAction, setPendingAction] = useState<{
    type: "create" | "update" | "delete"
    data: any
    productId?: string
  } | null>(null)
  const initialFormData = {
    name: "",
    hsCode: "",
    description: "",
    category: "",
    stockQuantity: 0,
    unitPrice: 0,
    netWeight: 0,
    supplier: "",
    stockType: "new" as "new" | "old",
    lowStockThreshold: 5,
  }

  const { formData, updateForm, resetForm } = usePersistentForm('products-form', initialFormData)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [approvalReason, setApprovalReason] = useState("")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [totalSteps, setTotalSteps] = useState(0)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deletingProduct, setDeletingProduct] = useState<any>(null)
  const [viewingProduct, setViewingProduct] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false)
  const [isCategoryHistoryOpen, setIsCategoryHistoryOpen] = useState(false)
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<any>(null)
  const [selectedCategoryForHistory, setSelectedCategoryForHistory] = useState<string>("")
  // Add state variables for supplier and client transaction history
  const [isSupplierHistoryOpen, setIsSupplierHistoryOpen] = useState(false)
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false)
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState<string>("")
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<string>("")
  const [customNetWeight, setCustomNetWeight] = useState(0)
  const uniqueNetWeights = useMemo(() => {
    const weights = products.map((p) => p.netWeight).filter((w) => typeof w === "number" && !isNaN(w))
    return Array.from(new Set(weights)).sort((a, b) => (a as number) - (b as number)) as number[]
  }, [products])
  const handleNetWeightChange = (value: string) => {
    if (value === "custom") {
      updateForm({ netWeight: customNetWeight })
    } else {
      updateForm({ netWeight: Number(value) })
    }
  }

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Group products by name to show variants in dropdown
  const groupedProducts = useMemo(() => {
    const groups: {[key: string]: any[]} = {}
    
    filteredProducts.forEach(product => {
      if (!groups[product.name]) {
        groups[product.name] = []
      }
      groups[product.name].push(product)
    })
    
    // Convert to array and sort by name
    return Object.entries(groups).map(([name, variants]) => ({
      name,
      variants: variants.sort((a, b) => (a.netWeight || 0) - (b.netWeight || 0)),
      totalStock: variants.reduce((sum, p) => sum + p.stockQuantity, 0),
      // Use the first variant for common fields
      category: variants[0].category,
      hsCode: variants[0].hsCode,
      supplier: variants[0].supplier,
      unitPrice: variants[0].unitPrice,
    }))
  }, [filteredProducts])

  // Auto-hide success alerts
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessAlert])

  const clearForm = () => {
    resetForm()
    setEditingProduct(null)
    setApprovalReason("")
    setIsAddingNewCategory(false)
    setNewCategoryName("")
    setAutoFilledFields({}) // Clear auto-fill indicators
    setIsAddDialogOpen(false)
  }

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
    setTotalSteps(total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use newCategoryName if adding new category
    const submitData = {
      ...formData,
      category: isAddingNewCategory ? newCategoryName : formData.category
    }
    
    // Validate required fields
    if (!submitData.name || submitData.name.trim() === '') {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" })
      return
    }
    
    if (!submitData.supplier || submitData.supplier.trim() === '') {
      toast({ title: "Error", description: "Supplier is required", variant: "destructive" })
      return
    }
    
    if (!submitData.category || submitData.category.trim() === '') {
      toast({ title: "Error", description: "Category is required", variant: "destructive" })
      return
    }
    
    // Close form immediately when submit is clicked
    setIsAddDialogOpen(false)
    
    setIsLoading(true)
    setProgress(0)
    
    try {
      // Show live progress messages
      toast({ 
        title: "Processing...", 
        description: "Validating product data...",
        duration: 2000
      })
      
      updateProgress("Validating product data...", 1, 4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (user?.role === "admin") {
        toast({ 
          title: "Processing...", 
          description: "Adding product to database...",
          duration: 2000
        })
        
        updateProgress("Adding product to database...", 2, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        toast({ 
          title: "Processing...", 
          description: "Updating inventory...",
          duration: 2000
        })
        
        updateProgress("Updating inventory...", 3, 4)
        await addProduct(submitData)
        
        updateProgress("Operation completed!", 4, 4)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        resetForm()
        
        toast({ title: "Success", description: "Product added successfully!", })
        setShowSuccessAlert(true)
        setAlertMessage("Product added successfully!")
        
        // Add notification
        addNotification({
          type: 'success',
          title: 'Product Added',
          message: `Product "${submitData.name}" has been successfully added to inventory.`,
          action: 'product_added',
          entityId: submitData.name,
          entityType: 'product'
        })
        
        // Force refresh the data in the background
        refreshData().catch(err => {
          console.error("Failed to refresh data:", err)
        })
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
        setPendingAction({ type: "create", data: submitData })
        setShowApprovalDialog(true)
        
        // Add notification for approval request
        addNotification({
          type: 'info',
          title: 'Approval Request',
          message: `Product "${submitData.name}" has been submitted for admin approval.`,
          action: 'approval_requested',
          entityId: submitData.name,
          entityType: 'product'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add product."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      
      // Add error notification
      addNotification({
        type: 'error',
        title: 'Product Addition Failed',
        message: errorMessage,
        action: 'product_add_failed',
        entityType: 'product'
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use newCategoryName if adding new category
    const submitData = {
      ...formData,
      category: isAddingNewCategory ? newCategoryName : formData.category
    }
    
    // Validate required fields
    if (!submitData.name || submitData.name.trim() === '') {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" })
      return
    }
    
    if (!submitData.supplier || submitData.supplier.trim() === '') {
      toast({ title: "Error", description: "Supplier is required", variant: "destructive" })
      return
    }
    
    if (!submitData.category || submitData.category.trim() === '') {
      toast({ title: "Error", description: "Category is required", variant: "destructive" })
      return
    }
    
    // Close form immediately when submit is clicked
    setIsEditDialogOpen(false)
    
    setIsLoading(true)
    setProgress(0)
    
    try {
      if (editingProduct) {
        // Show live progress messages
        toast({ 
          title: "Processing...", 
          description: "Validating changes...",
          duration: 2000
        })
        
        updateProgress("Validating changes...", 1, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (user?.role === "admin") {
          toast({ 
            title: "Processing...", 
            description: "Updating product in database...",
            duration: 2000
          })
          
          updateProgress("Updating product in database...", 2, 4)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          toast({ 
            title: "Processing...", 
            description: "Refreshing inventory...",
            duration: 2000
          })
          
          updateProgress("Refreshing inventory...", 3, 4)
          await updateProduct(editingProduct.id, submitData)
          
          updateProgress("Operation completed!", 4, 4)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          resetForm()
          setEditingProduct(null)
          
          toast({ title: "Success", description: "Product updated successfully!", })
          setShowSuccessAlert(true)
          setAlertMessage("Product updated successfully!")
          
          // Add notification
          addNotification({
            type: 'success',
            title: 'Product Updated',
            message: `Product "${submitData.name}" has been successfully updated.`,
            action: 'product_updated',
            entityId: editingProduct.id,
            entityType: 'product'
          })
          
          // Force refresh the data in the background
          refreshData().catch(err => {
            console.error("Failed to refresh data:", err)
          })
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
          setPendingAction({ type: "update", data: submitData, productId: editingProduct.id })
          setShowApprovalDialog(true)
          
          // Add notification for approval request
          addNotification({
            type: 'info',
            title: 'Update Approval Request',
            message: `Update for product "${submitData.name}" has been submitted for admin approval.`,
            action: 'update_approval_requested',
            entityId: editingProduct.id,
            entityType: 'product'
          })
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      
      // Add error notification
      addNotification({
        type: 'error',
        title: 'Product Update Failed',
        message: errorMessage,
        action: 'product_update_failed',
        entityType: 'product'
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const submitForApproval = () => {
    if (!pendingAction) return

    submitChange({
      type: "product",
      action: pendingAction.type,
      entityId: pendingAction.productId,
      originalData: pendingAction.productId ? products.find((p) => p.id === pendingAction.productId) : undefined,
      proposedData: pendingAction.data,
      requestedBy: user?.email || "",
      reason: approvalReason,
    })

    resetForm()
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    setShowApprovalDialog(false)
    setPendingAction(null)
    setShowSuccessAlert(true)
    setAlertMessage("Product request submitted for approval!")
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    updateForm({
      name: product.name,
      hsCode: product.hsCode,
      description: product.description,
      category: product.category,
      stockQuantity: product.stockQuantity,
      unitPrice: product.unitPrice,
      netWeight: product.netWeight || 0,
      supplier: product.supplier,
      stockType: product.stockType,
      lowStockThreshold: product.lowStockThreshold,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (product: any) => {
    setDeletingProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (product: any) => {
    setViewingProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleProductClick = (product: any) => {
    setSelectedProductForHistory(product)
    setIsTransactionHistoryOpen(true)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategoryForHistory(category)
    setIsCategoryHistoryOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleteDialogOpen(false)
    setIsLoading(true)
    setProgress(0)
    try {
      toast({ title: "Processing...", description: "Validating deletion...", duration: 2000 })
      updateProgress("Validating deletion...", 1, 3)
      if (user?.role === "admin") {
        updateProgress("Removing from database...", 2, 3)
        await deleteProduct(deletingProduct.id)
        updateProgress("Operation completed!", 3, 3)
        toast({ title: "Success", description: "Product deleted successfully!", })
        setDeletingProduct(null)
        addNotification({
          type: 'warning',
          title: 'Product Deleted',
          message: `Product "${deletingProduct.name}" has been permanently deleted from inventory.`,
          action: 'product_deleted',
          entityId: deletingProduct.id,
          entityType: 'product'
        })
        await refreshData()
      } else {
        updateProgress("Submitting for approval...", 2, 3)
        submitChange({ type: "product", action: "delete", entityId: deletingProduct.id, originalData: deletingProduct, proposedData: { deleted: true }, requestedBy: user?.email || "", reason: `Request to delete product: ${deletingProduct.name}` })
        toast({ title: "Submitted", description: "Product deletion submitted for approval!" })
        setDeletingProduct(null)
        addNotification({
          type: 'info',
          title: 'Deletion Approval Request',
          message: `Deletion request for product "${deletingProduct.name}" has been submitted for admin approval.`,
          action: 'deletion_approval_requested',
          entityId: deletingProduct.id,
          entityType: 'product'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
      addNotification({
        type: 'error',
        title: 'Product Deletion Failed',
        message: errorMessage,
        action: 'product_deletion_failed',
        entityType: 'product'
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  // Add functions for supplier and client transaction history
  const handleSupplierClick = (supplier: string) => {
    setSelectedSupplierForHistory(supplier)
    setIsSupplierHistoryOpen(true)
  }

  const handleClientClick = (client: string) => {
    setSelectedClientForHistory(client)
    setIsClientHistoryOpen(true)
  }

  const [customProductName, setCustomProductName] = useState("")
  const [autoFilledFields, setAutoFilledFields] = useState<{[key: string]: boolean}>({})
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({})
  const uniqueProductNames = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.name).filter(Boolean))).sort()
  }, [products])



  const handleProductNameChange = (value: string) => {
    if (value === "custom") {
      updateForm({ name: customProductName })
      setAutoFilledFields({}) // Clear auto-fill indicators
    } else {
      // Find the first product with this name to auto-fill common fields
      const existingProduct = products.find(p => p.name === value)
      
      if (existingProduct) {
        // Track which fields are being auto-filled
        const newAutoFilledFields: {[key: string]: boolean} = {}
        
        // Auto-fill HS code, category, and supplier from existing product
        // Only auto-fill if the existing product has non-empty values
        const updatedFormData = {
          ...formData,
          name: value,
          hsCode: existingProduct.hsCode && existingProduct.hsCode.trim() !== '' ? existingProduct.hsCode : formData.hsCode,
          category: existingProduct.category && existingProduct.category.trim() !== '' ? existingProduct.category : formData.category,
          supplier: existingProduct.supplier && existingProduct.supplier.trim() !== '' ? existingProduct.supplier : formData.supplier,
        }
        
        // Mark fields as auto-filled if they were changed and have valid values
        if (existingProduct.hsCode && existingProduct.hsCode.trim() !== '' && existingProduct.hsCode !== formData.hsCode) {
          newAutoFilledFields.hsCode = true
        }
        if (existingProduct.category && existingProduct.category.trim() !== '' && existingProduct.category !== formData.category) {
          newAutoFilledFields.category = true
        }
        if (existingProduct.supplier && existingProduct.supplier.trim() !== '' && existingProduct.supplier !== formData.supplier) {
          newAutoFilledFields.supplier = true
        }
        
        updateForm(updatedFormData)
        setAutoFilledFields(newAutoFilledFields)
        
        // Clear auto-fill indicators after 3 seconds
        setTimeout(() => setAutoFilledFields({}), 3000)
      } else {
        updateForm({ name: value })
        setAutoFilledFields({}) // Clear auto-fill indicators
      }
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === "__new__") {
      setIsAddingNewCategory(true)
      setNewCategoryName("")
    } else {
      setIsAddingNewCategory(false)
      updateForm({ category: value })
    }
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
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
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your product inventory with ease</p>
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
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Add New Product
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Enter product details to add to inventory
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Select
                      value={uniqueProductNames.includes(formData.name) ? formData.name : "custom"}
                      onValueChange={handleProductNameChange}
                    >
                      <SelectTrigger id="productName">
                        <SelectValue placeholder="Select product name" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueProductNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!uniqueProductNames.includes(formData.name) || formData.name === "") && (
                      <Input
                        id="productName-custom"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setCustomProductName(e.target.value)
                          updateForm({ name: e.target.value })
                        }}
                        placeholder="Enter custom product name"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hsCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        HS Code
                      </Label>
                      {autoFilledFields.hsCode && (
                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          Auto-filled
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="hsCode"
                      value={formData.hsCode}
                      onChange={(e) => updateForm({ hsCode: e.target.value })}
                      className={`border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                        autoFilledFields.hsCode ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : ''
                      }`}
                    />

                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </Label>
                    {autoFilledFields.category && (
                      <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        Auto-filled
                      </Badge>
                    )}
                  </div>
                  {isAddingNewCategory && (
                    <Input
                      id="category-new"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  )}
                  <Select
                    value={isAddingNewCategory ? "__new__" : formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select or add category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__">Add new category...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Supplier
                      </Label>
                      {autoFilledFields.supplier && (
                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          Auto-filled
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) => updateForm({ supplier: value })}
                    >
                      <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Stock Type
                  </Label>
                  <Select
                    value={formData.stockType}
                    onValueChange={(value: "new" | "old") => updateForm({ stockType: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select stock type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="new">New Stock</SelectItem>
                      <SelectItem value="old">Old Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        updateForm({ stockQuantity: Number.parseInt(e.target.value) || 0 })
                      }
                      className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Unit Price (Rs)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        updateForm({ unitPrice: Number.parseFloat(e.target.value) || 0 })
                      }
                      className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="netWeight">Net Weight (kg)</Label>
                    <Select
                      value={uniqueNetWeights.includes(formData.netWeight) ? String(formData.netWeight) : "custom"}
                      onValueChange={handleNetWeightChange}
                    >
                      <SelectTrigger id="netWeight">
                        <SelectValue placeholder="Select net weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueNetWeights.map((weight) => (
                          <SelectItem key={weight} value={String(weight)}>{weight} kg</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!uniqueNetWeights.includes(formData.netWeight) || formData.netWeight === 0) && (
                      <Input
                        id="netWeight-custom"
                        type="number"
                        min={0}
                        value={formData.netWeight}
                        onChange={(e) => {
                          setCustomNetWeight(Number(e.target.value) || 0)
                          updateForm({ netWeight: Number(e.target.value) || 0 })
                        }}
                        placeholder="Enter custom net weight"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="neutralOutline" onClick={clearForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {user?.role === "admin" ? "Add Product" : "Submit for Approval"}
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
                <DialogDescription>Please provide a reason for this product request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder="Explain why this change should be made..."
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Edit Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update product information
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
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-productName">Product Name</Label>
                <Select
                  value={uniqueProductNames.includes(formData.name) ? formData.name : "custom"}
                  onValueChange={handleProductNameChange}
                >
                  <SelectTrigger id="edit-productName">
                    <SelectValue placeholder="Select product name" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProductNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {(!uniqueProductNames.includes(formData.name) || formData.name === "") && (
                  <Input
                    id="edit-productName-custom"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setCustomProductName(e.target.value)
                      updateForm({ name: e.target.value })
                    }}
                    placeholder="Enter custom product name"
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-hsCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    HS Code
                  </Label>
                  {autoFilledFields.hsCode && (
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                      Auto-filled
                    </Badge>
                  )}
                </div>
                <Input
                  id="edit-hsCode"
                  value={formData.hsCode}
                  onChange={(e) => updateForm({ hsCode: e.target.value })}
                  className={`border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                    autoFilledFields.hsCode ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : ''
                  }`}
                />

              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                {autoFilledFields.category && (
                  <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    Auto-filled
                  </Badge>
                )}
              </div>
              {isAddingNewCategory && (
                <Input
                  id="edit-category-new"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                />
              )}
              <Select
                value={isAddingNewCategory ? "__new__" : formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Select or add category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">Add new category...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-supplier" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Supplier
                  </Label>
                  {autoFilledFields.supplier && (
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                      Auto-filled
                    </Badge>
                  )}
                </div>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) => updateForm({ supplier: value })}
                >
                  <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stockType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Stock Type
              </Label>
              <Select
                value={formData.stockType}
                onValueChange={(value: "new" | "old") => updateForm({ stockType: value })}
              >
                <SelectTrigger className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Select stock type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="new">New Stock</SelectItem>
                  <SelectItem value="old">Old Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-stock" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Stock Quantity
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    updateForm({ stockQuantity: Number.parseInt(e.target.value) || 0 })
                  }
                  className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Unit Price (Rs)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    updateForm({ unitPrice: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="border-2 focus:border-slate-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-netWeight">Net Weight (kg)</Label>
                <Select
                  value={uniqueNetWeights.includes(formData.netWeight) ? String(formData.netWeight) : "custom"}
                  onValueChange={handleNetWeightChange}
                >
                  <SelectTrigger id="edit-netWeight">
                    <SelectValue placeholder="Select net weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueNetWeights.map((weight) => (
                      <SelectItem key={weight} value={String(weight)}>{weight} kg</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {(!uniqueNetWeights.includes(formData.netWeight) || formData.netWeight === 0) && (
                  <Input
                    id="edit-netWeight-custom"
                    type="number"
                    min={0}
                    value={formData.netWeight}
                    onChange={(e) => {
                      setCustomNetWeight(Number(e.target.value) || 0)
                      updateForm({ netWeight: Number(e.target.value) || 0 })
                    }}
                    placeholder="Enter custom net weight"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="neutralOutline" onClick={() => {
                clearForm()
                setIsEditDialogOpen(false)
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {user?.role === "admin" ? "Update Product" : "Submit for Approval"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 border-2 focus:border-slate-500 h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800 dark:border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products Details ({groupedProducts.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product Name</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Number of units</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Weight (kg)</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price (Rs)</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedProducts.map((group) => {
                  const selectedVariantId = selectedVariants[group.name] || group.variants[0]?.id
                  const selectedVariant = group.variants.find(v => v.id === selectedVariantId) || group.variants[0]
                  
                  return (
                    <TableRow
                      key={group.name}
                      className="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <TableCell>
                        <p 
                          className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleProductClick(selectedVariant)}
                        >
                          {group.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p 
                          className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleProductClick(selectedVariant)}
                        >
                          {group.category}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {selectedVariant.stockQuantity <= 5 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          <span
                            className={`font-semibold ${selectedVariant.stockQuantity <= 5 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {selectedVariant.stockQuantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.variants.length > 1 ? (
                          <Select
                            value={selectedVariantId}
                            onValueChange={(value) => setSelectedVariants(prev => ({...prev, [group.name]: value}))}
                          >
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue placeholder="Select weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {group.variants.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.netWeight}kg
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{selectedVariant.netWeight ?? "-"}</span>
                        )}
                      </TableCell>
                      <TableCell>{selectedVariant.unitPrice ? `Rs ${selectedVariant.unitPrice.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="neutralOutline"
                            onClick={() => handleView(selectedVariant)}
                            className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="neutralOutline"
                            onClick={() => handleEdit(selectedVariant)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="neutralOutline"
                            onClick={() => handleDelete(selectedVariant)}
                            className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-600 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {groupedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Package className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">No products found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Product Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Complete information about the selected product
            </DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingProduct.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">HS Code</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-mono text-base">{viewingProduct.hsCode || "Not specified"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Category</Label>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-3 py-1 text-sm font-medium">
                      {viewingProduct.category}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock Type</Label>
                    <Badge 
                      variant={viewingProduct.stockType === "new" ? "default" : "secondary"}
                      className={viewingProduct.stockType === "new" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 text-sm font-medium" : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 px-3 py-1 text-sm font-medium"}
                    >
                      {viewingProduct.stockType === "new" ? "New Stock" : "Old Stock"}
                    </Badge>
                  </div>
                </div>
                {viewingProduct.description && (
                  <div className="space-y-2 mt-6">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Description</Label>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 leading-relaxed text-base">
                      {viewingProduct.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Inventory Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Inventory Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock Quantity</Label>
                    <div className="flex items-center space-x-3">
                      {viewingProduct.stockQuantity <= 5 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      <span className={`font-semibold text-lg ${viewingProduct.stockQuantity <= 5 ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"}`}>
                        {viewingProduct.stockQuantity} units
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {viewingProduct.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Value</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      Rs {(viewingProduct.stockQuantity * viewingProduct.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Low Stock Threshold</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">
                      {(viewingProduct as any).lowStockThreshold || 5} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Supplier Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Supplier</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{viewingProduct.supplier}</p>
                  </div>
                  {viewingProduct.batchNumber && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Batch Number</Label>
                      <p className="text-gray-700 dark:text-gray-300 font-mono text-base bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        {viewingProduct.batchNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Timestamps</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Created</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingProduct.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Updated</Label>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {formatNepaliDateForTable(viewingProduct.updatedAt || viewingProduct.createdAt)}
                    </p>
                  </div>
                  {viewingProduct.lastRestocked && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Restocked</Label>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                        {formatNepaliDateForTable(viewingProduct.lastRestocked)}
                      </p>
                    </div>
                  )}
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
                    <div className={`w-4 h-4 rounded-full ${viewingProduct.isActive !== false ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-base">
                      {viewingProduct.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {viewingProduct.stockQuantity <= 0 && (
                    <Badge variant="destructive" className="px-4 py-2 text-sm font-medium">Out of Stock</Badge>
                  )}
                  {viewingProduct.stockQuantity > 0 && viewingProduct.stockQuantity <= 5 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 px-4 py-2 text-sm font-medium">
                      Low Stock
                    </Badge>
                  )}
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
                handleEdit(viewingProduct)
              }}
              className="px-6 py-2"
            >
              Edit Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Product</span>
            </DialogTitle>
            <DialogDescription>
              {user?.role === "admin" ? "Confirm product deletion" : "Submit product deletion for admin approval"}
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
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{deletingProduct?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <Button 
                type="button" 
                variant="neutralOutline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeletingProduct(null)
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
                {user?.role === "admin" ? "Delete Product" : "Submit Deletion"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Transaction History Dialog */}
      <Dialog open={isTransactionHistoryOpen} onOpenChange={setIsTransactionHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Transaction History</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Sales and purchases for <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedProductForHistory?.name}</span> in {new Date().getFullYear()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProductForHistory && (
            <div className="space-y-6">
              {/* Product Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Product Summary</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{selectedProductForHistory.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current Stock</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{selectedProductForHistory.stockQuantity} units</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unit Price</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Rs {selectedProductForHistory.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Value</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-green-600 dark:text-green-400">
                      Rs {(selectedProductForHistory.stockQuantity * selectedProductForHistory.unitPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Statistics */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Year {new Date().getFullYear()} Statistics</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {(() => {
                    const currentYear = getCurrentNepaliYear()
                    const productSales = sales.filter(sale => 
                      sale.productName === selectedProductForHistory.name && 
                      getNepaliYear(sale.saleDate) === currentYear
                    ).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                    
                    const productPurchases = purchases.filter(purchase => 
                      purchase.productName === selectedProductForHistory.name && 
                      getNepaliYear(purchase.purchaseDate) === currentYear
                    )
                    
                    const totalSalesQuantity = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0)
                    const totalSalesValue = productSales.reduce((sum, sale) => sum + (sale.quantitySold * sale.salePrice), 0)
                    const totalPurchaseQuantity = productPurchases.reduce((sum, purchase) => sum + purchase.quantityPurchased, 0)
                    const totalPurchaseValue = productPurchases.reduce((sum, purchase) => sum + (purchase.quantityPurchased * purchase.purchasePrice), 0)
                    
                    return (
                      <>
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
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Sales Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sales Transactions ({(() => {
                    const currentYear = getCurrentNepaliYear()
                    return sales.filter(sale => 
                      sale.productName === selectedProductForHistory.name && 
                      getNepaliYear(sale.saleDate) === currentYear
                    ).length
                  })()})</span>
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
                      {(() => {
                        const currentYear = getCurrentNepaliYear()
                        const productSales = sales.filter(sale => 
                          sale.productName === selectedProductForHistory.name && 
                          getNepaliYear(sale.saleDate) === currentYear
                        ).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                        
                        return productSales.length > 0 ? (
                          productSales.map((sale) => (
                            <TableRow key={sale.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(sale.saleDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <span 
                                  className="cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                  onClick={() => handleClientClick(sale.client)}
                                >
                                  {sale.client}
                                </span>
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
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Purchase Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Purchase Transactions ({(() => {
                    const currentYear = getCurrentNepaliYear()
                    return purchases.filter(purchase => 
                      purchase.productName === selectedProductForHistory.name && 
                      getNepaliYear(purchase.purchaseDate) === currentYear
                    ).length
                  })()})</span>
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
                      {(() => {
                        const currentYear = getCurrentNepaliYear()
                        const productPurchases = purchases.filter(purchase => 
                          purchase.productName === selectedProductForHistory.name && 
                          getNepaliYear(purchase.purchaseDate) === currentYear
                        ).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                        
                        return productPurchases.length > 0 ? (
                          productPurchases.map((purchase) => (
                            <TableRow key={purchase.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(purchase.purchaseDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <span 
                                  className="cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                  onClick={() => handleSupplierClick(purchase.supplier)}
                                >
                                  {purchase.supplier}
                                </span>
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
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No purchase transactions found for this product in {currentYear}
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
              onClick={() => setIsTransactionHistoryOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsTransactionHistoryOpen(false)
                handleView(selectedProductForHistory)
              }}
              className="px-6 py-2"
            >
              View Product Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Transaction History Dialog */}
      <Dialog open={isCategoryHistoryOpen} onOpenChange={setIsCategoryHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span>Category Transaction History</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Sales and purchases for <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedCategoryForHistory}</span> category in {new Date().getFullYear()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategoryForHistory && (
            <div className="space-y-6">
              {/* Category Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Category Summary</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Category Name</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{selectedCategoryForHistory}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Products</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {products.filter(p => p.category === selectedCategoryForHistory).length} products
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Stock</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                      {products.filter(p => p.category === selectedCategoryForHistory).reduce((sum, p) => sum + p.stockQuantity, 0)} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Value</Label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg text-purple-600 dark:text-purple-400">
                      Rs {products.filter(p => p.category === selectedCategoryForHistory).reduce((sum, p) => sum + (p.stockQuantity * p.unitPrice), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Statistics */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Year {new Date().getFullYear()} Statistics</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {(() => {
                    const currentYear = getCurrentNepaliYear()
                    const categoryProducts = products.filter(p => p.category === selectedCategoryForHistory)
                    const categoryProductNames = categoryProducts.map(p => p.name)
                    
                    const categorySales = sales.filter(sale => 
                      categoryProductNames.includes(sale.productName) && 
                      getNepaliYear(sale.saleDate) === currentYear
                    )
                    const categoryPurchases = purchases.filter(purchase => 
                      categoryProductNames.includes(purchase.productName) && 
                      getNepaliYear(purchase.purchaseDate) === currentYear
                    )
                    
                    const totalSalesQuantity = categorySales.reduce((sum, sale) => sum + sale.quantitySold, 0)
                    const totalSalesValue = categorySales.reduce((sum, sale) => sum + (sale.quantitySold * sale.salePrice), 0)
                    const totalPurchaseQuantity = categoryPurchases.reduce((sum, purchase) => sum + purchase.quantityPurchased, 0)
                    const totalPurchaseValue = categoryPurchases.reduce((sum, purchase) => sum + (purchase.quantityPurchased * purchase.purchasePrice), 0)
                    
                    return (
                      <>
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
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Products in Category */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Products in {selectedCategoryForHistory} ({products.filter(p => p.category === selectedCategoryForHistory).length})</span>
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product Name</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Stock</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total Value</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.filter(p => p.category === selectedCategoryForHistory).map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {product.name}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {product.stockQuantity} units
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            Rs {product.unitPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-semibold text-purple-600 dark:text-purple-400">
                            Rs {(product.stockQuantity * product.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={`px-2 py-1 text-xs font-medium ${
                                product.stockQuantity > ((product as any).lowStockThreshold ?? 5) ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {product.stockQuantity > ((product as any).lowStockThreshold ?? 5) ? 'In Stock' : 'Low Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Category Sales Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sales Transactions ({(() => {
                    const currentYear = getCurrentNepaliYear()
                    const categoryProducts = products.filter(p => p.category === selectedCategoryForHistory)
                    const categoryProductNames = categoryProducts.map(p => p.name)
                    return sales.filter(sale => 
                      categoryProductNames.includes(sale.productName) && 
                      getNepaliYear(sale.saleDate) === currentYear
                    ).length
                  })()})</span>
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quantity</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const currentYear = getCurrentNepaliYear()
                        const categoryProducts = products.filter(p => p.category === selectedCategoryForHistory)
                        const categoryProductNames = categoryProducts.map(p => p.name)
                        const categorySales = sales.filter(sale => 
                          categoryProductNames.includes(sale.productName) && 
                          getNepaliYear(sale.saleDate) === currentYear
                        ).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                        
                        return categorySales.length > 0 ? (
                          categorySales.map((sale) => (
                            <TableRow key={sale.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(sale.saleDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {sale.productName}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <span 
                                  className="cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                  onClick={() => handleClientClick(sale.client)}
                                >
                                  {sale.client}
                                </span>
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
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No sales transactions found for this category in {currentYear}
                            </TableCell>
                          </TableRow>
                        )
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Category Purchase Transactions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Purchase Transactions ({(() => {
                    const currentYear = getCurrentNepaliYear()
                    const categoryProducts = products.filter(p => p.category === selectedCategoryForHistory)
                    const categoryProductNames = categoryProducts.map(p => p.name)
                    return purchases.filter(purchase => 
                      categoryProductNames.includes(purchase.productName) && 
                      getNepaliYear(purchase.purchaseDate) === currentYear
                    ).length
                  })()})</span>
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Supplier</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quantity</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Unit Price</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const currentYear = getCurrentNepaliYear()
                        const categoryProducts = products.filter(p => p.category === selectedCategoryForHistory)
                        const categoryProductNames = categoryProducts.map(p => p.name)
                        const categoryPurchases = purchases.filter(purchase => 
                          categoryProductNames.includes(purchase.productName) && 
                          getNepaliYear(purchase.purchaseDate) === currentYear
                        ).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                        
                        return categoryPurchases.length > 0 ? (
                          categoryPurchases.map((purchase) => (
                            <TableRow key={purchase.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <TableCell className="text-gray-700 dark:text-gray-300">
                                {formatNepaliDateForTable(purchase.purchaseDate)}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                {purchase.productName}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                <span 
                                  className="cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                  onClick={() => handleSupplierClick(purchase.supplier)}
                                >
                                  {purchase.supplier}
                                </span>
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
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No purchase transactions found for this category in {currentYear}
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
              onClick={() => setIsCategoryHistoryOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplier Transaction History Dialog */}
      <Dialog open={isSupplierHistoryOpen} onOpenChange={setIsSupplierHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
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
              All transactions with <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedSupplierForHistory}</span> in {new Date().getFullYear()}
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
              onClick={() => setIsSupplierHistoryOpen(false)}
              className="px-6 py-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Transaction History Dialog */}
      <Dialog open={isClientHistoryOpen} onOpenChange={setIsClientHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 sm:p-6">
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
              All transactions with <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedClientForHistory}</span> in {new Date().getFullYear()}
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
              onClick={() => setIsClientHistoryOpen(false)}
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
