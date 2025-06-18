const express = require("express")
const Supplier = require("../models/Supplier")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all suppliers
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query

    const query = { isActive: true }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const suppliers = await Supplier.find(query)
      .sort({ company: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Supplier.countDocuments(query)

    res.json({
      suppliers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get suppliers error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create supplier
router.post("/", adminAuth, async (req, res) => {
  try {
    const supplier = new Supplier(req.body)
    await supplier.save()
    res.status(201).json(supplier)
  } catch (error) {
    console.error("Create supplier error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get supplier by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" })
    }
    res.json(supplier)
  } catch (error) {
    console.error("Get supplier error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update supplier
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" })
    }

    res.json(supplier)
  } catch (error) {
    console.error("Update supplier error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete supplier
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" })
    }

    res.json({ message: "Supplier deleted successfully" })
  } catch (error) {
    console.error("Delete supplier error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
