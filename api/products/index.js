import dbConnect from '../../lib/mongodb'
import Product from '../../models/Product'

export default async function handler(req, res) {
  await dbConnect()

  const { method } = req

  switch (method) {
    case 'GET':
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

        res.status(200).json({
          products,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
        })
      } catch (error) {
        console.error("Get products error:", error)
        res.status(500).json({ message: "Server error" })
      }
      break

    case 'POST':
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
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 