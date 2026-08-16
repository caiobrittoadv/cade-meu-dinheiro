import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreateSpaceDto } from "./dto/create-space.dto";

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSpaceDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const space = await tx.financialSpace.create({
        data: {
          name: dto.name,
          type: dto.type ?? "PERSONAL",
          ownerUserId: userId,
        },
      });

      await tx.spaceMember.create({
        data: {
          spaceId: space.id,
          userId,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return space;
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.financialSpace.findMany({
      where: { members: { some: { userId } } },
    });
  }

  findById(spaceId: string) {
    return this.prisma.financialSpace.findUnique({ where: { id: spaceId } });
  }

  /** Fonte única de verdade do isolamento por Financial Space (Documento 09, E06). */
  isMember(spaceId: string, userId: string) {
    return this.prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId, userId } },
    });
  }
}
