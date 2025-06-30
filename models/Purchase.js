import mongoose from "mongoose"

const purchaseSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  supplier: { type: String, required: true },
  supplierType: { type: String, enum: ["Individual", "Company"], default: "Company" },
  quantityPurchased: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema) 