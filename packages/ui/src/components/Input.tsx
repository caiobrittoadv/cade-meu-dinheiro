import type { InputHTMLAttributes } from "react";
import { useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="cmd-field">
      {label && (
        <label className="cmd-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={["cmd-input", error && "cmd-input--error", className].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? (
        <span className="cmd-helper cmd-helper--error">{error}</span>
      ) : helperText ? (
        <span className="cmd-helper">{helperText}</span>
      ) : null}
    </div>
  );
}
