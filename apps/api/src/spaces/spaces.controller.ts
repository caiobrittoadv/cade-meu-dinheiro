import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { SpacesService } from "./spaces.service";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { SpaceMembershipGuard } from "./guards/space-membership.guard";

@UseGuards(JwtAuthGuard)
@Controller("spaces")
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSpaceDto) {
    return this.spacesService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.spacesService.findAllForUser(user.userId);
  }

  @UseGuards(SpaceMembershipGuard)
  @Get(":spaceId")
  findOne(@Param("spaceId") spaceId: string) {
    return this.spacesService.findById(spaceId);
  }
}
