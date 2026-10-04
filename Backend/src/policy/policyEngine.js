/**
 * Deterministic purchase policy engine.
 *
 * This is intentionally a pure function with no DB or network access —
 * ported from AgentPay's lib/policy/engine.ts. Keeping it pure is what
 * makes it trustworthy: the same input always produces the same
 * decision, and it can be unit-tested without a database.
 *
 * It does NOT decide whether a product exists or what its real price is —
 * that is the caller's job (see services/orderService.js). This engine only
 * evaluates whether an already-verified line item is *allowed* to be
 * purchased under the current policy configuration.
 */

/**
 * @typedef {Object} PolicyLineItemInput
 * @property {number} amountPaise   Unit price in minor currency units (paise)
 * @property {number} quantity
 * @property {string} category
 * @property {number} stock
 * @property {boolean} isActive
 * @property {boolean} userConfirmed
 * @property {boolean} isDuplicateAttempt
 */

/**
 * @typedef {Object} PolicyConfig
 * @property {boolean} confirmationRequired
 * @property {number} maximumAmountPaise   Max total (price * qty) for a single line item
 * @property {number} maximumQuantity      Max quantity per line item
 * @property {string[]|null} allowedCategories  null = all categories allowed
 */

/**
 * @param {PolicyLineItemInput} input
 * @param {PolicyConfig} config
 * @returns {{allowed: boolean, reasons: string[], checks: string[]}}
 */
export function evaluateLineItem(input, config) {
  const {
    amountPaise,
    quantity,
    category,
    stock,
    isActive,
    userConfirmed,
    isDuplicateAttempt,
  } = input;

  const reasons = [];
  const checks = [];

  if (isDuplicateAttempt) {
    checks.push('✗ Duplicate request (idempotency key already used)');
    reasons.push('This request was already processed — the existing order is returned instead of creating a duplicate.');
    return { allowed: false, reasons, checks };
  }
  checks.push('✓ Not a duplicate request');

  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    checks.push('✗ Valid unit price');
    reasons.push('Unit price is missing or not a positive number.');
  } else {
    checks.push('✓ Valid unit price');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    checks.push('✗ Valid quantity');
    reasons.push('Quantity must be a positive whole number.');
  } else {
    checks.push('✓ Valid quantity');
  }

  if (config.confirmationRequired && !userConfirmed) {
    checks.push('✗ User confirmation present');
    reasons.push('Explicit user confirmation is required before payment.');
  } else {
    checks.push('✓ User confirmation present');
  }

  if (!isActive || stock <= 0) {
    checks.push('✗ Product in stock');
    reasons.push('Product is out of stock or no longer active.');
  } else if (Number.isInteger(quantity) && quantity > stock) {
    checks.push('✗ Sufficient stock for requested quantity');
    reasons.push(`Only ${stock} unit(s) left in stock; ${quantity} requested.`);
  } else {
    checks.push('✓ Product in stock');
  }

  if (Number.isInteger(quantity) && quantity > config.maximumQuantity) {
    checks.push('✗ Quantity within limit');
    reasons.push(`Quantity ${quantity} exceeds the maximum allowed quantity of ${config.maximumQuantity} per item.`);
  } else {
    checks.push('✓ Quantity within limit');
  }

  const total = (amountPaise || 0) * (quantity || 0);
  if (total > config.maximumAmountPaise) {
    checks.push('✗ Under spending limit');
    reasons.push(`Line total ₹${(total / 100).toFixed(2)} exceeds the ₹${(config.maximumAmountPaise / 100).toFixed(2)} per-item spending limit.`);
  } else {
    checks.push('✓ Under spending limit');
  }

  if (config.allowedCategories && !config.allowedCategories.includes(category)) {
    checks.push('✗ Product category allowed');
    reasons.push(`Category '${category}' is not in the allowed category list.`);
  } else {
    checks.push('✓ Product category allowed');
  }

  return { allowed: reasons.length === 0, reasons, checks };
}

/**
 * Evaluates every line item in an order plus the order-level total.
 * @param {PolicyLineItemInput[]} lineItems
 * @param {PolicyConfig} config
 * @param {number} orderTotalPaise
 * @param {number} maximumOrderAmountPaise
 */
export function evaluateOrder(lineItems, config, orderTotalPaise, maximumOrderAmountPaise) {
  const perItem = lineItems.map((item) => evaluateLineItem(item, config));
  const reasons = perItem.flatMap((r) => r.reasons);
  const checks = perItem.flatMap((r) => r.checks);

  checks.push(
    orderTotalPaise > maximumOrderAmountPaise
      ? '✗ Under order-level spending limit'
      : '✓ Under order-level spending limit'
  );
  if (orderTotalPaise > maximumOrderAmountPaise) {
    reasons.push(
      `Order total ₹${(orderTotalPaise / 100).toFixed(2)} exceeds the ₹${(maximumOrderAmountPaise / 100).toFixed(2)} order spending limit.`
    );
  }

  return { allowed: reasons.length === 0, reasons, checks };
}
