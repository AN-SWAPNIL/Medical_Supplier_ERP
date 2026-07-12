import { ChevronLeft, ChevronRight, Download, Eye, FileDown, Pencil, Printer, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import type { EntityRecord } from "../../types";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";

type DataTableProps = {
  rows: EntityRecord[];
  columns: string[];
  searchable: string[];
  filterKey?: string;
  statusKey?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canPrint?: boolean;
  onView: (row: EntityRecord) => void;
  onEdit: (row: EntityRecord) => void;
  onDelete: (row: EntityRecord) => void;
  onPrint?: (row: EntityRecord) => void;
  rowCanEdit?: (row: EntityRecord) => boolean;
  rowCanDelete?: (row: EntityRecord) => boolean;
};

const pageSize = 8;

function humanize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCell(key: string, value: EntityRecord[string]) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  if (key.toLowerCase().includes("date") || key.toLowerCase().includes("eta") || key.toLowerCase().includes("etd")) {
    return typeof value === "string" ? formatDate(value) : String(value);
  }

  if (typeof value === "number") {
    const isMoney = /amount|price|value|balance|salary|cost|revenue|profit|due|target|achieved|limit|pay/i.test(key);
    return isMoney ? formatCurrency(value) : formatNumber(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

function csvValue(value: EntityRecord[string]) {
  if (Array.isArray(value)) {
    return `"${value.join(", ")}"`;
  }
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function DataTable({
  rows,
  columns,
  searchable,
  filterKey,
  statusKey = "status",
  canEdit,
  canDelete,
  canExport,
  canPrint,
  onView,
  onEdit,
  onDelete,
  onPrint,
  rowCanEdit,
  rowCanDelete
}: DataTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(() => {
    if (!filterKey) {
      return [];
    }
    return Array.from(new Set(rows.map((row) => String(row[filterKey] ?? "")).filter(Boolean)));
  }, [filterKey, rows]);

  const filteredRows = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !lowerQuery ||
        searchable.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(lowerQuery)
        );
      const matchesFilter = filter === "all" || String(row[filterKey ?? ""] ?? "") === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, filterKey, query, rows, searchable]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const header = columns.join(",");
    const body = filteredRows.map((row) => columns.map((key) => csvValue(row[key])).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mipro-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterKey ? (
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="all">All {humanize(filterKey)}</option>
              {filters.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : null}
          {canExport ? (
            <>
              <Button icon={<Download className="h-4 w-4" />} onClick={exportCsv}>
                CSV
              </Button>
              <Button icon={<FileDown className="h-4 w-4" />} onClick={() => window.print()}>
                PDF
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500" key={column}>
                  {humanize(column)}
                </th>
              ))}
              <th className="sticky right-0 bg-slate-50 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                  No records found for this search or filter.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr className="hover:bg-slate-50" key={row.id}>
                  {columns.map((column) => (
                    <td className="max-w-[260px] whitespace-nowrap px-4 py-3 text-slate-700" key={column}>
                      {column === statusKey ? <StatusBadge status={String(row[column] ?? "")} /> : formatCell(column, row[column])}
                    </td>
                  ))}
                  <td className="sticky right-0 bg-inherit px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" aria-label="View" icon={<Eye className="h-4 w-4" />} onClick={() => onView(row)} />
                      {canEdit && (rowCanEdit?.(row) ?? true) ? <Button variant="ghost" aria-label="Edit" icon={<Pencil className="h-4 w-4" />} onClick={() => onEdit(row)} /> : null}
                      {canPrint ? <Button variant="ghost" aria-label="Print" icon={<Printer className="h-4 w-4" />} onClick={() => onPrint?.(row)} /> : null}
                      {canDelete && (rowCanDelete?.(row) ?? true) ? <Button variant="ghost" aria-label="Delete" icon={<Trash2 className="h-4 w-4" />} onClick={() => onDelete(row)} /> : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {visibleRows.length} of {filteredRows.length} records
        </span>
        <div className="flex items-center gap-2">
          <Button disabled={page === 1} icon={<ChevronLeft className="h-4 w-4" />} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Prev
          </Button>
          <span className="font-semibold text-slate-800">
            {page} / {pageCount}
          </span>
          <Button disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
