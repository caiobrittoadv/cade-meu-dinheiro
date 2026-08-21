import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de Faturas (Documento 09, E11.1) — cenários não cobertos por
 * cards.e2e-spec.ts: pagamento parcial e isolamento na camada de fatura.
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada. Não executado neste ambiente (mesmo status dos demais
 * e2e-spec.ts do projeto).
 */
describe("Invoices (e2e)", () => {
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
    await prisma.transaction.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.creditCard.deleteMany();
    await prisma.account.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.spaceMember.deleteMany();
    await prisma.financialSpace.deleteMany();
    await prisma.user.deleteMany();
  });

  async function setup(email: string) {
    const registerResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: email, email, password: "12345678" })
      .expect(201);
    const accessToken = registerResponse.body.accessToken as string;

    const spaces = await request(app.getHttpServer())
      .get("/api/v1/spaces")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const spaceId = spaces.body[0].id as string;

    const cardResponse = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Cartão", lastFourDigits: "0000", creditLimit: "5000.00", closingDay: 10, dueDay: 17 })
      .expect(201);
    const cardId = cardResponse.body.id as string;

    const accountResponse = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta" })
      .expect(201);
    const accountId = accountResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Compra", amount: "1000.00", transactionDate: "2026-03-05", status: "CONFIRMED" })
      .expect(201);

    const invoicesResponse = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const invoiceId = invoicesResponse.body[0].id as string;

    return { accessToken, spaceId, cardId, accountId, invoiceId };
  }

  it("CRÍTICO — pagamentos parciais sucessivos reduzem o saldo em aberto até quitar", async () => {
    const { accessToken, spaceId, cardId, accountId, invoiceId } = await setup("ines.inv@example.com");

    const first = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ accountId, amount: "400.00", transactionDate: "2026-03-12" })
      .expect(201);
    expect(first.body.invoice.remainingAmount).toBe("600.00");
    expect(first.body.invoice.status).not.toBe("PAID");

    const second = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ accountId, amount: "600.00", transactionDate: "2026-03-14" })
      .expect(201);
    expect(second.body.invoice.remainingAmount).toBe("0.00");
    expect(second.body.invoice.status).toBe("PAID");
  });

  it("CRÍTICO — usuário B não consegue ver nem pagar fatura de cartão do Financial Space de A", async () => {
    const userA = await setup("joao.inv@example.com");
    const userB = await setup("karin.inv@example.com");

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/cards/${userA.cardId}/invoices/${userA.invoiceId}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/cards/${userA.cardId}/invoices/${userA.invoiceId}/payments`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ accountId: userB.accountId, amount: "10.00", transactionDate: "2026-03-12" })
      .expect(403);

    // Mesmo spaceId de B, cartão de A: guard passa, mas o cartão não é
    // encontrado no space de B (isolamento a nível de dado).
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/cards/${userA.cardId}/invoices/${userA.invoiceId}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it("CRÍTICO — pagamento com accountId de outro Financial Space é rejeitado", async () => {
    const userA = await setup("lucas.inv@example.com");
    const userB = await setup("marina.inv@example.com");

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/cards/${userA.cardId}/invoices/${userA.invoiceId}/payments`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({ accountId: userB.accountId, amount: "100.00", transactionDate: "2026-03-12" })
      .expect(400);
  });
});
