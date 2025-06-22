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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Edit, Trash2, CheckCircle, AlertTriangle, Clock } from "lucide-react"

export default function PurchasesPage() {
  const { user } = useAuth()
  const { products, purchases, suppliers, addPurchase } = useInventory()
  const { submitChange } = useApproval()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<any>(null)
  const [formData, setFormData] = useState({
    productId: "",
    supplier: "",
    quantityPurchased: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
  })
  const [editReason, setEditReason] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      productId: "",
      supplier: "",
      quantityPurchased: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    })
    setEditReason("")
  }

  const showAlert = (message: string, isSuccess = true) => {
    setAlertMessage(message)
    setShowSuccessAlert(isSuccess)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const product = products.find((p) => p.id === formData.productId)
    if (product) {
      if (user?.role === "admin") {
        addPurchase({
          ...formData,
          productName: product.name,
        })
        showAlert("Purchase recorded successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "purchase",
          action: "create",
          proposedData: {
            ...formData,
            productName: product.name,
          },
          requestedBy: user?.email || "",
          reason: editReason || "New purchase record",
        })
        showAlert("Purchase submitted for admin approval. You'll be notified once it's reviewed.")
      }
      resetForm()
      setIsAddDialogOpen(false)
    }
  }

  const handleEdit = (purchase: any) => {
    setEditingPurchase(purchase)
    const product = products.find((p) => p.name === purchase.productName)
    setFormData({
      productId: product?.id || "",
      supplier: purchase.supplier,
      quantityPurchased: purchase.quantityPurchased,
      purchasePrice: purchase.purchasePrice,
      purchaseDate: purchase.purchaseDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const product = products.find((p) => p.id === formData.productId)
    if (product && editingPurchase && editReason.trim()) {
      if (user?.role === "admin") {
        // Admin can edit directly (implement direct edit logic here)
        console.log("Admin direct edit")
        showAlert("Purchase updated successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "purchase",
          action: "update",
          entityId: editingPurchase.id,
          originalData: {
            productName: editingPurchase.productName,
            supplier: editingPurchase.supplier,
            quantityPurchased: editingPurchase.quantityPurchased,
            purchasePrice: editingPurchase.purchasePrice,
            purchaseDate: editingPurchase.purchaseDate,
          },
          proposedData: {
            ...formData,
            productName: product.name,
          },
          requestedBy: user?.email || "",
          reason: editReason,
        })
        showAlert("Purchase changes submitted for admin approval. You'll be notified once it's reviewed.")
      }
      resetForm()
      setIsEditDialogOpen(false)
      setEditingPurchase(null)
    } else if (!editReason.trim()) {
      alert("Please provide a reason for the changes")
    }
  }

  const handleDelete = (purchase: any) => {
    const reason = prompt("Please provide a reason for deleting this purchase:")
    if (reason && reason.trim()) {
      if (user?.role === "admin") {
        // Admin can delete directly (implement direct delete logic here)
        console.log("Admin direct delete")
        showAlert("Purchase deleted successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "purchase",
          action: "delete",
          entityId: purchase.id,
          originalData: {
            productName: purchase.productName,
            supplier: purchase.supplier,
            quantityPurchased: purchase.quantityPurchased,
            purchasePrice: purchase.purchasePrice,
            purchaseDate: purchase.purchaseDate,
          },
          proposedData: {},
          requestedBy: user?.email || "",
          reason: reason,
        })
        showAlert("Purchase deletion submitted for admin approval. You'll be notified once it's reviewed.")
      }
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
        <div className="absolute top-6 right-0 flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} variant="neutral">
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </DialogTrigger>
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

      {/* Purchases Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Purchase Orders ({filteredPurchases.length})</CardTitle>
          <CardDescription>Track all purchase orders and inventory restocking</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableRow key={purchase.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{purchase.productName}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.quantityPurchased}</TableCell>
                    <TableCell>Rs {purchase.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      Rs {(purchase.quantityPurchased * purchase.purchasePrice).toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
              <div className="text-center py-8">
                <p className="text-gray-500">No purchases found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (SKU: {product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier *</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                required
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantityPurchased}
                  onChange={(e) =>
                    setFormData({ ...formData, quantityPurchased: Number.parseInt(e.target.value) || 0 })
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
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Purchase Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reason">Reason for Changes {user?.role !== "admin" && "*"}</Label>
              <Textarea
                id="edit-reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Explain why you're making these changes..."
                rows={3}
                required={user?.role !== "admin"}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="neutralOutline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{user?.role === "admin" ? "Update Purchase" : "Submit Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
