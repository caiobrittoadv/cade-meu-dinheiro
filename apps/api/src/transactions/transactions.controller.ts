import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Param("spaceId") spaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(spaceId, user.userId, dto);
  }

  @Get()
  findAll(@Param("spaceId") spaceId: string) {
    return this.transactionsService.findAllForSpace(spaceId);
  }

  @Get(":transactionId")
  findOne(@Param("spaceId") spaceId: string, @Param("transactionId") transactionId: string) {
    return this.transactionsService.findOne(spaceId, transactionId);
  }

  @Patch(":transactionId")
  update(
    @Param("spaceId") spaceId: string,
    @Param("transactionId") transactionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(spaceId, transactionId, user.userId, dto);
  }

  @Post(":transactionId/cancel")
  cancel(
    @Param("spaceId") spaceId: string,
    @Param("transactionId") transactionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transactionsService.cancel(spaceId, transactionId, user.userId);
  }
}
