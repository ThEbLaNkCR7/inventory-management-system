import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  // Reference to the transaction (purchase or sale)
  transactionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  transactionType: { type: String, enum: ["Purchase", "Sale"], required: true },
  
  // Payment details
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["Cash", "Bank Transfer", "Check", "Credit Card", "Digital Payment"], 
    default: "Cash" 
  },
  referenceNumber: { type: String }, // Check number, transaction ID, etc.
  notes: { type: String },
  
  // Who made the payment
  paidBy: { type: String, required: true }, // Supplier name for purchases, Client name for sales
  recordedBy: { type: String, required: true }, // User who recorded the payment
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema) 