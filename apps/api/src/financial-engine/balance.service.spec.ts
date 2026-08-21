import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("BalanceService", () => {
  let service: BalanceService;
  // Mock manual do PrismaService, mesmo padrão usado em accounts/categories/transactions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      account: { findFirst: jest.fn() },
      transaction: { findMany: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [BalanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(BalanceService);
  });

  it("consulta a conta combinando id + spaceId no where (isolamento explícito)", async () => {
    prisma.account.findFirst.mockResolvedValue({
      id: "acc-1",
      spaceId: "space-A",
      initialBalance: { toString: () => "1000.00" },
    });
    prisma.transaction.findMany.mockResolvedValue([]);

    await service.getAccountBalance("space-A", "acc-1");

    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { id: "acc-1", spaceId: "space-A" },
    });
  });

  it("busca transactions filtrando por spaceId + accountId (isolamento explícito)", async () => {
    prisma.account.findFirst.mockResolvedValue({
      id: "acc-1",
      spaceId: "space-A",
      initialBalance: { toString: () => "1000.00" },
    });
    prisma.transaction.findMany.mockResolvedValue([]);

    await service.getAccountBalance("space-A", "acc-1");

    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { spaceId: "space-A", accountId: "acc-1" } }),
    );
  });

  it("CRÍTICO — NotFoundException se a conta pertence a outro Financial Space", async () => {
    prisma.account.findFirst.mockResolvedValue(null);

    await expect(service.getAccountBalance("space-B", "acc-do-space-A")).rejects.toBeInstanceOf(
      NotFoundException,
    );

    // Sem conta válida, não deveria nem consultar transactions.
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it("delega o cálculo ao financial-domain e retorna o saldo calculado", async () => {
    prisma.account.findFirst.mockResolvedValue({
      id: "acc-1",
      spaceId: "space-A",
      initialBalance: { toString: () => "1000.00" },
    });
    prisma.transaction.findMany.mockResolvedValue([
      {
        type: "INCOME",
        status: "CONFIRMED",
        amount: { toString: () => "500.00" },
        accountId: "acc-1",
      },
      {
        type: "EXPENSE",
        status: "CONFIRMED",
        amount: { toString: () => "200.00" },
        accountId: "acc-1",
      },
      {
        type: "INCOME",
        status: "PENDING",
        amount: { toString: () => "9999.00" },
        accountId: "acc-1",
      },
    ]);

    const result = await service.getAccountBalance("space-A", "acc-1");

    // 1000 + 500 - 200 = 1300 (PENDING ignorada pelo domínio)
    expect(result).toEqual({
      accountId: "acc-1",
      spaceId: "space-A",
      initialBalance: "1000.00",
      currentBalance: "1300.00",
    });
  });

  it("CRÍTICO — transaction de outro Financial Space não entra no cálculo (mesmo se vazasse na query)", async () => {
    prisma.account.findFirst.mockResolvedValue({
      id: "acc-1",
      spaceId: "space-A",
      initialBalance: { toString: () => "1000.00" },
    });
    // Simula um bug hipotético na query que retornasse uma transaction de
    // outra conta — o domínio deve filtrar por accountId de qualquer forma.
    prisma.transaction.findMany.mockResolvedValue([
      {
        type: "INCOME",
        status: "CONFIRMED",
        amount: { toString: () => "9999.00" },
        accountId: "acc-de-outro-space",
      },
    ]);

    const result = await service.getAccountBalance("space-A", "acc-1");

    expect(result.currentBalance).toBe("1000.00");
  });
});
