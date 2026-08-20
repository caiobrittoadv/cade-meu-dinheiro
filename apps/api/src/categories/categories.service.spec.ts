import { Test } from "@nestjs/testing";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("CategoriesService", () => {
  let service: CategoriesService;
  // Mock manual do PrismaService, mesmo padrão usado em accounts.service.spec.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      category: {
        create: jest.fn(),
        createManyAndReturn: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(CategoriesService);
  });

  describe("create", () => {
    it("cria categoria associada ao spaceId recebido", async () => {
      prisma.category.create.mockResolvedValue({ id: "cat-1" });

      await service.create("space-A", { name: "Alimentação" });

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: "space-A", name: "Alimentação" }),
        }),
      );
    });

    it("não permite que o body defina isSystem (campo inexistente no DTO)", async () => {
      prisma.category.create.mockResolvedValue({ id: "cat-1" });

      await service.create("space-A", { name: "Categoria" });

      const callArgs = prisma.category.create.mock.calls[0][0];
      expect(callArgs.data.isSystem).toBeUndefined();
    });

    it("aceita parentId quando a categoria-pai pertence ao mesmo space", async () => {
      prisma.category.findFirst.mockResolvedValue({ id: "cat-pai", spaceId: "space-A" });
      prisma.category.create.mockResolvedValue({ id: "cat-filha" });

      await service.create("space-A", { name: "Sub", parentId: "cat-pai" });

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: "cat-pai", spaceId: "space-A" },
      });
      expect(prisma.category.create).toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita parentId de categoria pertencente a outro Financial Space", async () => {
      // parentId informado, mas findFirst({where: {id, spaceId}}) não
      // encontra nada porque a categoria-pai está em outro space.
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.create("space-B", { name: "Sub", parentId: "cat-do-space-A" }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe("findAllForSpace", () => {
    it("lista filtrando exclusivamente pelo spaceId", async () => {
      prisma.category.findMany.mockResolvedValue([]);

      await service.findAllForSpace("space-A");

      expect(prisma.category.findMany).toHaveBeenCalledWith({ where: { spaceId: "space-A" } });
    });
  });

  describe("findOne", () => {
    it("consulta combinando id + spaceId no where (isolamento explícito)", async () => {
      prisma.category.findFirst.mockResolvedValue({ id: "cat-1", spaceId: "space-A" });

      await service.findOne("space-A", "cat-1");

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { id: "cat-1", spaceId: "space-A" },
      });
    });

    it("CRÍTICO — NotFoundException se a categoria pertence a outro Financial Space", async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne("space-B", "cat-do-space-A")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("atualiza usando updateMany com where { id, spaceId }", async () => {
      prisma.category.findFirst.mockResolvedValue({ id: "cat-1", spaceId: "space-A", isSystem: false });
      prisma.category.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "cat-1", { name: "Novo nome" });

      expect(prisma.category.updateMany).toHaveBeenCalledWith({
        where: { id: "cat-1", spaceId: "space-A" },
        data: { name: "Novo nome" },
      });
    });

    it("permite arquivamento via status: ARCHIVED em categoria não-sistema", async () => {
      prisma.category.findFirst.mockResolvedValue({ id: "cat-1", spaceId: "space-A", isSystem: false });
      prisma.category.updateMany.mockResolvedValue({ count: 1 });

      await service.update("space-A", "cat-1", { status: "ARCHIVED" });

      expect(prisma.category.updateMany).toHaveBeenCalledWith({
        where: { id: "cat-1", spaceId: "space-A" },
        data: { status: "ARCHIVED" },
      });
    });

    it("CRÍTICO — bloqueia qualquer alteração em categoria isSystem: true", async () => {
      prisma.category.findFirst.mockResolvedValue({ id: "cat-1", spaceId: "space-A", isSystem: true });

      await expect(
        service.update("space-A", "cat-1", { name: "Tentativa indevida" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.category.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — rejeita alteração de parentId para categoria de outro Financial Space", async () => {
      prisma.category.findFirst
        .mockResolvedValueOnce({ id: "cat-1", spaceId: "space-A", isSystem: false }) // findOne inicial
        .mockResolvedValueOnce(null); // validação do novo parentId

      await expect(
        service.update("space-A", "cat-1", { parentId: "cat-de-outro-space" }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.category.updateMany).not.toHaveBeenCalled();
    });

    it("CRÍTICO — NotFoundException ao tentar atualizar categoria de outro Financial Space", async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update("space-B", "cat-do-space-A", { name: "Tentativa indevida" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("initializeDefaultCategories", () => {
    it("cria as categorias padrão com isSystem: true associadas ao spaceId", async () => {
      prisma.category.createManyAndReturn.mockResolvedValue([{ id: "cat-outros" }]);

      await service.initializeDefaultCategories("space-A");

      const callArgs = prisma.category.createManyAndReturn.mock.calls[0][0];
      expect(callArgs.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ spaceId: "space-A", isSystem: true, name: "Outros" }),
        ]),
      );
    });
  });
});
