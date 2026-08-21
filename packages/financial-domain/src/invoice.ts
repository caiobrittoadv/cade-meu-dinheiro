// Regras de fatura de cartão (Documento 06, Seções 15-23 + Invariante 4).
//
// Distinção compra vs. pagamento usa apenas os campos já existentes em
// Transaction: uma compra tem accountId nulo (não afeta saldo bancário —
// Regra crítica 1); um pagamento tem accountId preenchido (reduz saldo
// bancário via o mesmo mecanismo do E10) e categoryId nulo (não é despesa
// de categoria — Regra crítica 2 / Documento 06 §21). Nenhum campo novo,
// nenhuma convenção fora do schema existente.

import { fromCents, toCents } from "./money";
import { isPastDate } from "./invoice-cycle";

export interface InvoiceTransactionInput {
  amount: string;
  accountId: string | null;
}

export interface InvoiceAmounts {
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
}

/**
 * Total da fatura, valor pago e saldo em aberto — a partir apenas das
 * transactions CONFIRMED vinculadas a ela (compras: accountId nulo;
 * pagamentos: accountId preenchido).
 */
export function calculateInvoiceAmounts(transactions: InvoiceTransactionInput[]): InvoiceAmounts {
  let totalCents = 0n;
  let paidCents = 0n;

  for (const transaction of transactions) {
    const cents = toCents(transaction.amount);
    if (transaction.accountId === null) {
      totalCents += cents;
    } else {
      paidCents += cents;
    }
  }

  return {
    totalAmount: fromCents(totalCents),
    paidAmount: fromCents(paidCents),
    remainingAmount: fromCents(totalCents - paidCents),
  };
}

export interface InvoiceStatusInput {
  currentStatus: string;
  closingDate: string;
  dueDate: string;
  totalAmount: string;
  remainingAmount: string;
  now?: Date;
}

/**
 * Deriva o status da fatura a partir do saldo em aberto e das datas de
 * ciclo — nunca confiar em um status persistido desatualizado.
 * CANCELLED é terminal (nunca recalculado automaticamente).
 *
 * PAID só se aplica quando há (ou houve) algum valor devido e ele foi
 * totalmente quitado — totalAmount 0 (fatura ainda sem nenhuma compra) não
 * é "paga", é OPEN, mesmo com remainingAmount também 0.
 */
export function resolveInvoiceStatus(input: InvoiceStatusInput): string {
  if (input.currentStatus === "CANCELLED") {
    return "CANCELLED";
  }

  const now = input.now ?? new Date();
  const totalCents = toCents(input.totalAmount);
  const remainingCents = toCents(input.remainingAmount);

  if (totalCents > 0n && remainingCents <= 0n) {
    return "PAID";
  }

  if (isPastDate(input.dueDate, now)) {
    return "OVERDUE";
  }

  // "Fechada" a partir do próprio dia de fechamento (inclusive), não só
  // estritamente depois dele.
  if (now.getTime() >= new Date(input.closingDate).getTime()) {
    return "CLOSED";
  }

  return "OPEN";
}

export interface CardLimitResult {
  creditLimit: string;
  committedAmount: string;
  availableLimit: string;
}

/**
 * Limite comprometido/disponível do cartão (Documento 06, Seções 39-40),
 * limitado ao que é calculável nesta fase: soma do saldo em aberto das
 * faturas não pagas/canceladas. Não inclui parcelas futuras (E11.2) nem
 * estornos (E11.4) — ver relatório de implementação do E11.1.
 */
export function calculateCardLimit(creditLimit: string, outstandingInvoiceAmounts: string[]): CardLimitResult {
  let committedCents = 0n;
  for (const amount of outstandingInvoiceAmounts) {
    committedCents += toCents(amount);
  }

  const limitCents = toCents(creditLimit);

  return {
    creditLimit,
    committedAmount: fromCents(committedCents),
    availableLimit: fromCents(limitCents - committedCents),
  };
}
