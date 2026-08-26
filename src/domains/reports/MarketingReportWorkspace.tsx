import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import EmployeePicker from "../../components/employees/EmployeePicker";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../lib/auth/session";
import { hasEffectivePermission } from "../../lib/permissions/effectiveAccess";
import { formatCurrency, formatNumber } from "../../utils/format";
import { ErrorBlock, LoadingBlock, Panel, Segmented, TableFrame, inputClass, labelClass } from "../components";
import type { ReportTable } from "../erp.types";
import { employeeService, marketingService, reportService } from "../services";

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function displaySummary(label: string, value: string) {
  return /collection|sales|amount/i.test(label) ? formatCurrency(value, true) : formatNumber(value);
}

export default function MarketingReportWorkspace({ from, to, preset = "", initialEmployeeId, initialSubjectId }: { from: string; to: string; preset?: string; initialEmployeeId?: string; initialSubjectId?: string }) {
  const user = useAuthStore((state) => state.session?.user);
  const canExport = hasEffectivePermission(user, "marketing", "export");
  const canPrint = hasEffectivePermission(user, "print", "view");
  const [employeeId, setEmployeeId] = useState(user?.role === "Sales Executive" ? user.id : initialEmployeeId ?? "all");
  const [territory, setTerritory] = useState("");
  const [activityType, setActivityType] = useState("");
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");
  const [verification, setVerification] = useState("");
  const [status, setStatus] = useState(preset === "overdue" ? "OVERDUE" : "");
  const [groupBy, setGroupBy] = useState("Date");
  const [mode, setMode] = useState<"Summary" | "Detail">(["verification", "overdue", "today", "my-day"].includes(preset) ? "Detail" : "Summary");
  const [tableId, setTableId] = useState(preset === "funnel" ? "lead-funnel" : preset === "verification" ? "visit-verification" : preset === "week" || preset === "overdue" ? "follow-up-status" : preset === "month" || preset === "target" ? "target-actual" : "marketing-activity");
  const directoryQuery = useQuery({ queryKey: ["employees", "directory", "marketing", user?.id], queryFn: () => employeeService.directory("marketing") });
  const subjectsQuery = useQuery({ queryKey: ["marketing", "subjects", user?.id], queryFn: marketingService.subjects });
  const reportQuery = useQuery({
    queryKey: ["reports", "marketing", from, to, employeeId, territory, activityType, subjectId, verification, status, groupBy, mode],
    queryFn: () => reportService.marketing({ from, to, employeeId, territory, activityType, subjectId, verification, status, groupBy, mode }),
    enabled: Boolean(from && to && from <= to)
  });

  const data = reportQuery.data;
  const tables = useMemo(() => data?.tables.filter((table) => mode === "Detail" || ["marketing-grouped", "lead-funnel", "target-actual", "activity-score"].includes(table.id)) ?? [], [data, mode]);
  const selected = tables.find((table) => table.id === tableId) ?? tables[0];

  useEffect(() => {
    if (tables.length && !tables.some((table) => table.id === tableId)) setTableId(tables[0].id);
  }, [tableId, tables]);

  if (directoryQuery.isLoading || subjectsQuery.isLoading || reportQuery.isLoading) return <LoadingBlock label="Preparing marketing report" />;
  if (directoryQuery.isError || subjectsQuery.isError || reportQuery.isError || !data) return <ErrorBlock error={directoryQuery.error ?? subjectsQuery.error ?? reportQuery.error ?? new Error("Marketing report is unavailable.")} onRetry={() => { void directoryQuery.refetch(); void subjectsQuery.refetch(); void reportQuery.refetch(); }} />;

  const exportCsv = async () => {
    await reportService.authorizeMarketingExport();
    const exported = selected ? [selected] : tables;
    const lines: string[] = [];
    for (const table of exported) {
      lines.push(csvCell(table.title));
      lines.push(table.columns.map((column) => csvCell(column.label)).join(","));
      for (const row of table.rows) lines.push(table.columns.map((column) => csvCell(row[column.key] ?? "")).join(","));
      lines.push("");
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mipro-marketing-${selected?.id ?? "report"}-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid w-full min-w-0 max-w-full gap-4">
      <Panel className="min-w-0" title="Marketing Report Builder" subtitle="Official metrics come from field verification and connected ERP transactions" actions={<>{canExport ? <Button icon={<Download className="h-4 w-4" />} onClick={() => void exportCsv()}>CSV</Button> : null}{canPrint ? <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print / Save PDF</Button> : null}</>}>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><EmployeePicker employees={directoryQuery.data ?? []} value={employeeId} onChange={setEmployeeId} allowAll={user?.role !== "Sales Executive"} allLabel="All Permitted Employees" /></div>
          <label><span className={labelClass}>Territory</span><select className={inputClass} value={territory} onChange={(event) => setTerritory(event.target.value)}><option value="">All territories</option>{[...new Set((directoryQuery.data ?? []).map((employee) => employee.territory).filter(Boolean))].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label><span className={labelClass}>Activity Type</span><select className={inputClass} value={activityType} onChange={(event) => setActivityType(event.target.value)}><option value="">All activities</option>{["LEAD_CREATED", "CUSTOMER_CONTACT", "CUSTOMER_VISIT", "PRODUCT_PRESENTATION", "SAMPLE_DELIVERED", "FOLLOW_UP_COMPLETED", "NEGOTIATION_UPDATE", "CHECK_IN", "CHECK_OUT", "QUOTATION_SUBMITTED", "ORDER_RECEIVED", "DELIVERY_POSTED", "PAYMENT_COLLECTED", "LEAD_CONVERTED"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label><span className={labelClass}>Customer / Lead</span><select className={inputClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">All customers and leads</option><optgroup label="Leads">{(subjectsQuery.data ?? []).filter((entry) => entry.type === "Lead").map((entry) => <option value={entry.value} key={entry.value}>{entry.label}</option>)}</optgroup><optgroup label="Customers">{(subjectsQuery.data ?? []).filter((entry) => entry.type === "Customer").map((entry) => <option value={entry.value} key={entry.value}>{entry.label}</option>)}</optgroup></select></label>
          <label><span className={labelClass}>Verification</span><select className={inputClass} value={verification} onChange={(event) => setVerification(event.target.value)}><option value="">All verification</option><option value="SYSTEM_VERIFIED">System Verified</option><option value="GPS_VERIFIED">GPS Verified</option><option value="MANUAL">Manual</option><option value="UNVERIFIED">Unverified</option></select></label>
          <label><span className={labelClass}>Lead / Follow-up / Visit Status</span><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["NEW", "CONTACTED", "INTERESTED", "PRESENTATION", "SAMPLE", "QUOTATION", "NEGOTIATION", "ORDER", "DELIVERED", "PAYMENT", "LOST", "PENDING", "OVERDUE", "COMPLETED", "CANCELLED", "PLANNED", "CHECKED_IN", "MISSED"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label><span className={labelClass}>Group By</span><select className={inputClass} value={groupBy} onChange={(event) => setGroupBy(event.target.value)}><option>Date</option><option>Employee</option><option>Territory</option><option>Customer</option><option>Activity Type</option><option>Lead Stage</option></select></label>
          <div className="sm:col-span-2"><span className={labelClass}>Report View</span><Segmented value={mode} onChange={setMode} ariaLabel="Marketing report detail" options={[{ value: "Summary", label: "Summary" }, { value: "Detail", label: "Detail" }]} /></div>
        </div>
      </Panel>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Marketing report summary">{data.summary.map((row) => <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={row.label}><span className="text-xs text-slate-500">{row.label}</span><strong className="mt-1 block text-xl text-slate-950">{displaySummary(row.label, row.value)}</strong></div>)}</section>

      <div className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-3 shadow-sm"><Segmented value={selected?.id ?? tableId} onChange={setTableId} ariaLabel="Marketing report types" options={tables.map((table) => ({ value: table.id, label: table.title, count: table.rows.length }))} /></div>
      <Panel className="min-w-0" title={selected?.title ?? "Marketing Report"} subtitle={`${from} to ${to} | ${mode} | grouped by ${groupBy}`} actions={<span className="flex items-center gap-2 text-xs text-slate-500"><FileSpreadsheet className="h-4 w-4 text-cyan-700" />{selected?.rows.length ?? 0} rows</span>}>
        {selected ? <MarketingDataTable table={selected} /> : <div className="p-8 text-center text-sm text-slate-500">No report matches the current view.</div>}
      </Panel>
    </div>
  );
}

function MarketingDataTable({ table }: { table: ReportTable }) {
  return <TableFrame><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr>{table.columns.map((column) => <th className={`px-3 py-2 ${column.align === "right" ? "text-right" : ""}`} key={column.key}>{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{table.rows.map((row, index) => <tr key={`${table.id}-${index}`}>{table.columns.map((column) => <td className={`px-3 py-3 text-slate-700 ${column.align === "right" ? "text-right font-semibold" : ""}`} key={column.key}>{row[column.key] || "-"}</td>)}</tr>)}</tbody></table></TableFrame>;
}
