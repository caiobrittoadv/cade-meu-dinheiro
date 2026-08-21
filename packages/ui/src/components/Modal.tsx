import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const EXIT_DURATION_MS = 180;

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      wasOpen.current = true;
      return;
    }

    if (!wasOpen.current) return;
    wasOpen.current = false;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setMounted(false);
      return;
    }

    setClosing(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`cmd-modal-overlay${closing ? " cmd-modal-overlay--closing" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`cmd-modal${closing ? " cmd-modal--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cmd-modal-header">
          <h2 className="cmd-modal-title">{title}</h2>
          <button
            type="button"
            className="cmd-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="cmd-modal-body">{children}</div>
        {footer && <div className="cmd-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
