import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";

@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Param("spaceId") spaceId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(spaceId, dto);
  }

  @Get()
  findAll(@Param("spaceId") spaceId: string) {
    return this.accountsService.findAllForSpace(spaceId);
  }

  @Get(":accountId")
  findOne(@Param("spaceId") spaceId: string, @Param("accountId") accountId: string) {
    return this.accountsService.findOne(spaceId, accountId);
  }

  @Patch(":accountId")
  update(
    @Param("spaceId") spaceId: string,
    @Param("accountId") accountId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(spaceId, accountId, dto);
  }
}
