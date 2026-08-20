import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("AccountsService", () => {
  let service: AccountsService;
  // Mock manual do PrismaService, mesmo padrão usado em auth.service.spec.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      account: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [AccountsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(AccountsService);
  });

  describe("create", () => {
    it("persiste initialBalance como string (sem conversão para float/number)", async () => {
      prisma.account.create.mockResolvedValue({ id: "acc-1" });

      await service.create("space-A", {
        name: "Carteira",
        initialBalance: "1234.56",
      });

      const callArgs = prisma.account.create.mock.calls[0][0];
      expect(callArgs.data.initialBalance).toBe("1234.56");
      expect(typeof callArgs.data.initialBalance).toBe("string");
      expect(callArgs.data.spaceId).toBe("space-A");
    });

    it("associa a conta ao spaceId recebido, nunca a um spaceId do body", async () => {
      prisma.account.create.mockResolvedValue({ id: "acc-1" });

      await service.create("space-A", { name: "Conta Corrente" });

      expect(prisma.account.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ spaceId: "space-A" }) }),
      );
    });
  });

  describe("findAllForSpace", () => {
    it("lista contas filtrando exclusivamente pelo spaceId", async () => {
      prisma.account.findMany.mockResolvedValue([]);

      await service.findAllForSpace("space-A");

      expect(prisma.account.findMany).toHaveBeenCalledWith({ where: { spaceId: "space-A" } });
    });
  });

  describe("findOne", () => {
    it("consulta combinando id + spaceId no where (isolamento explícito)", async () => {
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A" });

      await service.findOne("space-A", "acc-1");

      expect(prisma.account.findFirst).toHaveBeenCalledWith({
        where: { id: "acc-1", spaceId: "space-A" },
      });
    });

    it("CRÍTICO — lança NotFoundException se a conta pertence a outro Financial Space", async () => {
      // findFirst com where { id, spaceId } já não retornaria nada nesse caso;
      // o teste simula exatamente esse resultado do Prisma.
      prisma.account.findFirst.mockResolvedValue(null);

      await expect(service.findOne("space-B", "acc-do-space-A")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("atualiza usando updateMany com where { id, spaceId } (isolamento explícito)", async () => {
      prisma.account.updateMany.mockResolvedValue({ count: 1 });
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A", name: "Novo nome" });

      await service.update("space-A", "acc-1", { name: "Novo nome" });

      expect(prisma.account.updateMany).toHaveBeenCalledWith({
        where: { id: "acc-1", spaceId: "space-A" },
        data: { name: "Novo nome" },
      });
    });

    it("permite arquivamento via status: ARCHIVED", async () => {
      prisma.account.updateMany.mockResolvedValue({ count: 1 });
      prisma.account.findFirst.mockResolvedValue({ id: "acc-1", spaceId: "space-A", status: "ARCHIVED" });

      await service.update("space-A", "acc-1", { status: "ARCHIVED" });

      expect(prisma.account.updateMany).toHaveBeenCalledWith({
        where: { id: "acc-1", spaceId: "space-A" },
        data: { status: "ARCHIVED" },
      });
    });

    it("CRÍTICO — lança NotFoundException ao tentar atualizar conta de outro Financial Space", async () => {
      // count: 0 é o resultado do Prisma quando o where { id, spaceId } não
      // encontra nenhuma linha — ou seja, a conta existe, mas em outro space.
      prisma.account.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.update("space-B", "acc-do-space-A", { name: "Tentativa indevida" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
