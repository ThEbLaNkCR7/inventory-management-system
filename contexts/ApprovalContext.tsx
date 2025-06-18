"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useInventory } from "./InventoryContext"

export interface ApprovalChange {
  id: string
  type: "product" | "sale" | "purchase"
  action: "create" | "update" | "delete"
  entityId?: string
  originalData?: any
  proposedData: any
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  reason?: string
}

interface ApprovalContextType {
  pendingChanges: ApprovalChange[]
  submitChange: (change: Omit<ApprovalChange, "id" | "requestedAt" | "status">) => void
  approveChange: (changeId: string, notes?: string) => void
  rejectChange: (changeId: string, notes?: string) => void
  getPendingChanges: () => ApprovalChange[]
  getChangeHistory: () => ApprovalChange[]
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined)

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [changes, setChanges] = useState<ApprovalChange[]>([])
  const {
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    updateSale,
    deleteSale,
    addPurchase,
    updatePurchase,
    deletePurchase,
    sales,
    purchases,
  } = useInventory()

  const submitChange = (change: Omit<ApprovalChange, "id" | "requestedAt" | "status">) => {
    const newChange: ApprovalChange = {
      ...change,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString(),
      status: "pending",
    }
    setChanges((prev) => [...prev, newChange])
  }

  const applySaleChange = (change: ApprovalChange) => {
    switch (change.action) {
      case "create":
        addSale({
          productId: change.proposedData.productId,
          productName: change.proposedData.productName,
          client: change.proposedData.client,
          quantitySold: change.proposedData.quantitySold,
          salePrice: change.proposedData.salePrice,
          saleDate: change.proposedData.saleDate,
        })
        break
      case "update":
        if (change.entityId) {
          updateSale(change.entityId, {
            productId: change.proposedData.productId,
            productName: change.proposedData.productName,
            client: change.proposedData.client,
            quantitySold: change.proposedData.quantitySold,
            salePrice: change.proposedData.salePrice,
            saleDate: change.proposedData.saleDate,
          })
        }
        break
      case "delete":
        if (change.entityId) {
          deleteSale(change.entityId)
        }
        break
    }
  }

  const applyPurchaseChange = (change: ApprovalChange) => {
    switch (change.action) {
      case "create":
        addPurchase({
          productId: change.proposedData.productId,
          productName: change.proposedData.productName,
          supplier: change.proposedData.supplier,
          quantityPurchased: change.proposedData.quantityPurchased,
          purchasePrice: change.proposedData.purchasePrice,
          purchaseDate: change.proposedData.purchaseDate,
        })
        break
      case "update":
        if (change.entityId) {
          updatePurchase(change.entityId, {
            productId: change.proposedData.productId,
            productName: change.proposedData.productName,
            supplier: change.proposedData.supplier,
            quantityPurchased: change.proposedData.quantityPurchased,
            purchasePrice: change.proposedData.purchasePrice,
            purchaseDate: change.proposedData.purchaseDate,
          })
        }
        break
      case "delete":
        if (change.entityId) {
          deletePurchase(change.entityId)
        }
        break
    }
  }

  const applyProductChange = (change: ApprovalChange) => {
    switch (change.action) {
      case "create":
        addProduct(change.proposedData)
        break
      case "update":
        if (change.entityId) {
          updateProduct(change.entityId, change.proposedData)
        }
        break
      case "delete":
        if (change.entityId) {
          deleteProduct(change.entityId)
        }
        break
    }
  }

  const approveChange = (changeId: string, notes?: string) => {
    setChanges((prev) =>
      prev.map((change) => {
        if (change.id === changeId) {
          const updatedChange = {
            ...change,
            status: "approved" as const,
            reviewedBy: "admin@example.com", // In real app, get from auth context
            reviewedAt: new Date().toISOString(),
            reviewNotes: notes,
          }

          // Apply the approved change to the actual data
          try {
            switch (change.type) {
              case "product":
                applyProductChange(updatedChange)
                break
              case "sale":
                applySaleChange(updatedChange)
                break
              case "purchase":
                applyPurchaseChange(updatedChange)
                break
            }
          } catch (error) {
            console.error("Error applying approved change:", error)
            // In a real app, you might want to handle this error differently
          }

          return updatedChange
        }
        return change
      }),
    )
  }

  const rejectChange = (changeId: string, notes?: string) => {
    setChanges((prev) =>
      prev.map((change) =>
        change.id === changeId
          ? {
              ...change,
              status: "rejected" as const,
              reviewedBy: "admin@example.com", // In real app, get from auth context
              reviewedAt: new Date().toISOString(),
              reviewNotes: notes,
            }
          : change,
      ),
    )
  }

  const getPendingChanges = () => {
    return changes.filter((change) => change.status === "pending")
  }

  const getChangeHistory = () => {
    return changes
      .filter((change) => change.status !== "pending")
      .sort((a, b) => new Date(b.reviewedAt || "").getTime() - new Date(a.reviewedAt || "").getTime())
  }

  return (
    <ApprovalContext.Provider
      value={{
        pendingChanges: changes,
        submitChange,
        approveChange,
        rejectChange,
        getPendingChanges,
        getChangeHistory,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  )
}

export function useApproval() {
  const context = useContext(ApprovalContext)
  if (context === undefined) {
    throw new Error("useApproval must be used within an ApprovalProvider")
  }
  return context
}
