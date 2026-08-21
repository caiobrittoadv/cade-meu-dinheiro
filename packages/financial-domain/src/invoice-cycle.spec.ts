import { describe, expect, it } from "vitest";
import { isPastDate, resolveInvoiceCycle } from "./invoice-cycle";

describe("resolveInvoiceCycle", () => {
  it("compra antes ou no dia de fechamento entra na fatura do mês corrente", () => {
    const result = resolveInvoiceCycle({
      purchaseDate: "2026-03-10",
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.referenceMonth).toBe("2026-03-01");
    expect(result.closingDate).toBe("2026-03-10");
    expect(result.dueDate).toBe("2026-03-17");
  });

  it("compra após o fechamento entra na fatura do mês seguinte", () => {
    const result = resolveInvoiceCycle({
      purchaseDate: "2026-03-11",
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.referenceMonth).toBe("2026-04-01");
    expect(result.closingDate).toBe("2026-04-10");
    expect(result.dueDate).toBe("2026-04-17");
  });

  it("CRÍTICO — vencimento cai no mês seguinte ao fechamento quando dueDay <= closingDay", () => {
    const result = resolveInvoiceCycle({
      purchaseDate: "2026-03-05",
      closingDay: 25,
      dueDay: 5,
    });
    expect(result.closingDate).toBe("2026-03-25");
    expect(result.dueDate).toBe("2026-04-05");
  });

  it("compra em dezembro após fechamento vira fatura de janeiro do ano seguinte", () => {
    const result = resolveInvoiceCycle({
      purchaseDate: "2026-12-15",
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.referenceMonth).toBe("2027-01-01");
  });

  it("closingDay maior que os dias do mês é ajustado para o último dia (ex.: fevereiro)", () => {
    const result = resolveInvoiceCycle({
      purchaseDate: "2026-02-15",
      closingDay: 31,
      dueDay: 7,
    });
    expect(result.closingDate).toBe("2026-02-28");
  });
});

describe("isPastDate", () => {
  it("retorna true quando a data é anterior a now", () => {
    expect(isPastDate("2026-01-01", new Date("2026-06-01T00:00:00Z"))).toBe(true);
  });

  it("retorna false quando a data é futura", () => {
    expect(isPastDate("2026-12-01", new Date("2026-06-01T00:00:00Z"))).toBe(false);
  });
});
