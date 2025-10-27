import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

export interface Column<T> {
  /** Column header label */
  header: string;
  /** Accessor function to get cell value */
  accessorKey?: keyof T;
  /** Custom cell renderer function */
  cell?: (row: T) => React.ReactNode;
  /** Column width class (e.g., "w-[100px]") */
  className?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Optional className for the wrapper div */
  className?: string;
  /** Show empty state when no data */
  emptyMessage?: string;
  /** Optional row click handler */
  onRowClick?: (row: T) => void;
  /** Optional row className function */
  getRowClassName?: (row: T) => string;
}

/**
 * DataTable Component
 *
 * Reusable data table component with flexible column configuration
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { header: "Name", accessorKey: "name" },
 *     { header: "Email", accessorKey: "email" },
 *     {
 *       header: "Actions",
 *       cell: (user) => <Button>Edit</Button>,
 *       align: "right"
 *     }
 *   ]}
 *   onRowClick={(user) => router.push(`/users/${user.id}`)}
 * />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className = "",
  emptyMessage = "No data available",
  onRowClick,
  getRowClassName,
}: DataTableProps<T>) {
  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`${column.className || ""} ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : ""
                }`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                } ${getRowClassName?.(row) || ""}`}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`${column.className || ""} ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                      ? row[column.accessorKey]
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
