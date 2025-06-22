"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface BatchItem {
  productId: string
  productName: string
  quantity: number
  unitCost: number
  expiryDate?: string
}

export interface Batch {
  id: string
  batchNumber: string
  supplier: string
  arrivalDate: string
  items: BatchItem[]
  totalItems: number
  totalValue: number
  status: "pending" | "received" | "processed"
  createdAt: string
}

interface BatchContextType {
  batches: Batch[]
  addBatch: (batch: Omit<Batch, "id" | "createdAt">) => void
  updateBatchStatus: (id: string, status: Batch["status"]) => void
  getBatchById: (id: string) => Batch | undefined
  getRecentBatches: () => Batch[]
}

const BatchContext = createContext<BatchContextType | undefined>(undefined)

// Mock data
const mockBatches: Batch[] = [
  {
    id: "1",
    batchNumber: "BATCH-2024-001",
    supplier: "Dell Inc.",
    arrivalDate: "2024-01-15",
    items: [
      {
        productId: "1",
        productName: "Laptop Dell XPS 13",
        quantity: 20,
        unitCost: 1000,
        expiryDate: "2026-01-15",
      },
    ],
    totalItems: 20,
    totalValue: 20000,
    status: "received",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    batchNumber: "BATCH-2024-002",
    supplier: "Apple Inc.",
    arrivalDate: "2024-01-20",
    items: [
      {
        productId: "2",
        productName: "iPhone 15 Pro",
        quantity: 15,
        unitCost: 850,
      },
    ],
    totalItems: 15,
    totalValue: 12750,
    status: "received",
    createdAt: "2024-01-20T14:30:00Z",
  },
]

export function BatchProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([])

  const addBatch = (batchData: Omit<Batch, "id" | "createdAt">) => {
    const newBatch: Batch = {
      ...batchData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setBatches((prev) => [...prev, newBatch])
  }

  const updateBatchStatus = (id: string, status: Batch["status"]) => {
    setBatches((prev) => prev.map((batch) => (batch.id === id ? { ...batch, status } : batch)))
  }

  const getBatchById = (id: string) => {
    return batches.find((batch) => batch.id === id)
  }

  const getRecentBatches = () => {
    return batches
      .filter((batch) => {
        const batchDate = new Date(batch.arrivalDate)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return batchDate >= thirtyDaysAgo
      })
      .sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime())
  }

  return (
    <BatchContext.Provider
      value={{
        batches,
        addBatch,
        updateBatchStatus,
        getBatchById,
        getRecentBatches,
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}

export function useBatch() {
  const context = useContext(BatchContext)
  if (context === undefined) {
    throw new Error("useBatch must be used within a BatchProvider")
  }
  return context
}
