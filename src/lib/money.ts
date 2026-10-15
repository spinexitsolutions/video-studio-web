export function formatMoney(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }
}

export function invoiceTotals(inv: { items: { qty: number; rate: number }[]; taxPercent: number; discount: number }) {
  const subtotal = (inv.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const discount = Math.min(subtotal, Number(inv.discount) || 0);
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * (Number(inv.taxPercent) || 0)) / 100;
  return { subtotal, discount, tax, total: Math.round((taxable + tax) * 100) / 100 };
}
