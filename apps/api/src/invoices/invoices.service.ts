import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreditCard, Invoice } from "@prisma/client";
import {
  calculateCardLimit,
  calculateInvoiceAmounts,
  resolveInvoiceCycle,
  resolveInvoiceStatus,
  toCents,
} from "@cade-meu-dinheiro/financial-domain";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";

/**
 * Camada fina do E11.1 (mesmo padrão do BalanceService/E10): busca
 * CreditCard/Invoice/Transaction via Prisma, garante isolamento por
 * Financial Space, e delega toda a regra de cálculo/status a
 * @cade-meu-dinheiro/financial-domain.
 */
@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForCard(spaceId: string, cardId: string) {
    const card = await this.assertCardInSameSpace(spaceId, cardId);
    const invoices = await this.prisma.invoice.findMany({ where: { creditCardId: card.id } });
    return Promise.all(invoices.map((invoice) => this.toInvoiceView(invoice)));
  }

  async findOne(spaceId: string, cardId: string, invoiceId: string) {
    await this.assertCardInSameSpace(spaceId, cardId);
    const invoice = await this.findInvoiceForCard(cardId, invoiceId);
    return this.toInvoiceView(invoice);
  }

  async getCardLimit(spaceId: string, cardId: string) {
    const card = await this.assertCardInSameSpace(spaceId, cardId);
    const invoices = await this.prisma.invoice.findMany({ where: { creditCardId: card.id } });
    const views = await Promise.all(invoices.map((invoice) => this.toInvoiceView(invoice)));

    const outstanding = views
      .filter((view) => view.status !== "PAID" && view.status !== "CANCELLED")
      .map((view) => view.remainingAmount);

    return calculateCardLimit(card.creditLimit.toString(), outstanding);
  }

  async registerPurchase(spaceId: string, cardId: string, userId: string, dto: CreatePurchaseDto) {
    const card = await this.assertCardInSameSpace(spaceId, cardId);

    if (dto.categoryId) {
      await this.assertCategoryInSameSpace(spaceId, dto.categoryId);
    }

    const invoice = await this.resolveOpenInvoiceForPurchase(card, dto.transactionDate);

    const transaction = await this.prisma.transaction.create({
      data: {
        spaceId,
        type: "EXPENSE",
        description: dto.description,
        amount: dto.amount,
        transactionDate: dto.transactionDate,
        status: dto.status,
        categoryId: dto.categoryId,
        creditCardId: card.id,
        invoiceId: invoice.id,
        // Regra crítica 1: compra no cartão nunca afeta saldo bancário.
        accountId: null,
        sourceType: "MANUAL",
        createdBy: userId,
      },
    });

    return transaction;
  }

  async registerPayment(
    spaceId: string,
    cardId: string,
    invoiceId: string,
    userId: string,
    dto: CreatePaymentDto,
  ) {
    await this.assertCardInSameSpace(spaceId, cardId);
    const invoice = await this.findInvoiceForCard(cardId, invoiceId);

    if (invoice.status === "CANCELLED") {
      throw new ForbiddenException("Fatura cancelada não pode receber pagamentos.");
    }

    await this.assertAccountInSameSpace(spaceId, dto.accountId);

    const view = await this.toInvoiceView(invoice);

    // Regra crítica 6: excedente não pode "desaparecer". Como o schema não
    // possui nenhum campo para representar crédito/ajuste, o pagamento que
    // excederia o saldo em aberto é rejeitado em vez de causar perda de
    // valor — ver relatório de implementação do E11.1.
    if (toCents(dto.amount) > toCents(view.remainingAmount)) {
      throw new BadRequestException(
        `O valor do pagamento (${dto.amount}) excede o saldo em aberto da fatura (${view.remainingAmount}). ` +
          "Pagamento com valor superior ao devido não é suportado nesta fase.",
      );
    }

    const payment = await this.prisma.transaction.create({
      data: {
        spaceId,
        type: "EXPENSE",
        description: dto.description ?? "Pagamento de fatura",
        amount: dto.amount,
        transactionDate: dto.transactionDate,
        status: "CONFIRMED",
        // Regra crítica 2: pagamento nunca é despesa de categoria.
        categoryId: null,
        accountId: dto.accountId,
        invoiceId: invoice.id,
        sourceType: "MANUAL",
        createdBy: userId,
      },
    });

    const refreshedInvoice = await this.findInvoiceForCard(cardId, invoiceId);
    const updatedView = await this.toInvoiceView(refreshedInvoice);

    return { payment, invoice: updatedView };
  }

  private async resolveOpenInvoiceForPurchase(card: CreditCard, purchaseDate: string): Promise<Invoice> {
    const cycle = resolveInvoiceCycle({
      purchaseDate,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    });

    let invoice = await this.prisma.invoice.findFirst({
      where: { creditCardId: card.id, referenceMonth: cycle.referenceMonth },
    });

    if (!invoice) {
      invoice = await this.prisma.invoice.create({
        data: {
          creditCardId: card.id,
          referenceMonth: cycle.referenceMonth,
          closingDate: cycle.closingDate,
          dueDate: cycle.dueDate,
          status: "OPEN",
        },
      });
    }

    // Regra crítica 7: após o fechamento, novas compras não entram nela.
    // O status é sempre derivado (nunca confiar no valor persistido).
    const view = await this.toInvoiceView(invoice);
    if (view.status !== "OPEN") {
      throw new BadRequestException(
        `A fatura correspondente a esta data de compra já está ${view.status} e não aceita novos lançamentos.`,
      );
    }

    return invoice;
  }

  private async findInvoiceForCard(cardId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, creditCardId: cardId },
    });

    if (!invoice) {
      throw new NotFoundException("Fatura não encontrada para este cartão.");
    }

    return invoice;
  }

  private async toInvoiceView(invoice: Invoice) {
    const transactions = await this.prisma.transaction.findMany({
      where: { invoiceId: invoice.id, status: "CONFIRMED" },
      select: { amount: true, accountId: true },
    });

    const amounts = calculateInvoiceAmounts(
      transactions.map((transaction) => ({
        amount: transaction.amount.toString(),
        accountId: transaction.accountId,
      })),
    );

    const status = resolveInvoiceStatus({
      currentStatus: invoice.status,
      closingDate: invoice.closingDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      totalAmount: amounts.totalAmount,
      remainingAmount: amounts.remainingAmount,
    });

    // Write-through: mantém o registro persistido razoavelmente sincronizado,
    // mas a resposta da API sempre usa o valor recém-calculado, nunca o
    // persistido cegamente.
    if (status !== invoice.status || amounts.totalAmount !== invoice.totalAmount.toString()) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: status as Invoice["status"], totalAmount: amounts.totalAmount },
      });
    }

    return {
      id: invoice.id,
      creditCardId: invoice.creditCardId,
      referenceMonth: invoice.referenceMonth,
      closingDate: invoice.closingDate,
      dueDate: invoice.dueDate,
      status,
      totalAmount: amounts.totalAmount,
      paidAmount: amounts.paidAmount,
      remainingAmount: amounts.remainingAmount,
    };
  }

  private async assertCardInSameSpace(spaceId: string, cardId: string) {
    const card = await this.prisma.creditCard.findFirst({ where: { id: cardId, spaceId } });
    if (!card) {
      throw new NotFoundException("Cartão não encontrado neste Financial Space.");
    }
    return card;
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
}
