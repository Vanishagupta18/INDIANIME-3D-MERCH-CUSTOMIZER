/**
 * Every payment provider implements this shape. Nothing in orderService.js
 * should ever import razorpay/cashfree/simulation directly — always go
 * through payments/index.js so swapping providers is a one-line env change.
 *
 * @typedef {Object} CreatePaymentResult
 * @property {string} providerOrderId
 * @property {Object} clientConfig  Data the frontend needs to open the checkout widget
 *
 * @typedef {Object} VerifyPaymentResult
 * @property {boolean} verified
 * @property {string} [providerPaymentId]
 * @property {string} [failureReason]
 *
 * @typedef {Object} PaymentProvider
 * @property {string} name
 * @property {(args: {orderId: string, amountPaise: number, currency: string}) => Promise<CreatePaymentResult>} createPayment
 * @property {(args: {providerOrderId: string, payload: Object}) => Promise<VerifyPaymentResult>} verifyPayment
 */

export {}
