import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../shared/prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

const BCRYPT_ROUNDS = 12;
const GENERIC_INVALID_CREDENTIALS = "Credenciais inválidas.";
const GENERIC_RESET_RESPONSE = {
  message: "Se o e-mail existir em nossa base, um link de recuperação foi enviado.",
};

/** Converte durações simples ("15m", "1h", "30d") em milissegundos. */
function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Formato de duração inválido: ${duration}`);
  }
  const value = Number(match[1]);
  const unitMs: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[match[2]];
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface PublicUser {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTokenTtlMs: number;
  private readonly resetTokenTtlMs = parseDurationToMs("1h");

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.refreshTokenTtlMs = parseDurationToMs(
      this.config.get<string>("AUTH_REFRESH_TOKEN_EXPIRES_IN") ?? "30d",
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("E-mail já cadastrado.");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Cria o usuário e, no mesmo espírito do Documento 05 §5 ("no MVP,
    // normalmente haverá 1 usuário → 1 espaço financeiro"), já cria o
    // Financial Space pessoal com o usuário como OWNER — decisão aprovada
    // no planejamento da Fase 02, reduz fricção de onboarding.
    const user = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          status: "ACTIVE",
        },
      });

      const space = await tx.financialSpace.create({
        data: {
          name: "Espaço Pessoal",
          type: "PERSONAL",
          ownerUserId: createdUser.id,
        },
      });

      await tx.spaceMember.create({
        data: {
          spaceId: space.id,
          userId: createdUser.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return createdUser;
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(GENERIC_INVALID_CREDENTIALS);
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException(GENERIC_INVALID_CREDENTIALS);
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenException("Conta inativa.");
    }

    await this.usersService.touchLastLogin(user.id);

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(stored.userId);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Sessão inválida.");
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: "Sessão encerrada." };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      const plainToken = randomBytes(32).toString("hex");
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(plainToken),
          expiresAt: new Date(Date.now() + this.resetTokenTtlMs),
        },
      });

      const appUrl = this.config.get<string>("APP_URL") ?? "http://localhost:3000";
      // Nenhum provedor de e-mail foi decidido nos Documentos 01-10.
      // Nesta fase o "envio" apenas registra o link em log (decisão
      // aprovada no planejamento da Fase 02) até um provedor ser escolhido.
      console.log(
        `[auth] Link de recuperação de senha para ${user.email}: ${appUrl}/reset-password?token=${plainToken}`,
      );
    }

    // Resposta idêntica exista ou não o e-mail, para não permitir enumeração de contas.
    return GENERIC_RESET_RESPONSE;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const stored = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      });

      // Trocar a senha revoga todas as sessões ativas — evita que um
      // invasor que já tinha acesso continue autenticado após o reset.
      await tx.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: "Senha atualizada com sucesso." };
  }

  private async issueTokens(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenPlain = randomBytes(48).toString("hex");
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshTokenPlain),
        expiresAt: new Date(Date.now() + this.refreshTokenTtlMs),
      },
    });

    return { accessToken, refreshToken: refreshTokenPlain };
  }

  private toPublicUser(user: { id: string; name: string; email: string }): PublicUser {
    return { id: user.id, name: user.name, email: user.email };
  }
}
