import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "neutral" | "primary" | "success" | "danger" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  const classes = ["cmd-badge", `cmd-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
