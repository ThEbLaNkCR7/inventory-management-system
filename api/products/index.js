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
  
  // Check if this is a specific product request (has ID in URL)
  const productId = req.query.id || req.url.split('/').pop()
  
  switch (method) {
    case 'GET':
      try {
        if (productId && productId !== 'products') {
          // Get specific product
          const product = await Product.findById(productId)
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }
          res.status(200).json(product)
        } else {
          // Get all products
          const products = await Product.find({ isActive: true })
          res.status(200).json({ products })
        }
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const product = new Product(req.body)
        await product.save()
        res.status(201).json(product)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        if (!productId || productId === 'products') {
          return res.status(400).json({ message: 'Product ID required' })
        }
        const product = await Product.findByIdAndUpdate(productId, req.body, { new: true })
        if (!product) {
          return res.status(404).json({ message: 'Product not found' })
        }
        res.status(200).json(product)
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        if (!productId || productId === 'products') {
          return res.status(400).json({ message: 'Product ID required' })
        }
        const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true })
        if (!product) {
          return res.status(404).json({ message: 'Product not found' })
        }
        res.status(200).json({ message: 'Product deleted successfully' })
      } catch (error) {
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 