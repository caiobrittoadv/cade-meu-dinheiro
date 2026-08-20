import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

// Somente os dois estados relevantes ao E07. Account.status é String livre
// no schema (sem enum Prisma), então a validação de valores permitidos fica
// a cargo do DTO.
const ACCOUNT_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

// Campos deliberadamente ausentes: initialBalance, spaceId, id, currency, type.
// O ValidationPipe global (whitelist + forbidNonWhitelisted) já rejeita
// qualquer campo fora desta lista com 400 Bad Request.
export class UpdateAccountDto {
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
  @IsIn(ACCOUNT_STATUSES)
  status?: AccountStatus;
}
