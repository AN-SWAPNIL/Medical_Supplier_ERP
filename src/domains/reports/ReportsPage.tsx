import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Download,
  FileDown,
  FileSpreadsheet,
  PackageSearch,
  Printer,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Search,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { hasEffectivePermission } from "../../lib/permissions/effectiveAccess";
import { businessDate } from "../../lib/date";
import { formatCurrency, formatNumber } from "../../utils/format";
import type { ReportTable, SalespersonPerformanceData, SalespersonPerformanceSummary } from "../erp.types";
import { ErrorBlock, LoadingBlock, Panel, Segmented, TableFrame, inputClass, labelClass } from "../components";
import { aiService, reportService, settingsService } from "../services";
import { useAIContextStore } from "../../lib/ai/context";
import type { Role } from "../../types";
import MarketingReportWorkspace from "./MarketingReportWorkspace";

type View = "overview" | "marketing" | "imports" | "inventory" | "sales" | "expenses" | "audit";
type ReportGroupId = Exclude<View, "overview" | "marketing" | "audit">;

const colors = ["#075985", "#0891b2", "#059669", "#d97706"];
type PeriodPreset = "today" | "yesterday" | "this-week" | "last-week" | "this-month" | "last-month" | "custom";

function dateOffset(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function periodForPreset(preset: PeriodPreset, today: string) {
  if (preset === "today" || preset === "custom") return { from: today, to: today };
  if (preset === "yesterday") { const date = dateOffset(today, -1); return { from: date, to: date }; }
  const todayDate = new Date(`${today}T00:00:00Z`);
  const mondayOffset = -((todayDate.getUTCDay() + 6) % 7);
  const thisMonday = dateOffset(today, mondayOffset);
  if (preset === "this-week") return { from: thisMonday, to: today };
  if (preset === "last-week") return { from: dateOffset(thisMonday, -7), to: dateOffset(thisMonday, -1) };
  const [year, month] = today.split("-").map(Number);
  if (preset === "last-month") {
    const from = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 10);
    const to = new Date(Date.UTC(year, month - 1, 0)).toISOString().slice(0, 10);
    return { from, to };
  }
  return { from: `${today.slice(0, 7)}-01`, to: today };
}

function initialPeriodPreset(preset: string): PeriodPreset {
  if (["today", "my-day", "overdue"].includes(preset)) return "today";
  if (preset === "week") return "this-week";
  if (preset === "custom") return "custom";
  return "this-month";
}

function numeric(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function displayValue(value: string, key = "") {
  if (value === "Restricted") return value;
  const isMoney = /amount|value|cost|sales|collected|collection|due|profit|landed|revenue|cogs|ta|da/i.test(key);
  return isMoney && /^-?\d+(\.\d+)?$/.test(value) ? formatCurrency(value) : value;
}

export default function ReportsPage() {
  const today = businessDate();
  const role = useEffectiveRole();
  const user = useAuthStore((state) => state.session?.user);
  const canExport = hasEffectivePermission(user, "reports", "export");
  const canPrint = hasEffectivePermission(user, "print", "view");
  const [params] = useSearchParams();
  const preset = params.get("preset") ?? "";
  const requestedFrom = params.get("from");
  const requestedTo = params.get("to");
  const hasRequestedPeriod = Boolean(requestedFrom && requestedTo && /^\d{4}-\d{2}-\d{2}$/.test(requestedFrom) && /^\d{4}-\d{2}-\d{2}$/.test(requestedTo) && requestedFrom <= requestedTo);
  const requestedView = params.get("view") as View | null;
  const [view, setView] = useState<View>(requestedView ?? (role === "Sales Executive" ? "sales" : "overview"));
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>(() => hasRequestedPeriod ? "custom" : initialPeriodPreset(preset));
  const initialPeriod = periodForPreset(initialPeriodPreset(preset), today);
  const [from, setFrom] = useState(hasRequestedPeriod ? requestedFrom! : initialPeriod.from);
  const [to, setTo] = useState(hasRequestedPeriod ? requestedTo! : initialPeriod.to);
  const [tableId, setTableId] = useState(params.get("table") ?? (role === "Sales Executive" ? "salesperson-performance" : ""));
  const [taDaEmployee, setTaDaEmployee] = useState("All employees");
  const salesEmployeeId = role === "Sales Executive" ? "self" : "all";
  const navigate = useNavigate();
  const setReportPeriod = useAIContextStore((state) => state.setReportPeriod);
  const canAudit = ["Super Admin", "Managing Director", "Accounts"].includes(role);
  const canMarketing = hasEffectivePermission(user, "marketing", "view");
  const reportQuery = useQuery({
    queryKey: ["reports", from, to],
    queryFn: () => reportService.get(from, to),
    enabled: Boolean(from && to && from <= to)
  });
  const performanceQuery = useQuery({
    queryKey: ["reports", "salespeople", from, to, salesEmployeeId],
    queryFn: () => reportService.salespeople(from, to, salesEmployeeId),
    enabled: Boolean(from && to && from <= to)
  });
  const insightQuery = useQuery({
    queryKey: ["ai", "report-insights", from, to, role],
    queryFn: () => aiService.insights({ route: "/app/reports", entityType: "reports", reportFrom: from, reportTo: to }),
    enabled: Boolean(from && to && from <= to)
  });
  const auditQuery = useQuery({ queryKey: ["reports", "audit"], queryFn: settingsService.audit, enabled: canAudit });

  useEffect(() => setReportPeriod(from, to), [from, to, setReportPeriod]);

  const report = reportQuery.data;
  const groups = useMemo(() => report ? [
    { id: "imports" as const, title: "Import & Cost", icon: FileDown, rows: report.importCosts, tables: report.tables.imports },
    { id: "inventory" as const, title: "Inventory", icon: PackageSearch, rows: report.inventory, tables: report.tables.inventory },
    { id: "sales" as const, title: "Sales & Collection", icon: ShoppingCart, rows: report.sales, tables: report.tables.sales },
    { id: "expenses" as const, title: "Expense & Cash-Bank", icon: ReceiptText, rows: report.expenses, tables: report.tables.expenses }
  ].filter((group) => role !== "Sales Executive" || group.id === "sales") : [], [report, role]);
  const selectedGroup = groups.find((group) => group.id === view);
  const selectedTable = tableId === "salesperson-performance" ? undefined : selectedGroup?.tables.find((table) => table.id === tableId) ?? selectedGroup?.tables[0];

  useEffect(() => {
    if (selectedGroup && tableId !== "salesperson-performance" && !selectedGroup.tables.some((table) => table.id === tableId)) {
      setTableId(selectedGroup.id === "sales" ? "salesperson-performance" : selectedGroup.tables[0]?.id ?? "");
    }
  }, [selectedGroup, tableId]);

  if (reportQuery.isLoading || performanceQuery.isLoading || (canAudit && auditQuery.isLoading)) return <LoadingBlock label="Preparing period and employee reports" />;
  if (reportQuery.isError || performanceQuery.isError || (canAudit && auditQuery.isError)) return <ErrorBlock error={reportQuery.error ?? performanceQuery.error ?? auditQuery.error} onRetry={() => { void reportQuery.refetch(); void performanceQuery.refetch(); if (canAudit) void auditQuery.refetch(); }} />;
  if (!report) return <ErrorBlock error={new Error("Report data is unavailable for the selected period.")} />;

  const performanceTables = buildPerformanceExportTables(performanceQuery.data);
  const exportedTables = tableId === "salesperson-performance" ? performanceTables : selectedTable ? [selectedTable] : groups.flatMap((group) => group.tables);
  const exportCsv = async () => {
    await reportService.authorizeExport();
    const lines: string[] = [];
    for (const table of exportedTables) {
      lines.push(csvCell(table.title));
      lines.push(table.columns.map((column) => csvCell(column.label)).join(","));
      for (const row of table.rows) lines.push(table.columns.map((column) => csvCell(row[column.key] ?? "")).join(","));
      lines.push("");
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mipro-${selectedTable?.id ?? "reports"}-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const applyPeriodPreset = (next: PeriodPreset) => {
    setPeriodPreset(next);
    if (next === "custom") return;
    const period = periodForPreset(next, today);
    setFrom(period.from);
    setTo(period.to);
  };

  return (
    <>
      <PageHeader
        eyebrow="Management information"
        title="Reports"
        subtitle="Period-specific operating reports built from the same import, stock, delivery, collection and expense records."
        actions={
          <>
            {canExport && view !== "marketing" ? <Button icon={<Download className="h-4 w-4" />} onClick={() => void exportCsv()}>Export Current Data</Button> : null}
            {canPrint && view !== "marketing" ? <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print Current Report</Button> : null}
          </>
        }
      />

      <Panel>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[190px_190px_190px_1fr] lg:items-end">
          <label><span className={labelClass}>Period</span><select className={inputClass} value={periodPreset} onChange={(event) => applyPeriodPreset(event.target.value as PeriodPreset)}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="this-week">This Week</option><option value="last-week">Last Week</option><option value="this-month">This Month</option><option value="last-month">Last Month</option><option value="custom">Custom</option></select></label>
          <label><span className={labelClass}>From Date</span><input className={inputClass} type="date" max={to} value={from} onChange={(event) => { setFrom(event.target.value); setPeriodPreset("custom"); }} /></label>
          <label><span className={labelClass}>To Date</span><input className={inputClass} type="date" min={from} value={to} onChange={(event) => { setTo(event.target.value); setPeriodPreset("custom"); }} /></label>
          <div className="rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-900">
            <strong>Applied scope:</strong> {report.period.from} to {report.period.to} | {role} | Main Warehouse
          </div>
        </div>
      </Panel>

      {insightQuery.data?.[0] ? <div className="flex items-start gap-3 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-950" data-testid="report-ai-summary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-white text-cyan-700"><Sparkles className="h-4 w-4" /></span><div><strong>{insightQuery.data[0].title}</strong><p className="mt-0.5 text-xs leading-5 text-cyan-900">{insightQuery.data[0].summary}</p></div></div> : null}

      <Segmented
        value={view}
        onChange={setView}
        ariaLabel="Report groups"
        options={[
          ...(role === "Sales Executive" ? [] : [{ value: "overview" as const, label: "Overview" }]),
          ...(canMarketing ? [{ value: "marketing" as const, label: "Marketing Analysis" }] : []),
          ...groups.map((group) => ({ value: group.id, label: group.title })),
          ...(canAudit ? [{ value: "audit" as const, label: "Audit" }] : [])
        ]}
      />

      {view === "overview" ? <ReportOverview groups={groups} onOpen={setView} /> : null}
      {view === "marketing" && canMarketing ? <MarketingReportWorkspace from={from} to={to} preset={preset} initialEmployeeId={params.get("employee") ?? undefined} initialSubjectId={params.get("subject") ?? undefined} /> : null}
      {selectedGroup ? (
        <ReportWorkspace
          group={selectedGroup}
          selectedTable={selectedTable}
          tableId={tableId}
          onTableChange={setTableId}
          from={from}
          to={to}
          taDaEmployee={taDaEmployee}
          onTaDaEmployeeChange={setTaDaEmployee}
          performance={performanceQuery.data}
          role={role}
          onOpenEmployeeReport={(employeeId) => navigate(`/app/employees?view=activity&employee=${employeeId}`)}
        />
      ) : null}
      {view === "audit" && canAudit ? <AuditReport events={auditQuery.data ?? []} /> : null}
    </>
  );
}

function ReportOverview({ groups, onOpen }: { groups: Array<{ id: ReportGroupId; title: string; icon: typeof FileDown; rows: { label: string; value: string }[]; tables: ReportTable[] }>; onOpen: (view: View) => void }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((group, index) => {
          const Icon = group.icon;
          const first = group.rows[0];
          return (
            <button className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-cyan-300 hover:shadow" type="button" key={group.id} onClick={() => onOpen(group.id)}>
              <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded bg-slate-100"><Icon className="h-5 w-5" style={{ color: colors[index] }} /></span><span className="text-xs font-bold text-slate-400">{group.tables.length} reports</span></div>
              <h2 className="mt-3 text-base font-bold">{group.title}</h2>
              <strong className="mt-2 block truncate text-xl text-slate-950">{first?.value === "Restricted" ? "Restricted" : numeric(first?.value ?? "0") > 9999 ? formatCurrency(first?.value ?? 0, true) : formatNumber(first?.value ?? "0")}</strong>
              <span className="text-xs text-slate-500">{first?.label}</span>
            </button>
          );
        })}
      </div>
      <Panel title="Cross-workflow pulse" subtitle="Each bar is a separate operating signal; the values are not combined into an artificial total.">
        <div className="h-80 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groups.map((group) => ({ name: group.title, value: numeric(group.rows[0]?.value ?? "0") }))} margin={{ top: 10, right: 10, left: 10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={70} fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(value) => formatNumber(String(value))} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>{groups.map((group, index) => <Cell key={group.id} fill={colors[index]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}

function ReportWorkspace({ group, selectedTable, tableId, onTableChange, from, to, taDaEmployee, onTaDaEmployeeChange, performance, role, onOpenEmployeeReport }: {
  group: { id: ReportGroupId; title: string; rows: { label: string; value: string }[]; tables: ReportTable[] };
  selectedTable?: ReportTable;
  tableId: string;
  onTableChange: (id: string) => void;
  from: string;
  to: string;
  taDaEmployee: string;
  onTaDaEmployeeChange: (value: string) => void;
  performance?: SalespersonPerformanceData;
  role: Role;
  onOpenEmployeeReport: (employeeId: string) => void;
}) {
  const isTaDa = selectedTable?.id === "ta-da";
  const isSalesPerformance = group.id === "sales" && tableId === "salesperson-performance";
  const employees = isTaDa ? ["All employees", ...new Set(selectedTable.rows.map((row) => row.employee).filter(Boolean))] : [];
  const visibleRows = isTaDa && taDaEmployee !== "All employees" ? selectedTable.rows.filter((row) => row.employee === taDaEmployee) : selectedTable?.rows ?? [];
  const tableOptions = group.id === "sales" ? [{ value: "salesperson-performance", label: "Sales Team Comparison", count: performance?.comparison.length }, ...group.tables.map((table) => ({ value: table.id, label: table.title, count: table.rows.length }))] : group.tables.map((table) => ({ value: table.id, label: table.title, count: table.rows.length }));
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {group.rows.map((row, index) => <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={row.label}><span className="block text-xs text-slate-500">{row.label}</span><strong className="mt-1 block text-xl" style={{ color: colors[index % colors.length] }}>{displayValue(row.value, row.label)}</strong></div>)}
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"><Segmented value={tableId} onChange={onTableChange} ariaLabel={`${group.title} report types`} options={tableOptions} /></div>
      {isSalesPerformance && performance ? <SalespersonPerformanceWorkspace data={performance} role={role} onOpenEmployeeReport={onOpenEmployeeReport} from={from} to={to} /> : <Panel title={group.title + " reports"} subtitle={`Every table uses the active period ${from} to ${to}.`}>
        <div className="flex flex-wrap items-end justify-end gap-4 border-b border-slate-200 p-4">
          {isTaDa ? <label className="w-full sm:w-64"><span className={labelClass}>Employee</span><select className={inputClass} value={taDaEmployee} onChange={(event) => onTaDaEmployeeChange(event.target.value)}>{employees.map((name) => <option key={name}>{name}</option>)}</select></label> : <div className="flex items-center justify-end gap-2 text-xs text-slate-500"><FileSpreadsheet className="h-4 w-4 text-cyan-700" /> {visibleRows.length} filtered rows</div>}
        </div>
        {selectedTable ? <ReportDataTable table={selectedTable} rows={visibleRows} /> : <div className="p-8 text-center text-sm text-slate-500">No report is available in this group.</div>}
      </Panel>}
      {isTaDa && selectedTable ? <TaDaPrintSheet rows={visibleRows} from={from} to={to} employee={taDaEmployee} /> : null}
    </>
  );
}

const performanceMetricLabels: Array<[keyof SalespersonPerformanceSummary, string, "number" | "money" | "percent"]> = [
  ["quotationsCreated", "Quotations", "number"],
  ["quotationValue", "Quotation Value", "money"],
  ["convertedQuotations", "Converted", "number"],
  ["ordersCreated", "Orders", "number"],
  ["ordersDelivered", "Orders Delivered", "number"],
  ["deliveredSalesValue", "Delivered Sales", "money"],
  ["collectionsReceived", "Collections", "money"],
  ["assignedCustomerDue", "Assigned Customer Due", "money"],
  ["customersHandled", "Customers Handled", "number"],
  ["unitsDelivered", "Units Delivered", "number"],
  ["averageOrderValue", "Average Order Value", "money"],
  ["conversionRate", "Quote to Order", "percent"]
];

function metricValue(value: string | number, kind: "number" | "money" | "percent") {
  if (kind === "money") return formatCurrency(value, true);
  if (kind === "percent") return `${formatNumber(value)}%`;
  return formatNumber(value);
}

function comparisonTable(data: SalespersonPerformanceData): ReportTable {
  return {
    id: "salesperson-comparison",
    title: "All Sales Employees Comparison",
    columns: [
      { key: "employee", label: "Employee" },
      { key: "territory", label: "Territory" },
      { key: "quotes", label: "Quotes", align: "right" },
      { key: "converted", label: "Converted", align: "right" },
      { key: "orders", label: "Orders", align: "right" },
      { key: "sales", label: "Delivered Sales", align: "right" },
      { key: "collections", label: "Collections", align: "right" },
      { key: "visits", label: "Verified Visits", align: "right" },
      { key: "leads", label: "New Leads", align: "right" },
      { key: "score", label: "Activity Score", align: "right" },
      { key: "target", label: "Target", align: "right" },
      { key: "customers", label: "Customers", align: "right" },
      { key: "conversion", label: "Conversion", align: "right" }
    ],
    rows: data.comparison.map((row) => ({ employeeId: row.id, employee: row.name, territory: row.territory ?? "-", quotes: String(row.quotationsCreated), converted: String(row.convertedQuotations), orders: String(row.ordersCreated), sales: row.deliveredSalesValue, collections: row.collectionsReceived, visits: String(row.verifiedVisits), leads: String(row.newLeads), score: String(row.activityScore), target: `${row.targetProgress}%`, customers: String(row.customersHandled), conversion: `${row.conversionRate}%` }))
  };
}

function buildPerformanceExportTables(data?: SalespersonPerformanceData) {
  if (!data) return [];
  if (!data.selected) return [comparisonTable(data)];
  return [comparisonTable(data), ...Object.values(data.selected.tables)];
}

function SalespersonPerformanceWorkspace({ data, role, onOpenEmployeeReport, from, to }: { data: SalespersonPerformanceData; role: Role; onOpenEmployeeReport: (employeeId: string) => void; from: string; to: string }) {
  const [detailTableId, setDetailTableId] = useState("quotations");
  const [territory, setTerritory] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"deliveredSalesValue" | "collectionsReceived" | "conversionRate" | "ordersCreated" | "assignedCustomerDue" | "activityScore" | "targetProgress">("deliveredSalesValue");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const detail = data.selected;
  const detailTables = detail ? Object.entries(detail.tables) : [];
  const selectedTable = detailTables.find(([key]) => key === detailTableId)?.[1] ?? detailTables[0]?.[1];
  const managementView = role !== "Sales Executive";
  const territories = [...new Set(data.employees.map((employee) => employee.territory).filter(Boolean))].sort() as string[];
  const filteredComparison = data.comparison
    .filter((employee) => (!territory || employee.territory === territory) && (!search.trim() || [employee.name, employee.employeeCode ?? employee.id, employee.territory ?? ""].some((value) => value.toLowerCase().includes(search.trim().toLowerCase()))))
    .sort((a, b) => {
      const compared = Number(a[sortField]) - Number(b[sortField]);
      return ascending ? compared : -compared;
    });
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(filteredComparison.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredComparison.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <section className="grid gap-4" data-testid="salesperson-performance-report">
      <div className="grid gap-4 rounded-md border border-blue-200 bg-blue-50/50 p-4 shadow-sm lg:grid-cols-[minmax(280px,1fr)_240px] lg:items-end">
        <div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded bg-blue-950 text-cyan-300"><Users className="h-5 w-5" /></span><div><h2 className="text-base font-bold text-blue-950">{managementView ? "Sales Team Comparison" : "My Sales Performance"}</h2><p className="text-xs leading-5 text-slate-600">{managementView ? "Cross-employee sales ownership analysis. Select an employee name in the table for the complete personnel report." : "Your transaction-attributed sales results for the selected report period."}</p></div></div></div>
        {managementView ? <label><span className={labelClass}>Territory</span><select className={inputClass} value={territory} onChange={(event) => { setTerritory(event.target.value); setPage(1); }}><option value="">All territories</option>{territories.map((entry) => <option key={entry}>{entry}</option>)}</select></label> : <div className="rounded-md border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-900">Scope locked to signed-in employee</div>}
      </div>

      {!detail ? (
        <>
          <Panel title="Comparison Results" subtitle={`${from} to ${to}. Values come from owned quotations, inherited orders/deliveries and attributed collections.`}>
            <div className="grid gap-2 border-b border-slate-200 p-4 sm:grid-cols-[minmax(220px,1fr)_220px_auto] sm:items-end"><label><span className={labelClass}>Search Team</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass + " pl-9"} placeholder="Name / ID / territory" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></span></label><label><span className={labelClass}>Sort By</span><select className={inputClass} value={sortField} onChange={(event) => { setSortField(event.target.value as typeof sortField); setPage(1); }}><option value="deliveredSalesValue">Delivered Sales</option><option value="collectionsReceived">Collections</option><option value="activityScore">Activity Score</option><option value="targetProgress">Target Progress</option><option value="conversionRate">Quotation Conversion</option><option value="ordersCreated">Orders</option><option value="assignedCustomerDue">Outstanding Due</option></select></label><Button icon={<ArrowUpDown className="h-4 w-4" />} onClick={() => setAscending((value) => !value)}>{ascending ? "Ascending" : "Descending"}</Button></div>
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={filteredComparison.map((row) => ({ name: row.name.split(" ")[0], sales: Number(row.deliveredSalesValue), collections: Number(row.collectionsReceived) }))} margin={{ top: 10, right: 10, left: 10, bottom: 15 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(value) => formatCurrency(String(value))} /><Bar dataKey="sales" name="Delivered sales" fill="#075985" radius={[3, 3, 0, 0]} /><Bar dataKey="collections" name="Collections" fill="#059669" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
            <ReportDataTable table={comparisonTable({ ...data, comparison: pageRows })} rows={comparisonTable({ ...data, comparison: pageRows }).rows} onOpenEmployee={managementView ? onOpenEmployeeReport : undefined} />
            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {pageRows.length} of {filteredComparison.length} employees</span><div className="flex items-center gap-2"><Button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</Button><b className="text-slate-700">Page {currentPage} / {pageCount}</b><Button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>Next</Button></div></div>
          </Panel>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {performanceMetricLabels.map(([key, label, kind], index) => <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm" key={key}><span className="block min-h-8 text-xs leading-4 text-slate-500">{label}</span><strong className="mt-1 block truncate text-lg" style={{ color: colors[index % colors.length] }} title={String(detail.summary[key])}>{metricValue(detail.summary[key], kind)}</strong></article>)}
          </div>
          <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-600 sm:grid-cols-4">
            <span><b className="block text-slate-900">{detail.summary.sentQuotations}</b> Sent quotations</span><span><b className="block text-slate-900">{detail.summary.acceptedQuotations}</b> Accepted quotations</span><span><b className="block text-slate-900">{formatCurrency(detail.summary.pendingQuotationValue)}</b> Pending quote value</span><span><b className="block text-slate-900">{formatCurrency(detail.summary.totalDiscount)}</b> Total discount</span>
          </div>
          <Panel title="Marketing and field performance" subtitle="Verified activity, follow-up discipline and target actuals from the same employee record">
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 lg:grid-cols-5">{[
              ["Check-ins", detail.summary.checkIns], ["Completed Visits", detail.summary.completedVisits], ["Verified Visits", detail.summary.verifiedVisits], ["New Leads", detail.summary.newLeads], ["Qualified Leads", detail.summary.qualifiedLeads],
              ["Follow-ups", detail.summary.followUpsCompleted], ["Overdue", detail.summary.overdueFollowUps], ["Presentations", detail.summary.presentations], ["Samples", detail.summary.samples], ["Activity Score", detail.summary.activityScore]
            ].map(([label, value]) => <div className="bg-white p-3" key={String(label)}><span className="block text-[10px] font-bold uppercase text-slate-400">{label}</span><strong className="mt-1 block text-xl text-slate-950">{formatNumber(value)}</strong></div>)}</div>
            <div className="border-t border-slate-200 p-4"><div className="mb-1 flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">Overall target progress</span><b className="text-blue-950">{formatNumber(detail.summary.targetProgress)}%</b></div><div className="h-2 overflow-hidden rounded bg-slate-100"><span className="block h-full bg-cyan-600" style={{ width: `${Math.min(100, Number(detail.summary.targetProgress))}%` }} /></div></div>
          </Panel>
          <Panel title={`${detail.employee.name} | Activity details`} subtitle={`${detail.employee.title}${detail.employee.territory ? ` | ${detail.employee.territory}` : ""} | ${from} to ${to}`}>
            <div className="border-b border-slate-200 p-3"><Segmented value={detailTableId} onChange={setDetailTableId} ariaLabel="Employee report details" options={detailTables.map(([key, table]) => ({ value: key, label: table.title, count: table.rows.length }))} /></div>
            {selectedTable ? <ReportDataTable table={selectedTable} rows={selectedTable.rows} /> : null}
          </Panel>
        </>
      )}
    </section>
  );
}

function ReportDataTable({ table, rows, onOpenEmployee }: { table: ReportTable; rows: Record<string, string>[]; onOpenEmployee?: (employeeId: string) => void }) {
  return (
    <TableFrame>
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr>{table.columns.map((column) => <th className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""}`} key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => <tr className="hover:bg-cyan-50/40" key={`${table.id}-${rowIndex}`}>{table.columns.map((column) => <td className={`px-4 py-3 ${column.align === "right" ? "text-right font-semibold" : "text-slate-600"}`} key={column.key}>{column.key === "employee" && row.employeeId && onOpenEmployee ? <button className="font-bold text-cyan-800 hover:underline" type="button" onClick={() => onOpenEmployee(row.employeeId)}>{displayValue(row[column.key] ?? "-", column.key)}</button> : displayValue(row[column.key] ?? "-", column.key)}</td>)}</tr>)}
          {!rows.length ? <tr><td className="px-4 py-10 text-center text-slate-500" colSpan={table.columns.length}>No posted records fall inside this period.</td></tr> : null}
        </tbody>
      </table>
    </TableFrame>
  );
}

function TaDaPrintSheet({ rows, from, to, employee }: { rows: Record<string, string>[]; from: string; to: string; employee: string }) {
  const totalTa = rows.reduce((sum, row) => sum + numeric(row.ta ?? "0"), 0);
  const totalDa = rows.reduce((sum, row) => sum + numeric(row.da ?? "0"), 0);
  const designation = rows.find((row) => row.designation)?.designation ?? "-";
  return (
    <section className="print-report-sheet hidden bg-white p-10 print:block">
      <div className="border-b-2 border-cyan-700 pb-4 text-center"><h1 className="text-xl font-bold text-blue-950">MIPRO HEALTHCARE CORPORATION</h1><h2 className="mt-1 text-base font-bold text-cyan-700">TA/DA Approved Sheet</h2></div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-sm"><p><b>Period:</b> {from} to {to}</p><p><b>Name:</b> {employee}</p><p><b>Designation:</b> {designation}</p></div>
      <table className="mt-5 w-full border-collapse text-sm"><thead><tr className="bg-blue-950 text-white"><th className="border p-2 text-left">Date</th><th className="border p-2 text-right">TA Amount</th><th className="border p-2 text-right">DA Amount</th><th className="border p-2 text-left">Remarks</th></tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td className="border p-2">{row.date}</td><td className="border p-2 text-right">{formatCurrency(row.ta)}</td><td className="border p-2 text-right">{formatCurrency(row.da)}</td><td className="border p-2">{row.remarks}</td></tr>)}</tbody><tfoot><tr className="font-bold"><td className="border p-2">Total</td><td className="border p-2 text-right">{formatCurrency(totalTa)}</td><td className="border p-2 text-right">{formatCurrency(totalDa)}</td><td className="border p-2">Combined: {formatCurrency(totalTa + totalDa)}</td></tr></tfoot></table>
      <div className="mt-20 grid grid-cols-2 gap-20 text-center text-sm"><span className="border-t border-slate-600 pt-2">Audited By</span><span className="border-t border-slate-600 pt-2">Approved By</span></div>
    </section>
  );
}

function AuditReport({ events }: { events: Awaited<ReturnType<typeof settingsService.audit>> }) {
  return (
    <Panel title="Narrow audit report" subtitle="Protected actions, actors and recorded reasons. This is an operational audit trail, not a full accounting ledger.">
      <TableFrame>
        <table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User / Role</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th><th className="px-4 py-3">Summary / Reason</th></tr></thead><tbody className="divide-y divide-slate-100">{events.map((event) => <tr key={event.id}><td className="px-4 py-3 text-slate-600">{new Date(event.timestamp).toLocaleString()}</td><td className="px-4 py-3"><strong>{event.userName}</strong><small className="block text-slate-500">{event.role}</small></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-bold"><ShieldCheck className="h-3 w-3" /> {event.action}</span></td><td className="px-4 py-3 text-slate-600">{event.entityType}<small className="block">{event.entityId}</small></td><td className="max-w-lg px-4 py-3 text-slate-600">{event.summary}{event.reason ? <small className="mt-1 block font-semibold text-amber-700">Reason: {event.reason}</small> : null}</td></tr>)}</tbody></table>
      </TableFrame>
    </Panel>
  );
}
