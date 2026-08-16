import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { SpacesService } from "../spaces.service";

/**
 * Garante que o usuário autenticado é membro ativo do Financial Space
 * indicado por ":spaceId" na rota. Deve ser usado sempre em conjunto com
 * (e depois de) JwtAuthGuard, pois depende de request.user já populado.
 *
 * Este é o mecanismo central do isolamento por Financial Space exigido
 * pelo Documento 09 (E06): nenhuma operação financeira pode acessar
 * dados de outro Financial Space.
 */
@Injectable()
export class SpaceMembershipGuard implements CanActivate {
  constructor(private readonly spacesService: SpacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const spaceId = request.params?.spaceId;

    if (!user || !spaceId) {
      throw new ForbiddenException("Acesso negado a este Financial Space.");
    }

    const membership = await this.spacesService.isMember(spaceId, user.userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenException("Acesso negado a este Financial Space.");
    }

    request.spaceMembership = membership;
    return true;
  }
}
