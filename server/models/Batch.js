const mongoose = require("mongoose")

const batchItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  expiryDate: {
    type: Date,
  },
})

const batchSchema = new mongoose.Schema(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    items: [batchItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "received", "processed"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate totals before saving
batchSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0)
  this.totalValue = this.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
  next()
})

// Index for better search performance
batchSchema.index({ batchNumber: 1 })
batchSchema.index({ supplier: 1 })
batchSchema.index({ status: 1 })
batchSchema.index({ arrivalDate: 1 })

module.exports = mongoose.model("Batch", batchSchema)
