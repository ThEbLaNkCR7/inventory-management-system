import mongoose from 'mongoose'
import Client from './models/Client.js'
import Supplier from './models/Supplier.js'
import Sale from './models/Sale.js'
import Purchase from './models/Purchase.js'

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

async function updateClientTotals() {
  console.log('🔄 Updating client totals...')
  
  const clients = await Client.find({ isActive: true })
  const sales = await Sale.find({ isActive: true })
  
  for (const client of clients) {
    const clientSales = sales.filter(sale => sale.client === client.name)
    const totalSpent = clientSales.reduce((total, sale) => total + (sale.quantitySold * sale.salePrice), 0)
    const orders = clientSales.length
    const lastOrder = clientSales.length > 0 
      ? clientSales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))[0].saleDate
      : null
    
    await Client.findByIdAndUpdate(client._id, {
      totalSpent,
      orders,
      lastOrder
    })
    
    console.log(`✅ Updated ${client.name}: Rs ${totalSpent.toFixed(2)}, ${orders} orders`)
  }
}

async function updateSupplierTotals() {
  console.log('🔄 Updating supplier totals...')
  
  const suppliers = await Supplier.find({ isActive: true })
  const purchases = await Purchase.find({ isActive: true })
  
  for (const supplier of suppliers) {
    const supplierPurchases = purchases.filter(purchase => purchase.supplier === supplier.name)
    const totalSpent = supplierPurchases.reduce((total, purchase) => total + (purchase.quantityPurchased * purchase.purchasePrice), 0)
    const orders = supplierPurchases.length
    const lastOrder = supplierPurchases.length > 0 
      ? supplierPurchases.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))[0].purchaseDate
      : null
    
    await Supplier.findByIdAndUpdate(supplier._id, {
      totalSpent,
      orders,
      lastOrder
    })
    
    console.log(`✅ Updated ${supplier.name}: Rs ${totalSpent.toFixed(2)}, ${orders} orders`)
  }
}

async function main() {
  try {
    await dbConnect()
    console.log('📊 Starting total spent calculations...')
    
    await updateClientTotals()
    await updateSupplierTotals()
    
    console.log('✅ All totals updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating totals:', error)
    process.exit(1)
  }
}

main() 