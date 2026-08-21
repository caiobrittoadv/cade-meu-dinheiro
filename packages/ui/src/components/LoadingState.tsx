export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="cmd-loading-state">
      <span className="cmd-spinner" role="status" aria-label={label} />
      <span>{label}</span>
    </div>
  );
}
