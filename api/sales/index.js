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
  switch (method) {
    case 'GET':
      try {
        const sales = await Sale.find({ isActive: true })
        res.status(200).json({ sales })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const sale = new Sale(req.body)
        await sale.save()
        
        // Update product stock quantity
        const product = await Product.findById(sale.productId)
        if (product) {
          const newStockQuantity = Math.max(0, product.stockQuantity - sale.quantitySold)
          await Product.findByIdAndUpdate(sale.productId, {
            stockQuantity: newStockQuantity,
            lastRestocked: new Date()
          })
          console.log(`📦 Updated stock for ${product.name}: ${product.stockQuantity} → ${newStockQuantity}`)
        }
        
        res.status(201).json(sale)
      } catch (error) {
        console.error('Error creating sale:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 