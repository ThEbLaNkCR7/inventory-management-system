import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  // Basic payment info
  transactionId: { type: String, required: true, unique: true },
  transactionType: { 
    type: String, 
    enum: ["Purchase", "Sale", "Expense", "Income"], 
    required: true 
  },
  
  // Entity information
  entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityModel' },
  entityName: { type: String, required: true }, // Supplier or Client name
  entityModel: { 
    type: String, 
    enum: ['Supplier', 'Client'], 
    required: true 
  },
  
  // Accounting entries
  debitAccount: { 
    type: String, 
    enum: ['Accounts Payable', 'Accounts Receivable', 'Cash', 'Bank', 'Expenses', 'Revenue'],
    required: true 
  },
  creditAccount: { 
    type: String, 
    enum: ['Accounts Payable', 'Accounts Receivable', 'Cash', 'Bank', 'Expenses', 'Revenue'],
    required: true 
  },
  debitAmount: { type: Number, required: true },
  creditAmount: { type: Number, required: true },
  
  // Transaction details
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["Cash", "Bank Transfer", "Check", "Credit Card", "Digital Payment"],
    required: true 
  },
  
  // Reference information
  referenceNumber: { type: String },
  invoiceNumber: { type: String },
  description: { type: String, required: true },
  notes: { type: String },
  
  // User tracking
  paidBy: { type: String, required: true },
  recordedBy: { type: String, required: true },
  
  // Status and audit
  status: { 
    type: String, 
    enum: ["Pending", "Completed", "Cancelled", "Reversed"],
    default: "Completed"
  },
  isReversed: { type: Boolean, default: false },
  reversedDate: { type: Date },
  reversedBy: { type: String },
  reversalReason: { type: String },
  
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: true 
})

// Index for efficient queries
paymentSchema.index({ entityId: 1, entityModel: 1, paymentDate: -1 })
paymentSchema.index({ transactionType: 1, paymentDate: -1 })
paymentSchema.index({ status: 1 })

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema) 