import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

const CARD_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
type CardStatus = (typeof CARD_STATUSES)[number];

// lastFourDigits propositalmente ausente: identifica fisicamente o cartão,
// mesmo critério de initialBalance em Account (E07) — imutável após criação.
export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  institutionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  institutionCode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "creditLimit deve ser um valor decimal válido (até 2 casas decimais)",
  })
  creditLimit?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsIn(CARD_STATUSES)
  status?: CardStatus;
}
