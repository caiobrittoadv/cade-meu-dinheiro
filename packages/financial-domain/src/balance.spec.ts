import { describe, expect, it } from "vitest";
import { calculateAccountBalance, calculateConsolidatedBalance } from "./balance";

describe("calculateAccountBalance", () => {
  it("retorna o saldo inicial quando não há transactions", () => {
    expect(calculateAccountBalance("1000.00", "acc-1", [])).toBe("1000.00");
  });

  it("INCOME confirmada soma ao saldo", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "500.00", accountId: "acc-1" },
    ]);
    expect(balance).toBe("1500.00");
  });

  it("EXPENSE confirmada subtrai do saldo", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "EXPENSE", status: "CONFIRMED", amount: "300.00", accountId: "acc-1" },
    ]);
    expect(balance).toBe("700.00");
  });

  it("combina múltiplas receitas e despesas corretamente", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "500.00", accountId: "acc-1" },
      { type: "EXPENSE", status: "CONFIRMED", amount: "200.00", accountId: "acc-1" },
      { type: "INCOME", status: "CONFIRMED", amount: "50.00", accountId: "acc-1" },
      { type: "EXPENSE", status: "CONFIRMED", amount: "1000.00", accountId: "acc-1" },
    ]);
    // 1000 + 500 - 200 + 50 - 1000 = 350
    expect(balance).toBe("350.00");
  });

  it("CRÍTICO — PENDING é ignorada no cálculo", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "INCOME", status: "PENDING", amount: "5000.00", accountId: "acc-1" },
    ]);
    expect(balance).toBe("1000.00");
  });

  it("CRÍTICO — CANCELLED é ignorada no cálculo", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "EXPENSE", status: "CANCELLED", amount: "5000.00", accountId: "acc-1" },
    ]);
    expect(balance).toBe("1000.00");
  });

  it("CRÍTICO — transaction sem accountId (null) não afeta o saldo da conta", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "5000.00", accountId: null },
    ]);
    expect(balance).toBe("1000.00");
  });

  it("transaction de outra conta não afeta o saldo desta conta", () => {
    const balance = calculateAccountBalance("1000.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "5000.00", accountId: "acc-2" },
    ]);
    expect(balance).toBe("1000.00");
  });

  it("saldo negativo é válido quando despesas superam saldo inicial + receitas", () => {
    const balance = calculateAccountBalance("100.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "50.00", accountId: "acc-1" },
      { type: "EXPENSE", status: "CONFIRMED", amount: "300.00", accountId: "acc-1" },
    ]);
    // 100 + 50 - 300 = -150
    expect(balance).toBe("-150.00");
  });

  it("CRÍTICO — precisão Decimal: soma 0.10 + 0.20 sem erro de ponto flutuante", () => {
    // Em float, 0.1 + 0.2 = 0.30000000000000004. Este teste garante que a
    // aritmética em centavos (BigInt) não sofre esse problema.
    const balance = calculateAccountBalance("0.00", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "0.10", accountId: "acc-1" },
      { type: "INCOME", status: "CONFIRMED", amount: "0.20", accountId: "acc-1" },
    ]);
    expect(balance).toBe("0.30");
  });

  it("precisão Decimal: valores grandes com centavos não perdem precisão", () => {
    const balance = calculateAccountBalance("999999.99", "acc-1", [
      { type: "INCOME", status: "CONFIRMED", amount: "0.01", accountId: "acc-1" },
    ]);
    expect(balance).toBe("1000000.00");
  });
});

describe("calculateConsolidatedBalance", () => {
  it("soma o saldo atual de todas as contas do space", () => {
    const accounts = [
      { id: "acc-1", initialBalance: "1000.00" },
      { id: "acc-2", initialBalance: "500.00" },
    ];
    const transactions = [
      { type: "INCOME", status: "CONFIRMED", amount: "100.00", accountId: "acc-1" },
      { type: "EXPENSE", status: "CONFIRMED", amount: "50.00", accountId: "acc-2" },
    ];

    // acc-1: 1000 + 100 = 1100; acc-2: 500 - 50 = 450; total = 1550
    expect(calculateConsolidatedBalance(accounts, transactions)).toBe("1550.00");
  });

  it("retorna 0.00 quando não há contas", () => {
    expect(calculateConsolidatedBalance([], [])).toBe("0.00");
  });

  it("CRÍTICO — não inclui transactions PENDING/CANCELLED nem de outras contas", () => {
    const accounts = [{ id: "acc-1", initialBalance: "100.00" }];
    const transactions = [
      { type: "INCOME", status: "PENDING", amount: "9999.00", accountId: "acc-1" },
      { type: "INCOME", status: "CANCELLED", amount: "9999.00", accountId: "acc-1" },
      { type: "INCOME", status: "CONFIRMED", amount: "9999.00", accountId: "acc-fora-do-space" },
    ];

    expect(calculateConsolidatedBalance(accounts, transactions)).toBe("100.00");
  });
});
