import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Ties a client-generated key to one order so a retried/duplicated request
  // (e.g. a double-click or a network retry) can never create two orders.
  idempotencyKey: { type: String, index: true, sparse: true },
  items: [{
    // Required for a catalog item, absent for a custom (isCustom) item —
    // custom items are made-to-order and have no Product document.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: function () { return !this.isCustom }
    },
    isCustom: { type: Boolean, default: false },
    // Sanitized output of computeCustomItemPrice — fabric/printSide/size/color/designCount only.
    // Never raw client input, and never actual artwork pixel data (see customPricing.js scope note).
    customConfig: mongoose.Schema.Types.Mixed,
    name: String,
    image: String,
    price: Number,
    size: String,
    quantity: { type: Number, required: true, min: 1 }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cashfree', 'simulation', 'cod'],
    default: 'simulation'
  },
  paymentProvider: { type: String, enum: ['simulation', 'cashfree'] },
  paymentProviderOrderId: { type: String },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String
  },
  // Snapshot of the policy decision made at order-creation time, so a later
  // policy config change never silently rewrites the history of an order.
  policyDecision: {
    allowed: Boolean,
    checks: [String],
    version: Number
  },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  // Inventory reservation lifecycle (see orderService.js releaseReservation):
  // stock is decremented once at creation and stays reserved through both
  // payment_pending AND payment_failed (a failed payment does not free the
  // item — only an explicit cancel or an expired payment window does).
  // This flag makes that release idempotent: it can only ever happen once.
  reservationReleased: { type: Boolean, default: false },
  paymentWindowExpiresAt: { type: Date },
  // How this order originated — lets the audit trail and admin view
  // distinguish a manually-built cart from an AI-assisted purchase.
  source: { type: String, enum: ['direct', 'ai_agent'], default: 'direct' },
  status: {
    type: String,
    enum: ['payment_pending', 'payment_failed', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'payment_pending'
  },
  deliveredAt: Date
}, { timestamps: true })

// Prevents two orders from ever sharing the same idempotency key for the same user.
orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true } } })

export default mongoose.model('Order', orderSchema)