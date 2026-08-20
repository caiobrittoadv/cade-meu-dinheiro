import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de Contas (Documento 09, E07).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Docker não está disponível neste
 * ambiente — este arquivo fica preparado, mas não foi executado (mesmo
 * status de auth.e2e-spec.ts e spaces.e2e-spec.ts).
 */
describe("Accounts (e2e)", () => {
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

  it("cria, lista e consulta uma conta dentro do próprio Financial Space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("ana@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta Corrente", type: "CHECKING", initialBalance: "1500.75" })
      .expect(201);

    expect(created.body.spaceId).toBe(spaceId);
    expect(created.body.initialBalance).toBe("1500.75");

    const list = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });

  it("atualização parcial altera apenas os campos permitidos", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("bruno@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Carteira" })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Carteira Renomeada" })
      .expect(200);

    expect(updated.body.name).toBe("Carteira Renomeada");
  });

  it("rejeita tentativa de alterar initialBalance, spaceId ou id via PATCH", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("carla@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Poupança", initialBalance: "100.00" })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ initialBalance: "999999.99" })
      .expect(400);
  });

  it("arquiva uma conta via PATCH status=ARCHIVED", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("duda@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/accounts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Conta Digital" })
      .expect(201);

    const archived = await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "ARCHIVED" })
      .expect(200);

    expect(archived.body.status).toBe("ARCHIVED");
  });

  it("CRÍTICO — usuário B não consegue listar, consultar nem alterar conta do Financial Space de A", async () => {
    const userA = await registerUserWithSpace("erick@example.com");
    const userB = await registerUserWithSpace("fabia@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/accounts`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({ name: "Conta do A" })
      .expect(201);

    // B tentando acessar via spaceId de A: bloqueado pelo SpaceMembershipGuard.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/accounts`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${userA.spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ name: "Tentativa indevida" })
      .expect(403);

    // B tentando acessar a conta de A através do PRÓPRIO spaceId de B: o guard
    // passa (B é membro do seu próprio space), mas o service não encontra a
    // conta porque o where combina id + spaceId — isolamento a nível de dado,
    // não apenas de rota.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/accounts/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });
});
