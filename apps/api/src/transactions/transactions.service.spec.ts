import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("TransactionsService", () => {
  let service: TransactionsService;
  // Mock manual do PrismaService, mesmo padrão usado em accounts/categories.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      account: { findFirst: jest.fn() },
      category: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [TransactionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(TransactionsService);
  });

  describe("create", () => {
    it("cria transação associada ao spaceId e createdBy corretos, com sourceType MANUAL", async () => {
      prisma.transaction.create.mockResolvedValue({ id: "tx-1", spaceId: "space-A" });

      await service.create("space-A", "user-1", {
        type: "EXPENSE",
        description: "Mercado",
        amount: "150.30",
        transactionDate: "2026-01-10",
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            spaceId: "space-A",
            createdBy: "user-1",
            sourceType: "MANUAL",
            amount: "150.30",
          }),
        }),
      );
    });

    it("persiste amount como string (sem conversão para float)", async () => {
      prisma.transaction.create.mockResolvedValue({ id: "tx-1" });

      await service.create("space-A", "user-1", {
        type: "INCOME",
        description: "Salário",
        amount: "5000.00",
        transactionDate: "2026-01-05",
      });

      const callArgs = prisma.transaction.create.mock.calls[0][0];
      expect(typeof callArgs.data.amount).toBe("string");
    });

    it("registra AuditLog CREATE após criar a transação", async () => {
      const created = { id: "tx-1", spaceId: "space-A" };
      prisma.transaction.create.mockResolvedValue(created);

      await service.create("space-A", "user-1", {
        type: "EXPENSE",
        description: "Mercado",
        amount: "10.00",
        transactionDate: "2026-01-10",
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            spaceId: "space-A",
            userId: "user-1",
            entityType: "Transaction",
            entityId: "tx-1",
            action: "CREATE",
          }),
        }),
      );
    });

    it("aceita accountId/categoryId quando pertencem ao mesmo space", async () => {
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });
      prisma.category.findFirst.mockResolvedValue({ id: "cat-1", spaceId: "space-A" });
      prisma.transaction.create.mockResolvedValue({ id: "tx-1" });

      await service.create("space-A", "user-1", {
        type: "EXPENSE",
        description: "Mercado",
        amount: "10.00",
        transactionDate: "2026-01-10",
        accountId: "acc-1",
        categoryId: "cat-1",
      });

      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita accountId de outro Financial Space", async () => {
      prisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.create("space-B", "user-1", {
          type: "EXPENSE",
          description: "Mercado",
          amount: "10.00",
          transactionDate: "2026-01-10",
          accountId: "acc-do-space-A",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita categoryId de outro Financial Space", async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create("space-B", "user-1", {
          type: "EXPENSE",
          description: "Mercado",
          amount: "10.00",
          transactionDate: "2026-01-10",
          categoryId: "cat-do-space-A",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe("findAllForSpace", () => {
    it("lista filtrando exclusivamente pelo spaceId", async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.findAllForSpace("space-A");

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({ where: { spaceId: "space-A" } });
    });
  });

  describe("findOne", () => {
    it("consulta combinando id + spaceId no where (isolamento explícito)", async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: "tx-1", spaceId: "space-A" });

      await service.findOne("space-A", "tx-1");

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: "tx-1", spaceId: "space-A" },
      });
    });

    it("CRÍTICO — NotFoundException se a transação pertence a outro Financial Space", async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne("space-B", "tx-do-space-A")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("PENDING pode ser editada livremente, incluindo campos financeiros", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "PENDING",
      });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "tx-1", "user-1", { amount: "200.00" });

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: "tx-1", spaceId: "space-A" },
        data: { amount: "200.00" },
      });
    });

    it("PENDING pode transicionar para CONFIRMED via PATCH", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "PENDING",
      });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "tx-1", "user-1", { status: "CONFIRMED" });

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: "tx-1", spaceId: "space-A" },
        data: { status: "CONFIRMED" },
      });
    });

    it("CONFIRMED permite alterar description/notes (campos não financeiros)", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "CONFIRMED",
      });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "tx-1", "user-1", { notes: "observação adicional" });

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: "tx-1", spaceId: "space-A" },
        data: { notes: "observação adicional" },
      });
    });

    it("CRÍTICO — CONFIRMED bloqueia alteração de amount/type/accountId/categoryId/transactionDate", async () => {
      const financialFields: Array<Record<string, unknown>> = [
        { amount: "999.00" },
        { type: "INCOME" },
        { accountId: "acc-2" },
        { categoryId: "cat-2" },
        { transactionDate: "2026-02-01" },
      ];

      for (const patch of financialFields) {
        prisma.transaction.findFirst.mockResolvedValue({
          id: "tx-1",
          spaceId: "space-A",
          status: "CONFIRMED",
        });

        await expect(service.update("space-A", "tx-1", "user-1", patch)).rejects.toBeInstanceOf(
          ForbiddenException,
        );
      }

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — CONFIRMED bloqueia alteração de status via PATCH (deve usar /cancel)", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "CONFIRMED",
      });

      await expect(
        service.update("space-A", "tx-1", "user-1", { status: "PENDING" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — CANCELLED bloqueia qualquer alteração", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "CANCELLED",
      });

      await expect(
        service.update("space-A", "tx-1", "user-1", { notes: "tentativa indevida" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita accountId de outro Financial Space em transação PENDING", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "PENDING",
      });
      prisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.update("space-A", "tx-1", "user-1", { accountId: "acc-de-outro-space" }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — NotFoundException ao tentar atualizar transação de outro Financial Space", async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.update("space-B", "tx-do-space-A", "user-1", { notes: "x" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("registra AuditLog UPDATE após alterar", async () => {
      prisma.transaction.findFirst
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "PENDING", amount: "10.00" })
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "PENDING", amount: "20.00" });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "tx-1", "user-1", { amount: "20.00" });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entityType: "Transaction",
            entityId: "tx-1",
            action: "UPDATE",
          }),
        }),
      );
    });
  });

  describe("cancel", () => {
    it("cancela uma transação PENDING/CONFIRMED alterando status para CANCELLED", async () => {
      prisma.transaction.findFirst
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "CONFIRMED" })
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "CANCELLED" });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.cancel("space-A", "tx-1", "user-1");

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: "tx-1", spaceId: "space-A" },
        data: { status: "CANCELLED" },
      });
    });

    it("registra o cancelamento como AuditLog action UPDATE (AuditAction não possui CANCEL)", async () => {
      prisma.transaction.findFirst
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "PENDING" })
        .mockResolvedValueOnce({ id: "tx-1", spaceId: "space-A", status: "CANCELLED" });
      prisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.cancel("space-A", "tx-1", "user-1");

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "UPDATE", entityId: "tx-1" }),
        }),
      );
    });

    it("CRÍTICO — rejeita cancelar uma transação já CANCELLED", async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: "tx-1",
        spaceId: "space-A",
        status: "CANCELLED",
      });

      await expect(service.cancel("space-A", "tx-1", "user-1")).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — NotFoundException ao tentar cancelar transação de outro Financial Space", async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.cancel("space-B", "tx-do-space-A", "user-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
