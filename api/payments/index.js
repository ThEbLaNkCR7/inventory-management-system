import mongoose from 'mongoose'
import Payment from '../../models/Payment.js'
import Purchase from '../../models/Purchase.js'
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
  
  switch (method) {
    case 'GET':
      try {
        // Check if this is a stats request
        const stats = req.query.stats
        
        if (stats === 'true') {
          // Return payment statistics
          const purchases = await Purchase.find({ isActive: true })
          const sales = await Sale.find({ isActive: true })
          const payments = await Payment.find({ isActive: true })
          
          // Calculate purchase payment statistics
          const purchaseStats = purchases.reduce((acc, purchase) => {
            const totalAmount = purchase.totalAmount || (purchase.quantityPurchased * purchase.purchasePrice)
            const outstanding = totalAmount - (purchase.paidAmount || 0)
            
            acc.totalPurchases += totalAmount
            acc.paidPurchases += purchase.paidAmount || 0
            acc.outstandingPurchases += outstanding
            
            if (purchase.paymentStatus === "Overdue") {
              acc.overduePurchases += outstanding
            }
            
            return acc
          }, {
            totalPurchases: 0,
            paidPurchases: 0,
            outstandingPurchases: 0,
            overduePurchases: 0
          })
          
          // Calculate sale payment statistics
          const saleStats = sales.reduce((acc, sale) => {
            const totalAmount = sale.totalAmount || (sale.quantitySold * sale.salePrice)
            const outstanding = totalAmount - (sale.paidAmount || 0)
            
            acc.totalSales += totalAmount
            acc.paidSales += sale.paidAmount || 0
            acc.outstandingSales += outstanding
            
            if (sale.paymentStatus === "Overdue") {
              acc.overdueSales += outstanding
            }
            
            return acc
          }, {
            totalSales: 0,
            paidSales: 0,
            outstandingSales: 0,
            overdueSales: 0
          })
          
          // Get recent payments
          const recentPayments = await Payment.find({ isActive: true })
            .sort({ paymentDate: -1 })
            .limit(10)
          
          // Get payment method distribution
          const paymentMethodStats = payments.reduce((acc, payment) => {
            acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1
            return acc
          }, {})
          
          // Get overdue transactions
          const overduePurchases = purchases.filter(purchase => 
            purchase.paymentStatus === "Overdue"
          ).map(purchase => ({
            id: purchase._id,
            type: "Purchase",
            supplier: purchase.supplier,
            productName: purchase.productName,
            totalAmount: purchase.totalAmount || (purchase.quantityPurchased * purchase.purchasePrice),
            paidAmount: purchase.paidAmount || 0,
            outstanding: (purchase.totalAmount || (purchase.quantityPurchased * purchase.purchasePrice)) - (purchase.paidAmount || 0),
            dueDate: purchase.dueDate
          }))
          
          const overdueSales = sales.filter(sale => 
            sale.paymentStatus === "Overdue"
          ).map(sale => ({
            id: sale._id,
            type: "Sale",
            client: sale.client,
            productName: sale.productName,
            totalAmount: sale.totalAmount || (sale.quantitySold * sale.salePrice),
            paidAmount: sale.paidAmount || 0,
            outstanding: (sale.totalAmount || (sale.quantitySold * sale.salePrice)) - (sale.paidAmount || 0),
            dueDate: sale.dueDate
          }))
          
          return res.status(200).json({
            purchaseStats,
            saleStats,
            recentPayments,
            paymentMethodStats,
            overdueTransactions: [...overduePurchases, ...overdueSales],
            summary: {
              totalOutstanding: purchaseStats.outstandingPurchases + saleStats.outstandingSales,
              totalOverdue: purchaseStats.overduePurchases + saleStats.overdueSales,
              netCashFlow: saleStats.paidSales - purchaseStats.paidPurchases
            }
          })
        }
        
        // Return all payments (default behavior)
        const payments = await Payment.find({ isActive: true }).sort({ paymentDate: -1 })
        res.status(200).json(payments)
      } catch (error) {
        console.error('Payment API error:', error)
        res.status(500).json({ error: "Failed to fetch payments" })
      }
      break
    case 'POST':
      try {
        const { transactionId, transactionType, amount, paymentDate, paymentMethod, referenceNumber, notes, paidBy, recordedBy } = req.body
        
        // Create the payment record
        const payment = new Payment({
          transactionId,
          transactionType,
          amount,
          paymentDate,
          paymentMethod,
          referenceNumber,
          notes,
          paidBy,
          recordedBy
        })
        
        await payment.save()
        
        // Update the transaction's payment status
        if (transactionType === "Purchase") {
          const purchase = await Purchase.findById(transactionId)
          if (purchase) {
            const newPaidAmount = purchase.paidAmount + amount
            const totalAmount = purchase.totalAmount || (purchase.quantityPurchased * purchase.purchasePrice)
            
            let paymentStatus = "Pending"
            if (newPaidAmount >= totalAmount) {
              paymentStatus = "Paid"
            } else if (newPaidAmount > 0) {
              paymentStatus = "Partial"
            }
            
            // Check if overdue
            if (purchase.dueDate && new Date() > new Date(purchase.dueDate) && paymentStatus !== "Paid") {
              paymentStatus = "Overdue"
            }
            
            await Purchase.findByIdAndUpdate(transactionId, {
              paidAmount: newPaidAmount,
              paymentStatus
            })
          }
        } else if (transactionType === "Sale") {
          const sale = await Sale.findById(transactionId)
          if (sale) {
            const newPaidAmount = sale.paidAmount + amount
            const totalAmount = sale.totalAmount || (sale.quantitySold * sale.salePrice)
            
            let paymentStatus = "Pending"
            if (newPaidAmount >= totalAmount) {
              paymentStatus = "Paid"
            } else if (newPaidAmount > 0) {
              paymentStatus = "Partial"
            }
            
            // Check if overdue
            if (sale.dueDate && new Date() > new Date(sale.dueDate) && paymentStatus !== "Paid") {
              paymentStatus = "Overdue"
            }
            
            await Sale.findByIdAndUpdate(transactionId, {
              paidAmount: newPaidAmount,
              paymentStatus
            })
          }
        }
        
        res.status(201).json(payment)
      } catch (error) {
        console.error('Payment POST error:', error)
        res.status(500).json({ error: "Failed to record payment" })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 