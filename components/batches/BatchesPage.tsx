"use client"

import type React from "react"

import { useState } from "react"
import { useBatch } from "@/contexts/BatchContext"
import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Package, Truck, Calendar, DollarSign, Trash2 } from "lucide-react"
import type { BatchItem, Batch } from "@/contexts/BatchContext"
import { formatNepaliDateForTable } from '../../lib/nepaliDateUtils'
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

export default function BatchesPage() {
  const { user } = useAuth()
  const { batches, addBatch, updateBatchStatus } = useBatch()
  const { products, suppliers } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [formData, setFormData] = useState({
    batchNumber: "",
    supplier: "",
    arrivalDate: new Date().toISOString().split("T")[0],
    status: "pending" as const,
  })
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const updateProgress = (step: string, current: number, total: number) => {
    setCurrentStep(step)
    setProgress((current / total) * 100)
  }

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      batchNumber: "",
      supplier: "",
      arrivalDate: new Date().toISOString().split("T")[0],
      status: "pending",
    })
    setBatchItems([])
  }

  const addBatchItem = () => {
    setBatchItems([
      ...batchItems,
      {
        productId: "",
        productName: "",
        quantity: 0,
        unitCost: 0,
      },
    ])
  }

  const updateBatchItem = (index: number, field: keyof BatchItem, value: any) => {
    const updatedItems = [...batchItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updatedItems[index].productName = product.name
        updatedItems[index].unitCost = product.unitPrice
      }
    }

    setBatchItems(updatedItems)
  }

  const removeBatchItem = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProgress(0)
    
    try {
      if (batchItems.length === 0) {
        toast({ title: "Error", description: "Please add at least one item to the batch.", variant: "destructive" })
        return
      }

      updateProgress("Validating batch data...", 1, 4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const totalItems = batchItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalValue = batchItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

      const batchData = {
        ...formData,
        items: batchItems,  
        totalItems,
        totalValue,
      }

      updateProgress("Processing batch data...", 2, 4)
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingBatch) {
        updateProgress("Updating batch in database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addBatch(batchData)
        setEditingBatch(null)
      } else {
        updateProgress("Adding batch to database...", 3, 4)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        addBatch(batchData)
      }
      
      updateProgress("Operation completed!", 4, 4)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      toast({ title: "Success", description: editingBatch ? "Batch updated successfully!" : "Batch added successfully!" })
      resetForm()
      setIsAddDialogOpen(false)
      setShowSuccessAlert(true)
      setAlertMessage(editingBatch ? "Batch updated successfully!" : "Batch added successfully!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save batch."
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "received":
        return "bg-green-100 text-green-800"
      case "processed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
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

      <div className="relative">
        <div className="space-y-2">
          <h1 className="section-title">
            Batches
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Track and manage product batches and lot numbers</p>
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
                Add Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>Add multiple items to a new inventory batch</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      placeholder="BATCH-2024-XXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.company}>
                            {supplier.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate">Arrival Date</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Batch Items</h3>
                    <Button type="button" onClick={addBatchItem} variant="neutralOutline" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {batchItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateBatchItem(index, "productId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateBatchItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Cost (Rs)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateBatchItem(index, "unitCost", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date (Optional)</Label>
                        <Input
                          type="date"
                          value={item.expiryDate || ""}
                          onChange={(e) => updateBatchItem(index, "expiryDate", e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={() => removeBatchItem(index)} variant="neutralOutline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {batchItems.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No items added yet. Click "Add Item" to start.</p>
                    </div>
                  )}
                </div>

                {batchItems.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Batch Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Items:</span>{" "}
                        <span className="font-medium">{batchItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Value:</span>{" "}
                        <span className="font-medium">
                          Rs {batchItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="neutralOutline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Batch</Button>
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
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Truck className="h-4 w-4 mr-1" />
                    {batch.supplier}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formatNepaliDateForTable(batch.arrivalDate)}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{batch.totalItems} items</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-green-600">Rs {batch.totalValue.toLocaleString()}</span>
                </div>
                {batch.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => updateBatchStatus(batch.id, "received")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Received
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Items:</h4>
                <div className="space-y-1">
                  {batch.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs text-gray-600 flex justify-between">
                      <span>{item.productName}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                  {batch.items.length > 3 && (
                    <div className="text-xs text-gray-500">+{batch.items.length - 3} more items</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No batches found</p>
        </div>
      )}

      {showSuccessAlert && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">{alertMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
