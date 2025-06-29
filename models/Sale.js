import mongoose from "mongoose"

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  client: { type: String, required: true },
  clientType: { type: String, enum: ["Individual", "Company"], default: "Company" },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  saleDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema) 