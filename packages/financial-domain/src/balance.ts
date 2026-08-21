// Núcleo do Financial Engine (Documento 06 + Documento 09, Épico E10).
//
// Regra do saldo da conta (Documento 06, Seção 4):
//   Saldo inicial + receitas confirmadas - despesas confirmadas
//   + entradas de transferências - saídas de transferências
//
// Os termos de transferência são omitidos nesta fase: TRANSFER está fora
// do escopo do E09/E10 (decisão registrada), portanto sempre valem zero.
//
// Este módulo não depende de NestJS, Prisma ou HTTP — é testável
// isoladamente, conforme exigido pela arquitetura (Documento 08, Seção 35).

import { fromCents, toCents } from "./money";

export type BalanceTransactionType = "INCOME" | "EXPENSE" | string;
export type BalanceTransactionStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | string;

export interface BalanceTransactionInput {
  type: BalanceTransactionType;
  status: BalanceTransactionStatus;
  amount: string;
  accountId: string | null;
}

export interface BalanceAccountInput {
  id: string;
  initialBalance: string;
}

/**
 * Saldo de uma conta específica (Documento 06, Seção 4).
 *
 * Só entram no cálculo: transactions CONFIRMED, do tipo INCOME ou EXPENSE,
 * vinculadas a esta accountId. PENDING e CANCELLED nunca entram
 * (Invariante 2, Documento 06). Transactions sem accountId (null) ou de
 * outra conta não afetam este saldo.
 */
export function calculateAccountBalance(
  initialBalance: string,
  accountId: string,
  transactions: BalanceTransactionInput[],
): string {
  let cents = toCents(initialBalance);

  for (const transaction of transactions) {
    if (transaction.accountId !== accountId) continue;
    if (transaction.status !== "CONFIRMED") continue;

    if (transaction.type === "INCOME") {
      cents += toCents(transaction.amount);
    } else if (transaction.type === "EXPENSE") {
      cents -= toCents(transaction.amount);
    }
    // Qualquer outro type (ex.: TRANSFER) é ignorado neste núcleo — fora do
    // escopo do E10, estruturalmente não deveria existir ainda.
  }

  return fromCents(cents);
}

/**
 * Saldo consolidado do Financial Space (Documento 06, Seção 5):
 * soma do saldo atual de todas as contas monetárias do space.
 *
 * Não inclui limite de cartão, parcelas futuras, metas ou valores
 * projetados — nenhum desses conceitos existe ainda no núcleo (E10).
 */
export function calculateConsolidatedBalance(
  accounts: BalanceAccountInput[],
  transactions: BalanceTransactionInput[],
): string {
  let totalCents = 0n;

  for (const account of accounts) {
    const accountBalance = calculateAccountBalance(account.initialBalance, account.id, transactions);
    totalCents += toCents(accountBalance);
  }

  return fromCents(totalCents);
}
