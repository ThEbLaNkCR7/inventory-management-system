import mongoose from 'mongoose'
import Product from '../../../models/Product.js'

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
  
  if (!id) {
    return res.status(400).json({ message: 'Product ID required' })
  }
  
  console.log(`API Request: ${method} /api/products/${id}`)
  
  switch (method) {
    case 'GET':
      try {
        const product = await Product.findById(id)
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
        console.log(`Updating product ${id} with data:`, req.body)
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
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
        const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true })
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
} 