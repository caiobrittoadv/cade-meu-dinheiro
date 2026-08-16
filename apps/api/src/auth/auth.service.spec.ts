import { Test } from "@nestjs/testing";
import { ConflictException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../shared/prisma/prisma.service";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  // Mock manual do PrismaService: os métodos usados nos testes precisam ser
  // espiáveis (jest.fn) e o objeto precisa se referenciar dentro de $transaction,
  // o que não é modelável de forma prática com os tipos gerados pelo Prisma.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      touchLastLogin: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    prisma = {
      user: { update: jest.fn() },
      financialSpace: { create: jest.fn() },
      spaceMember: { create: jest.fn() },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
    };
    prisma.user.create = jest.fn();

    jwtService = {
      sign: jest.fn().mockReturnValue("signed.jwt.token"),
    } as unknown as jest.Mocked<JwtService>;

    const configService = {
      get: jest.fn((key: string) => {
        if (key === "AUTH_REFRESH_TOKEN_EXPIRES_IN") return "30d";
        if (key === "APP_URL") return "http://localhost:3000";
        return undefined;
      }),
    } as unknown as ConfigService;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe("register", () => {
    it("rejeita e-mail duplicado", async () => {
      usersService.findByEmail.mockResolvedValue({ id: "1" } as never);

      await expect(
        authService.register({ name: "Ana", email: "ana@test.com", password: "12345678" }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it("nunca armazena a senha em texto puro e cria Financial Space + SpaceMember OWNER", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: "user-1", email: "ana@test.com", name: "Ana" });
      prisma.financialSpace.create.mockResolvedValue({ id: "space-1" });

      await authService.register({ name: "Ana", email: "ana@test.com", password: "12345678" });

      const userCreateArgs = prisma.user.create.mock.calls[0][0];
      expect(userCreateArgs.data.passwordHash).not.toBe("12345678");
      expect(await bcrypt.compare("12345678", userCreateArgs.data.passwordHash)).toBe(true);

      expect(prisma.financialSpace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ownerUserId: "user-1", type: "PERSONAL" }),
        }),
      );
      expect(prisma.spaceMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: "space-1", userId: "user-1", role: "OWNER" }),
        }),
      );
    });

    it("retorna accessToken e refreshToken após o registro", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: "user-1", email: "ana@test.com", name: "Ana" });
      prisma.financialSpace.create.mockResolvedValue({ id: "space-1" });

      const result = await authService.register({
        name: "Ana",
        email: "ana@test.com",
        password: "12345678",
      });

      expect(result.accessToken).toBe("signed.jwt.token");
      expect(typeof result.refreshToken).toBe("string");
      expect(result.user).toEqual({ id: "user-1", email: "ana@test.com", name: "Ana" });
    });
  });

  describe("login", () => {
    it("rejeita usuário inexistente com mensagem genérica", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "x@test.com", password: "any" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rejeita senha incorreta com a mesma mensagem genérica (não revela qual campo errou)", async () => {
      const hash = await bcrypt.hash("correct-password", 12);
      usersService.findByEmail.mockResolvedValue({
        id: "user-1",
        email: "ana@test.com",
        passwordHash: hash,
        status: "ACTIVE",
      } as never);

      await expect(
        authService.login({ email: "ana@test.com", password: "wrong-password" }),
      ).rejects.toThrow("Credenciais inválidas.");
    });

    it("rejeita usuário com status diferente de ACTIVE", async () => {
      const hash = await bcrypt.hash("correct-password", 12);
      usersService.findByEmail.mockResolvedValue({
        id: "user-1",
        email: "ana@test.com",
        passwordHash: hash,
        status: "SUSPENDED",
      } as never);

      await expect(
        authService.login({ email: "ana@test.com", password: "correct-password" }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("autentica com sucesso e atualiza lastLoginAt", async () => {
      const hash = await bcrypt.hash("correct-password", 12);
      usersService.findByEmail.mockResolvedValue({
        id: "user-1",
        email: "ana@test.com",
        name: "Ana",
        passwordHash: hash,
        status: "ACTIVE",
      } as never);

      const result = await authService.login({ email: "ana@test.com", password: "correct-password" });

      expect(usersService.touchLastLogin).toHaveBeenCalledWith("user-1");
      expect(result.accessToken).toBe("signed.jwt.token");
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe("refresh", () => {
    it("rejeita refresh token inexistente, revogado ou expirado (sessão inválida)", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(authService.refresh("unknown-token")).rejects.toBeInstanceOf(UnauthorizedException);

      prisma.refreshToken.findUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
      });
      await expect(authService.refresh("revoked-token")).rejects.toBeInstanceOf(UnauthorizedException);

      prisma.refreshToken.findUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revokedAt: null,
        expiresAt: new Date(Date.now() - 10_000),
      });
      await expect(authService.refresh("expired-token")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rotaciona o refresh token: revoga o antigo e emite um novo par de tokens", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
      });
      usersService.findById.mockResolvedValue({
        id: "user-1",
        email: "ana@test.com",
        name: "Ana",
        status: "ACTIVE",
      } as never);

      const result = await authService.refresh("valid-token");

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "rt-1" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result.accessToken).toBe("signed.jwt.token");
    });
  });

  describe("forgotPassword / resetPassword", () => {
    it("forgotPassword sempre retorna a mesma resposta genérica, exista ou não o e-mail", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const resultUnknown = await authService.forgotPassword({ email: "unknown@test.com" });

      usersService.findByEmail.mockResolvedValue({ id: "user-1", email: "ana@test.com" } as never);
      const resultKnown = await authService.forgotPassword({ email: "ana@test.com" });

      expect(resultUnknown).toEqual(resultKnown);
      expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    });

    it("resetPassword rejeita token inválido, já usado ou expirado", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);
      await expect(
        authService.resetPassword({ token: "bad", newPassword: "novaSenha123" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "prt-1",
        userId: "user-1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 10_000),
      });
      await expect(
        authService.resetPassword({ token: "used", newPassword: "novaSenha123" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("resetPassword troca a senha e revoga todas as sessões ativas", async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: "prt-1",
        userId: "user-1",
        usedAt: null,
        expiresAt: new Date(Date.now() + 10_000),
      });

      await authService.resetPassword({ token: "valid", newPassword: "novaSenha123" });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "user-1" } }),
      );
      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: "prt-1" },
        data: { usedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
