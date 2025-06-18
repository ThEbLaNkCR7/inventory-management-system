"use client"

import type React from "react"
import { Package } from "lucide-react"

import { useState } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { useApproval } from "@/contexts/ApprovalContext"
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
import { Plus, Search, Edit, Trash2, AlertTriangle, Clock, Download, FileSpreadsheet, FileText } from "lucide-react"
import { exportToCSV, exportToExcel } from "@/utils/exportUtils"

export default function ProductsPage() {
  const { user } = useAuth()
  const { products, addProduct, updateProduct, deleteProduct } = useInventory()
  const { submitChange } = useApproval()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: "create" | "update" | "delete"
    data: any
    productId?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    stockQuantity: 0,
    unitPrice: 0,
    supplier: "",
    stockType: "new" as "new" | "old",
  })
  const [approvalReason, setApprovalReason] = useState("")

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      stockQuantity: 0,
      unitPrice: 0,
      supplier: "",
      stockType: "new" as "new" | "old",
    })
    setEditingProduct(null)
    setApprovalReason("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (user?.role === "admin") {
      // Admin can make changes directly
      if (editingProduct) {
        updateProduct(editingProduct.id, formData)
      } else {
        addProduct(formData)
      }
      resetForm()
      setIsAddDialogOpen(false)
    } else {
      // Regular users need approval
      setPendingAction({
        type: editingProduct ? "update" : "create",
        data: formData,
        productId: editingProduct?.id,
      })
      setShowApprovalDialog(true)
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
    setShowApprovalDialog(false)
    setPendingAction(null)
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      stockQuantity: product.stockQuantity,
      unitPrice: product.unitPrice,
      supplier: product.supplier,
      stockType: product.stockType || "new",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (product: any) => {
    if (user?.role === "admin") {
      if (confirm("Are you sure you want to delete this product?")) {
        deleteProduct(product.id)
      }
    } else {
      // Regular users submit delete request for approval
      submitChange({
        type: "product",
        action: "delete",
        entityId: product.id,
        originalData: product,
        proposedData: { deleted: true },
        requestedBy: user?.email || "",
        reason: `Request to delete product: ${product.name}`,
      })
    }
  }

  const handleExport = (format: "csv" | "excel") => {
    const exportData = filteredProducts.map((p) => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Stock: p.stockQuantity,
      "Price (Rs)": p.unitPrice,
      Supplier: p.supplier,
      "Last Updated": new Date(p.createdAt).toLocaleDateString(),
    }))

    if (format === "csv") {
      exportToCSV(exportData, "products")
    } else {
      exportToExcel(exportData, "products")
    }
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your product inventory with ease</p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                className="dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  {editingProduct ? "Update product information" : "Enter product details to add to inventory"}
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
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      SKU
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Supplier
                    </Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockType" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Stock Type
                  </Label>
                  <Select
                    value={formData.stockType}
                    onValueChange={(value: "new" | "old") => setFormData({ ...formData, stockType: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
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
                        setFormData({ ...formData, stockQuantity: Number.parseInt(e.target.value) || 0 })
                      }
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
                      onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })}
                      className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {user?.role === "admin" ? (editingProduct ? "Update" : "Add") : "Submit for Approval"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Approval Reason Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Submit for Approval
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Please provide a reason for this change request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Reason for Change
              </Label>
              <Textarea
                id="reason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Explain why this change is needed..."
                className="border-2 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button onClick={submitForApproval} disabled={!approvalReason.trim()}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 border-2 focus:border-blue-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 border-2 focus:border-blue-500 h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
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
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Products ({filteredProducts.length})</CardTitle>
          <CardDescription className="text-blue-100">Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">SKU</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Stock</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Price (Rs)</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Supplier</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Last Updated</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm bg-gray-50 dark:bg-gray-700 rounded px-2 py-1 dark:text-gray-300">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium"
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {product.stockQuantity <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        <span
                          className={`font-semibold ${product.stockQuantity <= 5 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
                        >
                          {product.stockQuantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      Rs {product.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{product.supplier}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product)}
                          className="hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-600 text-red-600 dark:text-red-400 transition-colors dark:bg-gray-700 dark:border-gray-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProducts.length === 0 && (
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
    </div>
  )
}
