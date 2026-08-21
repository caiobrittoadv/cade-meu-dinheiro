import type { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** Loader no formato do conteúdo real — usar em vez de LoadingState dentro
 * de tabelas/listas, onde o layout final já é conhecido. */
export function Skeleton({ width = "100%", height = 16, className, style }: SkeletonProps) {
  const classes = ["cmd-skeleton", className].filter(Boolean).join(" ");
  return <div className={classes} style={{ width, height, ...style }} aria-hidden="true" />;
}
