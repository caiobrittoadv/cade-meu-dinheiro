import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";
import { CategoriesService } from "../src/categories/categories.service";

/**
 * Testes e2e de Categorias (Documento 09, E08).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada (`npm run db:migrate`). Docker não está disponível neste
 * ambiente — este arquivo fica preparado, mas não foi executado (mesmo
 * status de auth.e2e-spec.ts, spaces.e2e-spec.ts e accounts.e2e-spec.ts).
 */
describe("Categories (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoriesService: CategoriesService;

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
    categoriesService = moduleRef.get(CategoriesService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
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

  it("cria, lista e consulta uma categoria dentro do próprio Financial Space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("gabi@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Alimentação", type: "EXPENSE" })
      .expect(201);

    expect(created.body.spaceId).toBe(spaceId);
    expect(created.body.isSystem).toBe(false);

    const list = await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });

  it("cria subcategoria com parentId no mesmo Financial Space", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("heitor@example.com");

    const parent = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Alimentação" })
      .expect(201);

    const child = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Mercado", parentId: parent.body.id })
      .expect(201);

    expect(child.body.parentId).toBe(parent.body.id);
  });

  it("CRÍTICO — rejeita criação com parentId de categoria de outro Financial Space", async () => {
    const userA = await registerUserWithSpace("ines@example.com");
    const userB = await registerUserWithSpace("joao@example.com");

    const parentOfA = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/categories`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({ name: "Categoria de A" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userB.spaceId}/categories`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ name: "Tentativa indevida", parentId: parentOfA.body.id })
      .expect(400);
  });

  it("atualização parcial altera apenas os campos permitidos e arquiva via status", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("karin@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Lazer" })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "ARCHIVED" })
      .expect(200);

    expect(updated.body.status).toBe("ARCHIVED");
  });

  it("rejeita tentativa de alterar isSystem ou spaceId via PATCH", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("lucas@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${spaceId}/categories`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Transporte" })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ isSystem: true })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ spaceId: "outro-space" })
      .expect(400);
  });

  it("CRÍTICO — protege categoria isSystem contra alteração pelo usuário", async () => {
    const { accessToken, spaceId } = await registerUserWithSpace("marina@example.com");

    const [systemCategory] = await categoriesService.initializeDefaultCategories(spaceId);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${spaceId}/categories/${systemCategory.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Tentativa de renomear categoria do sistema" })
      .expect(403);
  });

  it("CRÍTICO — usuário B não consegue listar, consultar nem alterar categoria do Financial Space de A", async () => {
    const userA = await registerUserWithSpace("nina@example.com");
    const userB = await registerUserWithSpace("otto@example.com");

    const created = await request(app.getHttpServer())
      .post(`/api/v1/spaces/${userA.spaceId}/categories`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({ name: "Categoria do A" })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/categories`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userA.spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/v1/spaces/${userA.spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .send({ name: "Tentativa indevida" })
      .expect(403);

    // Mesmo spaceId de B: guard passa (B é membro do próprio space), mas o
    // service não encontra a categoria porque o where combina id + spaceId
    // — isolamento a nível de dado, não apenas de rota.
    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${userB.spaceId}/categories/${created.body.id}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(404);
  });
});
