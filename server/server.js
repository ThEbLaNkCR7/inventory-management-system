const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const batchRoutes = require("./routes/batches")
const purchaseRoutes = require("./routes/purchases")
const saleRoutes = require("./routes/sales")
const clientRoutes = require("./routes/clients")
const supplierRoutes = require("./routes/suppliers")
const approvalRoutes = require("./routes/approvals")
const reportRoutes = require("./routes/reports")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Check if MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.log("⚠️  MONGODB_URI not found in environment variables")
  console.log("📝 Please create a .env file in the server directory with your MongoDB URI")
  console.log("📋 Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database")
}

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/batches", batchRoutes)
app.use("/api/purchases", purchaseRoutes)
app.use("/api/sales", saleRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/approvals", approvalRoutes)
app.use("/api/reports", reportRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}`)
})
