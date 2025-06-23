import mongoose from 'mongoose'
import Product from '../../models/Product'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

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