import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { InvoicesModule } from "../invoices/invoices.module";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";

@Module({
  imports: [SpacesModule, InvoicesModule],
  controllers: [CardsController],
  providers: [CardsService, SpaceMembershipGuard],
})
export class CardsModule {}
