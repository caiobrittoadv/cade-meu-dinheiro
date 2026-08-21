import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { CurrentUser, AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { InvoicesService } from "../invoices/invoices.service";
import { CardsService } from "./cards.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { CreatePurchaseDto } from "../invoices/dto/create-purchase.dto";

@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/cards")
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Post()
  create(@Param("spaceId") spaceId: string, @Body() dto: CreateCardDto) {
    return this.cardsService.create(spaceId, dto);
  }

  @Get()
  findAll(@Param("spaceId") spaceId: string) {
    return this.cardsService.findAllForSpace(spaceId);
  }

  @Get(":cardId")
  findOne(@Param("spaceId") spaceId: string, @Param("cardId") cardId: string) {
    return this.cardsService.findOne(spaceId, cardId);
  }

  @Patch(":cardId")
  update(
    @Param("spaceId") spaceId: string,
    @Param("cardId") cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(spaceId, cardId, dto);
  }

  @Get(":cardId/limit")
  getLimit(@Param("spaceId") spaceId: string, @Param("cardId") cardId: string) {
    return this.invoicesService.getCardLimit(spaceId, cardId);
  }

  @Post(":cardId/purchases")
  registerPurchase(
    @Param("spaceId") spaceId: string,
    @Param("cardId") cardId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.invoicesService.registerPurchase(spaceId, cardId, user.userId, dto);
  }
}
