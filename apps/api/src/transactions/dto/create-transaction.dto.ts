import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

// TRANSFER está deliberadamente fora (decisão 1 — E09 não implementa
// transferências; a entidade Transfer ainda não existe no schema).
const CREATABLE_TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
type CreatableTransactionType = (typeof CREATABLE_TRANSACTION_TYPES)[number];

// CANCELLED não é status de criação (decisão 5) — só resulta do endpoint de
// cancelamento.
const CREATABLE_TRANSACTION_STATUSES = ["PENDING", "CONFIRMED"] as const;
type CreatableTransactionStatus = (typeof CREATABLE_TRANSACTION_STATUSES)[number];

// creditCardId/invoiceId propositalmente ausentes (decisão 4 — cartão fora
// do E09). sourceType, sourceId, createdBy, spaceId, id: controlados pelo
// service, nunca pelo cliente da API.
export class CreateTransactionDto {
  @IsIn(CREATABLE_TRANSACTION_TYPES)
  type!: CreatableTransactionType;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description!: string;

  // String, nunca number: evita conversão para float antes de chegar ao
  // Prisma (Prisma.Decimal aceita string).
  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "amount deve ser um valor decimal válido (até 2 casas decimais)",
  })
  amount!: string;

  @IsDateString()
  transactionDate!: string;

  @IsOptional()
  @IsDateString()
  competenceDate?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(CREATABLE_TRANSACTION_STATUSES)
  status?: CreatableTransactionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
