import mongoose from 'mongoose'
import Product from '../../models/Product.js'

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
        const { page = 1, limit = 50, search, category, stockType, lowStock, debug } = req.query

        // Debug endpoint to see all products
        if (debug === 'true') {
          const allProducts = await Product.find({}).select('name hsCode _id')
          return res.status(200).json({ 
            message: "Debug: All products with HS Codes", 
            products: allProducts,
            count: allProducts.length
          })
        }

        // Migration endpoint to fix HS Code issues
        if (req.query.migrate === 'true') {
          try {
            // Remove empty HS Codes from existing products
            const result = await Product.updateMany(
              { $or: [{ hsCode: "" }, { hsCode: null }, { hsCode: { $exists: false } }] },
              { $unset: { hsCode: 1 } }
            )
            return res.status(200).json({ 
              message: "Migration completed", 
              modifiedCount: result.modifiedCount 
            })
          } catch (error) {
            console.error("Migration error:", error)
            return res.status(500).json({ message: "Migration failed", error: error.message })
          }
        }

        // Migration endpoint to remove SKU field
        if (req.query.removeSku === 'true') {
          try {
            // Remove SKU field from all products
            const result = await Product.updateMany(
              {},
              { $unset: { sku: 1 } }
            )
            
            // Note: To drop the SKU index, you would need to run this in MongoDB directly:
            // db.products.dropIndex("sku_1")
            
            return res.status(200).json({ 
              message: "SKU removal completed", 
              modifiedCount: result.modifiedCount,
              note: "You may need to manually drop the SKU index in MongoDB"
            })
          } catch (error) {
            console.error("SKU removal error:", error)
            return res.status(500).json({ message: "SKU removal failed", error: error.message })
          }
        }

        // Aggressive SKU cleanup endpoint
        if (req.query.cleanupSku === 'true') {
          try {
            // Remove SKU field from all products
            const result1 = await Product.updateMany(
              {},
              { $unset: { sku: 1 } }
            )
            
            // Try to drop the SKU index using MongoDB driver
            try {
              const db = mongoose.connection.db
              await db.collection('products').dropIndex('sku_1')
              console.log("Successfully dropped SKU index")
            } catch (indexError) {
              console.log("Could not drop SKU index (might not exist):", indexError.message)
            }
            
            return res.status(200).json({ 
              message: "Aggressive SKU cleanup completed", 
              modifiedCount: result1.modifiedCount,
              note: "SKU field removed and index drop attempted"
            })
          } catch (error) {
            console.error("Aggressive SKU cleanup error:", error)
            return res.status(500).json({ message: "Aggressive SKU cleanup failed", error: error.message })
          }
        }

        // Fix the null SKU product endpoint
        if (req.query.fixNullSku === 'true') {
          try {
            // Find and fix the product with sku: null
            const result = await Product.updateMany(
              { sku: null },
              { $set: { sku: `SKU_FIXED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } }
            )
            
            return res.status(200).json({ 
              message: "Fixed null SKU products", 
              modifiedCount: result.modifiedCount
            })
          } catch (error) {
            console.error("Fix null SKU error:", error)
            return res.status(500).json({ message: "Fix null SKU failed", error: error.message })
          }
        }

        // Test endpoint to verify Product model
        if (req.query.test === 'true') {
          try {
            const testProduct = new Product({
              name: "Test Product",
              hsCode: "TEST123",
              description: "Test description",
              category: "Test",
              stockQuantity: 10,
              unitPrice: 100,
              supplier: "Test Supplier"
            })
            await testProduct.save()
            await Product.findByIdAndDelete(testProduct._id)
            return res.status(200).json({ message: "Product model test successful" })
          } catch (error) {
            console.error("Product model test error:", error)
            return res.status(500).json({ message: "Product model test failed", error: error.message })
          }
        }

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
        console.log("Creating product with data:", req.body)
        console.log("HS Code being submitted:", req.body.hsCode)
        
        // Clean up existing products with empty HS Codes (one-time fix)
        await Product.updateMany(
          { hsCode: "" },
          { $unset: { hsCode: 1 } }
        )
        
        // Fix the existing product with sku: null first
        await Product.updateMany(
          { sku: null },
          { $set: { sku: `SKU_FIXED_${Date.now()}` } }
        )
        
        // Remove SKU field from existing products and drop SKU index
        await Product.updateMany(
          {},
          { $unset: { sku: 1 } }
        )
        
        // Ensure SKU is not included in the request body to avoid index conflicts
        const productData = { ...req.body }
        delete productData.sku // Remove SKU from the data being sent to MongoDB
        
        const product = new Product(productData)
        await product.save()
        res.status(201).json(product)
      } catch (error) {
        console.error("Create product error details:", error)
        console.error("Error stack:", error.stack)
        console.error("Request body:", req.body)
        if (error.name === 'ValidationError') {
          console.error("Validation errors:", error.errors)
          return res.status(400).json({ message: error.message, errors: error.errors })
        }
        console.error("Create product error:", error)
        res.status(500).json({ message: "Server error", details: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 