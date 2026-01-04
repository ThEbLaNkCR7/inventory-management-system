import mongoose from 'mongoose'
import Purchase from '../../models/Purchase.js'
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
  const { id } = req.query
  switch (method) {
    case 'GET':
      try {
        const purchase = await Purchase.findById(id)
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        res.status(200).json(purchase)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        // Get the original purchase to calculate stock difference
        const originalPurchase = await Purchase.findById(id)
        if (!originalPurchase) return res.status(404).json({ message: 'Purchase not found' })
        
        const purchase = await Purchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        
        // Update product stock quantity
        const product = await Product.findById(purchase.productId)
        if (product) {
          // Calculate the difference in quantity purchased
          const quantityDifference = purchase.quantityPurchased - originalPurchase.quantityPurchased
          const newStockQuantity = Math.max(0, product.stockQuantity + quantityDifference)
          
          await Product.findByIdAndUpdate(purchase.productId, {
            stockQuantity: newStockQuantity,
            lastRestocked: new Date()
          })
          console.log(`📦 Updated stock for ${product.name}: ${product.stockQuantity} → ${newStockQuantity} (difference: ${quantityDifference})`)
        }
        
        res.status(200).json(purchase)
      } catch (error) {
        console.error('Error updating purchase:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const purchase = await Purchase.findById(id)
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
        
        // Update product stock quantity before deleting
        const product = await Product.findById(purchase.productId)
        if (product) {
          const newStockQuantity = Math.max(0, product.stockQuantity - purchase.quantityPurchased)
          await Product.findByIdAndUpdate(purchase.productId, {
            stockQuantity: newStockQuantity,
            lastRestocked: new Date()
          })
          console.log(`📦 Reduced stock for ${product.name}: ${product.stockQuantity} → ${newStockQuantity}`)
        }
        
        await Purchase.findByIdAndDelete(id)
        res.status(200).json({ message: 'Purchase deleted successfully' })
      } catch (error) {
        console.error('Error deleting purchase:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 