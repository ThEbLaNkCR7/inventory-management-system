import mongoose from 'mongoose'
import Sale from '../../models/Sale.js'
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
        const sale = await Sale.findById(id)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json(sale)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        // Get the original sale to calculate stock difference
        const originalSale = await Sale.findById(id)
        if (!originalSale) return res.status(404).json({ message: 'Sale not found' })
        
        const sale = await Sale.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        
        // Update product stock quantity
        const product = await Product.findById(sale.productId)
        if (product) {
          // Calculate the difference in quantity sold
          const quantityDifference = originalSale.quantitySold - sale.quantitySold
          const newStockQuantity = Math.max(0, product.stockQuantity + quantityDifference)
          
          await Product.findByIdAndUpdate(sale.productId, {
            stockQuantity: newStockQuantity,
            lastRestocked: new Date()
          })
          console.log(`📦 Updated stock for ${product.name}: ${product.stockQuantity} → ${newStockQuantity} (difference: ${quantityDifference})`)
        }
        
        res.status(200).json(sale)
      } catch (error) {
        console.error('Error updating sale:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const sale = await Sale.findById(id)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        
        // Update product stock quantity before deleting
        const product = await Product.findById(sale.productId)
        if (product) {
          const newStockQuantity = product.stockQuantity + sale.quantitySold
          await Product.findByIdAndUpdate(sale.productId, {
            stockQuantity: newStockQuantity,
            lastRestocked: new Date()
          })
          console.log(`📦 Restored stock for ${product.name}: ${product.stockQuantity} → ${newStockQuantity}`)
        }
        
        await Sale.findByIdAndDelete(id)
        res.status(200).json({ message: 'Sale deleted successfully' })
      } catch (error) {
        console.error('Error deleting sale:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 