"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
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
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchPaymentStats()
  }, [])

  const fetchPaymentStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/payments?stats=true")
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

  // Get unique suppliers and clients from overdue transactions
  const suppliers = [...new Set(stats.overdueTransactions
    .filter(t => t.type === "Purchase")
    .map(t => t.supplier))]
    .map(supplier => ({
      name: supplier,
      transactions: stats.overdueTransactions.filter(t => t.type === "Purchase" && t.supplier === supplier),
      totalOutstanding: stats.overdueTransactions
        .filter(t => t.type === "Purchase" && t.supplier === supplier)
        .reduce((sum, t) => sum + t.outstanding, 0)
    }))

  const clients = [...new Set(stats.overdueTransactions
    .filter(t => t.type === "Sale")
    .map(t => t.client))]
    .map(client => ({
      name: client,
      transactions: stats.overdueTransactions.filter(t => t.type === "Sale" && t.client === client),
      totalOutstanding: stats.overdueTransactions
        .filter(t => t.type === "Sale" && t.client === client)
        .reduce((sum, t) => sum + t.outstanding, 0)
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking</h1>
          <p className="text-muted-foreground">
            Monitor outstanding payments by suppliers and clients
          </p>
        </div>
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
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
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

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                Suppliers with Outstanding Payments
              </CardTitle>
              <CardDescription>
                Suppliers who have overdue or outstanding payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No suppliers with outstanding payments</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Outstanding Amount</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.name}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(supplier.totalOutstanding)}
                        </TableCell>
                        <TableCell>{supplier.transactions.length}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Clients with Outstanding Payments
              </CardTitle>
              <CardDescription>
                Clients who have overdue or outstanding payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No clients with outstanding payments</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Outstanding Amount</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.name}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(client.totalOutstanding)}
                        </TableCell>
                        <TableCell>{client.transactions.length}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Overdue
                          </Badge>
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
                        <TableCell>{payment.paymentMethod}</TableCell>
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