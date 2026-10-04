# INDIANIME — Backend Security & Architecture Fixes

This document records what changed when AgentPay's policy/payment engine was
merged into INDIANIME, and why. Read this before an interview — it's the
answer key for "walk me through a technical decision in this project."

## What was broken before

1. **Client-trusted pricing.** `POST /api/orders` accepted `itemsPrice` and
   `totalPrice` directly from the request body. Anyone with browser devtools
   could set their own total.
2. **No payment verification.** Orders were marked paid based on whatever the
   frontend said, not on any provider-confirmed fact.
3. **No stock protection.** Two users could buy the last unit of a product;
   nothing prevented overselling.
4. **No purchase policy.** Nothing stopped an order of unlimited quantity or
   value.
5. **No audit trail.** No record of why an order was allowed, blocked, or
   changed status.
6. **No checkout page existed.** The "Checkout" button in the cart navigated
   straight to `/orders` — there was nothing to click through at all.

## What was added

| Area | File(s) | What it does |
|---|---|---|
| Server-side pricing | `Backend/src/services/pricing.js` | Recomputes price/total from the DB record for every item; client-supplied prices are structurally impossible to use (the request shape doesn't even carry a price field) |
| Policy engine | `Backend/src/policy/policyEngine.js` | Pure, DB-free function (ported from AgentPay) enforcing confirmation, stock, quantity, category, and spending-limit rules |
| Policy config | `Backend/src/models/PolicyConfig.js`, `Backend/src/controllers/policyController.js` | Admin-editable spending/quantity limits, `GET`/`PUT /api/policy` |
| Atomic stock | `Backend/src/services/orderService.js` → `reserveStock()` | Uses `findOneAndUpdate` with a `stock >= quantity` condition — the actual fix for overselling, not just a `stock > 0` check |
| Payment abstraction | `Backend/src/payments/` | `provider.js` (interface), `simulationProvider.js` (free, zero-setup default), `cashfreeProvider.js` (real sandbox gateway) |
| Payment attempts | `Backend/src/models/PaymentAttempt.js` | Separate model so retries/history aren't crammed into one embedded field |
| Audit log | `Backend/src/models/AuditLog.js` | Append-only record of every policy decision and payment event, correlated by order |
| Order state machine | `Backend/src/services/orderService.js` → `ALLOWED_TRANSITIONS` | Rejects any status change not explicitly allowed (e.g. `delivered → paid` is impossible) |
| Idempotency | `Order.idempotencyKey` (unique index) + `Idempotency-Key` header | A retried/duplicated checkout request can never create two orders |
| Checkout UI | `Frontend/src/pages/Checkout/` | The actual missing page — address form → order creation → simulated/real payment → verification |

## How the payment flow works now

1. `POST /api/orders` — server reprices from DB, runs the policy engine,
   atomically reserves stock, creates the order as `payment_pending`, and
   opens a payment attempt with the configured provider.
2. `POST /api/orders/:id/verify-payment` — asks the **provider**, not the
   client, whether payment succeeded. For Cashfree this is a server-to-server
   GET to Cashfree's own API. For the simulation provider, it's still gated
   by order ownership, order-status guards, and audit logging — the same
   trust boundary a real provider needs, just without a third party.
3. On failure, `POST /api/orders/:id/retry-payment` opens a new payment
   attempt without re-touching stock (stock reserved at order creation is
   not released just because a payment attempt failed).

## Running the demo

```bash
cd Backend
cp .env.example .env        # defaults to PAYMENT_PROVIDER=simulation — no keys needed
npm install
npm run dev
```

The simulation provider works immediately with no account setup. To demo a
real gateway instead:

```
PAYMENT_PROVIDER=cashfree
CASHFREE_APP_ID=<from your free sandbox account>
CASHFREE_SECRET_KEY=<from your free sandbox account>
CASHFREE_ENV=sandbox
```

## Tests

```bash
npm install   # installs jest
npm test
```

`src/tests/policyEngine.test.js` and `src/tests/pricing.test.js` cover the
two pure, DB-free modules — 18 test cases including the price-tampering
scenario (a request that claims a different price than the database has
zero effect on the total). These were written and manually verified line
against the actual policy/pricing logic; run `npm test` yourself to confirm
in your environment, since jest wasn't installable in the sandbox this was
authored in (no network access there).

**Not included**, and worth doing next if you have time before applying:
- Integration tests against a real/in-memory MongoDB (`mongodb-memory-server`)
  covering concurrent stock purchases and the full order→payment→paid flow
- Authenticated ownership tests for `/api/orders/:id`
- A webhook-based Cashfree flow (current implementation polls Cashfree's
  order-status API on verify, which works but isn't how a production system
  would usually confirm payment)

## Honest resume framing

Say: *"server-authoritative pricing, atomic stock reservation, and a
policy-gated purchase flow with provider-verified payments."*

Don't say: *"production payment processing"* or *"fully tested"* — the
gaps above are real and an interviewer who reads this file (or the code)
will find them if you claim more than what's here.
