import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de Transactions (Documento 09, E09).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Docker não está disponível neste
 * ambiente — este arquivo fica preparado, mas não foi executado (mesmo
 * status de auth/spaces/accounts/categories e2e-spec.ts).
 */
describe("Transactions (e2e)", () => {
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
    await prisma.category.deleteMany();
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

  async function createAccount(accessToken: string, spaceId: string, name = "Conta Corrente") {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name })
      .expect(201);
    return response.body.id as string;
  }

  it("cria, lista e consulta uma transação dentro do próprio Financial Space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("ana.tx@example.com");
    const accountId = await createAccount(accessToken, spaceId);

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        type: "EXPENSE",
        description: "Mercado",
        amount: "150.30",
        transactionDate: "2026-01-10",
        accountId,
      })
      .expect(201);

    expect(created.body.spaceId).toBe(spaceId);
    expect(created.body.amount).toBe("150.30");
    expect(created.body.status).toBe("PENDING");

    const list = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });

  it("rejeita criação com type TRANSFER (fora do escopo do E09)", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("bruno.tx@example.com");

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "TRANSFER", description: "Transferência", amount: "100.00", transactionDate: "2026-01-10" })
      .expect(400);
  });

  it("CRÍTICO — rejeita criação com accountId de outro Financial Space", async () => {
    const userA = await registerUserWithSpace("carla.tx@example.com");
    const userB = await registerUserWithSpace("duda.tx@example.com");
    const accountOfA = await createAccount(userA.accessToken, userA.spaceId);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userB.spaceId}/transactions`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({
        type: "EXPENSE",
        description: "Tentativa indevida",
        amount: "10.00",
        transactionDate: "2026-01-10",
        accountId: accountOfA,
      })
      .expect(400);
  });

  it("PENDING pode ser editada; CONFIRMED bloqueia campos financeiros", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("erick.tx@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "EXPENSE", description: "Lazer", amount: "50.00", transactionDate: "2026-01-10" })
      .expect(201);

    const confirmed = await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "CONFIRMED" })
      .expect(200);
    expect(confirmed.body.status).toBe("CONFIRMED");

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: "999.00" })
      .expect(403);
  });

  it("cancela uma transação via endpoint dedicado e bloqueia edição posterior", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("fabia.tx@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ type: "INCOME", description: "Freelance", amount: "300.00", transactionDate: "2026-01-10" })
      .expect(201);

    const cancelled = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);
    expect(cancelled.body.status).toBe("CANCELLED");

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ notes: "tentativa indevida" })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/transactions/${created.body.id}/cancel`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(400);
  });

  it("CRÍTICO — usuário B não consegue listar, consultar, alterar nem cancelar transação do Financial Space de A", async () => {
    const userA = await registerUserWithSpace("gil.tx@example.com");
    const userB = await registerUserWithSpace("helo.tx@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/transactions`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({ type: "EXPENSE", description: "Transação do A", amount: "10.00", transactionDate: "2026-01-10" })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/transactions`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${userA.spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ notes: "tentativa indevida" })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/transactions/${created.body.id}/cancel`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    // Mesmo spaceId de B: guard passa, mas o service não encontra a
    // transação porque o where combina id + spaceId — isolamento a nível de
    // dado, não apenas de rota.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/transactions/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });
});
