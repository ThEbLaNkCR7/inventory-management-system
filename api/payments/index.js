import mongoose from 'mongoose'
import Payment from '../../models/Payment.js'
import Purchase from '../../models/Purchase.js'
import Sale from '../../models/Sale.js'
import Supplier from '../../models/Supplier.js'
import Client from '../../models/Client.js'

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

// Helper function to generate transaction ID
function generateTransactionId(type) {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${type}-${timestamp}-${random}`
}

// Helper function to create accounting entries
function createAccountingEntries(transactionType, entityType, amount, description) {
  let debitAccount, creditAccount, debitAmount, creditAmount

  switch (transactionType) {
    case 'Purchase':
      // When paying a supplier: Debit Accounts Payable, Credit Cash/Bank
      debitAccount = 'Accounts Payable'
      creditAccount = 'Cash'
      debitAmount = amount
      creditAmount = amount
      break
      
    case 'Sale':
      // When receiving from client: Debit Cash/Bank, Credit Accounts Receivable
      debitAccount = 'Cash'
      creditAccount = 'Accounts Receivable'
      debitAmount = amount
      creditAmount = amount
      break
      
    case 'Expense':
      // When paying expense: Debit Expenses, Credit Cash/Bank
      debitAccount = 'Expenses'
      creditAccount = 'Cash'
      debitAmount = amount
      creditAmount = amount
      break
      
    case 'Income':
      // When receiving income: Debit Cash/Bank, Credit Revenue
      debitAccount = 'Cash'
      creditAccount = 'Revenue'
      debitAmount = amount
      creditAmount = amount
      break
      
    default:
      throw new Error('Invalid transaction type')
  }

  return { debitAccount, creditAccount, debitAmount, creditAmount }
}

export default async function handler(req, res) {
  await dbConnect()
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { stats, entityId, entityType, startDate, endDate } = req.query

        if (stats === 'true') {
          // Get payment statistics
          const payments = await Payment.find({ isActive: true, status: 'Completed' })
          
          // Calculate purchase stats
          const purchasePayments = payments.filter(p => p.transactionType === 'Purchase')
          const purchaseStats = {
            totalPurchases: purchasePayments.reduce((sum, p) => sum + p.amount, 0),
            paidPurchases: purchasePayments.reduce((sum, p) => sum + p.amount, 0),
            outstandingPurchases: 0, // Will be calculated from purchases
            overduePurchases: 0
          }

          // Calculate sale stats
          const salePayments = payments.filter(p => p.transactionType === 'Sale')
          const saleStats = {
            totalSales: salePayments.reduce((sum, p) => sum + p.amount, 0),
            paidSales: salePayments.reduce((sum, p) => sum + p.amount, 0),
            outstandingSales: 0, // Will be calculated from sales
            overdueSales: 0
          }

          // Get outstanding amounts from purchases and sales
          const purchases = await Purchase.find({ isActive: true })
          const sales = await Sale.find({ isActive: true })
          
          purchaseStats.outstandingPurchases = purchases.reduce((sum, p) => {
            const paidAmount = purchasePayments
              .filter(pay => pay.entityName === p.supplier)
              .reduce((sum, pay) => sum + pay.amount, 0)
            return sum + (p.quantityPurchased * p.purchasePrice - paidAmount)
          }, 0)

          saleStats.outstandingSales = sales.reduce((sum, s) => {
            const paidAmount = salePayments
              .filter(pay => pay.entityName === s.client)
              .reduce((sum, pay) => sum + pay.amount, 0)
            return sum + (s.quantitySold * s.salePrice - paidAmount)
          }, 0)

          const summary = {
            totalOutstanding: purchaseStats.outstandingPurchases + saleStats.outstandingSales,
            totalOverdue: 0, // Would need due dates to calculate
            netCashFlow: saleStats.paidSales - purchaseStats.paidPurchases
          }

          // Get recent payments
          const recentPayments = await Payment.find({ isActive: true, status: 'Completed' })
            .sort({ paymentDate: -1 })
            .limit(10)

          // Get overdue transactions (simplified - would need due dates)
          const overdueTransactions = []

          res.status(200).json({
            purchaseStats,
            saleStats,
            summary,
            recentPayments,
            overdueTransactions
          })
        } else {
          // Get payments with filters
          let query = { isActive: true }
          
          if (entityId) query.entityId = entityId
          if (entityType) query.entityModel = entityType
          if (startDate || endDate) {
            query.paymentDate = {}
            if (startDate) query.paymentDate.$gte = new Date(startDate)
            if (endDate) query.paymentDate.$lte = new Date(endDate)
          }

          const payments = await Payment.find(query).sort({ paymentDate: -1 })
          res.status(200).json({ payments })
        }
      } catch (error) {
        console.error('Payment GET error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break

    case 'POST':
      try {
        const paymentData = req.body
        
        // Generate transaction ID
        const transactionId = generateTransactionId(paymentData.transactionType)
        
        // Create accounting entries
        const accountingEntries = createAccountingEntries(
          paymentData.transactionType,
          paymentData.entityModel,
          paymentData.amount,
          paymentData.description
        )

        const payment = new Payment({
          ...paymentData,
          transactionId,
          ...accountingEntries,
          paymentDate: new Date(paymentData.paymentDate)
        })

        await payment.save()
        res.status(201).json(payment)
      } catch (error) {
        console.error('Payment POST error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break

    case 'PUT':
      try {
        const { id } = req.query
        const updateData = req.body

        if (updateData.amount) {
          // Recalculate accounting entries if amount changes
          const accountingEntries = createAccountingEntries(
            updateData.transactionType,
            updateData.entityModel,
            updateData.amount,
            updateData.description
          )
          updateData.debitAmount = accountingEntries.debitAmount
          updateData.creditAmount = accountingEntries.creditAmount
        }

        const payment = await Payment.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        )

        if (!payment) {
          return res.status(404).json({ message: 'Payment not found' })
        }

        res.status(200).json(payment)
      } catch (error) {
        console.error('Payment PUT error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break

    case 'DELETE':
      try {
        const { id } = req.query
        const payment = await Payment.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        )

        if (!payment) {
          return res.status(404).json({ message: 'Payment not found' })
        }

        res.status(200).json({ message: 'Payment deleted successfully' })
      } catch (error) {
        console.error('Payment DELETE error:', error)
        res.status(500).json({ message: 'Server error' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
} 