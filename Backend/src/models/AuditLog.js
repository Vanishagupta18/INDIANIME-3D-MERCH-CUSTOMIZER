import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  correlationId: { type: String, required: true, index: true }, // ties together every event for one order
  eventType: {
    type: String,
    required: true,
    enum: [
      'order.created',
      'order.policy_blocked',
      'order.stock_reserved',
      'order.stock_reservation_failed',
      'payment.attempt_created',
      'payment.verified',
      'payment.verification_failed',
      'order.paid',
      'order.cancelled',
      'order.status_changed',
      'ai.intent_extracted',
      'ai.catalog_searched',
      'ai.recommendation_returned',
      'ai.proposal_created'
    ]
  },
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String
  },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  policyVersion: Number,
  decision: {
    allowed: Boolean,
    reasons: [String],
    checks: [String]
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true })

// Audit rows are append-only by convention: no update/delete routes exist for this model.
export default mongoose.model('AuditLog', auditLogSchema)
