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
  X,
  Check,
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
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
      case "update":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
      case "delete":
        return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700"
      case "approved":
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-700"
      case "rejected":
        return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-700"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700"
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
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 dark:bg-slate-900/20 dark:border-slate-700">
            <div className="flex items-center space-x-2 mb-3">
              <Plus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">New Record Details</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(proposedData).map(([key, value]) => (
                <div key={key} className="bg-white dark:bg-slate-800 rounded-md p-3 border border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{getFieldDisplayName(key)}</div>
                  <div className="text-slate-900 dark:text-slate-100 font-semibold">{formatValue(key, value)}</div>
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
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 dark:bg-zinc-900/20 dark:border-zinc-700">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <Label className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Record to be Deleted</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(originalData).map(([key, value]) => (
                <div key={key} className="bg-white dark:bg-zinc-800 rounded-md p-3 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{getFieldDisplayName(key)}</div>
                  <div className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatValue(key, value)}</div>
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
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 dark:bg-zinc-900/20 dark:border-zinc-700">
            <div className="flex items-center space-x-2 mb-3">
              <Minus className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <Label className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Current Data</Label>
            </div>
            <div className="space-y-3">
              {Object.entries(originalData).map(([key, value]) => (
                <div
                  key={key}
                  className={`bg-white dark:bg-zinc-800 rounded-md p-3 border ${
                    changedFields.includes(key) ? "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/40" : "border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{getFieldDisplayName(key)}</div>
                  <div className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatValue(key, value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Data */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 dark:bg-slate-900/20 dark:border-slate-700">
            <div className="flex items-center space-x-2 mb-3">
              <Plus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <Label className="text-lg font-semibold text-slate-800 dark:text-slate-200">Proposed Changes</Label>
            </div>
            <div className="space-y-3">
              {Object.entries(proposedData).map(([key, value]) => (
                <div
                  key={key}
                  className={`bg-white dark:bg-slate-800 rounded-md p-3 border ${
                    changedFields.includes(key) ? "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40" : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{getFieldDisplayName(key)}</div>
                  <div className="text-slate-900 dark:text-slate-100 font-semibold">{formatValue(key, value)}</div>
                  {changedFields.includes(key) && (
                    <div className="flex items-center mt-1 text-xs text-slate-600 dark:text-slate-400">
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900/20 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Summary of Changes</Label>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {changedFields.length} field{changedFields.length > 1 ? "s" : ""} will be updated:{" "}
              {changedFields.map((field) => getFieldDisplayName(field)).join(", ")}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderApprovalSection = (title: string, changes: any[], icon: React.ReactNode, color: string) => (
    <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className={`${color} text-white`}>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
          <Badge variant="secondary" className="ml-2">
            {changes.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-white/80">Review and approve {title.toLowerCase()} changes</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {changes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No {title.toLowerCase()} changes pending approval</p>
          </div>
        ) : (
          <div className="divide-y">
            {changes.map((change, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getActionColor(change.action)}`}>
                      {getActionIcon(change.action)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {change.action.charAt(0).toUpperCase() + change.action.slice(1)} {change.type}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested by {change.requestedBy} on {formatDate(change.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(change.status)}>{change.status}</Badge>
                </div>

                {renderDataComparison(change.originalData, change.proposedData, change.action)}

                {change.status === "pending" && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <Button onClick={() => {
                      setSelectedChange(change)
                      handleReject()
                    }} variant="neutralOutline" size="sm">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button onClick={() => {
                      setSelectedChange(change)
                      handleApprove()
                    }} variant="neutral" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to view this page.</p>
      </div>
    )
  }

  if (pendingChanges.length === 0) {
    return (
      <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <div className="relative">
          <div className="space-y-2">
            <h1 className="section-title">
              Approvals
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Review and approve system changes</p>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 dark:text-gray-400">No pending approvals at the moment.</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
            <CardDescription>Previously reviewed changes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No approval history available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="space-y-2">
        <h1 className="section-title">
          Approval Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Review and manage pending approval requests</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{pendingList.length} Total Pending</span>
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
          {renderApprovalSection("Product Changes", pendingProducts, <Package className="h-5 w-5" />, "bg-slate-600")}

          {/* Sales Section */}
          {renderApprovalSection("Sales Changes", pendingSales, <ShoppingCart className="h-5 w-5" />, "bg-gray-600")}

          {/* Purchases Section */}
          {renderApprovalSection("Purchase Changes", pendingPurchases, <Users className="h-5 w-5" />, "bg-zinc-600")}

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
            <Button variant="neutralOutline" onClick={() => setIsReviewDialogOpen(false)} className="px-6">
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
