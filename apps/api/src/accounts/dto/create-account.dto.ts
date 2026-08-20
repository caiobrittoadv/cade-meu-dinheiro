import { AccountType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  institutionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  institutionCode?: string;

  // String, nunca number: evita que o JSON parser converta o valor monetário
  // para float antes de chegar ao Prisma (Prisma.Decimal aceita string).
  @IsOptional()
  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "initialBalance deve ser um valor decimal válido (até 2 casas decimais)",
  })
  initialBalance?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
