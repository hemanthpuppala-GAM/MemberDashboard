import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import EmptyState from "./EmptyState";
import { Select } from "./Field";

/**
 * Generic admin list table: sorting, global search, pagination, row selection slot.
 * `toolbar` renders filter chips/buttons to the right of the search box.
 *
 * By default sorting/filtering/pagination run client-side over `data`.
 * Pass `manual` to hand all three to the server instead: the table then
 * expects `data` to already be one page, `pageCount` to reflect the server's
 * total, and `pagination`/`onPaginationChange` (+ optionally `sorting`/
 * `onSortingChange` and `globalFilter`/`onGlobalFilterChange`) to be controlled
 * by the parent.
 */
export default function DataTable({
  columns,
  data,
  searchPlaceholder = "Search...",
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  pageSize = 10,
  onRowClick,
  manual = false,
  pageCount,
  enableSorting = true,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange: controlledOnGlobalFilterChange,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  searchDebounceMs = 350,
}) {
  const [internalSorting, setInternalSorting] = useState([]);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const [internalPagination, setInternalPagination] = useState({ pageIndex: 0, pageSize });

  const sorting = manual ? controlledSorting ?? [] : internalSorting;
  const onSortingChange = manual ? controlledOnSortingChange ?? (() => {}) : setInternalSorting;
  const globalFilter = manual ? controlledGlobalFilter ?? "" : internalGlobalFilter;
  const onGlobalFilterChange = manual ? controlledOnGlobalFilterChange ?? (() => {}) : setInternalGlobalFilter;
  const pagination = manual ? controlledPagination ?? { pageIndex: 0, pageSize } : internalPagination;
  const onPaginationChange = manual ? controlledOnPaginationChange ?? (() => {}) : setInternalPagination;

  // Debounce the search box so manual mode doesn't fire a request per keystroke.
  const [searchInput, setSearchInput] = useState(globalFilter);
  useEffect(() => setSearchInput(globalFilter), [globalFilter]);
  useEffect(() => {
    if (!manual) return undefined;
    const id = setTimeout(() => {
      if (searchInput !== globalFilter) onGlobalFilterChange(searchInput);
    }, searchDebounceMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, manual]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange,
    onGlobalFilterChange,
    onPaginationChange,
    enableSorting,
    manualPagination: manual,
    manualSorting: manual,
    manualFiltering: manual,
    pageCount: manual ? pageCount ?? -1 : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const rowCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--a-text-faint)]" />
          <input
            value={manual ? searchInput : globalFilter}
            onChange={(e) => (manual ? setSearchInput(e.target.value) : onGlobalFilterChange(e.target.value))}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-base)] py-2 pr-3 pl-9 text-[13px] text-[var(--a-text-primary)] placeholder:text-[var(--a-text-faint)] outline-none focus:border-[var(--a-focus)] focus:ring-2 focus:ring-[var(--a-focus-muted)]"
          />
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--a-border)]">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[var(--a-bg-surface-2)]">
                {hg.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--a-text-muted)] uppercase select-none ${sortable ? "cursor-pointer hover:text-[var(--a-text-primary)]" : ""}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && (sorted === "asc" ? <ArrowUp size={12} /> : sorted === "desc" ? <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={`border-t border-[var(--a-border)] ${onRowClick ? "cursor-pointer" : ""} hover:bg-[var(--a-bg-surface-2)]`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-[13.5px] text-[var(--a-text-primary)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[var(--a-text-muted)]">
          <div className="flex items-center gap-2">
            Rows per page
            <Select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="w-auto! py-1! pr-8! pl-2.5!"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Page {pagination.pageIndex + 1} of {Math.max(rowCount, 1)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border border-[var(--a-border)] p-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border border-[var(--a-border)] p-1.5 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
