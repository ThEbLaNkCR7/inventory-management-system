import mongoose from "mongoose"

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  status: { type: String, default: "active" },
  address: { type: String, trim: true },
  orders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrder: { type: Date },
}, { timestamps: true })

export default mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema) 