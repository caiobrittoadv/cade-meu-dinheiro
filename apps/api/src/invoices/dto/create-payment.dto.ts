import { IsDateString, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";

// categoryId propositalmente ausente: pagamento de fatura nunca é despesa de
// categoria (Regra crítica 2 / Documento 06, Seção 21).
export class CreatePaymentDto {
  @IsUUID()
  accountId!: string;

  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "amount deve ser um valor decimal válido (até 2 casas decimais)",
  })
  amount!: string;

  @IsDateString()
  transactionDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
