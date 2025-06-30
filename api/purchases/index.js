import mongoose from 'mongoose'
import Purchase from '../../models/Purchase.js'

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
  let purchaseId = req.query.id
  
  // If no ID in query, check if the URL path contains an ID
  if (!purchaseId && req.url) {
    const urlParts = req.url.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    
    // Check if the last part looks like a MongoDB ObjectId (24 hex characters)
    if (lastPart && lastPart.length === 24 && /^[0-9a-fA-F]{24}$/.test(lastPart)) {
      purchaseId = lastPart
    }
  }
  
  console.log(`API Request: ${method} ${req.url}, Purchase ID: ${purchaseId}`)
  
  // If we have a purchase ID, handle individual purchase operations
  if (purchaseId) {
    switch (method) {
      case 'GET':
        try {
          const purchase = await Purchase.findById(purchaseId)
          if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
          res.status(200).json(purchase)
        } catch (error) {
          console.error("Get purchase error:", error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'PUT':
        try {
          console.log(`Updating purchase ${purchaseId} with data:`, req.body)
          const purchase = await Purchase.findByIdAndUpdate(purchaseId, req.body, { new: true, runValidators: true })
          if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
          console.log(`Purchase updated successfully:`, purchase)
          res.status(200).json(purchase)
        } catch (error) {
          console.error("Update purchase error:", error)
          res.status(500).json({ message: 'Server error' })
        }
        break
      case 'DELETE':
        try {
          const purchase = await Purchase.findByIdAndUpdate(purchaseId, { isActive: false }, { new: true })
          if (!purchase) return res.status(404).json({ message: 'Purchase not found' })
          res.status(200).json({ message: 'Purchase deleted successfully' })
        } catch (error) {
          console.error("Delete purchase error:", error)
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
        const purchases = await Purchase.find({ isActive: { $ne: false } })
        res.status(200).json({ purchases })
      } catch (error) {
        console.error('GET purchases error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'POST':
      try {
        const purchaseData = req.body
        
        // Calculate total amount and set payment defaults
        const totalAmount = purchaseData.quantityPurchased * purchaseData.purchasePrice
        const purchase = new Purchase({
          ...purchaseData,
          totalAmount,
          paidAmount: 0,
          paymentStatus: "Pending",
          dueDate: purchaseData.dueDate || null,
          paymentTerms: purchaseData.paymentTerms || "Immediate"
        })
        
        await purchase.save()
        res.status(201).json(purchase)
      } catch (error) {
        console.error('POST purchase error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 