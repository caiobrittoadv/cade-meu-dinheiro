import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Param("spaceId") spaceId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(spaceId, dto);
  }

  @Get()
  findAll(@Param("spaceId") spaceId: string) {
    return this.categoriesService.findAllForSpace(spaceId);
  }

  @Get(":categoryId")
  findOne(@Param("spaceId") spaceId: string, @Param("categoryId") categoryId: string) {
    return this.categoriesService.findOne(spaceId, categoryId);
  }

  @Patch(":categoryId")
  update(
    @Param("spaceId") spaceId: string,
    @Param("categoryId") categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(spaceId, categoryId, dto);
  }
}
