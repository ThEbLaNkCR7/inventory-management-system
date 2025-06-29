import mongoose from 'mongoose'
import Client from './models/Client.js'
import Sale from './models/Sale.js'

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

async function migrateClientData() {
  console.log('🔄 Starting client data migration...')
  
  const clients = await Client.find({ isActive: true })
  const sales = await Sale.find({ isActive: true })
  
  for (const client of clients) {
    console.log(`Processing client: ${client.name}`)
    
    // Fix address structure
    let newAddress = {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    }
    
    if (client.address) {
      if (typeof client.address === 'string') {
        newAddress.street = client.address
      } else if (typeof client.address === 'object') {
        newAddress = {
          street: client.address.street || "",
          city: client.address.city || "",
          state: client.address.state || "",
          zipCode: client.address.zipCode || "",
          country: client.address.country || "",
        }
      }
    }
    
    // Calculate totals from sales
    const clientSales = sales.filter(sale => sale.client === client.name)
    const totalSpent = clientSales.reduce((total, sale) => total + (sale.quantitySold * sale.salePrice), 0)
    const orders = clientSales.length
    const lastOrder = clientSales.length > 0 
      ? clientSales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))[0].saleDate
      : null
    
    // Update client with all new data
    await Client.findByIdAndUpdate(client._id, {
      address: newAddress,
      taxId: client.taxId || "",
      creditLimit: client.creditLimit || 0,
      currentBalance: client.currentBalance || 0,
      totalSpent,
      orders,
      lastOrder,
      notes: client.notes || "",
    })
    
    console.log(`✅ Updated ${client.name}: Rs ${totalSpent.toFixed(2)}, ${orders} orders`)
  }
  
  console.log('✅ Client data migration completed!')
}

async function main() {
  try {
    await dbConnect()
    console.log('🚀 Starting comprehensive client migration...')
    
    await migrateClientData()
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

main() 