"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
import { 
  Plus, 
  Search, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  Loader2
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface PaymentStats {
  purchaseStats: {
    totalPurchases: number
    paidPurchases: number
    outstandingPurchases: number
    overduePurchases: number
  }
  saleStats: {
    totalSales: number
    paidSales: number
    outstandingSales: number
    overdueSales: number
  }
  summary: {
    totalOutstanding: number
    totalOverdue: number
    netCashFlow: number
  }
  recentPayments: any[]
  paymentMethodStats: Record<string, number>
  overdueTransactions: any[]
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
    transactionId: "",
    transactionType: "Sale",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: "",
    paidBy: ""
  })

  useEffect(() => {
    fetchPaymentStats()
  }, [])

  const fetchPaymentStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/payments/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payment statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recordedBy: user?.email || "Unknown"
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment recorded successfully!"
        })
        setIsAddPaymentDialogOpen(false)
        resetForm()
        fetchPaymentStats() // Refresh stats
      } else {
        throw new Error("Failed to record payment")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      transactionId: "",
      transactionType: "Sale",
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      referenceNumber: "",
      notes: "",
      paidBy: ""
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800"
      case "Partial": return "bg-yellow-100 text-yellow-800"
      case "Pending": return "bg-blue-100 text-blue-800"
      case "Overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "Cash": return <Banknote className="h-4 w-4" />
      case "Bank Transfer": return <CreditCard className="h-4 w-4" />
      case "Check": return <Receipt className="h-4 w-4" />
      case "Credit Card": return <CreditCard className="h-4 w-4" />
      case "Digital Payment": return <CreditCard className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load payment statistics. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking</h1>
          <p className="text-muted-foreground">
            Monitor outstanding payments and cash flow
          </p>
        </div>
        <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for a purchase or sale transaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select
                    value={formData.transactionType}
                    onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Sale">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Digital Payment">Digital Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  placeholder="Enter transaction ID"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="paidBy">Paid By</Label>
                <Input
                  id="paidBy"
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  placeholder="Name of person/company who made payment"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="Check number, transaction ID, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the payment"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.summary.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.purchaseStats.outstandingPurchases)} purchases + {formatCurrency(stats.saleStats.outstandingSales)} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.summary.totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.summary.netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.saleStats.paidSales)} received - {formatCurrency(stats.purchaseStats.paidPurchases)} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 10 payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="recent">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Purchase Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Purchases:</span>
                    <span className="font-medium">{formatCurrency(stats.purchaseStats.totalPurchases)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>
                    <span className="font-medium text-green-600">{formatCurrency(stats.purchaseStats.paidPurchases)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding:</span>
                    <span className="font-medium text-red-600">{formatCurrency(stats.purchaseStats.outstandingPurchases)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(stats.purchaseStats.overduePurchases)}</span>
                  </div>
                </div>
                <Progress 
                  value={(stats.purchaseStats.paidPurchases / stats.purchaseStats.totalPurchases) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {((stats.purchaseStats.paidPurchases / stats.purchaseStats.totalPurchases) * 100).toFixed(1)}% paid
                </p>
              </CardContent>
            </Card>

            {/* Sale Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Sale Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">{formatCurrency(stats.saleStats.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Amount:</span>
                    <span className="font-medium text-green-600">{formatCurrency(stats.saleStats.paidSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding:</span>
                    <span className="font-medium text-red-600">{formatCurrency(stats.saleStats.outstandingSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(stats.saleStats.overdueSales)}</span>
                  </div>
                </div>
                <Progress 
                  value={(stats.saleStats.paidSales / stats.saleStats.totalSales) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {((stats.saleStats.paidSales / stats.saleStats.totalSales) * 100).toFixed(1)}% paid
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Overdue Transactions
              </CardTitle>
              <CardDescription>
                Transactions with payments past due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.overdueTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No overdue transactions</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.overdueTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge variant={transaction.type === "Purchase" ? "destructive" : "default"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.type === "Purchase" ? transaction.supplier : transaction.client}</TableCell>
                        <TableCell>{transaction.productName}</TableCell>
                        <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                        <TableCell>{formatCurrency(transaction.paidAmount)}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(transaction.outstanding)}
                        </TableCell>
                        <TableCell>
                          {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Recent Payments
              </CardTitle>
              <CardDescription>
                Latest payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent payments</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Paid By</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.transactionType === "Purchase" ? "destructive" : "default"}>
                            {payment.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.paidBy}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            {payment.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell>{payment.referenceNumber || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 