import crypto from 'crypto'

/**
 * A self-contained "payment provider" for demos — no account, no API keys,
 * no network calls. It exists so the checkout flow can be demonstrated
 * end-to-end without depending on a third-party sandbox being reachable.
 *
 * IMPORTANT / honest limitation: because there is no real external party to
 * verify against, this provider trusts the outcome the caller reports
 * ('success' | 'failure'). That is fine for a demo, but it is why:
 *   - this provider is only selectable when PAYMENT_PROVIDER=simulation
 *     (never the default in a real deployment), and
 *   - the verify endpoint is still gated behind order-ownership auth,
 *     an order-status guard (can't "pay" a cancelled or already-paid order),
 *     and full audit logging — the same guards a real provider needs.
 * A real gateway (see cashfreeProvider.js) replaces the trust boundary with
 * cryptographic signature verification instead of removing these guards.
 */

/** @type {import('./provider.js').PaymentProvider} */
export const simulationProvider = {
  name: 'simulation',

  async createPayment({ orderId, amountPaise }) {
    const providerOrderId = `sim_${orderId}_${crypto.randomBytes(6).toString('hex')}`
    return {
      providerOrderId,
      clientConfig: {
        mode: 'simulation',
        providerOrderId,
        amountPaise,
        message: 'Demo payment — no real money moves. Choose an outcome on the checkout screen.'
      }
    }
  },

  async verifyPayment({ providerOrderId, payload }) {
    const outcome = payload?.outcome
    if (outcome === 'success') {
      return {
        verified: true,
        providerPaymentId: `sim_pay_${crypto.randomBytes(6).toString('hex')}`
      }
    }
    return {
      verified: false,
      failureReason: outcome === 'failure' ? 'Simulated failure selected by demo user' : 'Missing or invalid simulated outcome'
    }
  }
}
