import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

const CREATABLE_TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
type CreatableTransactionType = (typeof CREATABLE_TRANSACTION_TYPES)[number];

// CANCELLED propositalmente fora dos valores aceitos aqui: cancelamento só
// acontece pelo endpoint dedicado POST .../cancel (decisão 6). O service
// ainda aplica a regra real: PENDING pode editar tudo, CONFIRMED não pode
// alterar os campos financeiros essenciais nem o status.
const EDITABLE_TRANSACTION_STATUSES = ["PENDING", "CONFIRMED"] as const;
type EditableTransactionStatus = (typeof EDITABLE_TRANSACTION_STATUSES)[number];

// spaceId, id, sourceType, sourceId, createdBy: nunca editáveis via API.
export class UpdateTransactionDto {
  @IsOptional()
  @IsIn(CREATABLE_TRANSACTION_TYPES)
  type?: CreatableTransactionType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "amount deve ser um valor decimal válido (até 2 casas decimais)",
  })
  amount?: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

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
  @IsIn(EDITABLE_TRANSACTION_STATUSES)
  status?: EditableTransactionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
