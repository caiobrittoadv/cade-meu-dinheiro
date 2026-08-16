import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("AUTH_JWT_SECRET"),
        signOptions: {
          // AUTH_JWT_EXPIRES_IN vem do .env como string dinâmica; jsonwebtoken
          // tipa expiresIn com um template-literal type (StringValue) que não
          // aceita `string` genérico em tempo de compilação.
          expiresIn: (config.get<string>("AUTH_JWT_EXPIRES_IN") ?? "15m") as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
