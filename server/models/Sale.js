const mongoose = require("mongoose")

const saleSchema = new mongoose.Schema(
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
    client: {
      type: String,
      required: true,
      trim: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: 1,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit_card", "bank_transfer", "check"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "overdue"],
      default: "paid",
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
saleSchema.pre("save", function (next) {
  this.totalAmount = this.quantitySold * this.salePrice
  next()
})

// Index for better search and reporting
saleSchema.index({ saleDate: 1 })
saleSchema.index({ client: 1 })
saleSchema.index({ productId: 1 })
saleSchema.index({ paymentStatus: 1 })

module.exports = mongoose.model("Sale", saleSchema)
