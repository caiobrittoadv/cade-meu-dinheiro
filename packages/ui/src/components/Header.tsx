export interface HeaderProps {
  spaceName: string;
  onSpaceSelectorClick?: () => void;
  userName: string;
  userEmail: string;
  onMenuClick?: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Header({ spaceName, onSpaceSelectorClick, userName, userEmail, onMenuClick }: HeaderProps) {
  return (
    <header className="cmd-header">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button
          type="button"
          className="cmd-header-menu-button"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
        >
          ☰
        </button>
        <button type="button" className="cmd-header-space-selector" onClick={onSpaceSelectorClick}>
          <span className="cmd-header-space-label">{spaceName}</span>
          <span aria-hidden="true">▾</span>
        </button>
      </div>

      <div className="cmd-header-user">
        <div style={{ textAlign: "right" }}>
          <div className="cmd-header-user-name">{userName}</div>
          <div className="cmd-header-user-email">{userEmail}</div>
        </div>
        <div className="cmd-header-avatar" aria-hidden="true">
          {initials(userName)}
        </div>
      </div>
    </header>
  );
}
