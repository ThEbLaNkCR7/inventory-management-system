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

export default function SalesPage() {
  const { user } = useAuth()
  const { products, sales, clients, addSale, updateSale, deleteSale } = useInventory()
  const { submitChange } = useApproval()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<any>(null)
  const [formData, setFormData] = useState({
    productId: "",
    client: "",
    quantitySold: 0,
    salePrice: 0,
    saleDate: new Date().toISOString().split("T")[0],
  })
  const [editReason, setEditReason] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const filteredSales = sales.filter(
    (sale) =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      productId: "",
      client: "",
      quantitySold: 0,
      salePrice: 0,
      saleDate: new Date().toISOString().split("T")[0],
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
    if (product && product.stockQuantity >= formData.quantitySold) {
      if (user?.role === "admin") {
        addSale({
          ...formData,
          productName: product.name,
        })
        showAlert("Sale recorded successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "sale",
          action: "create",
          proposedData: {
            ...formData,
            productName: product.name,
          },
          requestedBy: user?.email || "",
          reason: editReason || "New sale record",
        })
        showAlert("Sale submitted for admin approval. You'll be notified once it's reviewed.")
      }
      resetForm()
      setIsAddDialogOpen(false)
    } else {
      alert("Insufficient stock for this sale")
    }
  }

  const handleEdit = (sale: any) => {
    setEditingSale(sale)
    const product = products.find((p) => p.name === sale.productName)
    setFormData({
      productId: product?.id || "",
      client: sale.client,
      quantitySold: sale.quantitySold,
      salePrice: sale.salePrice,
      saleDate: sale.saleDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const product = products.find((p) => p.id === formData.productId)
    if (product && editingSale && editReason.trim()) {
      if (user?.role === "admin") {
        // Admin can edit directly
        updateSale(editingSale.id, {
          ...formData,
          productName: product.name,
        })
        showAlert("Sale updated successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "sale",
          action: "update",
          entityId: editingSale.id,
          originalData: {
            productName: editingSale.productName,
            client: editingSale.client,
            quantitySold: editingSale.quantitySold,
            salePrice: editingSale.salePrice,
            saleDate: editingSale.saleDate,
          },
          proposedData: {
            ...formData,
            productName: product.name,
          },
          requestedBy: user?.email || "",
          reason: editReason,
        })
        showAlert("Sale changes submitted for admin approval. You'll be notified once it's reviewed.")
      }
      resetForm()
      setIsEditDialogOpen(false)
      setEditingSale(null)
    } else if (!editReason.trim()) {
      alert("Please provide a reason for the changes")
    }
  }

  const handleDelete = (sale: any) => {
    const reason = prompt("Please provide a reason for deleting this sale:")
    if (reason && reason.trim()) {
      if (user?.role === "admin") {
        // Admin can delete directly
        deleteSale(sale.id)
        showAlert("Sale deleted successfully!")
      } else {
        // Submit for approval
        submitChange({
          type: "sale",
          action: "delete",
          entityId: sale.id,
          originalData: {
            productName: sale.productName,
            client: sale.client,
            quantitySold: sale.quantitySold,
            salePrice: sale.salePrice,
            saleDate: sale.saleDate,
          },
          proposedData: {},
          requestedBy: user?.email || "",
          reason: reason,
        })
        showAlert("Sale deletion submitted for admin approval. You'll be notified once it's reviewed.")
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
                  <Select
                    value={formData.client}
                    onValueChange={(value) => setFormData({ ...formData, client: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.company}>
                          {client.company}
                        </SelectItem>
                      ))}
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
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Changes {user?.role !== "admin" && "*"}</Label>
                  <Textarea
                    id="reason"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Explain why you're making these changes..."
                    rows={3}
                    required={user?.role !== "admin"}
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

      {/* Sales Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Sales Transactions ({filteredSales.length})</CardTitle>
          <CardDescription>Track all sales transactions and revenue</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableRow key={sale.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{sale.productName}</TableCell>
                    <TableCell>{sale.client}</TableCell>
                    <TableCell>{sale.quantitySold}</TableCell>
                    <TableCell>Rs {sale.salePrice.toFixed(2)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      Rs {(sale.quantitySold * sale.salePrice).toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(sale.saleDate).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
              <div className="text-center py-8">
                <p className="text-gray-500">No sales found</p>
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
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.company}>
                      {client.company}
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
              <Button type="submit">{user?.role === "admin" ? "Update Sale" : "Submit Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
