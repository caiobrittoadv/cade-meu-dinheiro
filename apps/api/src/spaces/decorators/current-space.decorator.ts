import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SpaceMember } from "@prisma/client";

/** Disponível apenas em rotas protegidas por SpaceMembershipGuard. */
export const CurrentSpace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SpaceMember => {
    const request = ctx.switchToHttp().getRequest();
    return request.spaceMembership;
  },
);
