const express = require("express")
const Batch = require("../models/Batch")
const Product = require("../models/Product")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all batches
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query

    const query = {}

    // Search filter
    if (search) {
      query.$or = [{ batchNumber: { $regex: search, $options: "i" } }, { supplier: { $regex: search, $options: "i" } }]
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status
    }

    const batches = await Batch.find(query)
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Batch.countDocuments(query)

    res.json({
      batches,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get batches error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get batch by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("items.productId", "name sku")
      .populate("processedBy", "name email")

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    res.json(batch)
  } catch (error) {
    console.error("Get batch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create batch
router.post("/", adminAuth, async (req, res) => {
  try {
    const batch = new Batch(req.body)
    await batch.save()

    // Update products with batch information
    for (const item of batch.items) {
      await Product.findByIdAndUpdate(item.productId, {
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        lastRestocked: batch.arrivalDate,
        stockType: "new",
      })
    }

    res.status(201).json(batch)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Batch number already exists" })
    }
    console.error("Create batch error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update batch status
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "processed" && {
          processedBy: req.user._id,
          processedAt: new Date(),
        }),
      },
      { new: true },
    )

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // If batch is received, update product stock quantities
    if (status === "received") {
      for (const item of batch.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity },
          lastRestocked: new Date(),
          stockType: "new",
        })
      }
    }

    res.json(batch)
  } catch (error) {
    console.error("Update batch status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get recent batches (last 30 days)
router.get("/recent/list", adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const batches = await Batch.find({
      arrivalDate: { $gte: thirtyDaysAgo },
    })
      .sort({ arrivalDate: -1 })
      .limit(10)

    res.json(batches)
  } catch (error) {
    console.error("Get recent batches error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
