import React from "react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyText?: string;
  /** Disables the scroll wrapper so row-level popovers are not clipped. */
  overflowVisible?: boolean;
  onRowClick?: (row: T) => void;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "No records found",
  overflowVisible = false,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={`w-full ${overflowVisible ? "" : "overflow-x-auto"}`}>
      {/* border-separate so the rounded header corners render; row separators
          therefore live on the cells, not the rows */}
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap bg-white border-y border-gray-200 first:border-l first:rounded-tl-lg last:border-r last:rounded-tr-lg"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-12 text-sm">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`last:[&>td]:border-b-0 ${index % 2 === 0 ? "bg-brand-lighter-gray" : "bg-white"} ${onRowClick ? "cursor-pointer hover:bg-brand-light-gray" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-4 align-middle border-b border-gray-100"
                  >
                    {col.render
                      ? col.render(row, index)
                      : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
