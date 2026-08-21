import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  /** Eleva e sobe sutilmente no hover — usar em cards clicáveis/selecionáveis. */
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ padded = true, interactive = false, className, children, ...rest }: CardProps) {
  const classes = [
    "cmd-card",
    padded && "cmd-card--padded",
    interactive && "cmd-card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
