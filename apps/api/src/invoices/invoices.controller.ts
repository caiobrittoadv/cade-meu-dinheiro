import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { InvoicesService } from "./invoices.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/cards/:cardId/invoices")
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Param("spaceId") spaceId: string, @Param("cardId") cardId: string) {
    return this.invoicesService.findAllForCard(spaceId, cardId);
  }

  @Get(":invoiceId")
  findOne(
    @Param("spaceId") spaceId: string,
    @Param("cardId") cardId: string,
    @Param("invoiceId") invoiceId: string,
  ) {
    return this.invoicesService.findOne(spaceId, cardId, invoiceId);
  }

  @Post(":invoiceId/payments")
  registerPayment(
    @Param("spaceId") spaceId: string,
    @Param("cardId") cardId: string,
    @Param("invoiceId") invoiceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.invoicesService.registerPayment(spaceId, cardId, invoiceId, user.userId, dto);
  }
}
