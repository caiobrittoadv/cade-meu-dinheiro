import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";

@Module({
  // SpacesModule é importado (não recriado) para reaproveitar o SpacesService
  // exportado por ele, do qual SpaceMembershipGuard depende.
  imports: [SpacesModule],
  controllers: [AccountsController],
  providers: [AccountsService, SpaceMembershipGuard],
})
export class AccountsModule {}
