import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="cmd-empty-state">
      {icon && <div className="cmd-empty-state-icon">{icon}</div>}
      <div className="cmd-empty-state-title">{title}</div>
      {description && <div className="cmd-empty-state-description">{description}</div>}
      {action}
    </div>
  );
}
