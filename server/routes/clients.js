const express = require("express")
const Client = require("../models/Client")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all clients
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

    const clients = await Client.find(query)
      .sort({ company: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Client.countDocuments(query)

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create client
router.post("/", adminAuth, async (req, res) => {
  try {
    const client = new Client(req.body)
    await client.save()
    res.status(201).json(client)
  } catch (error) {
    console.error("Create client error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get client by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }
    res.json(client)
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update client
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    console.error("Update client error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete client
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
