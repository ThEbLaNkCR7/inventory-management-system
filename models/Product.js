import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hsCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: undefined,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    stockType: {
      type: String,
      enum: ["new", "old"],
      default: "new",
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    netWeight: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
productSchema.index({ name: "text", hsCode: "text", description: "text" })
productSchema.index({ category: 1 })
productSchema.index({ stockQuantity: 1 })

// Virtual for stock status
productSchema.virtual("stockStatus").get(function () {
  if (this.stockQuantity <= 0) return "out_of_stock"
  if (this.stockQuantity <= this.lowStockThreshold) return "low_stock"
  return "in_stock"
})

// Update stock type based on last restocked date
productSchema.pre("save", function (next) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  if (this.lastRestocked && this.lastRestocked < thirtyDaysAgo) {
    this.stockType = "old"
  } else {
    this.stockType = "new"
  }

  // Handle empty HS Code - set to undefined to avoid unique constraint issues
  if (!this.hsCode || this.hsCode === "" || this.hsCode === null || this.hsCode.trim() === "") {
    this.hsCode = undefined
  } else {
    // Ensure HS Code is properly formatted
    this.hsCode = this.hsCode.trim().toUpperCase()
  }

  next()
})

export default mongoose.models.Product || mongoose.model("Product", productSchema) 