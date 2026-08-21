import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CardsService } from "./cards.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("CardsService", () => {
  let service: CardsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      creditCard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [CardsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(CardsService);
  });

  it("cria cartão associado ao spaceId recebido", async () => {
    prisma.creditCard.create.mockResolvedValue({ id: "card-1" });

    await service.create("space-A", {
      name: "Nubank",
      lastFourDigits: "1234",
      creditLimit: "5000.00",
      closingDay: 10,
      dueDay: 17,
    });

    expect(prisma.creditCard.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ spaceId: "space-A" }) }),
    );
  });

  it("lista filtrando exclusivamente pelo spaceId", async () => {
    prisma.creditCard.findMany.mockResolvedValue([]);
    await service.findAllForSpace("space-A");
    expect(prisma.creditCard.findMany).toHaveBeenCalledWith({ where: { spaceId: "space-A" } });
  });

  it("consulta combinando id + spaceId no where (isolamento explícito)", async () => {
    prisma.creditCard.findFirst.mockResolvedValue({ id: "card-1", spaceId: "space-A" });
    await service.findOne("space-A", "card-1");
    expect(prisma.creditCard.findFirst).toHaveBeenCalledWith({
      where: { id: "card-1", spaceId: "space-A" },
    });
  });

  it("CRÍTICO — NotFoundException se o cartão pertence a outro Financial Space", async () => {
    prisma.creditCard.findFirst.mockResolvedValue(null);
    await expect(service.findOne("space-B", "card-do-space-A")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("atualiza usando updateMany com where { id, spaceId }", async () => {
    prisma.creditCard.updateMany.mockResolvedValue({ count: 1 });
    prisma.creditCard.findFirst.mockResolvedValue({ id: "card-1", spaceId: "space-A" });

    await service.update("space-A", "card-1", { name: "Novo nome" });

    expect(prisma.creditCard.updateMany).toHaveBeenCalledWith({
      where: { id: "card-1", spaceId: "space-A" },
      data: { name: "Novo nome" },
    });
  });

  it("CRÍTICO — NotFoundException ao atualizar cartão de outro Financial Space", async () => {
    prisma.creditCard.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.update("space-B", "card-do-space-A", { name: "Tentativa indevida" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
