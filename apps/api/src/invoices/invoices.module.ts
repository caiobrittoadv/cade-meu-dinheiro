import { Module } from "@nestjs/common";
import { SpacesModule } from "../spaces/spaces.module";
import { SpaceMembershipGuard } from "../spaces/guards/space-membership.guard";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";

@Module({
  imports: [SpacesModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, SpaceMembershipGuard],
  // Exportado para o CardsModule usar (registrar compra a partir da rota de
  // cartões, sem duplicar a lógica de resolução/fechamento de fatura).
  exports: [InvoicesService],
})
export class InvoicesModule {}
