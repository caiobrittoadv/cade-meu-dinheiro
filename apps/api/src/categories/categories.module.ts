import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  // SpacesModule é importado (não recriado) para reaproveitar o SpacesService
  // exportado por ele, do qual SpaceMembershipGuard depende.
  imports: [SpacesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, SpaceMembershipGuard],
  // Exportado para permitir que uma tarefa futura (ex.: wiring em
  // SpacesService) chame initializeDefaultCategories() sem duplicar lógica.
  exports: [CategoriesService],
})
export class CategoriesModule {}
