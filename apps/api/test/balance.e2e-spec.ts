import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e do endpoint de saldo (Documento 09, E10).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Docker não está disponível neste
 * ambiente — este arquivo fica preparado, mas não foi executado (mesmo
 * status de auth/spaces/accounts/categories/transactions e2e-spec.ts).
 */
describe("Balance (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.spaceMember.deleteMany();
    await prisma.financialSpace.deleteMany();
    await prisma.user.deleteMany();
  });

  async function registerUserWithSpace(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: email, email, password: "12345678" })
      .expect(201);
    const accessToken = response.body.accessToken as string;

    const spaces = await request(app.getHttpServer())
      .get("/api/v1/spaces")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    return { accessToken, spaceId: spaces.body[0].id as string };
  }

  async function createAccount(accessToken: string, spaceId: string, initialBalance = "1000.00") {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta Corrente", initialBalance })
      .expect(201);
    return response.body.id as string;
  }

  async function createTransaction(
    accessToken: string,
    spaceId: string,
    body: Record<string, unknown>,
  ) {
    return request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(body)
      .expect(201);
  }

  it("calcula o saldo combinando initialBalance + INCOME/EXPENSE confirmadas", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("ana.bal@example.com");
    const accountId = await createAccount(accessToken, spaceId, "1000.00");

    const income = await createTransaction(accessToken, spaceId, {
      type: "INCOME",
      description: "Salário",
      amount: "500.00",
      transactionDate: "2026-01-05",
      accountId,
      status: "CONFIRMED",
    });
    const expense = await createTransaction(accessToken, spaceId, {
      type: "EXPENSE",
      description: "Mercado",
      amount: "200.00",
      transactionDate: "2026-01-10",
      accountId,
      status: "CONFIRMED",
    });
    // PENDING não deve contar.
    await createTransaction(accessToken, spaceId, {
      type: "EXPENSE",
      description: "Assinatura ainda não confirmada",
      amount: "9999.00",
      transactionDate: "2026-01-11",
      accountId,
    });

    const balance = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/accounts/${accountId}/balance`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(balance.body).toEqual({
      accountId,
      spaceId,
      initialBalance: "1000.00",
      currentBalance: "1300.00",
    });

    expect(income.body.status).toBe("CONFIRMED");
    expect(expense.body.status).toBe("CONFIRMED");
  });

  it("CRÍTICO — 404 ao consultar saldo de conta inexistente no space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("bruno.bal@example.com");

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/accounts/00000000-0000-0000-0000-000000000000/balance`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });

  it("CRÍTICO — usuário B não consegue consultar saldo de conta do Financial Space de A", async () => {
    const userA = await registerUserWithSpace("carla.bal@example.com");
    const userB = await registerUserWithSpace("duda.bal@example.com");
    const accountOfA = await createAccount(userA.accessToken, userA.spaceId);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/accounts/${accountOfA}/balance`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    // Mesmo spaceId de B: guard passa, mas a conta não pertence a esse space.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/accounts/${accountOfA}/balance`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });
});
