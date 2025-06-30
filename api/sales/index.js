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
  
  // Improved ID detection logic
  let saleId = req.query.id
  
  // If no ID in query, check if the URL path contains an ID
  if (!saleId && req.url) {
    const urlParts = req.url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Check if the last part looks like a MongoDB ObjectId (24 hex characters)
    if (lastPart && lastPart.length === 24 && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      saleId = lastPart
    }
  }
  
  console.log(`API Request: ${method} ${req.url}, Sale ID: ${saleId}`)
  
  // If we have a sale ID, handle individual sale operations
  if (saleId) {
    switch (method) {
      case 'GET':
        try {
          const sale = await Sale.findById(saleId)
          if (!sale) return res.status(404).json({ message: 'Sale not found' })
          res.status(200).json(sale)
        } catch (error) {
          console.error("Get sale error:", error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'PUT':
        try {
          console.log(`Updating sale ${saleId} with data:`, req.body)
          const sale = await Sale.findByIdAndUpdate(saleId, req.body, { new: true, runValidators: true })
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
          const sale = await Sale.findByIdAndUpdate(saleId, { isActive: false }, { new: true })
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
    return
  }
  
  // Handle collection operations (no specific ID)
  switch (method) {
    case 'GET':
      try {
        const sales = await Sale.find({ isActive: { $ne: false } })
        res.status(200).json({ sales })
      } catch (error) {
        console.error('GET sales error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const sale = new Sale(req.body)
        await sale.save()
        res.status(201).json(sale)
      } catch (error) {
        console.error('POST sale error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 