"use client";

import { useMemo } from "react";
import { Badge, Button, Card, Skeleton, StatusBadge } from "@cade-meu-dinheiro/ui";
import { PageHeader } from "@/components/PageHeader";
import { useMockQuery } from "@/lib/use-mock-query";
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

const TYPE_LABEL: Record<Category["type"], string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  BOTH: "Ambos",
};

export default function CategoriesPage() {
  // TODO(integração real): apiClient.categories.list(spaceId).
  const query = useMockQuery(mockCategories);

  const categoryById = useMemo(() => new Map(query.data.map((c) => [c.id, c])), [query.data]);
  const systemCategories = query.data.filter((c) => c.isSystem);
  const customCategories = query.data.filter((c) => !c.isSystem);

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas receitas e despesas por categoria."
        action={<Button>+ Nova categoria</Button>}
      />

      {query.loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton width="70%" height={16} style={{ marginBottom: "var(--space-3)" }} />
              <Skeleton width="40%" height={20} />
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          <CategoryGroup
            title="Categorias do sistema"
            description="Protegidas — não podem ser editadas ou arquivadas."
            categories={systemCategories}
            categoryById={categoryById}
          />
          <CategoryGroup
            title="Categorias personalizadas"
            description="Criadas por você."
            categories={customCategories}
            categoryById={categoryById}
          />
        </div>
      )}
    </div>
  );
}

function CategoryGroup({
  title,
  description,
  categories,
  categoryById,
}: {
  title: string;
  description: string;
  categories: Category[];
  categoryById: Map<string, Category>;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, marginBottom: "var(--space-1)" }}>
        {title}
      </h2>
      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-secondary)",
          marginTop: 0,
          marginBottom: "var(--space-4)",
        }}
      >
        {description}
      </p>

      {categories.length === 0 ? (
        <Card>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            Nenhuma categoria aqui ainda.
          </span>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {categories.map((category) => (
            <Card key={category.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                <span aria-hidden="true">{category.icon ?? "🗂️"}</span>
                <strong>{category.name}</strong>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                <Badge tone="neutral">{TYPE_LABEL[category.type]}</Badge>
                {category.parentId && (
                  <Badge tone="primary">↳ {categoryById.get(category.parentId)?.name ?? "categoria pai"}</Badge>
                )}
                <StatusBadge status={category.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
