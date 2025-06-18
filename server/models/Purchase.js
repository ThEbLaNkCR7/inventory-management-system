const mongoose = require("mongoose")

const purchaseSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    quantityPurchased: {
      type: Number,
      required: true,
      min: 1,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    totalAmount: {
      type: Number,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate total amount before saving
purchaseSchema.pre("save", function (next) {
  this.totalAmount = this.quantityPurchased * this.purchasePrice
  next()
})

// Index for better search and reporting
purchaseSchema.index({ purchaseDate: 1 })
purchaseSchema.index({ supplier: 1 })
purchaseSchema.index({ productId: 1 })

module.exports = mongoose.model("Purchase", purchaseSchema)
