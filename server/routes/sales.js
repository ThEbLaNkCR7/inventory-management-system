const express = require("express")
const Sale = require("../models/Sale")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all sales
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, startDate, endDate, paymentStatus } = req.query

    const query = {}

    // Search filter
    if (search) {
      query.$or = [{ productName: { $regex: search, $options: "i" } }, { client: { $regex: search, $options: "i" } }]
    }

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) query.saleDate.$gte = new Date(startDate)
      if (endDate) query.saleDate.$lte = new Date(endDate)
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus
    }

    const sales = await Sale.find(query)
      .populate("productId", "name sku")
      .populate("createdBy", "name email")
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Sale.countDocuments(query)

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get sales error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create sale
router.post("/", adminAuth, async (req, res) => {
  try {
    // Check if product has sufficient stock
    const product = await Product.findById(req.body.productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (product.stockQuantity < req.body.quantitySold) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: product.stockQuantity,
        requested: req.body.quantitySold,
      })
    }

    const sale = new Sale({
      ...req.body,
      createdBy: req.user._id,
    })

    await sale.save()

    // Update product stock
    await Product.findByIdAndUpdate(sale.productId, {
      $inc: { stockQuantity: -sale.quantitySold },
    })

    await sale.populate("productId", "name sku")
    res.status(201).json(sale)
  } catch (error) {
    console.error("Create sale error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get sale by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("productId", "name sku")
      .populate("createdBy", "name email")

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" })
    }

    res.json(sale)
  } catch (error) {
    console.error("Get sale error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update sale
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const oldSale = await Sale.findById(req.params.id)
    if (!oldSale) {
      return res.status(404).json({ message: "Sale not found" })
    }

    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    // Update product stock if quantity changed
    if (oldSale.quantitySold !== sale.quantitySold) {
      const difference = oldSale.quantitySold - sale.quantitySold
      await Product.findByIdAndUpdate(sale.productId, {
        $inc: { stockQuantity: difference },
      })
    }

    res.json(sale)
  } catch (error) {
    console.error("Update sale error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete sale
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" })
    }

    // Revert product stock
    await Product.findByIdAndUpdate(sale.productId, {
      $inc: { stockQuantity: sale.quantitySold },
    })

    await Sale.findByIdAndDelete(req.params.id)
    res.json({ message: "Sale deleted successfully" })
  } catch (error) {
    console.error("Delete sale error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
