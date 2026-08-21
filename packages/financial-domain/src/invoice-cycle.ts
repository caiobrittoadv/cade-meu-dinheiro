// Ciclo de fatura de cartão (Documento 06, Seções 16-20).
// Puro: sem NestJS/Prisma/HTTP. Datas em UTC para evitar deriva de fuso.

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

function buildDateString(year: number, monthIndex0: number, day: number): string {
  const clampedDay = Math.min(day, daysInMonth(year, monthIndex0));
  return new Date(Date.UTC(year, monthIndex0, clampedDay)).toISOString().slice(0, 10);
}

export interface InvoiceCycleInput {
  purchaseDate: string;
  closingDay: number;
  dueDay: number;
}

export interface InvoiceCycleResult {
  referenceMonth: string;
  closingDate: string;
  dueDate: string;
}

/**
 * Determina a qual fatura (mês de referência, fechamento, vencimento) uma
 * compra pertence, a partir do dia de fechamento do cartão.
 *
 * Regra: se o dia da compra for <= closingDay, a compra entra na fatura do
 * mês corrente; caso contrário, entra na fatura do mês seguinte (Documento
 * 06, Seção 18-19 — fatura aberta aceita compras até o fechamento).
 */
export function resolveInvoiceCycle(input: InvoiceCycleInput): InvoiceCycleResult {
  const purchase = new Date(input.purchaseDate);
  const purchaseYear = purchase.getUTCFullYear();
  const purchaseMonth = purchase.getUTCMonth();
  const purchaseDay = purchase.getUTCDate();

  let refYear = purchaseYear;
  let refMonth = purchaseMonth;

  if (purchaseDay > input.closingDay) {
    refMonth += 1;
    if (refMonth > 11) {
      refMonth = 0;
      refYear += 1;
    }
  }

  const referenceMonth = buildDateString(refYear, refMonth, 1);
  const closingDate = buildDateString(refYear, refMonth, input.closingDay);

  // Vencimento sempre após o fechamento: se dueDay <= closingDay, o
  // vencimento cai necessariamente no mês seguinte ao fechamento.
  let dueYear = refYear;
  let dueMonth = refMonth;
  if (input.dueDay <= input.closingDay) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }
  const dueDate = buildDateString(dueYear, dueMonth, input.dueDay);

  return { referenceMonth, closingDate, dueDate };
}

export function isPastDate(dateIso: string, now: Date = new Date()): boolean {
  return new Date(dateIso).getTime() < now.getTime();
}
