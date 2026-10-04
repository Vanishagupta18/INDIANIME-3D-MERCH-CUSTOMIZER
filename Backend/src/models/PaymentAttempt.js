import mongoose from 'mongoose'

const paymentAttemptSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  provider: { type: String, enum: ['simulation', 'cashfree'], required: true },
  // Provider-side identifiers — kept distinct on purpose:
  providerOrderId: { type: String },   // the order/session id the provider issued
  providerPaymentId: { type: String }, // the specific payment id, set once a payment is attempted
  amountPaise: { type: Number, required: true },
  status: {
    type: String,
    enum: ['created', 'pending', 'verified', 'failed'],
    default: 'created'
  },
  verificationPayload: mongoose.Schema.Types.Mixed, // raw provider callback/response, for audit
  failureReason: String
}, { timestamps: true })

export default mongoose.model('PaymentAttempt', paymentAttemptSchema)
