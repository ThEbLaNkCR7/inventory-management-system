"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getCurrentNepaliYear, getNepaliYear, getNepaliMonth, getNepaliMonthName } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  hsCode: string
  description?: string
  category: string
  stockQuantity: number
  unitPrice: number
  supplier: string
  createdAt: string
  batchId?: string
  batchNumber?: string
  stockType: "new" | "old"
  lastRestocked?: string
  isActive?: boolean
}

export interface Purchase {
  id: string
  productId: string
  productName: string
  supplier: string
  supplierType?: string
  quantityPurchased: number
  purchasePrice: number
  purchaseDate: string
  // Payment tracking fields
  totalAmount?: number
  paidAmount?: number
  paymentStatus?: "Pending" | "Partial" | "Paid" | "Overdue"
  dueDate?: string
  paymentTerms?: string
  isActive?: boolean
}

export interface Sale {
  id: string
  productId: string
  productName: string
  client: string
  clientType?: string
  quantitySold: number
  salePrice: number
  saleDate: string
  // Payment tracking fields
  totalAmount?: number
  paidAmount?: number
  paymentStatus?: "Pending" | "Partial" | "Paid" | "Overdue"
  dueDate?: string
  paymentTerms?: string
  isActive?: boolean
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  } | string
  taxId: string
  creditLimit: number
  currentBalance: number
  totalSpent: number
  orders: number
  lastOrder: string
  isActive?: boolean
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  address: string
  orders: number
  totalSpent: number
  lastOrder: string
  isActive?: boolean
}

export interface Payment {
  id: string
  transactionId: string
  transactionType: "Purchase" | "Sale"
  amount: number
  paymentDate: string
  paymentMethod: "Cash" | "Bank Transfer" | "Check" | "Credit Card" | "Digital Payment"
  referenceNumber?: string
  notes?: string
  paidBy: string
  recordedBy: string
  isActive?: boolean
}

interface InventoryContextType {
  products: Product[]
  purchases: Purchase[]
  sales: Sale[]
  clients: Client[]
  suppliers: Supplier[]
  isRefreshing: boolean
  lastRefresh: Date
  refreshData: () => Promise<void>
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  requestProductChange: (
    action: "create" | "update" | "delete",
    productData: any,
    productId?: string,
    reason?: string,
  ) => Promise<void>
  addPurchase: (purchase: Omit<Purchase, "id">) => void
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void
  deletePurchase: (id: string) => void
  addSale: (sale: Omit<Sale, "id">) => void
  updateSale: (id: string, sale: Partial<Sale>) => void
  deleteSale: (id: string) => void
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addSupplier: (supplier: Omit<Supplier, "id">) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  // Payment functions
  recordPayment: (payment: Omit<Payment, "id">) => Promise<void>
  getPaymentStats: () => Promise<any>
  getOutstandingPayments: () => { purchases: Purchase[], sales: Sale[] }
  getOverduePayments: () => { purchases: Purchase[], sales: Sale[] }
  getLowStockProducts: () => Product[]
  getTotalSales: () => number
  getTotalPurchases: () => number
  getProfit: () => number
  getNewStock: () => Product[]
  getOldStock: () => Product[]
  getStockByBatch: (batchId: string) => Product[]
  getMonthlyData: (year?: number) => {
    month: string
    sales: number
    purchases: number
    profit: number
    salesCount: number
    purchasesCount: number
  }[]
  getYearlyData: () => {
    year: number
    sales: number
    purchases: number
    profit: number
    monthlyBreakdown: any[]
  }[]
  getSalesData: (period: "monthly" | "yearly", year?: number) => any[]
  getPurchasesData: (period: "monthly" | "yearly", year?: number) => any[]
  getClientTotalSpent: (clientName: string) => number
  getSupplierTotalSpent: (supplierName: string) => number
  getClientOrderCount: (clientName: string) => number
  getSupplierOrderCount: (supplierName: string) => number
  getClientLastOrder: (clientName: string) => string | null
  getSupplierLastOrder: (supplierName: string) => string | null
  updateClientStats: (clientName: string) => Promise<void>
  updateSupplierStats: (supplierName: string) => Promise<void>
  refreshAllTotals: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Enhanced fetch function with better error handling
  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true)
    
    try {
      console.log("🔄 Refreshing inventory data...")
      const [productsRes, purchasesRes, salesRes, clientsRes, suppliersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/purchases"),
        fetch("/api/sales"),
        fetch("/api/clients"),
        fetch("/api/suppliers"),
      ])
      
      const productsData = await productsRes.json()
      const purchasesData = await purchasesRes.json()
      const salesData = await salesRes.json()
      const clientsData = await clientsRes.json()
      const suppliersData = await suppliersRes.json()
      
      setProducts((productsData.products || []).map((p: any) => ({ ...p, id: p._id || p.id })).filter((p: any) => p.isActive !== false))
      setPurchases((purchasesData.purchases || []).map((p: any) => ({ ...p, id: p._id || p.id })).filter((p: any) => p.isActive !== false))
      setSales((salesData.sales || []).map((s: any) => ({ ...s, id: s._id || s.id })).filter((s: any) => s.isActive !== false))
      setClients((clientsData.clients || []).map((c: any) => ({ ...c, id: c._id || c.id })).filter((c: any) => c.isActive !== false))
      setSuppliers((suppliersData.suppliers || []).map((s: any) => ({ ...s, id: s._id || s.id })).filter((s: any) => s.isActive !== false))
      
      setLastRefresh(new Date())
      console.log("✅ Inventory data refreshed successfully")
    } catch (error) {
      console.error("❌ Failed to fetch inventory data:", error)
    } finally {
      if (showLoading) setIsRefreshing(false)
    }
  }, [])

  // Fetch all entities from API on mount
  useEffect(() => {
    fetchAllData(false) // Don't show loading on initial load
  }, [fetchAllData])

  // Auto-refresh function that can be called after operations
  const refreshData = useCallback(async () => {
    await fetchAllData(true)
  }, [fetchAllData])

  // Products
  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    try {
      console.log("📦 Adding new product:", product.name)
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.message || `Failed to add product (${res.status})`
        throw new Error(errorMessage)
      }
      
      const newProduct = await res.json()
      setProducts((prev) => [...prev, { ...newProduct, id: newProduct._id || newProduct.id }])
      console.log("✅ Product added successfully:", product.name)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Add product error:", error)
      throw error
    }
  }
  
  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      console.log("🔄 Updating product:", id)
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
      if (!res.ok) throw new Error("Failed to update product")
      const product = await res.json()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...product, id: product._id || product.id } : p)))
      console.log("✅ Product updated successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Update product error:", error)
      throw error
    }
  }
  
  const deleteProduct = async (id: string) => {
    try {
      console.log("🗑️ Deleting product:", id)
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")
      setProducts((prev) => prev.filter((p) => p.id !== id))
      console.log("✅ Product deleted successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Delete product error:", error)
      throw error
    }
  }

  // Purchases
  const addPurchase = async (purchase: Omit<Purchase, "id">) => {
    try {
      console.log("📦 Adding new purchase:", purchase.productName)
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
      })
      if (!res.ok) throw new Error("Failed to add purchase")
      const newPurchase = await res.json()
      setPurchases((prev) => [...prev, { ...newPurchase, id: newPurchase._id || newPurchase.id }])
      console.log("✅ Purchase added successfully:", purchase.productName)
      
      // Update supplier statistics
      await updateSupplierStats(purchase.supplier)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Add purchase error:", error)
      throw error
    }
  }
  
  const updatePurchase = async (id: string, updatedPurchase: Partial<Purchase>) => {
    try {
      console.log("🔄 Updating purchase:", id)
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPurchase),
      })
      if (!res.ok) throw new Error("Failed to update purchase")
      const purchase = await res.json()
      setPurchases((prev) => prev.map((p) => (p.id === id ? purchase : p)))
      console.log("✅ Purchase updated successfully:", id)
      
      // Update supplier statistics if supplier changed
      if (updatedPurchase.supplier) {
        await updateSupplierStats(updatedPurchase.supplier)
      }
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Update purchase error:", error)
      throw error
    }
  }
  
  const deletePurchase = async (id: string) => {
    try {
      console.log("🗑️ Deleting purchase:", id)
      const purchaseToDelete = purchases.find(p => p.id === id)
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete purchase")
      setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)))
      console.log("✅ Purchase deleted successfully:", id)
      
      // Update supplier statistics
      if (purchaseToDelete) {
        await updateSupplierStats(purchaseToDelete.supplier)
      }
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Delete purchase error:", error)
      throw error
    }
  }

  // Sales
  const addSale = async (sale: Omit<Sale, "id">) => {
    try {
      console.log("💰 Adding new sale:", sale.productName)
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      })
      if (!res.ok) throw new Error("Failed to add sale")
      const newSale = await res.json()
      setSales((prev) => [...prev, { ...newSale, id: newSale._id || newSale.id }])
      console.log("✅ Sale added successfully:", sale.productName)
      
      // Update client statistics
      await updateClientStats(sale.client)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Add sale error:", error)
      throw error
    }
  }
  
  const updateSale = async (id: string, updatedSale: Partial<Sale>) => {
    try {
      console.log("🔄 Updating sale:", id)
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSale),
      })
      if (!res.ok) throw new Error("Failed to update sale")
      const sale = await res.json()
      setSales((prev) => prev.map((s) => (s.id === id ? sale : s)))
      console.log("✅ Sale updated successfully:", id)
      
      // Update client statistics if client changed
      if (updatedSale.client) {
        await updateClientStats(updatedSale.client)
      }
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Update sale error:", error)
      throw error
    }
  }
  
  const deleteSale = async (id: string) => {
    try {
      console.log("🗑️ Deleting sale:", id)
      const saleToDelete = sales.find(s => s.id === id)
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete sale")
      setSales((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)))
      console.log("✅ Sale deleted successfully:", id)
      
      // Update client statistics
      if (saleToDelete) {
        await updateClientStats(saleToDelete.client)
      }
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Delete sale error:", error)
      throw error
    }
  }

  // Clients
  const addClient = async (client: Omit<Client, "id">) => {
    try {
      console.log("👤 Adding new client:", client.name)
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      })
      if (!res.ok) throw new Error("Failed to add client")
      const newClient = await res.json()
      setClients((prev) => [...prev, { ...newClient, id: newClient._id || newClient.id }])
      console.log("✅ Client added successfully:", client.name)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Add client error:", error)
      throw error
    }
  }
  
  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    try {
      console.log("🔄 Updating client:", id)
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClient),
      })
      if (!res.ok) throw new Error("Failed to update client")
      const client = await res.json()
      setClients((prev) => prev.map((c) => (c.id === id ? { ...client, id: client._id || client.id } : c)))
      console.log("✅ Client updated successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Update client error:", error)
      throw error
    }
  }
  
  const deleteClient = async (id: string) => {
    try {
      console.log("🗑️ Deleting client:", id)
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete client")
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)))
      console.log("✅ Client deleted successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Delete client error:", error)
      throw error
    }
  }

  // Suppliers
  const addSupplier = async (supplier: Omit<Supplier, "id">) => {
    try {
      console.log("🏢 Adding new supplier:", supplier.company)
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      })
      if (!res.ok) throw new Error("Failed to add supplier")
      const newSupplier = await res.json()
      setSuppliers((prev) => [...prev, { ...newSupplier, id: newSupplier._id || newSupplier.id }])
      console.log("✅ Supplier added successfully:", supplier.company)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Add supplier error:", error)
      throw error
    }
  }
  
  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
    try {
      console.log("🔄 Updating supplier:", id)
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSupplier),
      })
      if (!res.ok) throw new Error("Failed to update supplier")
      const supplier = await res.json()
      setSuppliers((prev) => prev.map((s) => (s.id === id ? supplier : s)))
      console.log("✅ Supplier updated successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Update supplier error:", error)
      throw error
    }
  }
  
  const deleteSupplier = async (id: string) => {
    try {
      console.log("🗑️ Deleting supplier:", id)
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete supplier")
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
      console.log("✅ Supplier deleted successfully:", id)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Delete supplier error:", error)
      throw error
    }
  }

  const getLowStockProducts = () => {
    return products.filter((p) => p.stockQuantity <= 5)
  }

  const getTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.quantitySold * sale.salePrice, 0)
  }

  const getTotalPurchases = () => {
    return purchases.reduce((total, purchase) => total + purchase.quantityPurchased * purchase.purchasePrice, 0)
  }

  const getProfit = () => {
    return getTotalSales() - getTotalPurchases()
  }

  // Calculate total spent for a specific client
  const getClientTotalSpent = (clientName: string) => {
    return sales
      .filter(sale => sale.client === clientName && sale.isActive !== false)
      .reduce((total, sale) => total + (sale.quantitySold * sale.salePrice), 0)
  }

  // Calculate total spent for a specific supplier
  const getSupplierTotalSpent = (supplierName: string) => {
    return purchases
      .filter(purchase => purchase.supplier === supplierName && purchase.isActive !== false)
      .reduce((total, purchase) => total + (purchase.quantityPurchased * purchase.purchasePrice), 0)
  }

  // Calculate order count for a specific client
  const getClientOrderCount = (clientName: string) => {
    return sales.filter(sale => sale.client === clientName && sale.isActive !== false).length
  }

  // Calculate order count for a specific supplier
  const getSupplierOrderCount = (supplierName: string) => {
    return purchases.filter(purchase => purchase.supplier === supplierName && purchase.isActive !== false).length
  }

  // Get last order date for a specific client
  const getClientLastOrder = (clientName: string) => {
    const clientSales = sales
      .filter(sale => sale.client === clientName && sale.isActive !== false)
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
    
    return clientSales.length > 0 ? clientSales[0].saleDate : null
  }

  // Get last order date for a specific supplier
  const getSupplierLastOrder = (supplierName: string) => {
    const supplierPurchases = purchases
      .filter(purchase => purchase.supplier === supplierName && purchase.isActive !== false)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    
    return supplierPurchases.length > 0 ? supplierPurchases[0].purchaseDate : null
  }

  // Update client statistics when a sale is added/updated/deleted
  const updateClientStats = async (clientName: string) => {
    try {
      const totalSpent = getClientTotalSpent(clientName)
      const orders = getClientOrderCount(clientName)
      const lastOrder = getClientLastOrder(clientName)

      // Find client by name and update stats
      const client = clients.find(c => c.name === clientName)
      if (client) {
        await updateClient(client.id, { 
          totalSpent, 
          orders, 
          lastOrder: lastOrder || undefined 
        })
      }
    } catch (error) {
      console.error("❌ Update client stats error:", error)
    }
  }

  // Update supplier statistics when a purchase is added/updated/deleted
  const updateSupplierStats = async (supplierName: string) => {
    try {
      const totalSpent = getSupplierTotalSpent(supplierName)
      const orders = getSupplierOrderCount(supplierName)
      const lastOrder = getSupplierLastOrder(supplierName)

      // Find supplier by name and update stats
      const supplier = suppliers.find(s => s.name === supplierName)
      if (supplier) {
        await updateSupplier(supplier.id, { 
          totalSpent, 
          orders, 
          lastOrder: lastOrder || undefined 
        })
      }
    } catch (error) {
      console.error("❌ Update supplier stats error:", error)
    }
  }

  // Refresh all client and supplier totals (useful for initial setup or data migration)
  const refreshAllTotals = async () => {
    try {
      console.log("🔄 Refreshing all client and supplier totals...")
      
      // Update all client totals
      for (const client of clients) {
        await updateClientStats(client.name)
      }
      
      // Update all supplier totals
      for (const supplier of suppliers) {
        await updateSupplierStats(supplier.name)
      }
      
      console.log("✅ All totals refreshed successfully!")
    } catch (error) {
      console.error("❌ Refresh totals error:", error)
    }
  }

  const getNewStock = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return products.filter((product) => {
      if (product.lastRestocked) {
        return new Date(product.lastRestocked) >= thirtyDaysAgo
      }
      return product.stockType === "new"
    })
  }

  const getOldStock = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return products.filter((product) => {
      if (product.lastRestocked) {
        return new Date(product.lastRestocked) < thirtyDaysAgo
      }
      return product.stockType === "old"
    })
  }

  const getStockByBatch = (batchId: string) => {
    return products.filter((product) => product.batchId === batchId)
  }

  const getMonthlyData = (year = getCurrentNepaliYear()) => {
    const nepaliMonths = [
      "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ]

    return nepaliMonths.map((month, index) => {
      const monthNumber = index + 1 // Convert to 1-based month number
      const monthSales = sales.filter((sale) => {
        const saleNepaliYear = getNepaliYear(sale.saleDate)
        const saleNepaliMonth = getNepaliMonth(sale.saleDate)
        return saleNepaliYear === year && saleNepaliMonth === monthNumber
      })

      const monthPurchases = purchases.filter((purchase) => {
        const purchaseNepaliYear = getNepaliYear(purchase.purchaseDate)
        const purchaseNepaliMonth = getNepaliMonth(purchase.purchaseDate)
        return purchaseNepaliYear === year && purchaseNepaliMonth === monthNumber
      })

      const salesAmount = monthSales.reduce((total, sale) => total + sale.quantitySold * sale.salePrice, 0)
      const purchasesAmount = monthPurchases.reduce(
        (total, purchase) => total + purchase.quantityPurchased * purchase.purchasePrice,
        0,
      )

      return {
        month,
        sales: salesAmount,
        purchases: purchasesAmount,
        profit: salesAmount - purchasesAmount,
        salesCount: monthSales.length,
        purchasesCount: monthPurchases.length,
      }
    })
  }

  const getYearlyData = () => {
    const nepaliYears = [
      ...new Set([
        ...sales.map((s) => getNepaliYear(s.saleDate)),
        ...purchases.map((p) => getNepaliYear(p.purchaseDate)),
      ]),
    ].sort((a, b) => b - a)

    return nepaliYears.map((year) => {
      const monthlyBreakdown = getMonthlyData(year)
      const yearSales = monthlyBreakdown.reduce((total, month) => total + month.sales, 0)
      const yearPurchases = monthlyBreakdown.reduce((total, month) => total + month.purchases, 0)

      return {
        year,
        sales: yearSales,
        purchases: yearPurchases,
        profit: yearSales - yearPurchases,
        monthlyBreakdown,
      }
    })
  }

  const getSalesData = (period: "monthly" | "yearly", year?: number) => {
    if (period === "monthly") {
      return sales.filter((sale) => {
        if (year) {
          return getNepaliYear(sale.saleDate) === year
        }
        return true
      })
    }
    return sales
  }

  const getPurchasesData = (period: "monthly" | "yearly", year?: number) => {
    if (period === "monthly") {
      return purchases.filter((purchase) => {
        if (year) {
          return getNepaliYear(purchase.purchaseDate) === year
        }
        return true
      })
    }
    return purchases
  }

  // Update all price formatting functions
  const formatPrice = (price: number) => `Rs ${price.toLocaleString()}`

  const user = { role: "admin", email: "test@example.com" }
  const useApproval = () => ({ submitChange: (change: any) => console.log("Approval submitted:", change) })
  const { submitChange } = useApproval()

  const requestProductChange = async (
    action: "create" | "update" | "delete",
    productData: any,
    productId?: string,
    reason?: string,
  ) => {
    if (user?.role === "admin") {
      // Admin can make changes directly
      if (action === "create") {
        addProduct(productData)
      } else if (action === "update" && productId) {
        updateProduct(productId, productData)
      } else if (action === "delete" && productId) {
        deleteProduct(productId)
      }
    } else {
      // Regular users submit for approval
      submitChange({
        type: "product",
        action,
        entityId: productId,
        originalData: productId ? products.find((p) => p.id === productId) : undefined,
        proposedData: productData,
        requestedBy: user?.email || "",
        reason,
      })
    }
  }

  // Payment functions
  const recordPayment = async (payment: Omit<Payment, "id">) => {
    try {
      console.log("📋 Recording new payment:", payment.transactionId)
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      })
      if (!res.ok) throw new Error("Failed to record payment")
      const newPayment = await res.json()
      console.log("✅ Payment recorded successfully:", payment.transactionId)
      
      // Auto-refresh to ensure data consistency
      setTimeout(() => refreshData(), 500)
    } catch (error) {
      console.error("❌ Record payment error:", error)
      throw error
    }
  }

  const getPaymentStats = async () => {
    try {
      console.log("📊 Getting payment stats...")
      const res = await fetch("/api/payments/stats")
      if (!res.ok) throw new Error("Failed to get payment stats")
      const stats = await res.json()
      console.log("✅ Payment stats retrieved successfully")
      return stats
    } catch (error) {
      console.error("❌ Get payment stats error:", error)
      throw error
    }
  }

  const getOutstandingPayments = () => {
    const outstandingPurchases = purchases.filter(purchase => 
      purchase.paymentStatus !== "Paid" && (purchase.paidAmount || 0) < (purchase.totalAmount || purchase.quantityPurchased * purchase.purchasePrice)
    )
    const outstandingSales = sales.filter(sale => 
      sale.paymentStatus !== "Paid" && (sale.paidAmount || 0) < (sale.totalAmount || sale.quantitySold * sale.salePrice)
    )
    return { purchases: outstandingPurchases, sales: outstandingSales }
  }

  const getOverduePayments = () => {
    const overduePurchases = purchases.filter(purchase => 
      purchase.paymentStatus === "Overdue"
    )
    const overdueSales = sales.filter(sale => 
      sale.paymentStatus === "Overdue"
    )
    return { purchases: overduePurchases, sales: overdueSales }
  }

  return (
    <InventoryContext.Provider
      value={{
        products,
        purchases,
        sales,
        clients,
        suppliers,
        isRefreshing,
        lastRefresh,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        requestProductChange,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addSale,
        updateSale,
        deleteSale,
        addClient,
        updateClient,
        deleteClient,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordPayment,
        getPaymentStats,
        getOutstandingPayments,
        getOverduePayments,
        getLowStockProducts,
        getTotalSales,
        getTotalPurchases,
        getProfit,
        getNewStock,
        getOldStock,
        getStockByBatch,
        getMonthlyData,
        getYearlyData,
        getSalesData,
        getPurchasesData,
        getClientTotalSpent,
        getSupplierTotalSpent,
        getClientOrderCount,
        getSupplierOrderCount,
        getClientLastOrder,
        getSupplierLastOrder,
        updateClientStats,
        updateSupplierStats,
        refreshAllTotals,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
