import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { BalanceController } from "./balance.controller";
import { BalanceService } from "./balance.service";

@Module({
  // SpacesModule é importado (não recriado) para reaproveitar o SpacesService
  // exportado por ele, do qual SpaceMembershipGuard depende.
  imports: [SpacesModule],
  controllers: [BalanceController],
  providers: [BalanceService, SpaceMembershipGuard],
})
export class FinancialEngineModule {}
