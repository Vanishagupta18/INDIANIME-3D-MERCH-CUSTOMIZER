import { simulationProvider } from './simulationProvider.js'
import { cashfreeProvider } from './cashfreeProvider.js'

const providers = {
  simulation: simulationProvider,
  cashfree: cashfreeProvider
}

/**
 * Selects the active payment provider from PAYMENT_PROVIDER env var.
 * Defaults to 'simulation' so the app runs demo-ready with zero setup.
 * @returns {import('./provider.js').PaymentProvider}
 */
export function getPaymentProvider() {
  const name = process.env.PAYMENT_PROVIDER || 'simulation'
  const provider = providers[name]
  if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER '${name}'. Valid options: ${Object.keys(providers).join(', ')}`)
  }
  return provider
}
