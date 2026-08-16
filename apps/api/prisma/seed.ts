import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed técnico da Fase 01 (Fundação).
 *
 * Nesta fase ainda não existem Auth nem Financial Space (Fase 02), e
 * Category pertence obrigatoriamente a um space_id. Por isso, não há
 * dados de domínio válidos para semear ainda — conforme o Documento 10
 * (F01.19): "Não utilizar seed para mascarar ausência de implementação."
 *
 * Este script apenas valida que a conexão Prisma → PostgreSQL funciona.
 * Categorias padrão por espaço serão adicionadas quando Financial Space
 * (Fase 02) existir.
 */
async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Seed técnico: conexão com o banco validada.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
