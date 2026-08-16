import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/shared/prisma/prisma.service";

/**
 * Testes e2e de isolamento por Financial Space (Documento 09, E06).
 *
 * PRÉ-REQUISITO: PostgreSQL disponível via `npm run infra:up` + migration
 * aplicada. Ainda não executado nesta fase — ver auth.e2e-spec.ts.
 */
describe("Spaces isolation (e2e)", () => {
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

  async function registerUser(email: string) {
    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ name: email, email, password: "12345678" })
      .expect(201);
    return response.body as { accessToken: string; user: { id: string } };
  }

  it("CRÍTICO — usuário A não consegue acessar o Financial Space do usuário B", async () => {
    const userA = await registerUser("a@example.com");
    const userB = await registerUser("b@example.com");

    const spacesA = await request(app.getHttpServer())
      .get("/api/v1/spaces")
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);

    const spaceIdA = spacesA.body[0].id;

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceIdA}`)
      .set("Authorization", `Bearer ${userB.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/v1/spaces/${spaceIdA}`)
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .expect(200);
  });

  it("owner consegue criar um Financial Space adicional e ele aparece na listagem", async () => {
    const user = await registerUser("multi@example.com");

    await request(app.getHttpServer())
      .post("/api/v1/spaces")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({ name: "Espaço Empresarial", type: "BUSINESS" })
      .expect(201);

    const spaces = await request(app.getHttpServer())
      .get("/api/v1/spaces")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .expect(200);

    expect(spaces.body).toHaveLength(2);
  });
});
