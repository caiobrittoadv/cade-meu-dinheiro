// Conceitos e regras do Motor Financeiro (Documento 06).
// Núcleo (E10): cálculo de saldo por conta e saldo consolidado.
export { calculateAccountBalance, calculateConsolidatedBalance } from "./balance";
export type { BalanceAccountInput, BalanceTransactionInput } from "./balance";
export { toCents, fromCents } from "./money";

// Avançado (E11.1): cartão, ciclo de fatura e comprometimento de limite.
export { resolveInvoiceCycle, isPastDate } from "./invoice-cycle";
export type { InvoiceCycleInput, InvoiceCycleResult } from "./invoice-cycle";
export { calculateInvoiceAmounts, resolveInvoiceStatus, calculateCardLimit } from "./invoice";
export type { InvoiceTransactionInput, InvoiceAmounts, InvoiceStatusInput, CardLimitResult } from "./invoice";
