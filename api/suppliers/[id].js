import mongoose from 'mongoose'
import Supplier from '../../../models/Supplier.js'

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
    return res.status(400).json({ message: 'Supplier ID required' })
  }
  
  console.log(`API Request: ${method} /api/suppliers/${id}`)
  
  switch (method) {
    case 'GET':
      try {
        const supplier = await Supplier.findById(id)
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        res.status(200).json(supplier)
      } catch (error) {
        console.error("Get supplier error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        console.log(`Updating supplier ${id} with data:`, req.body)
        const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        console.log(`Supplier updated successfully:`, supplier)
        res.status(200).json(supplier)
      } catch (error) {
        console.error("Update supplier error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const supplier = await Supplier.findByIdAndUpdate(id, { isActive: false }, { new: true })
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
        res.status(200).json({ message: 'Supplier deleted successfully' })
      } catch (error) {
        console.error("Delete supplier error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 