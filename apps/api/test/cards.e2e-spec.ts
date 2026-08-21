import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de Cartões (Documento 09, E11.1).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Docker não está disponível neste
 * ambiente — este arquivo fica preparado, mas não foi executado (mesmo
 * status dos demais e2e-spec.ts do projeto).
 */
describe("Cards (e2e)", () => {
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

  async function createCard(accessToken: string, spaceId: string) {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Nubank",
        lastFourDigits: "1234",
        creditLimit: "5000.00",
        closingDay: 10,
        dueDay: 17,
      })
      .expect(201);
    return response.body.id as string;
  }

  it("cria, lista, consulta e atualiza um cartão dentro do próprio Financial Space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("ana.card@example.com");
    const cardId = await createCard(accessToken, spaceId);

    const list = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/cards/${cardId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ creditLimit: "6000.00" })
      .expect(200);
    expect(updated.body.creditLimit).toBe("6000.00");
  });

  it("CRÍTICO — usuário B não consegue listar, consultar nem alterar cartão do Financial Space de A", async () => {
    const userA = await registerUserWithSpace("bruno.card@example.com");
    const userB = await registerUserWithSpace("carla.card@example.com");
    const cardOfA = await createCard(userA.accessToken, userA.spaceId);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/cards`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/cards/${cardOfA}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${userA.spaceId}/cards/${cardOfA}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ name: "Tentativa indevida" })
      .expect(403);

    // Mesmo spaceId de B: guard passa, mas o cartão não pertence a esse space.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/cards/${cardOfA}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });

  it("compra no cartão cria despesa comprometida (fatura) sem afetar saldo bancário", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("duda.card@example.com");
    const cardId = await createCard(accessToken, spaceId);

    const purchase = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Mercado", amount: "150.00", transactionDate: "2026-03-05", status: "CONFIRMED" })
      .expect(201);

    expect(purchase.body.accountId).toBeNull();
    expect(purchase.body.creditCardId).toBe(cardId);
    expect(purchase.body.invoiceId).toBeDefined();

    const invoices = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(invoices.body).toHaveLength(1);
    expect(invoices.body[0].totalAmount).toBe("150.00");
  });

  it("compras em datas antes/depois do fechamento vão para faturas diferentes", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("erick.card@example.com");
    const cardId = await createCard(accessToken, spaceId); // closingDay: 10

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Antes do fechamento", amount: "100.00", transactionDate: "2026-03-05", status: "CONFIRMED" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Depois do fechamento", amount: "200.00", transactionDate: "2026-03-11", status: "CONFIRMED" })
      .expect(201);

    const invoices = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(invoices.body).toHaveLength(2);
  });

  it("CRÍTICO — pagamento integral quita a fatura sem duplicar despesa; limite reflete o comprometimento", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("fabia.card@example.com");
    const cardId = await createCard(accessToken, spaceId);

    const bankAccount = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta Corrente", initialBalance: "2000.00" })
      .expect(201);
    const accountId = bankAccount.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Compra", amount: "1000.00", transactionDate: "2026-03-05", status: "CONFIRMED" })
      .expect(201);

    const limitBefore = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/limit`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(limitBefore.body.committedAmount).toBe("1000.00");
    expect(limitBefore.body.availableLimit).toBe("4000.00");

    const invoices = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const invoiceId = invoices.body[0].id as string;

    const payment = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ accountId, amount: "1000.00", transactionDate: "2026-03-15" })
      .expect(201);

    expect(payment.body.invoice.status).toBe("PAID");
    expect(payment.body.payment.categoryId).toBeNull();

    // Saldo bancário reduzido apenas UMA vez (pelo pagamento, não pela compra).
    const balance = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/accounts/${accountId}/balance`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(balance.body.currentBalance).toBe("1000.00"); // 2000 - 1000, não 2000 - 2000

    const limitAfter = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/limit`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(limitAfter.body.availableLimit).toBe("5000.00");
  });

  it("CRÍTICO — pagamento que excede o saldo em aberto é rejeitado", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("gil.card@example.com");
    const cardId = await createCard(accessToken, spaceId);

    const bankAccount = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta Corrente" })
      .expect(201);
    const accountId = bankAccount.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/purchases`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Compra", amount: "100.00", transactionDate: "2026-03-05", status: "CONFIRMED" })
      .expect(201);

    const invoices = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    const invoiceId = invoices.body[0].id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/cards/${cardId}/invoices/${invoiceId}/payments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ accountId, amount: "999.00", transactionDate: "2026-03-15" })
      .expect(400);
  });
});
