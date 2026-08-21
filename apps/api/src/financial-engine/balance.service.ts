import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateAccountBalance } from "@cade-meu-dinheiro/financial-domain";
import { PrismaService } from "../shared/prisma/prisma.service";

/**
 * Camada fina do E10 (Documento 09, Épico E10 + Documento 08, Seção 13:
 * Controller → Application Service → Domain Service → Repository → Database).
 *
 * Esta classe NÃO reimplementa nenhuma regra financeira: ela apenas busca
 * Account/Transaction via Prisma, garante isolamento por Financial Space, e
 * delega o cálculo inteiramente a @cade-meu-dinheiro/financial-domain — a
 * única fonte de verdade da regra de saldo.
 */
@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccountBalance(spaceId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, spaceId },
    });

    if (!account) {
      throw new NotFoundException("Conta não encontrada neste Financial Space.");
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { spaceId, accountId },
      select: { type: true, status: true, amount: true, accountId: true },
    });

    const currentBalance = calculateAccountBalance(
      account.initialBalance.toString(),
      accountId,
      transactions.map((transaction) => ({
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount.toString(),
        accountId: transaction.accountId,
      })),
    );

    return {
      accountId: account.id,
      spaceId: account.spaceId,
      initialBalance: account.initialBalance.toString(),
      currentBalance,
    };
  }
}
