import { Module } from "@nestjs/common";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { SpaceMembershipGuard } from "./guards/space-membership.guard";

@Module({
  controllers: [SpacesController],
  providers: [SpacesService, SpaceMembershipGuard],
  exports: [SpacesService],
})
export class SpacesModule {}
