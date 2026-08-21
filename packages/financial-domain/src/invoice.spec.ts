import { describe, expect, it } from "vitest";
import { calculateCardLimit, calculateInvoiceAmounts, resolveInvoiceStatus } from "./invoice";

describe("calculateInvoiceAmounts", () => {
  it("soma compras (accountId nulo) como totalAmount", () => {
    const amounts = calculateInvoiceAmounts([
      { amount: "100.00", accountId: null },
      { amount: "50.00", accountId: null },
    ]);
    expect(amounts.totalAmount).toBe("150.00");
    expect(amounts.paidAmount).toBe("0.00");
    expect(amounts.remainingAmount).toBe("150.00");
  });

  it("soma pagamentos (accountId preenchido) como paidAmount, nunca como totalAmount", () => {
    const amounts = calculateInvoiceAmounts([
      { amount: "100.00", accountId: null },
      { amount: "60.00", accountId: "acc-1" },
    ]);
    expect(amounts.totalAmount).toBe("100.00");
    expect(amounts.paidAmount).toBe("60.00");
    expect(amounts.remainingAmount).toBe("40.00");
  });

  it("CRÍTICO — pagamento integral zera o remainingAmount", () => {
    const amounts = calculateInvoiceAmounts([
      { amount: "500.00", accountId: null },
      { amount: "500.00", accountId: "acc-1" },
    ]);
    expect(amounts.remainingAmount).toBe("0.00");
  });

  it("fatura sem nenhuma transaction retorna tudo zerado", () => {
    expect(calculateInvoiceAmounts([])).toEqual({
      totalAmount: "0.00",
      paidAmount: "0.00",
      remainingAmount: "0.00",
    });
  });
});

describe("resolveInvoiceStatus", () => {
  const now = new Date("2026-03-15T00:00:00Z");

  it("CANCELLED é terminal, nunca recalculado", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "CANCELLED",
        closingDate: "2026-01-01",
        dueDate: "2026-01-10",
        totalAmount: "100.00",
        remainingAmount: "100.00",
        now,
      }),
    ).toBe("CANCELLED");
  });

  it("CRÍTICO — remainingAmount <= 0 sempre resulta em PAID, mesmo vencida", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "OVERDUE",
        closingDate: "2026-01-01",
        dueDate: "2026-01-10",
        totalAmount: "500.00",
        remainingAmount: "0.00",
        now,
      }),
    ).toBe("PAID");
  });

  it("CRÍTICO — totalAmount 0 (fatura sem nenhuma compra) NUNCA é PAID, mesmo com remainingAmount 0", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "OPEN",
        closingDate: "2026-04-10",
        dueDate: "2026-04-20",
        totalAmount: "0.00",
        remainingAmount: "0.00",
        now,
      }),
    ).toBe("OPEN");
  });

  it("OVERDUE quando passou do vencimento e ainda há saldo devedor", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "OPEN",
        closingDate: "2026-01-01",
        dueDate: "2026-01-10",
        totalAmount: "100.00",
        remainingAmount: "100.00",
        now,
      }),
    ).toBe("OVERDUE");
  });

  it("CLOSED quando passou do fechamento mas ainda não do vencimento", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "OPEN",
        closingDate: "2026-03-10",
        dueDate: "2026-03-20",
        totalAmount: "100.00",
        remainingAmount: "100.00",
        now,
      }),
    ).toBe("CLOSED");
  });

  it("OPEN quando ainda não chegou o fechamento", () => {
    expect(
      resolveInvoiceStatus({
        currentStatus: "OPEN",
        closingDate: "2026-04-10",
        dueDate: "2026-04-20",
        totalAmount: "100.00",
        remainingAmount: "100.00",
        now,
      }),
    ).toBe("OPEN");
  });
});

describe("calculateCardLimit", () => {
  it("disponível = limite total - comprometido", () => {
    const result = calculateCardLimit("5000.00", ["1000.00", "1500.00"]);
    expect(result).toEqual({
      creditLimit: "5000.00",
      committedAmount: "2500.00",
      availableLimit: "2500.00",
    });
  });

  it("sem faturas em aberto, disponível = limite total", () => {
    expect(calculateCardLimit("5000.00", [])).toEqual({
      creditLimit: "5000.00",
      committedAmount: "0.00",
      availableLimit: "5000.00",
    });
  });
});
