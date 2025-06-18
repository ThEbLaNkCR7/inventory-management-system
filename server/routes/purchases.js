const express = require("express")
const Purchase = require("../models/Purchase")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all purchases
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, startDate, endDate } = req.query

    const query = {}

    // Search filter
    if (search) {
      query.$or = [{ productName: { $regex: search, $options: "i" } }, { supplier: { $regex: search, $options: "i" } }]
    }

    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) query.purchaseDate.$gte = new Date(startDate)
      if (endDate) query.purchaseDate.$lte = new Date(endDate)
    }

    const purchases = await Purchase.find(query)
      .populate("productId", "name sku")
      .populate("createdBy", "name email")
      .populate("batchId", "batchNumber")
      .sort({ purchaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Purchase.countDocuments(query)

    res.json({
      purchases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get purchases error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create purchase
router.post("/", adminAuth, async (req, res) => {
  try {
    const purchase = new Purchase({
      ...req.body,
      createdBy: req.user._id,
    })

    await purchase.save()

    // Update product stock
    await Product.findByIdAndUpdate(purchase.productId, {
      $inc: { stockQuantity: purchase.quantityPurchased },
      lastRestocked: purchase.purchaseDate,
      stockType: "new",
    })

    await purchase.populate("productId", "name sku")
    res.status(201).json(purchase)
  } catch (error) {
    console.error("Create purchase error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get purchase by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("productId", "name sku")
      .populate("createdBy", "name email")
      .populate("batchId", "batchNumber")

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" })
    }

    res.json(purchase)
  } catch (error) {
    console.error("Get purchase error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update purchase
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const oldPurchase = await Purchase.findById(req.params.id)
    if (!oldPurchase) {
      return res.status(404).json({ message: "Purchase not found" })
    }

    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    // Update product stock if quantity changed
    if (oldPurchase.quantityPurchased !== purchase.quantityPurchased) {
      const difference = purchase.quantityPurchased - oldPurchase.quantityPurchased
      await Product.findByIdAndUpdate(purchase.productId, {
        $inc: { stockQuantity: difference },
      })
    }

    res.json(purchase)
  } catch (error) {
    console.error("Update purchase error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete purchase
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" })
    }

    // Revert product stock
    await Product.findByIdAndUpdate(purchase.productId, {
      $inc: { stockQuantity: -purchase.quantityPurchased },
    })

    await Purchase.findByIdAndDelete(req.params.id)
    res.json({ message: "Purchase deleted successfully" })
  } catch (error) {
    console.error("Delete purchase error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
