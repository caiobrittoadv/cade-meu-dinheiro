import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

const CATEGORY_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

// Campos deliberadamente ausentes: isSystem, spaceId, id, type.
// `type` fica de fora pelo mesmo critério conservador já aplicado em
// UpdateAccountDto (E07): só entram os campos explicitamente autorizados
// como editáveis; nada foi definido sobre alterar o tipo de uma categoria.
//
// A proteção de categorias isSystem NÃO é "campo não editável" — é a
// entidade inteira bloqueada para update, verificado no service antes de
// qualquer escrita (decisão 4).
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsIn(CATEGORY_STATUSES)
  status?: CategoryStatus;
}
