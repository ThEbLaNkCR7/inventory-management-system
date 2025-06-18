const express = require("express")
const Approval = require("../models/Approval")
const Product = require("../models/Product")
const Sale = require("../models/Sale")
const Purchase = require("../models/Purchase")
const Client = require("../models/Client")
const Supplier = require("../models/Supplier")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all approvals
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type } = req.query

    const query = {}

    // Status filter
    if (status && status !== "all") {
      query.status = status
    }

    // Type filter
    if (type && type !== "all") {
      query.type = type
    }

    const approvals = await Approval.find(query)
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Approval.countDocuments(query)

    res.json({
      approvals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get approvals error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit approval request
router.post("/", auth, async (req, res) => {
  try {
    const approval = new Approval({
      ...req.body,
      requestedBy: req.user._id,
    })

    await approval.save()
    await approval.populate("requestedBy", "name email")

    res.status(201).json(approval)
  } catch (error) {
    console.error("Submit approval error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Approve/Reject approval
router.patch("/:id/:action", adminAuth, async (req, res) => {
  try {
    const { id, action } = req.params
    const { reviewNotes } = req.body

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" })
    }

    const approval = await Approval.findById(id)
    if (!approval) {
      return res.status(404).json({ message: "Approval not found" })
    }

    if (approval.status !== "pending") {
      return res.status(400).json({ message: "Approval already processed" })
    }

    // Update approval status
    approval.status = action === "approve" ? "approved" : "rejected"
    approval.reviewedBy = req.user._id
    approval.reviewedAt = new Date()
    approval.reviewNotes = reviewNotes

    await approval.save()

    // If approved, apply the changes
    if (action === "approve") {
      await applyApprovedChanges(approval)
    }

    await approval.populate(["requestedBy", "reviewedBy"], "name email")
    res.json(approval)
  } catch (error) {
    console.error("Process approval error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to apply approved changes
async function applyApprovedChanges(approval) {
  const { type, action, entityId, proposedData } = approval

  try {
    switch (type) {
      case "product":
        if (action === "create") {
          await Product.create(proposedData)
        } else if (action === "update") {
          await Product.findByIdAndUpdate(entityId, proposedData)
        } else if (action === "delete") {
          await Product.findByIdAndUpdate(entityId, { isActive: false })
        }
        break

      case "sale":
        if (action === "create") {
          const sale = await Sale.create(proposedData)
          // Update product stock
          await Product.findByIdAndUpdate(sale.productId, {
            $inc: { stockQuantity: -sale.quantitySold },
          })
        } else if (action === "update") {
          await Sale.findByIdAndUpdate(entityId, proposedData)
        } else if (action === "delete") {
          const sale = await Sale.findById(entityId)
          if (sale) {
            // Revert product stock
            await Product.findByIdAndUpdate(sale.productId, {
              $inc: { stockQuantity: sale.quantitySold },
            })
            await Sale.findByIdAndDelete(entityId)
          }
        }
        break

      case "purchase":
        if (action === "create") {
          const purchase = await Purchase.create(proposedData)
          // Update product stock
          await Product.findByIdAndUpdate(purchase.productId, {
            $inc: { stockQuantity: purchase.quantityPurchased },
          })
        } else if (action === "update") {
          await Purchase.findByIdAndUpdate(entityId, proposedData)
        } else if (action === "delete") {
          const purchase = await Purchase.findById(entityId)
          if (purchase) {
            // Revert product stock
            await Product.findByIdAndUpdate(purchase.productId, {
              $inc: { stockQuantity: -purchase.quantityPurchased },
            })
            await Purchase.findByIdAndDelete(entityId)
          }
        }
        break

      case "client":
        if (action === "create") {
          await Client.create(proposedData)
        } else if (action === "update") {
          await Client.findByIdAndUpdate(entityId, proposedData)
        } else if (action === "delete") {
          await Client.findByIdAndUpdate(entityId, { isActive: false })
        }
        break

      case "supplier":
        if (action === "create") {
          await Supplier.create(proposedData)
        } else if (action === "update") {
          await Supplier.findByIdAndUpdate(entityId, proposedData)
        } else if (action === "delete") {
          await Supplier.findByIdAndUpdate(entityId, { isActive: false })
        }
        break
    }
  } catch (error) {
    console.error("Error applying approved changes:", error)
    throw error
  }
}

// Get pending approvals count
router.get("/pending/count", adminAuth, async (req, res) => {
  try {
    const count = await Approval.countDocuments({ status: "pending" })
    res.json({ count })
  } catch (error) {
    console.error("Get pending count error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
