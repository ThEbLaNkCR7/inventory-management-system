const express = require("express")
const Product = require("../models/Product")
const Sale = require("../models/Sale")
const Purchase = require("../models/Purchase")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get dashboard statistics
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const [totalProducts, lowStockProducts, totalSales, totalPurchases, recentSales, recentPurchases] =
      await Promise.all([
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({
          isActive: true,
          $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
        }),
        Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Purchase.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Sale.find().sort({ saleDate: -1 }).limit(5).populate("productId", "name"),
        Purchase.find().sort({ purchaseDate: -1 }).limit(5).populate("productId", "name"),
      ])

    const totalSalesAmount = totalSales[0]?.total || 0
    const totalPurchasesAmount = totalPurchases[0]?.total || 0
    const profit = totalSalesAmount - totalPurchasesAmount

    res.json({
      totalProducts,
      lowStockProducts,
      totalSales: totalSalesAmount,
      totalPurchases: totalPurchasesAmount,
      profit,
      recentSales,
      recentPurchases,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get sales vs purchases data
router.get("/sales-vs-purchases", adminAuth, async (req, res) => {
  try {
    const { period = "monthly" } = req.query

    let groupBy
    switch (period) {
      case "daily":
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }
        break
      case "weekly":
        groupBy = { $dateToString: { format: "%Y-W%U", date: "$saleDate" } }
        break
      case "monthly":
      default:
        groupBy = { $dateToString: { format: "%Y-%m", date: "$saleDate" } }
        break
    }

    const [salesData, purchasesData] = await Promise.all([
      Sale.aggregate([
        {
          $group: {
            _id: groupBy,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Purchase.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$purchaseDate" } },
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    res.json({ salesData, purchasesData })
  } catch (error) {
    console.error("Get sales vs purchases error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get stock distribution by category
router.get("/stock-distribution", adminAuth, async (req, res) => {
  try {
    const distribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: { $multiply: ["$stockQuantity", "$unitPrice"] } },
          totalQuantity: { $sum: "$stockQuantity" },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
    ])

    res.json(distribution)
  } catch (error) {
    console.error("Get stock distribution error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get top selling products
router.get("/top-products", adminAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$quantitySold" },
          totalRevenue: { $sum: "$totalAmount" },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: Number.parseInt(limit) },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ])

    res.json(topProducts)
  } catch (error) {
    console.error("Get top products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get low stock products
router.get("/low-stock", adminAuth, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
    }).sort({ stockQuantity: 1 })

    res.json(lowStockProducts)
  } catch (error) {
    console.error("Get low stock products error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get profit/loss analysis
router.get("/profit-analysis", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const [salesAnalysis, purchaseAnalysis] = await Promise.all([
      Sale.aggregate([
        ...(Object.keys(dateFilter).length ? [{ $match: { saleDate: dateFilter } }] : []),
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalTransactions: { $sum: 1 },
            avgTransactionValue: { $avg: "$totalAmount" },
          },
        },
      ]),
      Purchase.aggregate([
        ...(Object.keys(dateFilter).length ? [{ $match: { purchaseDate: dateFilter } }] : []),
        {
          $group: {
            _id: null,
            totalCost: { $sum: "$totalAmount" },
            totalTransactions: { $sum: 1 },
            avgTransactionValue: { $avg: "$totalAmount" },
          },
        },
      ]),
    ])

    const sales = salesAnalysis[0] || { totalRevenue: 0, totalTransactions: 0, avgTransactionValue: 0 }
    const purchases = purchaseAnalysis[0] || { totalCost: 0, totalTransactions: 0, avgTransactionValue: 0 }

    const profit = sales.totalRevenue - purchases.totalCost
    const profitMargin = sales.totalRevenue > 0 ? (profit / sales.totalRevenue) * 100 : 0

    res.json({
      sales,
      purchases,
      profit,
      profitMargin,
    })
  } catch (error) {
    console.error("Get profit analysis error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
