import mongoose from 'mongoose'

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

// Client Model Schema
const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    taxId: {
      type: String,
      trim: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    orders: {
      type: Number,
      default: 0,
    },
    lastOrder: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
clientSchema.index({ name: "text", company: "text", email: "text" })
clientSchema.index({ company: 1 })

const Client = mongoose.models.Client || mongoose.model("Client", clientSchema)

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req
  const { id } = req.query
  
  if (!id) {
    return res.status(400).json({ message: 'Client ID required' })
  }
  
  console.log(`API Request: ${method} /api/clients/${id}`)
  
  switch (method) {
    case 'GET':
      try {
        const client = await Client.findById(id)
        if (!client) return res.status(404).json({ message: 'Client not found' })
        res.status(200).json(client)
      } catch (error) {
        console.error("Get client error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'PUT':
      try {
        console.log(`Updating client ${id} with data:`, req.body)
        const client = await Client.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!client) return res.status(404).json({ message: 'Client not found' })
        console.log(`Client updated successfully:`, client)
        res.status(200).json(client)
      } catch (error) {
        console.error("Update client error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    case 'DELETE':
      try {
        const client = await Client.findByIdAndUpdate(id, { isActive: false }, { new: true })
        if (!client) return res.status(404).json({ message: 'Client not found' })
        res.status(200).json({ message: 'Client deleted successfully' })
      } catch (error) {
        console.error("Delete client error:", error)
        res.status(500).json({ message: 'Server error' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 