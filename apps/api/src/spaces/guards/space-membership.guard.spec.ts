import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { SpaceMembershipGuard } from "./space-membership.guard";
import { SpacesService } from "../spaces.service";

function buildContext(user: unknown, spaceId: string | undefined): ExecutionContext {
  const request = { user, params: { spaceId } };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("SpaceMembershipGuard", () => {
  // Tipado de forma solta (não jest.Mocked<SpacesService>) porque o retorno real
  // de isMember() é o client fluente do Prisma (Prisma__SpaceMemberClient), e os
  // testes só precisam simular o valor resolvido pelo await.
  let spacesService: { isMember: jest.Mock };
  let guard: SpaceMembershipGuard;

  beforeEach(() => {
    spacesService = { isMember: jest.fn() };
    guard = new SpaceMembershipGuard(spacesService as unknown as SpacesService);
  });

  it("rejeita quando não há usuário autenticado ou spaceId na rota", async () => {
    await expect(guard.canActivate(buildContext(undefined, "space-A"))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      guard.canActivate(buildContext({ userId: "user-A" }, undefined)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejeita usuário sem nenhuma membership no espaço", async () => {
    spacesService.isMember.mockResolvedValue(null);

    await expect(
      guard.canActivate(buildContext({ userId: "user-B" }, "space-A")),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("CRÍTICO — rejeita usuário que é membro de OUTRO Financial Space (isolamento entre espaços)", async () => {
    // user-B é membro apenas do space-B; tenta acessar o space-A.
    spacesService.isMember.mockImplementation(async (spaceId, userId) => {
      if (spaceId === "space-B" && userId === "user-B") {
        return { spaceId: "space-B", userId: "user-B", status: "ACTIVE" } as never;
      }
      return null;
    });

    await expect(
      guard.canActivate(buildContext({ userId: "user-B" }, "space-A")),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejeita membership com status diferente de ACTIVE", async () => {
    spacesService.isMember.mockResolvedValue({
      spaceId: "space-A",
      userId: "user-A",
      status: "SUSPENDED",
    } as never);

    await expect(
      guard.canActivate(buildContext({ userId: "user-A" }, "space-A")),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("aceita o owner/membro ativo do espaço correto e anexa a membership à request", async () => {
    const membership = { spaceId: "space-A", userId: "user-A", status: "ACTIVE" };
    spacesService.isMember.mockResolvedValue(membership as never);

    const context = buildContext({ userId: "user-A" }, "space-A");
    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request.spaceMembership).toEqual(membership);
  });
});
