import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(spaceId: string, dto: CreateCardDto) {
    return this.prisma.creditCard.create({
      data: {
        spaceId,
        name: dto.name,
        institutionName: dto.institutionName,
        institutionCode: dto.institutionCode,
        lastFourDigits: dto.lastFourDigits,
        creditLimit: dto.creditLimit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
      },
    });
  }

  findAllForSpace(spaceId: string) {
    return this.prisma.creditCard.findMany({ where: { spaceId } });
  }

  async findOne(spaceId: string, cardId: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id: cardId, spaceId },
    });

    if (!card) {
      throw new NotFoundException("Cartão não encontrado neste Financial Space.");
    }

    return card;
  }

  async update(spaceId: string, cardId: string, dto: UpdateCardDto) {
    // updateMany (em vez de update) porque o where combina id + spaceId:
    // isolamento explícito, nunca dependente apenas do guard de rota.
    const result = await this.prisma.creditCard.updateMany({
      where: { id: cardId, spaceId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException("Cartão não encontrado neste Financial Space.");
    }

    return this.findOne(spaceId, cardId);
  }
}
