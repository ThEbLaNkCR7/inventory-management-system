import mongoose from 'mongoose'
import Supplier from '../../models/Supplier.js'

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
  let supplierId = req.query.id
  
  // If no ID in query, check if the URL path contains an ID
  if (!supplierId && req.url) {
    const urlParts = req.url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Check if the last part looks like a MongoDB ObjectId (24 hex characters)
    if (lastPart && lastPart.length === 24 && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      supplierId = lastPart
    }
  }
  
  console.log(`API Request: ${method} ${req.url}, Supplier ID: ${supplierId}`)
  
  // If we have a supplier ID, handle individual supplier operations
  if (supplierId) {
    switch (method) {
      case 'GET':
        try {
          const supplier = await Supplier.findById(supplierId)
          if (!supplier) return res.status(404).json({ message: 'Supplier not found' })
          res.status(200).json(supplier)
        } catch (error) {
          console.error("Get supplier error:", error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'PUT':
        try {
          console.log(`Updating supplier ${supplierId} with data:`, req.body)
          const supplier = await Supplier.findByIdAndUpdate(supplierId, req.body, { new: true, runValidators: true })
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
          const supplier = await Supplier.findByIdAndUpdate(supplierId, { isActive: false }, { new: true })
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
    return
  }
  
  // Handle collection operations (no specific ID)
  switch (method) {
    case 'GET':
      try {
        const suppliers = await Supplier.find({ isActive: { $ne: false } })
        res.status(200).json({ suppliers })
      } catch (error) {
        console.error('GET suppliers error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const supplier = new Supplier(req.body)
        await supplier.save()
        res.status(201).json(supplier)
      } catch (error) {
        console.error('POST supplier error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 