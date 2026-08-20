import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoryType } from "@prisma/client";
import { PrismaService } from "../shared/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

/**
 * Único item textualmente mandatado pela documentação (Documento 06, Seção
 * 49: "Toda despesa confirmada deve possuir categoria, inclusive Outros. É
 * melhor utilizar Outros do que bloquear o lançamento."). Nenhum documento
 * define uma taxonomia completa de categorias padrão — o restante da lista
 * não foi inventado aqui; ver relatório de implementação do E08.
 */
const DEFAULT_CATEGORIES: Array<{ name: string; type: CategoryType }> = [
  { name: "Outros", type: "EXPENSE" },
];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(spaceId: string, dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.assertParentInSameSpace(spaceId, dto.parentId);
    }

    return this.prisma.category.create({
      data: {
        spaceId,
        name: dto.name,
        type: dto.type,
        parentId: dto.parentId,
        icon: dto.icon,
        color: dto.color,
      },
    });
  }

  findAllForSpace(spaceId: string) {
    return this.prisma.category.findMany({ where: { spaceId } });
  }

  async findOne(spaceId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, spaceId },
    });

    if (!category) {
      throw new NotFoundException("Categoria não encontrada neste Financial Space.");
    }

    return category;
  }

  async update(spaceId: string, categoryId: string, dto: UpdateCategoryDto) {
    const existing = await this.findOne(spaceId, categoryId);

    if (existing.isSystem) {
      throw new ForbiddenException("Categorias do sistema não podem ser alteradas, arquivadas ou excluídas.");
    }

    if (dto.parentId) {
      await this.assertParentInSameSpace(spaceId, dto.parentId);
    }

    // updateMany (em vez de update) porque o where combina id + spaceId:
    // isolamento explícito, nunca dependente apenas do guard de rota.
    const result = await this.prisma.category.updateMany({
      where: { id: categoryId, spaceId },
      data: dto,
    });

    if (result.count === 0) {
      throw new NotFoundException("Categoria não encontrada neste Financial Space.");
    }

    return this.findOne(spaceId, categoryId);
  }

  /**
   * Inicializa as categorias padrão (isSystem: true) de um Financial Space.
   * NÃO é chamada automaticamente por SpacesService nesta etapa (E08) —
   * capacidade isolada, pronta para ser integrada em uma tarefa futura,
   * conforme decisão 2.
   */
  initializeDefaultCategories(spaceId: string) {
    return this.prisma.category.createManyAndReturn({
      data: DEFAULT_CATEGORIES.map((category) => ({
        ...category,
        spaceId,
        isSystem: true,
      })),
    });
  }

  private async assertParentInSameSpace(spaceId: string, parentId: string) {
    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, spaceId },
    });

    if (!parent) {
      throw new BadRequestException(
        "parentId deve apontar para uma categoria existente no mesmo Financial Space.",
      );
    }
  }
}
