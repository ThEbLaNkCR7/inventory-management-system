"use client"

import { useState } from "react"
import { useInventory } from "@/contexts/InventoryContext"
import { useBatch } from "@/contexts/BatchContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Clock, AlertTriangle } from "lucide-react"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"

export default function StockViewPage() {
  const { products, getNewStock, getOldStock } = useInventory()
  const { batches } = useBatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBatch, setSelectedBatch] = useState<string>("all")

  const newStock = getNewStock()
  const oldStock = getOldStock()

  const filterProducts = (productList: any[]) => {
    let filtered = productList.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedBatch !== "all") {
      filtered = filtered.filter((product) => product.batchId === selectedBatch)
    }

    return filtered
  }

  const filteredNewStock = filterProducts(newStock)
  const filteredOldStock = filterProducts(oldStock)

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="space-y-2">
        <h1 className="section-title">
          Stock Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Monitor inventory levels and stock movements</p>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 border-2 focus:border-slate-500 transition-colors h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>
            </div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchNumber}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{newStock.length}</div>
            <p className="text-xs text-muted-foreground">Products restocked in last 30 days</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Old Stock</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{oldStock.length}</div>
            <p className="text-xs text-muted-foreground">Products older than 30 days</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rs {products.reduce((total, p) => total + p.stockQuantity * p.unitPrice, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Tables */}
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Stock ({filteredNewStock.length})</TabsTrigger>
          <TabsTrigger value="old">Old Stock ({filteredOldStock.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">New Stock Items</h3>
          </div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Last Restocked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNewStock.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {product.stockQuantity <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />}
                            <span className={product.stockQuantity <= 5 ? "text-orange-600 font-medium" : ""}>
                              {product.stockQuantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>Rs {product.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.batchNumber ? (
                            <Badge variant="outline">{product.batchNumber}</Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{product.lastRestocked || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredNewStock.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No new stock found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="old" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Old Stock Items</h3>
          </div>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Last Restocked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOldStock.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {product.stockQuantity <= 5 && <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />}
                            <span className={product.stockQuantity <= 5 ? "text-orange-600 font-medium" : ""}>
                              {product.stockQuantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>Rs {product.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.batchNumber ? (
                            <Badge variant="outline">{product.batchNumber}</Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{product.lastRestocked || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredOldStock.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No old stock found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
