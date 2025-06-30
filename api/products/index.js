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
  
  // Improved ID detection logic
  let productId = req.query.id
  
  // If no ID in query, check if the URL path contains an ID
  if (!productId && req.url) {
    const urlParts = req.url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Check if the last part looks like a MongoDB ObjectId (24 hex characters)
    if (lastPart && lastPart.length === 24 && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      productId = lastPart
    }
  }
  
  console.log(`API Request: ${method} ${req.url}, Product ID: ${productId}`)
  
  // If we have a product ID, handle individual product operations
  if (productId) {
    switch (method) {
      case 'GET':
        try {
          const product = await Product.findById(productId)
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }
          res.status(200).json(product)
        } catch (error) {
          console.error('GET product error:', error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'PUT':
        try {
          console.log(`Updating product ${productId} with data:`, req.body)
          const product = await Product.findByIdAndUpdate(productId, req.body, { new: true, runValidators: true })
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }
          console.log(`Product updated successfully:`, product)
          res.status(200).json(product)
        } catch (error) {
          console.error('PUT product error:', error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'DELETE':
        try {
          const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true })
          if (!product) {
            return res.status(404).json({ message: 'Product not found' })
          }
          res.status(200).json({ message: 'Product deleted successfully' })
        } catch (error) {
          console.error('DELETE product error:', error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
    return
  }
  
  // Handle collection operations (no specific ID)
  switch (method) {
    case 'GET':
      try {
        // Get all products
        const products = await Product.find({ isActive: { $ne: false } })
        res.status(200).json({ products })
      } catch (error) {
        console.error('GET products error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const product = new Product(req.body)
        await product.save()
        res.status(201).json(product)
      } catch (error) {
        console.error('POST product error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 