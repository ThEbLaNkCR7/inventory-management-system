const mongoose = require("mongoose")

const approvalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["product", "sale", "purchase", "client", "supplier", "batch"],
      required: true,
    },
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
    },
    originalData: {
      type: mongoose.Schema.Types.Mixed,
    },
    proposedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
approvalSchema.index({ status: 1 })
approvalSchema.index({ type: 1 })
approvalSchema.index({ requestedBy: 1 })
approvalSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Approval", approvalSchema)
