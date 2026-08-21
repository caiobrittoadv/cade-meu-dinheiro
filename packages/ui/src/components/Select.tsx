import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  helperText,
  error,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="cmd-field">
      {label && (
        <label className="cmd-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={["cmd-select", error && "cmd-select--error", className].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="cmd-helper cmd-helper--error">{error}</span>
      ) : helperText ? (
        <span className="cmd-helper">{helperText}</span>
      ) : null}
    </div>
  );
}
