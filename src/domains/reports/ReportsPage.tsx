import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  Boxes,
  Building2,
  ChevronRight,
  Download,
  FileDown,
  FileSpreadsheet,
  FolderSearch,
  Landmark,
  Printer,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Search,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { reportCategories, reportSearchText, visibleReportCatalog, type ReportCategoryId, type ReportDefinition } from "./reportCatalog";
import { appendReportFilters, filterReportRows, readReportFilters, reportFilterLabels, reportFilterOptions, type ReportFilterValues } from "./reportFilters";

type View = "overview" | "print" | "marketing" | "audit";

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

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function displayValue(value: string, key = "") {
  if (value === "Restricted") return value;
  const isMoney = /amount|value|cost|sales|collected|collection|due|profit|landed|revenue|cogs|ta|da/i.test(key);
  return isMoney && /^-?\d+(\.\d+)?$/.test(value) ? formatCurrency(value) : value;
}

const categoryIcons = { sales: ShoppingCart, inventory: Boxes, imports: FileDown, customers: Building2, expenses: Landmark, employees: Users } satisfies Record<ReportCategoryId, typeof FileDown>;
const legacyViews: Partial<Record<string, ReportCategoryId>> = { sales: "sales", inventory: "inventory", imports: "imports", expenses: "expenses" };

export default function ReportsPage() {
  const today = businessDate();
  const role = useEffectiveRole();
  const user = useAuthStore((state) => state.session?.user);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const rawView = params.get("view") ?? "";
  const legacyCategory = legacyViews[rawView];
  const view: View = legacyCategory ? "print" : ["overview", "print", "marketing", "audit"].includes(rawView) ? rawView as View : role === "Sales Executive" ? "print" : "overview";
  const preset = params.get("preset") ?? "";
  const requestedFrom = params.get("from");
  const requestedTo = params.get("to");
  const hasRequestedPeriod = Boolean(requestedFrom && requestedTo && /^\d{4}-\d{2}-\d{2}$/.test(requestedFrom) && /^\d{4}-\d{2}-\d{2}$/.test(requestedTo) && requestedFrom <= requestedTo);
  const initialPeriod = periodForPreset(initialPeriodPreset(preset), today);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>(() => hasRequestedPeriod ? "custom" : initialPeriodPreset(preset));
  const [from, setFrom] = useState(hasRequestedPeriod ? requestedFrom! : initialPeriod.from);
  const [to, setTo] = useState(hasRequestedPeriod ? requestedTo! : initialPeriod.to);
  const [search, setSearch] = useState("");
  const [mobileReportOpen, setMobileReportOpen] = useState(Boolean(params.get("report") || params.get("table")));
  const [draftFilters, setDraftFilters] = useState<ReportFilterValues>(() => readReportFilters(params));
  const [appliedFilters, setAppliedFilters] = useState<ReportFilterValues>(() => readReportFilters(params));
  const canExport = hasEffectivePermission(user, "reports", "export");
  const canPrint = hasEffectivePermission(user, "print", "view");
  const canAudit = ["Super Admin", "Managing Director", "Accounts"].includes(role);
  const canMarketing = hasEffectivePermission(user, "marketing", "view");
  const catalog = useMemo(() => visibleReportCatalog(user), [user]);
  const requestedReportId = params.get("report") ?? params.get("table") ?? "";
  const requestedReport = catalog.find((entry) => entry.id === requestedReportId || entry.tableId === requestedReportId);
  const requestedCategory = params.get("category") as ReportCategoryId | null;
  const availableCategories = reportCategories.filter((category) => catalog.some((entry) => entry.category === category.id));
  const category = availableCategories.some((entry) => entry.id === requestedCategory)
    ? requestedCategory!
    : requestedReport?.category ?? (legacyCategory && availableCategories.some((entry) => entry.id === legacyCategory) ? legacyCategory : availableCategories[0]?.id ?? "sales");
  const categoryReports = catalog.filter((entry) => entry.category === category);
  const selectedDefinition = requestedReport?.category === category ? requestedReport : categoryReports[0];
  const salesEmployeeId = role === "Sales Executive" ? "self" : params.get("employeeId") ?? "all";
  const setReportPeriod = useAIContextStore((state) => state.setReportPeriod);
  const reportQuery = useQuery({ queryKey: ["reports", from, to, salesEmployeeId], queryFn: () => reportService.get(from, to, salesEmployeeId), enabled: Boolean(from && to && from <= to) });
  const performanceQuery = useQuery({ queryKey: ["reports", "salespeople", from, to, salesEmployeeId], queryFn: () => reportService.salespeople(from, to, salesEmployeeId), enabled: selectedDefinition?.source === "performance" && Boolean(from && to && from <= to) });
  const insightQuery = useQuery({ queryKey: ["ai", "report-insights", from, to, role], queryFn: () => aiService.insights({ route: "/app/reports", entityType: "reports", reportFrom: from, reportTo: to }), enabled: view === "overview" && Boolean(from && to && from <= to) });
  const auditQuery = useQuery({ queryKey: ["reports", "audit"], queryFn: settingsService.audit, enabled: view === "audit" && canAudit });

  useEffect(() => setReportPeriod(from, to), [from, to, setReportPeriod]);
  useEffect(() => {
    if (!legacyCategory || !selectedDefinition) return;
    const next = new URLSearchParams(params);
    next.set("view", "print");
    next.set("category", selectedDefinition.category);
    next.set("report", selectedDefinition.id);
    next.delete("table");
    setParams(next, { replace: true });
  }, [legacyCategory, params, selectedDefinition, setParams]);
  useEffect(() => {
    const filters = readReportFilters(params);
    setDraftFilters(filters);
    setAppliedFilters(filters);
  }, [selectedDefinition?.id]);

  const report = reportQuery.data;
  const sourceTables = selectedDefinition?.sourceGroup && report ? report.tables[selectedDefinition.sourceGroup] : [];
  const selectedTable = selectedDefinition?.source === "table" ? sourceTables.find((table) => table.id === selectedDefinition.tableId) : undefined;
  const filteredTable = selectedTable ? { ...selectedTable, rows: filterReportRows(selectedTable, appliedFilters) } : undefined;
  const auditTable = auditReportTable(auditQuery.data ?? []);
  const performanceTables = buildPerformanceExportTables(performanceQuery.data);

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", next);
    if (next === "print" && selectedDefinition) {
      nextParams.set("category", selectedDefinition.category);
      nextParams.set("report", selectedDefinition.id);
      nextParams.delete("table");
    }
    setParams(nextParams);
  };
  const selectCategory = (next: ReportCategoryId) => {
    const first = catalog.find((entry) => entry.category === next);
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", "print");
    nextParams.set("category", next);
    if (first) nextParams.set("report", first.id);
    nextParams.delete("table");
    for (const key of Object.keys(reportFilterLabels)) nextParams.delete(`filter.${key}`);
    setSearch("");
    setMobileReportOpen(false);
    setParams(nextParams);
  };
  const selectReport = (definition: ReportDefinition) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", "print");
    nextParams.set("category", definition.category);
    nextParams.set("report", definition.id);
    nextParams.delete("table");
    for (const key of Object.keys(reportFilterLabels)) nextParams.delete(`filter.${key}`);
    setMobileReportOpen(true);
    setParams(nextParams);
  };
  const applyPeriodPreset = (next: PeriodPreset) => {
    setPeriodPreset(next);
    if (next === "custom") return;
    const period = periodForPreset(next, today);
    setFrom(period.from);
    setTo(period.to);
  };
  const generate = () => {
    setAppliedFilters(draftFilters);
    const nextParams = new URLSearchParams(params);
    nextParams.set("view", "print");
    nextParams.set("category", category);
    if (selectedDefinition) nextParams.set("report", selectedDefinition.id);
    nextParams.set("period", periodPreset);
    nextParams.set("from", from);
    nextParams.set("to", to);
    for (const key of Object.keys(reportFilterLabels)) nextParams.delete(`filter.${key}`);
    appendReportFilters(nextParams, draftFilters);
    setParams(nextParams);
    void reportQuery.refetch();
  };
  const exportedTables = view === "audit" ? [auditTable] : selectedDefinition?.source === "performance" ? performanceTables : filteredTable ? [filteredTable] : [];
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
    link.download = `mipro-${selectedDefinition?.id ?? "audit"}-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const openPrintPreview = () => {
    if (view === "audit") return navigate(`/app/print/operational-report/audit?${new URLSearchParams({ from, to, view: "audit" })}`);
    if (!selectedDefinition?.sourceGroup || !selectedDefinition.tableId) return;
    const previewParams = new URLSearchParams({ from, to, view: selectedDefinition.sourceGroup, table: selectedDefinition.tableId, employeeId: salesEmployeeId });
    appendReportFilters(previewParams, appliedFilters);
    navigate(`/app/print/operational-report/${selectedDefinition.sourceGroup}?${previewParams.toString()}`);
  };

  if (reportQuery.isLoading || performanceQuery.isLoading || auditQuery.isLoading) return <LoadingBlock label="Preparing report catalogue" />;
  if (reportQuery.isError || performanceQuery.isError || auditQuery.isError) return <ErrorBlock error={reportQuery.error ?? performanceQuery.error ?? auditQuery.error} onRetry={() => { void reportQuery.refetch(); void performanceQuery.refetch(); void auditQuery.refetch(); }} />;
  if (!report) return <ErrorBlock error={new Error("Report data is unavailable for the selected period.")} />;

  return <>
    <PageHeader eyebrow="Management information" title="Reports" subtitle="Find, check, preview and export role-safe reports from one catalogue." />
    <Segmented value={view} onChange={setView} ariaLabel="Reports navigation" options={[
      ...(role === "Sales Executive" ? [] : [{ value: "overview" as const, label: "Overview" }]),
      { value: "print" as const, label: "Print & Preview" },
      ...(canMarketing ? [{ value: "marketing" as const, label: "Marketing Analysis" }] : []),
      ...(canAudit ? [{ value: "audit" as const, label: "Audit" }] : [])
    ]} />

    {view !== "audit" ? <Panel>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[190px_190px_190px_1fr] lg:items-end">
        <label><span className={labelClass}>Period</span><select className={inputClass} value={periodPreset} onChange={(event) => applyPeriodPreset(event.target.value as PeriodPreset)}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="this-week">This Week</option><option value="last-week">Last Week</option><option value="this-month">This Month</option><option value="last-month">Last Month</option><option value="custom">Custom</option></select></label>
        <label><span className={labelClass}>From Date</span><input className={inputClass} type="date" max={to} value={from} onChange={(event) => { setFrom(event.target.value); setPeriodPreset("custom"); }} /></label>
        <label><span className={labelClass}>To Date</span><input className={inputClass} type="date" min={from} value={to} onChange={(event) => { setTo(event.target.value); setPeriodPreset("custom"); }} /></label>
        <div className="rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-900"><strong>Applied scope:</strong> {report.period.from} to {report.period.to} | {role} | Main Warehouse</div>
      </div>
    </Panel> : null}

    {view === "overview" ? <>
      {insightQuery.data?.[0] ? <div className="flex items-start gap-3 rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-950" data-testid="report-ai-summary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-white text-cyan-700"><Sparkles className="h-4 w-4" /></span><div><strong>{insightQuery.data[0].title}</strong><p className="mt-0.5 text-xs leading-5 text-cyan-900">{insightQuery.data[0].summary}</p></div></div> : null}
      <ReportOverview categories={availableCategories} catalog={catalog} onOpen={selectCategory} />
    </> : null}
    {view === "print" ? <PrintPreviewCatalogue category={category} categories={availableCategories} reports={categoryReports} selected={selectedDefinition} sourceTable={selectedTable} selectedTable={filteredTable} performance={performanceQuery.data} role={role} search={search} onSearch={setSearch} mobileReportOpen={mobileReportOpen} onBack={() => setMobileReportOpen(false)} onCategory={selectCategory} onReport={selectReport} filters={draftFilters} onFilter={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))} onGenerate={generate} canExport={canExport} canPrint={canPrint} onExport={() => void exportCsv()} onPrint={openPrintPreview} onOpenMarketing={(definition) => navigate(`/app/reports?view=marketing&preset=${definition.marketingPreset ?? "month"}`)} from={from} to={to} onOpenEmployeeReport={(employeeId) => navigate(`/app/employees?view=activity&employee=${employeeId}`)} /> : null}
    {view === "marketing" && canMarketing ? <MarketingReportWorkspace from={from} to={to} preset={preset} initialEmployeeId={params.get("employee") ?? undefined} initialSubjectId={params.get("subject") ?? undefined} /> : null}
    {view === "audit" && canAudit ? <><div className="flex justify-end gap-2">{canExport ? <Button icon={<Download className="h-4 w-4" />} onClick={() => void exportCsv()}>Export CSV</Button> : null}{canPrint ? <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={openPrintPreview}>A4 Preview</Button> : null}</div><AuditReport events={auditQuery.data ?? []} /></> : null}
  </>;
}

function ReportOverview({ categories, catalog, onOpen }: { categories: typeof reportCategories; catalog: ReportDefinition[]; onOpen: (category: ReportCategoryId) => void }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {categories.map((category, index) => { const Icon = categoryIcons[category.id]; const count = catalog.filter((report) => report.category === category.id).length; return <button className="group rounded-md border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-400 hover:shadow" type="button" key={category.id} onClick={() => onOpen(category.id)}><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded bg-slate-100"><Icon className="h-5 w-5" style={{ color: colors[index % colors.length] }} /></span><span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{count} reports</span></div><h2 className="mt-4 text-base font-bold text-slate-950">{category.title}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{category.description}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-800">Open Print & Preview <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></button>; })}
  </div>;
}

function PrintPreviewCatalogue({ category, categories, reports, selected, sourceTable, selectedTable, performance, role, search, onSearch, mobileReportOpen, onBack, onCategory, onReport, filters, onFilter, onGenerate, canExport, canPrint, onExport, onPrint, onOpenMarketing, from, to, onOpenEmployeeReport }: {
  category: ReportCategoryId; categories: typeof reportCategories; reports: ReportDefinition[]; selected?: ReportDefinition; sourceTable?: ReportTable; selectedTable?: ReportTable; performance?: SalespersonPerformanceData; role: Role; search: string; onSearch: (value: string) => void; mobileReportOpen: boolean; onBack: () => void; onCategory: (value: ReportCategoryId) => void; onReport: (report: ReportDefinition) => void; filters: ReportFilterValues; onFilter: (key: keyof ReportFilterValues, value: string) => void; onGenerate: () => void; canExport: boolean; canPrint: boolean; onExport: () => void; onPrint: () => void; onOpenMarketing: (report: ReportDefinition) => void; from: string; to: string; onOpenEmployeeReport: (employeeId: string) => void;
}) {
  const matchingReports = reports.filter((report) => !search.trim() || reportSearchText(report).includes(search.trim().toLowerCase()));
  return <section className="grid min-w-0 gap-4">
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <label className="lg:hidden"><span className={labelClass}>Report Category</span><select className={inputClass} value={category} onChange={(event) => onCategory(event.target.value as ReportCategoryId)}>{categories.map((entry) => <option value={entry.id} key={entry.id}>{entry.title}</option>)}</select></label>
      <div className="hidden grid-cols-3 gap-2 lg:grid xl:grid-cols-6">{categories.map((entry) => { const Icon = categoryIcons[entry.id]; return <button className={`flex min-h-16 items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-bold transition ${entry.id === category ? "border-blue-950 bg-blue-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"}`} type="button" key={entry.id} onClick={() => onCategory(entry.id)}><Icon className={`h-4 w-4 shrink-0 ${entry.id === category ? "text-cyan-300" : "text-cyan-700"}`} />{entry.title}</button>; })}</div>
    </div>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <aside className={`${mobileReportOpen ? "hidden" : "block"} min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:block`}>
        <div className="border-b border-slate-200 p-4"><h2 className="text-sm font-bold text-blue-950">Report Library</h2><p className="mt-1 text-xs text-slate-500">{reports.length} available in this category</p><label className="relative mt-3 block"><span className="sr-only">Search reports</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass + " w-full pl-9"} value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search reports..." /></label></div>
        <div className="max-h-[680px] overflow-y-auto p-2">{matchingReports.map((report) => <button className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition ${selected?.id === report.id ? "bg-cyan-50 text-blue-950" : "hover:bg-slate-50"}`} type="button" onClick={() => onReport(report)} key={report.id}><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded ${selected?.id === report.id ? "bg-blue-950 text-cyan-300" : "bg-slate-100 text-slate-500"}`}><FileSpreadsheet className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{report.title}</strong><small className="mt-0.5 block text-xs leading-4 text-slate-500">{report.description}</small></span><ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400" /></button>)}{!matchingReports.length ? <div className="p-8 text-center text-sm text-slate-500"><FolderSearch className="mx-auto mb-2 h-6 w-6" />No report matches this search.</div> : null}</div>
      </aside>
      <div className={`${mobileReportOpen ? "block" : "hidden"} min-w-0 lg:block`}>
        {selected ? <Panel title={selected.title} subtitle={selected.description} actions={<span className="flex items-center gap-2 text-xs text-slate-500"><FileSpreadsheet className="h-4 w-4 text-cyan-700" />{selected.source === "performance" ? performance?.comparison.length ?? 0 : selectedTable?.rows.length ?? 0} rows</span>}>
          <div className="border-b border-slate-200 p-4 lg:hidden"><Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>Back to Reports</Button></div>
          {selected.source === "marketing" ? <div className="p-5"><div className="rounded-md border border-cyan-200 bg-cyan-50 p-4"><strong className="text-blue-950">Connected marketing analysis</strong><p className="mt-1 text-sm leading-6 text-slate-600">This report uses the interactive marketing workspace so employee, territory, verification and activity filters remain consistent.</p><Button className="mt-4" variant="primary" icon={<ChevronRight className="h-4 w-4" />} onClick={() => onOpenMarketing(selected)}>Open Analysis & Print</Button></div></div> : <>
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {selected.source === "table" && sourceTable ? selected.filters.map((filter) => <label key={filter}><span className={labelClass}>{reportFilterLabels[filter]}</span><select className={inputClass} value={filters[filter] ?? ""} onChange={(event) => onFilter(filter, event.target.value)}><option value="">All {reportFilterLabels[filter].toLowerCase()}</option>{reportFilterOptions(sourceTable, filter).map((option) => <option value={option} key={option}>{option}</option>)}</select></label>) : null}
              <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-3"><Button variant="primary" icon={<RefreshCw className="h-4 w-4" />} onClick={onGenerate}>Generate / Refresh</Button>{canPrint && selected.printable ? <Button icon={<Printer className="h-4 w-4" />} onClick={onPrint}>A4 Preview</Button> : null}{canExport && selected.exportable ? <Button icon={<Download className="h-4 w-4" />} onClick={onExport}>Export CSV</Button> : null}<span className="ml-auto text-xs text-slate-500">{from} to {to}</span></div>
            </div>
            {selected.source === "performance" && performance ? <div className="p-4"><SalespersonPerformanceWorkspace data={performance} role={role} onOpenEmployeeReport={onOpenEmployeeReport} from={from} to={to} /></div> : selectedTable ? <ReportDataTable table={selectedTable} rows={selectedTable.rows} /> : <div className="p-10 text-center text-sm text-slate-500">This report has no source data for the signed-in role.</div>}
          </>}
        </Panel> : <Panel><div className="p-10 text-center text-sm text-slate-500">No report is available in this category.</div></Panel>}
      </div>
    </div>
  </section>;
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

function auditReportTable(events: Awaited<ReturnType<typeof settingsService.audit>>): ReportTable {
  return {
    id: "audit-events",
    title: "Protected Action Audit Trail",
    columns: [
      { key: "timestamp", label: "Timestamp" },
      { key: "user", label: "User / Role" },
      { key: "action", label: "Action" },
      { key: "record", label: "Record" },
      { key: "summary", label: "Summary / Reason" }
    ],
    rows: events.map((event) => ({ timestamp: new Date(event.timestamp).toLocaleString(), user: `${event.userName} | ${event.role}`, action: event.action, record: `${event.entityType} | ${event.entityId}`, summary: `${event.summary}${event.reason ? ` | Reason: ${event.reason}` : ""}` }))
  };
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
