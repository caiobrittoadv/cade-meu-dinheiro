import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateCardDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  institutionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  institutionCode?: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: "lastFourDigits deve conter exatamente 4 dígitos" })
  lastFourDigits!: string;

  @IsString()
  @Matches(/^-?\d+(\.\d{1,2})?$/, {
    message: "creditLimit deve ser um valor decimal válido (até 2 casas decimais)",
  })
  creditLimit!: string;

  @IsInt()
  @Min(1)
  @Max(31)
  closingDay!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;
}
