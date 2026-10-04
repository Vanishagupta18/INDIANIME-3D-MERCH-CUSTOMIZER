/**
 * Cashfree Payment Gateway (Orders API) provider.
 *
 * Requires a free Cashfree merchant sandbox account:
 *   1. Sign up at https://merchant.cashfree.com/merchants/signup
 *   2. Use "Test Mode" — no real money, no activation needed for sandbox keys
 *   3. Get your sandbox App ID + Secret Key from Developers > API Keys
 *   4. Set env vars: PAYMENT_PROVIDER=cashfree, CASHFREE_APP_ID, CASHFREE_SECRET_KEY,
 *      CASHFREE_ENV=sandbox
 *
 * Unlike a client-reported outcome, verifyPayment here makes a server-to-server
 * GET call to Cashfree to read the authoritative order status — this is the
 * fix for the "verification route trusts caller-supplied data" bug found in
 * the AgentPay audit. The frontend never gets to declare a payment successful;
 * only Cashfree's own API response can do that.
 */

const BASE_URL = () =>
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'

function authHeaders() {
  const appId = process.env.CASHFREE_APP_ID
  const secretKey = process.env.CASHFREE_SECRET_KEY
  if (!appId || !secretKey) {
    throw new Error('Cashfree is not configured — set CASHFREE_APP_ID and CASHFREE_SECRET_KEY, or use PAYMENT_PROVIDER=simulation for a free demo.')
  }
  return {
    'Content-Type': 'application/json',
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'x-api-version': '2023-08-01'
  }
}

/** @type {import('./provider.js').PaymentProvider} */
export const cashfreeProvider = {
  name: 'cashfree',

  async createPayment({ orderId, amountPaise, currency = 'INR' }, customer) {
    const res = await fetch(`${BASE_URL()}/orders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        order_id: `cf_${orderId}`,
        order_amount: Number((amountPaise / 100).toFixed(2)),
        order_currency: currency,
        customer_details: {
          customer_id: customer?.id || `guest_${orderId}`,
          customer_email: customer?.email || 'demo@indianime.example',
          customer_phone: customer?.phone || '9999999999'
        }
      })
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`Cashfree order creation failed (${res.status}): ${errBody}`)
    }

    const data = await res.json()
    return {
      providerOrderId: data.order_id,
      clientConfig: {
        mode: 'cashfree',
        paymentSessionId: data.payment_session_id,
        orderId: data.order_id
      }
    }
  },

  async verifyPayment({ providerOrderId }) {
    // Authoritative check: ask Cashfree directly, never trust the client's report.
    const res = await fetch(`${BASE_URL()}/orders/${providerOrderId}/payments`, {
      method: 'GET',
      headers: authHeaders()
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      return { verified: false, failureReason: `Could not reach Cashfree to verify (${res.status}): ${errBody}` }
    }

    const payments = await res.json()
    const successfulPayment = Array.isArray(payments)
      ? payments.find((p) => p.payment_status === 'SUCCESS')
      : null

    if (successfulPayment) {
      return { verified: true, providerPaymentId: String(successfulPayment.cf_payment_id) }
    }
    return { verified: false, failureReason: 'No successful payment found for this order at Cashfree' }
  }
}
