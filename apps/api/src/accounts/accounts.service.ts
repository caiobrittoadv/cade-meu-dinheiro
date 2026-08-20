import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(spaceId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        spaceId,
        name: dto.name,
        type: dto.type,
        institutionName: dto.institutionName,
        institutionCode: dto.institutionCode,
        initialBalance: dto.initialBalance,
        currency: dto.currency,
      },
    });
  }

  findAllForSpace(spaceId: string) {
    return this.prisma.account.findMany({ where: { spaceId } });
  }

  async findOne(spaceId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, spaceId },
    });

    if (!account) {
      throw new NotFoundException("Conta não encontrada neste Financial Space.");
    }

    return account;
  }

  async update(spaceId: string, accountId: string, dto: UpdateAccountDto) {
    // updateMany (em vez de update) porque o where combina id + spaceId:
    // isolamento explícito, nunca dependente apenas do guard de rota.
    const result = await this.prisma.account.updateMany({
      where: { id: accountId, spaceId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException("Conta não encontrada neste Financial Space.");
    }

    return this.findOne(spaceId, accountId);
  }
}
