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
  switch (method) {
    case 'GET':
      try {
        const purchases = await Purchase.find({ isActive: true })
        res.status(200).json({ purchases })
      } catch (error) {
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
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 