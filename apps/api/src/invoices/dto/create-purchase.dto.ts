import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

// Mesmos valores aceitos na criação de Transaction (E09): CANCELLED nunca é
// status de criação.
const CREATABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;
type CreatableStatus = (typeof CREATABLE_STATUSES)[number];

// accountId propositalmente ausente: compra no cartão nunca afeta conta
// bancária (Regra crítica 1). creditCardId/invoiceId vêm da rota/resolução
// automática, nunca do body.
export class CreatePurchaseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  description!: string;

  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "amount deve ser um valor decimal válido (até 2 casas decimais)",
  })
  amount!: string;

  @IsDateString()
  transactionDate!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIn(CREATABLE_STATUSES)
  status?: CreatableStatus;
}
