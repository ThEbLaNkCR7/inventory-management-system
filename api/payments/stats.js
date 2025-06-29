import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Purchase from "@/models/Purchase"
import Sale from "@/models/Sale"
import Payment from "@/models/Payment"

export async function GET() {
  try {
    await connectDB()
    
    // Get all active purchases and sales
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
    
    return NextResponse.json({
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payment statistics" }, { status: 500 })
  }
} 