// Default purchase policy. In a real deployment this would be an admin-editable
// singleton document in Mongo (see PolicyConfig model) — this module reads
// that document if present and falls back to these defaults otherwise.

export const DEFAULT_POLICY_CONFIG = {
  confirmationRequired: true,
  maximumAmountPaise: Number(process.env.POLICY_MAX_ITEM_AMOUNT_PAISE || 10_000_00), // ₹10,000 per line item
  maximumOrderAmountPaise: Number(process.env.POLICY_MAX_ORDER_AMOUNT_PAISE || 25_000_00), // ₹25,000 per order
  maximumQuantity: Number(process.env.POLICY_MAX_QUANTITY_PER_ITEM || 10),
  allowedCategories: null, // null = all catalog categories allowed
  dailySpendingLimitPaise: process.env.POLICY_DAILY_SPENDING_LIMIT_PAISE
    ? Number(process.env.POLICY_DAILY_SPENDING_LIMIT_PAISE)
    : null,
};

export async function getActivePolicyConfig() {
  // Lazy import to avoid a hard circular dependency at module load time.
  const { default: PolicyConfig } = await import('../models/PolicyConfig.js');
  const stored = await PolicyConfig.findOne({ singleton: 'default' }).lean();
  if (!stored) return DEFAULT_POLICY_CONFIG;
  return {
    confirmationRequired: stored.confirmationRequired,
    maximumAmountPaise: stored.maximumAmountPaise,
    maximumOrderAmountPaise: stored.maximumOrderAmountPaise,
    maximumQuantity: stored.maximumQuantity,
    allowedCategories: stored.allowedCategories?.length ? stored.allowedCategories : null,
    dailySpendingLimitPaise: stored.dailySpendingLimitPaise ?? null,
  };
}
