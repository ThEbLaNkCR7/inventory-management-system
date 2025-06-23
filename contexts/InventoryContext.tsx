"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  stockQuantity: number
  unitPrice: number
  supplier: string
  createdAt: string
  batchId?: string
  batchNumber?: string
  stockType: "new" | "old"
  lastRestocked?: string
}

export interface Purchase {
  id: string
  productId: string
  productName: string
  supplier: string
  quantityPurchased: number
  purchasePrice: number
  purchaseDate: string
}

export interface Sale {
  id: string
  productId: string
  productName: string
  client: string
  quantitySold: number
  salePrice: number
  saleDate: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  address: string
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
}

interface InventoryContextType {
  products: Product[]
  purchases: Purchase[]
  sales: Sale[]
  clients: Client[]
  suppliers: Supplier[]
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
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  // Fetch all entities from API on mount
  useEffect(() => {
    async function fetchAll() {
      try {
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
        setProducts(productsData.products || [])
        setPurchases(purchasesData.purchases || [])
        setSales(salesData.sales || [])
        setClients(clientsData.clients || [])
        setSuppliers(suppliersData.suppliers || [])
      } catch (error) {
        console.error("Failed to fetch inventory data:", error)
      }
    }
    fetchAll()
  }, [])

  // Add product via API
  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      if (!res.ok) throw new Error("Failed to add product")
      const newProduct = await res.json()
      setProducts((prev) => [...prev, { ...newProduct, id: newProduct._id || newProduct.id }])
    } catch (error) {
      console.error("Add product error:", error)
    }
  }

  // Update product via API
  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
      if (!res.ok) throw new Error("Failed to update product")
      const product = await res.json()
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...product, id: product._id || product.id } : p)))
    } catch (error) {
      console.error("Update product error:", error)
    }
  }

  // Delete product via API (soft delete)
  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Delete product error:", error)
    }
  }

  // Purchases
  const addPurchase = async (purchase: Omit<Purchase, "id">) => {
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchase),
      })
      if (!res.ok) throw new Error("Failed to add purchase")
      const newPurchase = await res.json()
      setPurchases((prev) => [...prev, { ...newPurchase, id: newPurchase._id || newPurchase.id }])
    } catch (error) {
      console.error("Add purchase error:", error)
    }
  }
  const updatePurchase = async (id: string, updatedPurchase: Partial<Purchase>) => {
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPurchase),
      })
      if (!res.ok) throw new Error("Failed to update purchase")
      const purchase = await res.json()
      setPurchases((prev) => prev.map((p) => (p.id === id ? purchase : p)))
    } catch (error) {
      console.error("Update purchase error:", error)
    }
  }
  const deletePurchase = async (id: string) => {
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete purchase")
      setPurchases((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Delete purchase error:", error)
    }
  }

  // Sales
  const addSale = async (sale: Omit<Sale, "id">) => {
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      })
      if (!res.ok) throw new Error("Failed to add sale")
      const newSale = await res.json()
      setSales((prev) => [...prev, { ...newSale, id: newSale._id || newSale.id }])
    } catch (error) {
      console.error("Add sale error:", error)
    }
  }
  const updateSale = async (id: string, updatedSale: Partial<Sale>) => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSale),
      })
      if (!res.ok) throw new Error("Failed to update sale")
      const sale = await res.json()
      setSales((prev) => prev.map((s) => (s.id === id ? sale : s)))
    } catch (error) {
      console.error("Update sale error:", error)
    }
  }
  const deleteSale = async (id: string) => {
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete sale")
      setSales((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Delete sale error:", error)
    }
  }

  // Clients
  const addClient = async (client: Omit<Client, "id">) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      })
      if (!res.ok) throw new Error("Failed to add client")
      const newClient = await res.json()
      setClients((prev) => [...prev, { ...newClient, id: newClient._id || newClient.id }])
    } catch (error) {
      console.error("Add client error:", error)
    }
  }
  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClient),
      })
      if (!res.ok) throw new Error("Failed to update client")
      const client = await res.json()
      setClients((prev) => prev.map((c) => (c.id === id ? client : c)))
    } catch (error) {
      console.error("Update client error:", error)
    }
  }
  const deleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete client")
      setClients((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Delete client error:", error)
    }
  }

  // Suppliers
  const addSupplier = async (supplier: Omit<Supplier, "id">) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      })
      if (!res.ok) throw new Error("Failed to add supplier")
      const newSupplier = await res.json()
      setSuppliers((prev) => [...prev, { ...newSupplier, id: newSupplier._id || newSupplier.id }])
    } catch (error) {
      console.error("Add supplier error:", error)
    }
  }
  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSupplier),
      })
      if (!res.ok) throw new Error("Failed to update supplier")
      const supplier = await res.json()
      setSuppliers((prev) => prev.map((s) => (s.id === id ? supplier : s)))
    } catch (error) {
      console.error("Update supplier error:", error)
    }
  }
  const deleteSupplier = async (id: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete supplier")
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Delete supplier error:", error)
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

  const getMonthlyData = (year = new Date().getFullYear()) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return months.map((month, index) => {
      const monthSales = sales.filter((sale) => {
        const saleDate = new Date(sale.saleDate)
        return saleDate.getFullYear() === year && saleDate.getMonth() === index
      })

      const monthPurchases = purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchaseDate)
        return purchaseDate.getFullYear() === year && purchaseDate.getMonth() === index
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
    const years = [
      ...new Set([
        ...sales.map((s) => new Date(s.saleDate).getFullYear()),
        ...purchases.map((p) => new Date(p.purchaseDate).getFullYear()),
      ]),
    ].sort((a, b) => b - a)

    return years.map((year) => {
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
          return new Date(sale.saleDate).getFullYear() === year
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
          return new Date(purchase.purchaseDate).getFullYear() === year
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

  return (
    <InventoryContext.Provider
      value={{
        products,
        purchases,
        sales,
        clients,
        suppliers,
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
