"use client"

import type React from "react"

import { useState } from "react"
import { useApproval } from "@/contexts/ApprovalContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  Minus,
  Plus,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react"

export default function ApprovalsPage() {
  const { user } = useAuth()
  const { pendingChanges, approveChange, rejectChange, getPendingChanges, getChangeHistory } = useApproval()
  const [selectedChange, setSelectedChange] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)

  const pendingList = getPendingChanges()
  const historyList = getChangeHistory()

  // Separate pending changes by type
  const pendingProducts = pendingList.filter((change) => change.type === "product")
  const pendingSales = pendingList.filter((change) => change.type === "sale")
  const pendingPurchases = pendingList.filter((change) => change.type === "purchase")

  const handleApprove = () => {
    if (selectedChange) {
      approveChange(selectedChange.id, reviewNotes)
      setIsReviewDialogOpen(false)
      setReviewNotes("")
      setSelectedChange(null)
    }
  }

  const handleReject = () => {
    if (selectedChange) {
      rejectChange(selectedChange.id, reviewNotes)
      setIsReviewDialogOpen(false)
      setReviewNotes("")
      setSelectedChange(null)
    }
  }

  const openReviewDialog = (change: any) => {
    setSelectedChange(change)
    setIsReviewDialogOpen(true)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "delete":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />
      case "sale":
        return <ShoppingCart className="h-4 w-4" />
      case "purchase":
        return <Users className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4" />
      case "update":
        return <FileText className="h-4 w-4" />
      case "delete":
        return <Minus className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost")) {
      return `Rs ${Number(value).toFixed(2)}`
    }
    if (key.toLowerCase().includes("date")) {
      return new Date(value).toLocaleDateString("en-IN")
    }
    return String(value)
  }

  const getFieldDisplayName = (key: string) => {
    const fieldNames: { [key: string]: string } = {
      productName: "Product Name",
      productId: "Product ID",
      quantitySold: "Quantity Sold",
      quantityPurchased: "Quantity Purchased",
      salePrice: "Sale Price",
      purchasePrice: "Purchase Price",
      saleDate: "Sale Date",
      purchaseDate: "Purchase Date",
      client: "Client",
      supplier: "Supplier",
      stockQuantity: "Stock Quantity",
      unitPrice: "Unit Price",
      category: "Category",
      description: "Description",
      sku: "SKU",
    }
    return fieldNames[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  const renderDataComparison = (originalData: any, proposedData: any, action: string) => {
    if (action === "create") {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Plus className="h-5 w-5 text-emerald-600" />
              <Label className="text-lg font-semibold text-emerald-800">New Record Details</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(proposedData).map(([key, value]) => (
                <div key={key} className="bg-white rounded-md p-3 border border-emerald-200">
                  <div className="text-sm font-medium text-emerald-700">{getFieldDisplayName(key)}</div>
                  <div className="text-emerald-900 font-semibold">{formatValue(key, value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (action === "delete") {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <Label className="text-lg font-semibold text-red-800">Record to be Deleted</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(originalData).map(([key, value]) => (
                <div key={key} className="bg-white rounded-md p-3 border border-red-200">
                  <div className="text-sm font-medium text-red-700">{getFieldDisplayName(key)}</div>
                  <div className="text-red-900 font-semibold">{formatValue(key, value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Update action - show comparison
    const changedFields = Object.keys(proposedData).filter((key) => originalData[key] !== proposedData[key])

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Data */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Minus className="h-5 w-5 text-red-600" />
              <Label className="text-lg font-semibold text-red-800">Current Data</Label>
            </div>
            <div className="space-y-3">
              {Object.entries(originalData).map(([key, value]) => (
                <div
                  key={key}
                  className={`bg-white rounded-md p-3 border ${
                    changedFields.includes(key) ? "border-red-300 bg-red-50" : "border-red-200"
                  }`}
                >
                  <div className="text-sm font-medium text-red-700">{getFieldDisplayName(key)}</div>
                  <div className="text-red-900 font-semibold">{formatValue(key, value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Data */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Plus className="h-5 w-5 text-green-600" />
              <Label className="text-lg font-semibold text-green-800">Proposed Changes</Label>
            </div>
            <div className="space-y-3">
              {Object.entries(proposedData).map(([key, value]) => (
                <div
                  key={key}
                  className={`bg-white rounded-md p-3 border ${
                    changedFields.includes(key) ? "border-green-300 bg-green-50" : "border-green-200"
                  }`}
                >
                  <div className="text-sm font-medium text-green-700">{getFieldDisplayName(key)}</div>
                  <div className="text-green-900 font-semibold">{formatValue(key, value)}</div>
                  {changedFields.includes(key) && (
                    <div className="flex items-center mt-1 text-xs text-green-600">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Changed from: {formatValue(key, originalData[key])}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary of Changes */}
        {changedFields.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold text-blue-800">Summary of Changes</Label>
            </div>
            <div className="text-sm text-blue-700">
              {changedFields.length} field{changedFields.length > 1 ? "s" : ""} will be updated:{" "}
              <span className="font-medium">{changedFields.map(getFieldDisplayName).join(", ")}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderApprovalSection = (title: string, changes: any[], icon: React.ReactNode, color: string) => (
    <Card className="mb-6">
      <CardHeader className={`${color} text-white`}>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>
            {title} ({changes.length})
          </span>
        </CardTitle>
        <CardDescription className="text-white/80">Review and approve {title.toLowerCase()} changes</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {changes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change) => (
                  <TableRow key={change.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(change.action)}
                        <Badge className={`${getActionColor(change.action)} border`}>{change.action}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{change.requestedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{formatDate(change.requestedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate" title={change.reason}>
                          {change.reason || "No reason provided"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewDialog(change)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <p className="text-gray-500">No pending {title.toLowerCase()} approvals</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Management</h1>
          <p className="text-gray-600">Review and approve user-submitted changes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">{pendingList.length} Total Pending</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending Approvals ({pendingList.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>History ({historyList.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Products Section */}
          {renderApprovalSection("Product Changes", pendingProducts, <Package className="h-5 w-5" />, "bg-blue-600")}

          {/* Sales Section */}
          {renderApprovalSection("Sales Changes", pendingSales, <ShoppingCart className="h-5 w-5" />, "bg-green-600")}

          {/* Purchases Section */}
          {renderApprovalSection("Purchase Changes", pendingPurchases, <Users className="h-5 w-5" />, "bg-purple-600")}

          {pendingList.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">No pending approvals at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>Previously reviewed changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Review Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyList.map((change) => (
                      <TableRow key={change.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(change.type)}
                            <Badge variant="outline" className="capitalize">
                              {change.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionIcon(change.action)}
                            <Badge className={getActionColor(change.action)}>{change.action}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{change.requestedBy}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(change.status)}>{change.status}</Badge>
                        </TableCell>
                        <TableCell>{change.reviewedBy || "N/A"}</TableCell>
                        <TableCell>{change.reviewedAt ? formatDate(change.reviewedAt) : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {historyList.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No approval history</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-2 text-xl">
              {selectedChange && getTypeIcon(selectedChange.type)}
              <span>Review Change Request</span>
            </DialogTitle>
            <DialogDescription>
              Carefully review the proposed changes and provide your decision with optional notes
            </DialogDescription>
          </DialogHeader>

          {selectedChange && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</Label>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        {getTypeIcon(selectedChange.type)}
                        <Badge className="capitalize bg-slate-100 text-slate-800 border-slate-300">
                          {selectedChange.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Action</Label>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        {getActionIcon(selectedChange.action)}
                        <Badge className={`${getActionColor(selectedChange.action)} border`}>
                          {selectedChange.action}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Requested By
                      </Label>
                      <p className="font-medium text-slate-900 mt-1">{selectedChange.requestedBy}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</Label>
                      <p className="font-medium text-slate-900 mt-1 text-sm">
                        {formatDate(selectedChange.requestedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {selectedChange.reason && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <Label className="text-sm font-semibold text-amber-800">Reason for Request</Label>
                    </div>
                    <p className="text-amber-900 bg-white rounded-md p-3 border border-amber-200">
                      {selectedChange.reason}
                    </p>
                  </div>
                )}

                {/* Data Comparison */}
                <div>
                  <Label className="text-lg font-semibold text-gray-900 mb-4 block">Data Review</Label>
                  {renderDataComparison(
                    selectedChange.originalData,
                    selectedChange.proposedData,
                    selectedChange.action,
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          <Separator className="my-4" />

          {/* Review Notes */}
          <div className="space-y-3">
            <Label htmlFor="reviewNotes" className="text-sm font-semibold">
              Review Notes (Optional)
            </Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about your decision, feedback, or instructions..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} className="px-6">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} className="px-6 bg-red-600 hover:bg-red-700">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} className="px-6 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
