import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, getRowKey, onRowClick }: TableProps<T>) {
  const classes = ["cmd-table", onRowClick && "cmd-table--clickable"].filter(Boolean).join(" ");

  return (
    <table className={classes}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} style={{ textAlign: column.align ?? "left" }}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map((column) => (
              <td key={column.key} style={{ textAlign: column.align ?? "left" }}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
