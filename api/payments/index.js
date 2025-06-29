import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Payment from "@/models/Payment"
import Purchase from "@/models/Purchase"
import Sale from "@/models/Sale"

export async function GET() {
  try {
    await connectDB()
    const payments = await Payment.find({ isActive: true }).sort({ paymentDate: -1 })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    
    const { transactionId, transactionType, amount, paymentDate, paymentMethod, referenceNumber, notes, paidBy, recordedBy } = body
    
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
    
    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
} 