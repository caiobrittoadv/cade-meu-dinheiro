import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { SpacesModule } from "./spaces/spaces.module";
import { AccountsModule } from "./accounts/accounts.module";
import { CategoriesModule } from "./categories/categories.module";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env"],
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    SpacesModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
  ],
})
export class AppModule {}
