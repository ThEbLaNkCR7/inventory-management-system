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

      {/* Enhanced Tabs for Detailed Tracking */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Expenses</TabsTrigger>
          <TabsTrigger value="clients">Client Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Existing overview content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top Suppliers by Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suppliers.slice(0, 5).map((supplier, index) => (
                    <div key={supplier.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{supplier.name}</span>
                      <span className="text-red-600 font-bold">
                        {formatCurrency(supplier.totalOutstanding)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Clients by Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clients.slice(0, 5).map((client, index) => (
                    <div key={client.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-red-600 font-bold">
                        {formatCurrency(client.totalOutstanding)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Supplier Expenses Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Supplier Expense Tracking
              </CardTitle>
              <CardDescription>
                Detailed view of all expenses and outstanding balances with suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {/* Supplier Expense Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.name}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{formatCurrency(supplier.transactions.reduce((sum, t) => sum + t.amount, 0))}</TableCell>
                        <TableCell>{formatCurrency(supplier.transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0))}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          {formatCurrency(supplier.totalOutstanding)}
                        </TableCell>
                        <TableCell>30 days</TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor("Overdue")}>
                            Overdue
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Revenue Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Revenue Tracking
              </CardTitle>
              <CardDescription>
                Detailed view of all revenue and outstanding balances from clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {/* Client Revenue Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Total Received</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.name}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{formatCurrency(client.transactions.reduce((sum, t) => sum + t.amount, 0))}</TableCell>
                        <TableCell>{formatCurrency(client.transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0))}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          {formatCurrency(client.totalOutstanding)}
                        </TableCell>
                        <TableCell>Rs 50,000</TableCell>
                        <TableCell>2024-01-10</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor("Overdue")}>
                            Overdue
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Payment Time (Suppliers)</span>
                    <span className="font-bold">15 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Payment Time (Clients)</span>
                    <span className="font-bold">25 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On-time Payment Rate</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Supplier Expenses</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(stats.purchaseStats.totalPurchases)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Client Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(stats.saleStats.totalSales)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net Cash Flow</span>
                    <span className={`font-bold ${stats.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.summary.netCashFlow)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 