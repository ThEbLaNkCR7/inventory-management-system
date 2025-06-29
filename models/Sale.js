import mongoose from "mongoose"

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  client: { type: String, required: true },
  clientType: { type: String, enum: ["Individual", "Company"], default: "Company" },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  saleDate: { type: Date, required: true },
  // Payment tracking fields
  totalAmount: { type: Number, required: true }, // quantitySold * salePrice
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Partial", "Paid", "Overdue"], 
    default: "Pending" 
  },
  dueDate: { type: Date },
  paymentTerms: { type: String, default: "Immediate" }, // Immediate, 30 days, 60 days, etc.
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema) 