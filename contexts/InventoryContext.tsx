"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

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

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const addPurchase = (purchase: Omit<Purchase, "id">) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
    }
    setPurchases((prev) => [...prev, newPurchase])

    // Update stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === purchase.productId ? { ...p, stockQuantity: p.stockQuantity + purchase.quantityPurchased } : p,
      ),
    )
  }

  const updatePurchase = (id: string, updatedPurchase: Partial<Purchase>) => {
    const oldPurchase = purchases.find((p) => p.id === id)
    if (oldPurchase) {
      setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedPurchase } : p)))

      // Update stock if quantity changed
      if (updatedPurchase.quantityPurchased && updatedPurchase.quantityPurchased !== oldPurchase.quantityPurchased) {
        const difference = updatedPurchase.quantityPurchased - oldPurchase.quantityPurchased
        setProducts((prev) =>
          prev.map((p) => (p.id === oldPurchase.productId ? { ...p, stockQuantity: p.stockQuantity + difference } : p)),
        )
      }
    }
  }

  const deletePurchase = (id: string) => {
    const purchase = purchases.find((p) => p.id === id)
    if (purchase) {
      setPurchases((prev) => prev.filter((p) => p.id !== id))

      // Revert stock
      setProducts((prev) =>
        prev.map((p) =>
          p.id === purchase.productId ? { ...p, stockQuantity: p.stockQuantity - purchase.quantityPurchased } : p,
        ),
      )
    }
  }

  const addSale = (sale: Omit<Sale, "id">) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
    }
    setSales((prev) => [...prev, newSale])

    // Update stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === sale.productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity - sale.quantitySold) } : p,
      ),
    )
  }

  const updateSale = (id: string, updatedSale: Partial<Sale>) => {
    const oldSale = sales.find((s) => s.id === id)
    if (oldSale) {
      setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedSale } : s)))

      // Update stock if quantity changed
      if (updatedSale.quantitySold && updatedSale.quantitySold !== oldSale.quantitySold) {
        const difference = oldSale.quantitySold - updatedSale.quantitySold
        setProducts((prev) =>
          prev.map((p) => (p.id === oldSale.productId ? { ...p, stockQuantity: p.stockQuantity + difference } : p)),
        )
      }
    }
  }

  const deleteSale = (id: string) => {
    const sale = sales.find((s) => s.id === id)
    if (sale) {
      setSales((prev) => prev.filter((s) => s.id !== id))

      // Revert stock
      setProducts((prev) =>
        prev.map((p) => (p.id === sale.productId ? { ...p, stockQuantity: p.stockQuantity + sale.quantitySold } : p)),
      )
    }
  }

  const addClient = (client: Omit<Client, "id">) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    }
    setClients((prev) => [...prev, newClient])
  }

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    }
    setSuppliers((prev) => [...prev, newSupplier])
  }

  const updateSupplier = (id: string, updatedSupplier: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedSupplier } : s)))
  }

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
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
