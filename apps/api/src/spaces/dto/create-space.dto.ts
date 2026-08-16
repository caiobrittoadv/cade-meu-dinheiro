import { SpaceType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateSpaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsEnum(SpaceType)
  type?: SpaceType;
}
