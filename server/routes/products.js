const express = require("express")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all products
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, stockType, lowStock } = req.query

    const query = { isActive: true }

    // Search filter
    if (search) {
      query.$text = { $search: search }
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category
    }

    // Stock type filter
    if (stockType && stockType !== "all") {
      query.stockType = stockType
    }

    // Low stock filter
    if (lowStock === "true") {
      query.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] }
    }

    const products = await Product.find(query)
      .populate("batchId", "batchNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get product by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("batchId", "batchNumber supplier arrivalDate")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create product (Admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" })
    }
    console.error("Create product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update product (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" })
    }
    console.error("Update product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete product (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get categories
router.get("/meta/categories", auth, async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true })
    res.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update stock quantity
router.patch("/:id/stock", adminAuth, async (req, res) => {
  try {
    const { quantity, operation } = req.body // operation: 'add' or 'subtract'

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (operation === "add") {
      product.stockQuantity += quantity
      product.lastRestocked = new Date()
    } else if (operation === "subtract") {
      product.stockQuantity = Math.max(0, product.stockQuantity - quantity)
    }

    await product.save()
    res.json(product)
  } catch (error) {
    console.error("Update stock error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
