import mongoose from 'mongoose'
import Purchase from './models/Purchase.js'
import Sale from './models/Sale.js'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

async function updatePaymentFields() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Update purchases
    console.log('Updating purchases...')
    const purchases = await Purchase.find({})
    
    for (const purchase of purchases) {
      const totalAmount = purchase.quantityPurchased * purchase.purchasePrice
      const paidAmount = purchase.paidAmount || 0
      
      let paymentStatus = "Pending"
      if (paidAmount >= totalAmount) {
        paymentStatus = "Paid"
      } else if (paidAmount > 0) {
        paymentStatus = "Partial"
      }
      
      // Check if overdue
      if (purchase.dueDate && new Date() > new Date(purchase.dueDate) && paymentStatus !== "Paid") {
        paymentStatus = "Overdue"
      }
      
      await Purchase.findByIdAndUpdate(purchase._id, {
        totalAmount,
        paidAmount,
        paymentStatus,
        paymentTerms: purchase.paymentTerms || "Immediate"
      })
    }
    
    console.log(`Updated ${purchases.length} purchases`)

    // Update sales
    console.log('Updating sales...')
    const sales = await Sale.find({})
    
    for (const sale of sales) {
      const totalAmount = sale.quantitySold * sale.salePrice
      const paidAmount = sale.paidAmount || 0
      
      let paymentStatus = "Pending"
      if (paidAmount >= totalAmount) {
        paymentStatus = "Paid"
      } else if (paidAmount > 0) {
        paymentStatus = "Partial"
      }
      
      // Check if overdue
      if (sale.dueDate && new Date() > new Date(sale.dueDate) && paymentStatus !== "Paid") {
        paymentStatus = "Overdue"
      }
      
      await Sale.findByIdAndUpdate(sale._id, {
        totalAmount,
        paidAmount,
        paymentStatus,
        paymentTerms: sale.paymentTerms || "Immediate"
      })
    }
    
    console.log(`Updated ${sales.length} sales`)
    console.log('Payment fields update completed successfully!')

  } catch (error) {
    console.error('Error updating payment fields:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

updatePaymentFields() 