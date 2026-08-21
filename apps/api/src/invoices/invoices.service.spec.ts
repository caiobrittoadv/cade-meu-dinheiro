import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { PrismaService } from "../shared/prisma/prisma.service";

// Datas seguras (sempre no passado/futuro em relação a "agora") para não
// depender de injeção de relógio no domínio.
const PAST_DATE = "2020-01-01";
const FUTURE_DATE = "2099-01-01";

function decimal(value: string) {
  return { toString: () => value };
}

describe("InvoicesService", () => {
  let service: InvoicesService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      creditCard: { findFirst: jest.fn() },
      invoice: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      transaction: { findMany: jest.fn(), create: jest.fn() },
      account: { findFirst: jest.fn() },
      category: { findFirst: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [InvoicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(InvoicesService);
  });

  function mockOpenCard() {
    prisma.creditCard.findFirst.mockResolvedValue({
      id: "card-1",
      spaceId: "space-A",
      closingDay: 10,
      dueDay: 17,
      creditLimit: decimal("5000.00"),
    });
  }

  function mockOpenInvoice(overrides: Record<string, unknown> = {}) {
    return {
      id: "inv-1",
      creditCardId: "card-1",
      referenceMonth: new Date("2026-03-01"),
      closingDate: new Date(FUTURE_DATE),
      dueDate: new Date(FUTURE_DATE),
      status: "OPEN",
      totalAmount: decimal("0.00"),
      ...overrides,
    };
  }

  describe("registerPurchase", () => {
    it("CRÍTICO — compra nunca recebe accountId (não afeta saldo bancário)", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.create.mockResolvedValue({ id: "tx-1" });

      await service.registerPurchase("space-A", "card-1", "user-1", {
        description: "Mercado",
        amount: "150.00",
        transactionDate: "2026-03-05",
      });

      const callArgs = prisma.transaction.create.mock.calls[0][0];
      expect(callArgs.data.accountId).toBeNull();
      expect(callArgs.data.creditCardId).toBe("card-1");
      expect(callArgs.data.type).toBe("EXPENSE");
    });

    it("cria uma nova fatura quando não existe uma para o ciclo resolvido", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(null);
      prisma.invoice.create.mockResolvedValue(mockOpenInvoice());
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.create.mockResolvedValue({ id: "tx-1" });

      await service.registerPurchase("space-A", "card-1", "user-1", {
        description: "Mercado",
        amount: "150.00",
        transactionDate: "2026-03-05",
      });

      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ creditCardId: "card-1", status: "OPEN" }),
        }),
      );
    });

    it("reutiliza a fatura existente para o mesmo ciclo (não duplica)", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.create.mockResolvedValue({ id: "tx-1" });

      await service.registerPurchase("space-A", "card-1", "user-1", {
        description: "Mercado",
        amount: "150.00",
        transactionDate: "2026-03-05",
      });

      expect(prisma.invoice.create).not.toHaveBeenCalled();
      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita nova compra quando a fatura já está fechada/vencida", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(
        mockOpenInvoice({ closingDate: new Date(PAST_DATE), dueDate: new Date(PAST_DATE) }),
      );
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.invoice.update.mockResolvedValue({});

      await expect(
        service.registerPurchase("space-A", "card-1", "user-1", {
          description: "Compra tardia",
          amount: "50.00",
          transactionDate: "2026-03-05",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita categoryId de outro Financial Space", async () => {
      mockOpenCard();
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.registerPurchase("space-A", "card-1", "user-1", {
          description: "Mercado",
          amount: "150.00",
          transactionDate: "2026-03-05",
          categoryId: "cat-de-outro-space",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it("CRÍTICO — cartão de outro Financial Space é rejeitado", async () => {
      prisma.creditCard.findFirst.mockResolvedValue(null);

      await expect(
        service.registerPurchase("space-B", "card-do-space-A", "user-1", {
          description: "Tentativa indevida",
          amount: "10.00",
          transactionDate: "2026-03-05",
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("registerPayment", () => {
    it("CRÍTICO — pagamento nunca recebe categoryId (não é despesa de categoria)", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: decimal("500.00"), accountId: null }]) // compra existente
        .mockResolvedValueOnce([{ amount: decimal("500.00"), accountId: null }]); // recomputo pós-pagamento
      prisma.transaction.create.mockResolvedValue({ id: "pay-1" });

      await service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
        accountId: "acc-1",
        amount: "500.00",
        transactionDate: "2026-03-15",
      });

      const callArgs = prisma.transaction.create.mock.calls[0][0];
      expect(callArgs.data.categoryId).toBeNull();
      expect(callArgs.data.accountId).toBe("acc-1");
    });

    it("CRÍTICO — pagamento parcial reduz o saldo em aberto sem quitar a fatura", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: decimal("1000.00"), accountId: null }])
        .mockResolvedValueOnce([
          { amount: decimal("1000.00"), accountId: null },
          { amount: decimal("600.00"), accountId: "acc-1" },
        ]);
      prisma.transaction.create.mockResolvedValue({ id: "pay-1" });

      const result = await service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
        accountId: "acc-1",
        amount: "600.00",
        transactionDate: "2026-03-15",
      });

      expect(result.invoice.remainingAmount).toBe("400.00");
      expect(result.invoice.status).not.toBe("PAID");
    });

    it("CRÍTICO — pagamento integral transiciona a fatura para PAID", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: decimal("1000.00"), accountId: null }])
        .mockResolvedValueOnce([
          { amount: decimal("1000.00"), accountId: null },
          { amount: decimal("1000.00"), accountId: "acc-1" },
        ]);
      prisma.transaction.create.mockResolvedValue({ id: "pay-1" });
      prisma.invoice.update.mockResolvedValue({});

      const result = await service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
        accountId: "acc-1",
        amount: "1000.00",
        transactionDate: "2026-03-15",
      });

      expect(result.invoice.status).toBe("PAID");
      expect(result.invoice.remainingAmount).toBe("0.00");
    });

    it("CRÍTICO — não haverá dupla contagem: compra + pagamento integral não geram duas despesas no cálculo de saldo", async () => {
      // A compra tem accountId nulo (não soma no saldo de nenhuma conta —
      // ver E10). O pagamento tem accountId preenchido: é a ÚNICA
      // transaction que efetivamente reduz o saldo bancário, evitando a
      // dupla contagem descrita na Regra crítica 3 / Documento 06 §15.
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: decimal("1000.00"), accountId: null }])
        .mockResolvedValueOnce([
          { amount: decimal("1000.00"), accountId: null },
          { amount: decimal("1000.00"), accountId: "acc-1" },
        ]);
      prisma.transaction.create.mockResolvedValue({ id: "pay-1" });

      await service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
        accountId: "acc-1",
        amount: "1000.00",
        transactionDate: "2026-03-15",
      });

      const paymentData = prisma.transaction.create.mock.calls[0][0].data;
      // Só o pagamento tem accountId preenchido — a compra original (já
      // simulada no mock de findMany) manteve accountId nulo.
      expect(paymentData.accountId).not.toBeNull();
    });

    it("CRÍTICO — rejeita pagamento que excede o saldo em aberto (excedente não pode desaparecer)", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.transaction.findMany.mockResolvedValue([{ amount: decimal("500.00"), accountId: null }]);

      await expect(
        service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
          accountId: "acc-1",
          amount: "999.00",
          transactionDate: "2026-03-15",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita accountId de outro Financial Space", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice());
      prisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
          accountId: "acc-de-outro-space",
          amount: "100.00",
          transactionDate: "2026-03-15",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("CRÍTICO — rejeita pagamento em fatura CANCELLED", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(mockOpenInvoice({ status: "CANCELLED" }));

      await expect(
        service.registerPayment("space-A", "card-1", "inv-1", "user-1", {
          accountId: "acc-1",
          amount: "100.00",
          transactionDate: "2026-03-15",
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("CRÍTICO — fatura de outro Financial Space (via cartão de outro space) é rejeitada", async () => {
      prisma.creditCard.findFirst.mockResolvedValue(null);

      await expect(
        service.registerPayment("space-B", "card-do-space-A", "inv-1", "user-1", {
          accountId: "acc-1",
          amount: "100.00",
          transactionDate: "2026-03-15",
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("findOne / findAllForCard", () => {
    it("CRÍTICO — NotFoundException se a fatura não pertence ao cartão informado", async () => {
      mockOpenCard();
      prisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.findOne("space-A", "card-1", "inv-de-outro-cartao")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it("lista faturas filtrando exclusivamente pelo creditCardId do cartão isolado por space", async () => {
      mockOpenCard();
      prisma.invoice.findMany.mockResolvedValue([]);

      await service.findAllForCard("space-A", "card-1");

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({ where: { creditCardId: "card-1" } });
    });
  });

  describe("getCardLimit", () => {
    it("soma o saldo em aberto das faturas não pagas/canceladas como comprometido", async () => {
      mockOpenCard();
      prisma.invoice.findMany.mockResolvedValue([
        mockOpenInvoice({ id: "inv-1", status: "OPEN" }),
        mockOpenInvoice({ id: "inv-2", status: "PAID" }),
      ]);
      prisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: decimal("1000.00"), accountId: null }]) // inv-1: aberta
        .mockResolvedValueOnce([
          { amount: decimal("500.00"), accountId: null },
          { amount: decimal("500.00"), accountId: "acc-1" },
        ]); // inv-2: paga

      const result = await service.getCardLimit("space-A", "card-1");

      expect(result.committedAmount).toBe("1000.00");
      expect(result.availableLimit).toBe("4000.00");
    });
  });
});
