import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

// Campos que representam o fato financeiro em si (decisão 6). Uma
// Transaction CONFIRMED não pode ter nenhum destes alterado via PATCH — só
// via cancelamento (status: CANCELLED, endpoint dedicado).
const FINANCIAL_FIELDS = ["amount", "type", "accountId", "categoryId", "transactionDate"] as const;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(spaceId: string, userId: string, dto: CreateTransactionDto) {
    if (dto.accountId) {
      await this.assertAccountInSameSpace(spaceId, dto.accountId);
    }
    if (dto.categoryId) {
      await this.assertCategoryInSameSpace(spaceId, dto.categoryId);
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        spaceId,
        type: dto.type,
        description: dto.description,
        amount: dto.amount,
        transactionDate: dto.transactionDate,
        competenceDate: dto.competenceDate,
        status: dto.status,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        notes: dto.notes,
        sourceType: "MANUAL",
        createdBy: userId,
      },
    });

    await this.recordAudit(spaceId, userId, "CREATE", transaction.id, null, transaction);

    return transaction;
  }

  findAllForSpace(spaceId: string) {
    return this.prisma.transaction.findMany({ where: { spaceId } });
  }

  async findOne(spaceId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, spaceId },
    });

    if (!transaction) {
      throw new NotFoundException("Transação não encontrada neste Financial Space.");
    }

    return transaction;
  }

  async update(spaceId: string, transactionId: string, userId: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(spaceId, transactionId);

    if (existing.status === "CANCELLED") {
      throw new ForbiddenException("Transações canceladas não podem ser alteradas.");
    }

    if (existing.status === "CONFIRMED") {
      const dtoRecord = dto as unknown as Record<string, unknown>;
      const attemptedFinancialChange = FINANCIAL_FIELDS.some((field) => dtoRecord[field] !== undefined);

      if (attemptedFinancialChange) {
        throw new ForbiddenException(
          "Transações confirmadas não podem ter amount, type, accountId, categoryId ou transactionDate alterados. Use o cancelamento.",
        );
      }

      if (dto.status !== undefined) {
        throw new ForbiddenException(
          "Transações confirmadas só podem mudar de status através do cancelamento.",
        );
      }
    }

    if (dto.accountId) {
      await this.assertAccountInSameSpace(spaceId, dto.accountId);
    }
    if (dto.categoryId) {
      await this.assertCategoryInSameSpace(spaceId, dto.categoryId);
    }

    // updateMany (em vez de update) porque o where combina id + spaceId:
    // isolamento explícito, nunca dependente apenas do guard de rota.
    const result = await this.prisma.transaction.updateMany({
      where: { id: transactionId, spaceId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException("Transação não encontrada neste Financial Space.");
    }

    const updated = await this.findOne(spaceId, transactionId);
    await this.recordAudit(spaceId, userId, "UPDATE", transactionId, existing, updated);

    return updated;
  }

  async cancel(spaceId: string, transactionId: string, userId: string) {
    const existing = await this.findOne(spaceId, transactionId);

    if (existing.status === "CANCELLED") {
      throw new BadRequestException("Transação já está cancelada.");
    }

    const result = await this.prisma.transaction.updateMany({
      where: { id: transactionId, spaceId },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      throw new NotFoundException("Transação não encontrada neste Financial Space.");
    }

    const cancelled = await this.findOne(spaceId, transactionId);

    // AuditAction (schema) não possui um valor "CANCEL" e o schema não pode
    // ser alterado nesta etapa. Cancelamento é registrado como UPDATE, já
    // que estruturalmente é uma alteração do campo status — ver relatório
    // de implementação do E09.
    await this.recordAudit(spaceId, userId, "UPDATE", transactionId, existing, cancelled);

    return cancelled;
  }

  private async assertAccountInSameSpace(spaceId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({ where: { id: accountId, spaceId } });
    if (!account) {
      throw new BadRequestException(
        "accountId deve apontar para uma conta existente no mesmo Financial Space.",
      );
    }
  }

  private async assertCategoryInSameSpace(spaceId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({ where: { id: categoryId, spaceId } });
    if (!category) {
      throw new BadRequestException(
        "categoryId deve apontar para uma categoria existente no mesmo Financial Space.",
      );
    }
  }

  private recordAudit(
    spaceId: string,
    userId: string,
    action: AuditAction,
    entityId: string,
    oldData: unknown,
    newData: unknown,
  ) {
    return this.prisma.auditLog.create({
      data: {
        spaceId,
        userId,
        entityType: "Transaction",
        entityId,
        action,
        oldData: this.toJsonValue(oldData),
        newData: this.toJsonValue(newData),
      },
    });
  }

  // Normaliza para JSON puro: Decimal e Date do Prisma não são serializáveis
  // diretamente como Prisma.InputJsonValue.
  private toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
