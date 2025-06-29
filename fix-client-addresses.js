import mongoose from 'mongoose'
import Client from './models/Client.js'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

async function dbConnect() {
  const opts = {
    bufferCommands: false,
  }
  await mongoose.connect(MONGODB_URI, opts)
}

async function fixClientAddresses() {
  console.log('🔄 Fixing client addresses...')
  
  const clients = await Client.find({ isActive: true })
  
  for (const client of clients) {
    // Check if client has the old address structure or no address at all
    if (!client.address || typeof client.address === 'string') {
      const oldAddress = typeof client.address === 'string' ? client.address : ''
      
      // Create new address structure
      const newAddress = {
        street: oldAddress,
        city: "",
        state: "",
        zipCode: "",
        country: "",
      }
      
      // Update client with new address structure and default values for new fields
      await Client.findByIdAndUpdate(client._id, {
        address: newAddress,
        taxId: client.taxId || "",
        creditLimit: client.creditLimit || 0,
        currentBalance: client.currentBalance || 0,
        totalSpent: client.totalSpent || 0,
        orders: client.orders || 0,
        lastOrder: client.lastOrder || null,
        notes: client.notes || "",
      })
      
      console.log(`✅ Fixed address for ${client.name}`)
    }
  }
  
  console.log('✅ All client addresses fixed!')
}

async function main() {
  try {
    await dbConnect()
    console.log('🔧 Starting client address fixes...')
    
    await fixClientAddresses()
    
    console.log('✅ All fixes completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error fixing client addresses:', error)
    process.exit(1)
  }
}

main() 