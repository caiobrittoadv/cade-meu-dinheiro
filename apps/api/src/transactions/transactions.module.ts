import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  // SpacesModule é importado (não recriado) para reaproveitar o SpacesService
  // exportado por ele, do qual SpaceMembershipGuard depende.
  imports: [SpacesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, SpaceMembershipGuard],
})
export class TransactionsModule {}
