import mongoose from 'mongoose'
import Sale from '../../models/Sale.js'

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
    return res.status(400).json({ message: 'Sale ID required' })
  }
  
  console.log(`API Request: ${method} /api/sales/${id}`)
  
  switch (method) {
    case 'GET':
      try {
        const sale = await Sale.findById(id)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json(sale)
      } catch (error) {
        console.error("Get sale error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        console.log(`Updating sale ${id} with data:`, req.body)
        const sale = await Sale.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        console.log(`Sale updated successfully:`, sale)
        res.status(200).json(sale)
      } catch (error) {
        console.error("Update sale error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const sale = await Sale.findByIdAndUpdate(id, { isActive: false }, { new: true })
        if (!sale) return res.status(404).json({ message: 'Sale not found' })
        res.status(200).json({ message: 'Sale deleted successfully' })
      } catch (error) {
        console.error("Delete sale error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 