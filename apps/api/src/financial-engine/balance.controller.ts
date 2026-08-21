import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { BalanceService } from "./balance.service";

// Mesmo prefixo de rota de AccountsController (spaces/:spaceId/accounts),
// mas em módulo/controller separado: E07 não pode ser alterado nesta etapa.
// Nest resolve sem conflito porque ":accountId/balance" é um path distinto
// de ":accountId".
@UseGuards(JwtAuthGuard, SpaceMembershipGuard)
@Controller("spaces/:spaceId/accounts")
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(":accountId/balance")
  getBalance(@Param("spaceId") spaceId: string, @Param("accountId") accountId: string) {
    return this.balanceService.getAccountBalance(spaceId, accountId);
  }
}
