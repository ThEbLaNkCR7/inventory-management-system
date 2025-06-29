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
  Loader2,
  Plus,
  BookOpen,
  Calculator
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
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

interface Payment {
  _id: string
  transactionId: string
  transactionType: "Purchase" | "Sale" | "Expense" | "Income"
  entityName: string
  entityModel: "Supplier" | "Client"
  debitAccount: string
  creditAccount: string
  debitAmount: number
  creditAmount: number
  amount: number
  paymentDate: string
  paymentMethod: string
  description: string
  referenceNumber?: string
  invoiceNumber?: string
  notes?: string
  paidBy: string
  recordedBy: string
  status: string
}

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  taxId: string
  creditLimit: number
  currentBalance: number
  totalSpent: number
  orders: number
  lastOrder: string
  paymentTerms: string
  notes: string
  isActive: boolean
}

interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  address: string
  orders: number
  totalSpent: number
  lastOrder: string
  creditLimit: number
  paymentTerms: string
  notes: string
  taxId?: string
  isActive: boolean
}

interface ClientSummary {
  name: string
  transactions: Payment[]
  totalOutstanding: number
}

interface SupplierSummary {
  name: string
  transactions: Payment[]
  totalOutstanding: number
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [clientList, setClientList] = useState<Client[]>([])
  const [supplierList, setSupplierList] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddEntityDialogOpen, setIsAddEntityDialogOpen] = useState(false)
  const [isEditEntityDialogOpen, setIsEditEntityDialogOpen] = useState(false)
  const [entityType, setEntityType] = useState<"Supplier" | "Client">("Supplier")
  const [editingEntity, setEditingEntity] = useState<any>(null)
  const [formData, setFormData] = useState({
    transactionType: "Purchase",
    entityName: "",
    entityModel: "Supplier",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    description: "",
    referenceNumber: "",
    invoiceNumber: "",
    notes: "",
    paidBy: "",
  })
  const [entityFormData, setEntityFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    taxId: "",
    creditLimit: 0,
    paymentTerms: "30 days",
    notes: "",
  })

  useEffect(() => {
    fetchPaymentStats()
    fetchPayments()
    fetchEntities()
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

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      })
    }
  }

  const fetchEntities = async () => {
    try {
      const [clientsRes, suppliersRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/suppliers")
      ])
      
      const clientsData = await clientsRes.json()
      const suppliersData = await suppliersRes.json()
      
      setClientList(clientsData.clients || [])
      setSupplierList(suppliersData.suppliers || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch entities",
        variant: "destructive"
      })
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recordedBy: user?.email || "Unknown"
        })
      })

      if (!response.ok) throw new Error("Failed to add payment")

      toast({
        title: "Success",
        description: "Payment recorded successfully"
      })

      setIsAddDialogOpen(false)
      setFormData({
        transactionType: "Purchase",
        entityName: "",
        entityModel: "Supplier",
        amount: 0,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        description: "",
        referenceNumber: "",
        invoiceNumber: "",
        notes: "",
        paidBy: "",
      })
      
      fetchPaymentStats()
      fetchPayments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      })
    }
  }

  const handleAddEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const endpoint = entityType === "Supplier" ? "/api/suppliers" : "/api/clients"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entityFormData)
      })

      if (!response.ok) throw new Error("Failed to add entity")

      toast({
        title: "Success",
        description: `${entityType} added successfully`
      })

      setIsAddEntityDialogOpen(false)
      setEntityFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        taxId: "",
        creditLimit: 0,
        paymentTerms: "30 days",
        notes: "",
      })
      
      fetchEntities()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${entityType.toLowerCase()}`,
        variant: "destructive"
      })
    }
  }

  const handleEditEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEntity) return

    try {
      const endpoint = entityType === "Supplier" ? `/api/suppliers/${editingEntity._id}` : `/api/clients/${editingEntity._id}`
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entityFormData)
      })

      if (!response.ok) throw new Error("Failed to update entity")

      toast({
        title: "Success",
        description: `${entityType} updated successfully`
      })

      setIsEditEntityDialogOpen(false)
      setEditingEntity(null)
      setEntityFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        taxId: "",
        creditLimit: 0,
        paymentTerms: "30 days",
        notes: "",
      })
      
      fetchEntities()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${entityType.toLowerCase()}`,
        variant: "destructive"
      })
    }
  }

  const handleDeleteEntity = async (entityId: string) => {
    try {
      const endpoint = entityType === "Supplier" ? `/api/suppliers/${entityId}` : `/api/clients/${entityId}`
      const response = await fetch(endpoint, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete entity")

      toast({
        title: "Success",
        description: `${entityType} deleted successfully`
      })
      
      fetchEntities()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${entityType.toLowerCase()}`,
        variant: "destructive"
      })
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
      case "Completed": return "bg-green-100 text-green-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "Cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAccountColor = (account: string) => {
    switch (account) {
      case "Cash": return "text-green-600"
      case "Bank": return "text-blue-600"
      case "Accounts Payable": return "text-red-600"
      case "Accounts Receivable": return "text-purple-600"
      case "Expenses": return "text-orange-600"
      case "Revenue": return "text-green-600"
      default: return "text-gray-600"
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

  const filteredPayments = payments.filter(payment =>
    payment.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking & Accounting</h1>
          <p className="text-muted-foreground">
            Monitor payments with full double-entry bookkeeping
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Record a payment with proper accounting entries
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Type</Label>
                  <Select 
                    value={formData.transactionType} 
                    onValueChange={(value) => setFormData({...formData, transactionType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Purchase">Purchase Payment</SelectItem>
                      <SelectItem value="Sale">Sale Receipt</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Entity Type</Label>
                  <Select 
                    value={formData.entityModel} 
                    onValueChange={(value) => setFormData({...formData, entityModel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Entity Name</Label>
                <Input
                  value={formData.entityName}
                  onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                  placeholder="Enter supplier or client name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
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
                <div>
                  <Label>Paid By</Label>
                  <Input
                    value={formData.paidBy}
                    onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
                    placeholder="Who made/received the payment"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the payment"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                    placeholder="Check number, transaction ID, etc."
                  />
                </div>
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    placeholder="Related invoice number"
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Recorded payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs for Detailed Tracking */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Expenses</TabsTrigger>
          <TabsTrigger value="clients">Client Revenue</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="entities">Manage Entities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
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
                <div className="flex gap-2">
                  <Input
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

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
                <div className="flex gap-2">
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

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

        {/* General Ledger Tab */}
        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                General Ledger
              </CardTitle>
              <CardDescription>
                Complete double-entry bookkeeping ledger with debit and credit entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Debit Account</TableHead>
                      <TableHead>Credit Account</TableHead>
                      <TableHead>Debit Amount</TableHead>
                      <TableHead>Credit Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.entityModel}: {payment.entityName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getAccountColor(payment.debitAccount)}>
                            {payment.debitAccount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getAccountColor(payment.creditAccount)}>
                            {payment.creditAccount}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-red-600">
                          {formatCurrency(payment.debitAmount)}
                        </TableCell>
                        <TableCell className="font-mono text-green-600">
                          {formatCurrency(payment.creditAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
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

        {/* Manage Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Manage Clients & Suppliers</h2>
              <p className="text-muted-foreground">
                Add, edit, and manage your clients and suppliers
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={entityType} onValueChange={(value: "Supplier" | "Client") => setEntityType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supplier">Suppliers</SelectItem>
                  <SelectItem value="Client">Clients</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddEntityDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add {entityType}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {entityType === "Supplier" ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                {entityType} List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder={`Search ${entityType.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(entityType === "Supplier" ? supplierList : clientList)
                      .filter(entity => 
                        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        entity.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((entity) => (
                        <TableRow key={entity._id}>
                          <TableCell className="font-medium">{entity.name}</TableCell>
                          <TableCell>{entity.company}</TableCell>
                          <TableCell>{entity.email}</TableCell>
                          <TableCell>{entity.phone}</TableCell>
                          <TableCell>{formatCurrency(entity.creditLimit || 0)}</TableCell>
                          <TableCell>{entity.paymentTerms || "30 days"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingEntity(entity)
                                  setEntityFormData({
                                    name: entity.name,
                                    email: entity.email,
                                    phone: entity.phone,
                                    company: entity.company,
                                    address: entity.address,
                                    taxId: entity.taxId || "",
                                    creditLimit: entity.creditLimit || 0,
                                    paymentTerms: entity.paymentTerms || "30 days",
                                    notes: entity.notes || "",
                                  })
                                  setIsEditEntityDialogOpen(true)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEntity(entity._id)}
                              >
                                Delete
                              </Button>
                            </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(payments.filter(p => p.debitAccount === 'Cash').reduce((sum, p) => sum + p.debitAmount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Cash Balance</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(payments.filter(p => p.debitAccount === 'Accounts Payable').reduce((sum, p) => sum + p.debitAmount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Accounts Payable</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(payments.filter(p => p.creditAccount === 'Accounts Receivable').reduce((sum, p) => sum + p.creditAmount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Accounts Receivable</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Entity Dialog */}
      <Dialog open={isAddEntityDialogOpen} onOpenChange={setIsAddEntityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New {entityType}</DialogTitle>
            <DialogDescription>
              Enter the details for the new {entityType.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEntity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={entityFormData.name}
                  onChange={(e) => setEntityFormData({...entityFormData, name: e.target.value})}
                  placeholder={`Enter ${entityType.toLowerCase()} name`}
                  required
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={entityFormData.company}
                  onChange={(e) => setEntityFormData({...entityFormData, company: e.target.value})}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={entityFormData.email}
                  onChange={(e) => setEntityFormData({...entityFormData, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={entityFormData.phone}
                  onChange={(e) => setEntityFormData({...entityFormData, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={entityFormData.address}
                onChange={(e) => setEntityFormData({...entityFormData, address: e.target.value})}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tax ID</Label>
                <Input
                  value={entityFormData.taxId}
                  onChange={(e) => setEntityFormData({...entityFormData, taxId: e.target.value})}
                  placeholder="Tax identification number"
                />
              </div>
              <div>
                <Label>Credit Limit</Label>
                <Input
                  type="number"
                  value={entityFormData.creditLimit}
                  onChange={(e) => setEntityFormData({...entityFormData, creditLimit: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Select 
                  value={entityFormData.paymentTerms} 
                  onValueChange={(value) => setEntityFormData({...entityFormData, paymentTerms: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="15 days">15 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="60 days">60 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={entityFormData.notes}
                onChange={(e) => setEntityFormData({...entityFormData, notes: e.target.value})}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddEntityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add {entityType}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Entity Dialog */}
      <Dialog open={isEditEntityDialogOpen} onOpenChange={setIsEditEntityDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {entityType}</DialogTitle>
            <DialogDescription>
              Update the details for this {entityType.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEntity} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={entityFormData.name}
                  onChange={(e) => setEntityFormData({...entityFormData, name: e.target.value})}
                  placeholder={`Enter ${entityType.toLowerCase()} name`}
                  required
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={entityFormData.company}
                  onChange={(e) => setEntityFormData({...entityFormData, company: e.target.value})}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={entityFormData.email}
                  onChange={(e) => setEntityFormData({...entityFormData, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={entityFormData.phone}
                  onChange={(e) => setEntityFormData({...entityFormData, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={entityFormData.address}
                onChange={(e) => setEntityFormData({...entityFormData, address: e.target.value})}
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tax ID</Label>
                <Input
                  value={entityFormData.taxId}
                  onChange={(e) => setEntityFormData({...entityFormData, taxId: e.target.value})}
                  placeholder="Tax identification number"
                />
              </div>
              <div>
                <Label>Credit Limit</Label>
                <Input
                  type="number"
                  value={entityFormData.creditLimit}
                  onChange={(e) => setEntityFormData({...entityFormData, creditLimit: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Select 
                  value={entityFormData.paymentTerms} 
                  onValueChange={(value) => setEntityFormData({...entityFormData, paymentTerms: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="15 days">15 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="60 days">60 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={entityFormData.notes}
                onChange={(e) => setEntityFormData({...entityFormData, notes: e.target.value})}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditEntityDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update {entityType}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 