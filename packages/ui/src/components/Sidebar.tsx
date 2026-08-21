import type { ReactNode } from "react";

export interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  /** Item preparado visualmente, mas sem funcionalidade ainda ("em breve"). */
  comingSoon?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeHref: string;
  brandName: string;
  /**
   * Router-agnostic: packages/ui não depende de next/link. O app consumidor
   * decide como renderizar a navegação real (ex.: <Link>).
   */
  renderLink: (item: SidebarItem, className: string, children: ReactNode) => ReactNode;
  open?: boolean;
}

export function Sidebar({ items, activeHref, brandName, renderLink, open = true }: SidebarProps) {
  const classes = ["cmd-sidebar", open && "cmd-sidebar--open"].filter(Boolean).join(" ");

  return (
    <aside className={classes} aria-label="Navegação principal">
      <div className="cmd-sidebar-brand">
        <span className="cmd-sidebar-brand-mark" aria-hidden="true">
          $
        </span>
        <span className="cmd-sidebar-brand-name">{brandName}</span>
      </div>

      <nav className="cmd-sidebar-nav">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          const className = [
            "cmd-sidebar-item",
            isActive && "cmd-sidebar-item--active",
            item.comingSoon && "cmd-sidebar-item--disabled",
          ]
            .filter(Boolean)
            .join(" ");

          const content = (
            <>
              {item.icon && (
                <span className="cmd-sidebar-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
              {item.comingSoon && <span className="cmd-sidebar-item-soon">em breve</span>}
            </>
          );

          if (item.comingSoon) {
            return (
              <span key={item.key} className={className} aria-disabled="true">
                {content}
              </span>
            );
          }

          return <span key={item.key}>{renderLink(item, className, content)}</span>;
        })}
      </nav>
    </aside>
  );
}
