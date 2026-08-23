import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, PackageSearch, Printer, ReceiptText, ShieldCheck, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorBlock, LoadingBlock, Panel, Segmented, TableFrame, inputClass, labelClass } from "../components";
import { reportService, settingsService } from "../services";
import { useEffectiveRole } from "../../lib/auth/session";
import { formatCurrency, formatNumber } from "../../utils/format";

type View = "overview" | "imports" | "inventory" | "sales" | "expenses" | "audit";
const colors = ["#b91c1c", "#0891b2", "#059669", "#d97706"];

function numeric(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ReportsPage() {
  const [view, setView] = useState<View>("overview");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-08-31");
  const role = useEffectiveRole();
  const reportQuery = useQuery({ queryKey: ["reports", from, to], queryFn: reportService.get });
  const canAudit = ["Super Admin", "Managing Director", "Accounts"].includes(role);
  const auditQuery = useQuery({ queryKey: ["reports", "audit"], queryFn: settingsService.audit, enabled: canAudit });

  if (reportQuery.isLoading || (canAudit && auditQuery.isLoading)) return <LoadingBlock label="Preparing report summaries" />;
  if (reportQuery.isError || (canAudit && auditQuery.isError)) return <ErrorBlock error={reportQuery.error ?? auditQuery.error} onRetry={() => { void reportQuery.refetch(); if (canAudit) void auditQuery.refetch(); }} />;
  const report = reportQuery.data!;
  const groups = [
    { id: "imports" as const, title: "Import & Cost", icon: FileDown, rows: report.importCosts },
    { id: "inventory" as const, title: "Inventory", icon: PackageSearch, rows: report.inventory },
    { id: "sales" as const, title: "Sales & Collection", icon: ShoppingCart, rows: report.sales },
    { id: "expenses" as const, title: "Expense & Cash-Bank", icon: ReceiptText, rows: report.expenses }
  ];
  const selected = groups.find((group) => group.id === view);
  const exportCsv = () => {
    const rows = selected ? selected.rows : groups.flatMap((group) => group.rows.map((row) => ({ ...row, group: group.title })));
    const csv = ["Group,Metric,Value", ...rows.map((row) => [("group" in row ? row.group : selected?.title) ?? "Summary", row.label, row.value].map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mipro-report-" + from + "-to-" + to + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="Management information"
        title="Reports"
        subtitle="Focused operational reports for import cost, stock, sales and collection, expenses and narrow audit review."
        actions={<><Button icon={<Download className="h-4 w-4" />} onClick={exportCsv}>Export CSV</Button><Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print Report</Button></>}
      />

      <Panel>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[220px_220px_1fr] lg:items-end">
          <label><span className={labelClass}>From Date</span><input className={inputClass} type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label><span className={labelClass}>To Date</span><input className={inputClass} type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <div className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Report scope:</strong> {role} · Mipro HealthCare · Main Warehouse</div>
        </div>
      </Panel>

      <Segmented value={view} onChange={setView} ariaLabel="Report groups" options={[{ value: "overview", label: "Overview" }, ...groups.map((group) => ({ value: group.id, label: group.title })), ...(canAudit ? [{ value: "audit" as const, label: "Audit" }] : [])]} />

      {view === "overview" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groups.map((group, groupIndex) => {
              const Icon = group.icon;
              return <button className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-red-300 hover:shadow" type="button" key={group.id} onClick={() => setView(group.id)}><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded bg-slate-100"><Icon className="h-5 w-5" style={{ color: colors[groupIndex] }} /></span><span className="text-xs font-bold text-slate-400">{group.rows.length} KPIs</span></div><h2 className="mt-3 text-base font-bold">{group.title}</h2><strong className="mt-2 block truncate text-xl text-slate-950">{group.rows[0]?.value === "Restricted" ? "Restricted" : numeric(group.rows[0]?.value ?? "0") > 9999 ? formatCurrency(group.rows[0]?.value, true) : formatNumber(group.rows[0]?.value ?? "0")}</strong><span className="text-xs text-slate-500">{group.rows[0]?.label}</span></button>;
            })}
          </div>
          <Panel title="Cross-workflow pulse" subtitle="A compact comparison of the primary numeric signal from each report group.">
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
      ) : null}

      {selected ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <Panel title={selected.title + " summary"} subtitle={"Filtered period " + from + " to " + to}>
            <div className="grid divide-y divide-slate-100">{selected.rows.map((row, index) => <div className="flex items-center justify-between gap-4 px-4 py-4" key={row.label}><div className="flex items-center gap-3"><span className="h-8 w-1 rounded" style={{ background: colors[index % colors.length] }} /><span className="text-sm font-semibold text-slate-600">{row.label}</span></div><strong className="text-lg text-slate-950">{row.value === "Restricted" ? "Restricted" : numeric(row.value) > 9999 ? formatCurrency(row.value) : formatNumber(row.value)}</strong></div>)}</div>
          </Panel>
          <Panel title="Visual comparison" subtitle="Values are kept distinct rather than merged into a misleading combined total.">
            <div className="h-72 p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={selected.rows.map((row) => ({ name: row.label, value: numeric(row.value) }))} layout="vertical" margin={{ left: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={130} fontSize={11} /><Tooltip formatter={(value) => formatNumber(String(value))} /><Bar dataKey="value" fill="#0891b2" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div>
          </Panel>
        </div>
      ) : null}

      {view === "audit" && canAudit ? (
        <Panel title="Narrow audit report" subtitle="Only protected operational events and reasons are presented; this is not a separate security module.">
          <TableFrame>
            <table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User / Role</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th><th className="px-4 py-3">Summary / Reason</th></tr></thead><tbody className="divide-y divide-slate-100">{(auditQuery.data ?? []).map((event) => <tr key={event.id}><td className="px-4 py-3 text-slate-600">{new Date(event.timestamp).toLocaleString()}</td><td className="px-4 py-3"><strong>{event.userName}</strong><small className="block text-slate-500">{event.role}</small></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-bold"><ShieldCheck className="h-3 w-3" /> {event.action}</span></td><td className="px-4 py-3 text-slate-600">{event.entityType}<small className="block">{event.entityId}</small></td><td className="max-w-lg px-4 py-3 text-slate-600">{event.summary}{event.reason ? <small className="mt-1 block font-semibold text-amber-700">Reason: {event.reason}</small> : null}</td></tr>)}</tbody></table>
          </TableFrame>
        </Panel>
      ) : null}
    </>
  );
}
