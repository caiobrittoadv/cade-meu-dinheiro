import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de Autenticação (Documento 09, E05).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Nesta fase da implementação o Docker
 * ainda não está disponível no ambiente — este arquivo fica preparado,
 * mas não foi executado. Rodar com: `npm run test:e2e --workspace=@cade-meu-dinheiro/api`.
 */
describe("Auth (e2e)", () => {
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
    await prisma.refreshToken.deleteMany();
    await prisma.spaceMember.deleteMany();
    await prisma.financialSpace.deleteMany();
    await prisma.user.deleteMany();
  });

  it("registra um usuário, cria o Financial Space pessoal e retorna tokens", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: "Ana", email: "ana@example.com", password: "12345678" })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe("ana@example.com");
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("rotas protegidas rejeitam acesso não autenticado", async () => {
    await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
  });

  it("login → rota protegida → refresh (rotaciona) → logout → refresh token revogado é rejeitado", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: "Bruno", email: "bruno@example.com", password: "12345678" })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "bruno@example.com", password: "12345678" })
      .expect(200);

    const { accessToken, refreshToken } = loginResponse.body;

    await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const refreshResponse = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    // o refresh token antigo já foi rotacionado — não deve mais funcionar
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .post("/api/v1/auth/logout")
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(401);
  });

  it("login com senha incorreta é rejeitado", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: "Carla", email: "carla@example.com", password: "12345678" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "carla@example.com", password: "senha-errada" })
      .expect(401);
  });
});
