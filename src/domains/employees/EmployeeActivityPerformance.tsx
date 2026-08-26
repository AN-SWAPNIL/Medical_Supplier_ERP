import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, Clock3, FileBarChart, MapPinned, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeePicker from "../../components/employees/EmployeePicker";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { businessDate } from "../../lib/date";
import { hasEffectivePermission } from "../../lib/permissions/effectiveAccess";
import type { User } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/format";
import { ErrorBlock, LoadingBlock, Panel, TableFrame, inputClass, labelClass } from "../components";
import type { MarketingActivity, MarketingPerformanceRow } from "../erp.types";
import { employeeService, marketingService } from "../services";

type Period = "Today" | "Yesterday" | "This Week" | "Last Week" | "This Month" | "Last Month" | "Custom";

function shift(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return businessDate(value);
}

function periodDates(period: Period, customFrom: string, customTo: string) {
  const today = businessDate();
  const current = new Date(`${today}T12:00:00`);
  const mondayOffset = (current.getDay() + 6) % 7;
  const weekStart = shift(today, -mondayOffset);
  if (period === "Today") return { from: today, to: today };
  if (period === "Yesterday") return { from: shift(today, -1), to: shift(today, -1) };
  if (period === "This Week") return { from: weekStart, to: today };
  if (period === "Last Week") return { from: shift(weekStart, -7), to: shift(weekStart, -1) };
  if (period === "This Month") return { from: `${today.slice(0, 7)}-01`, to: today };
  if (period === "Last Month") {
    const first = new Date(current.getFullYear(), current.getMonth() - 1, 1, 12);
    const last = new Date(current.getFullYear(), current.getMonth(), 0, 12);
    return { from: businessDate(first), to: businessDate(last) };
  }
  return { from: customFrom || today, to: customTo || today };
}

function eventDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value} | Time unavailable`;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function activityLabel(activity: MarketingActivity) {
  return activity.activityType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SummaryGrid({ row }: { row: MarketingPerformanceRow }) {
  const values: Array<[string, string]> = [
    ["Check-in / Check-out", `${row.checkIns} / ${row.completedVisits}`],
    ["Visits", String(row.completedVisits)],
    ["Verified Visits", String(row.verifiedVisits)],
    ["New Leads", String(row.newLeads)],
    ["Qualified Leads", String(row.qualifiedLeads)],
    ["Follow-ups", String(row.followUpsCompleted)],
    ["Overdue Follow-ups", String(row.overdueFollowUps)],
    ["Presentations", String(row.presentations)],
    ["Samples", String(row.samples)],
    ["Quotations", String(row.quotations)],
    ["Orders", String(row.orders)],
    ["Delivered Sales", formatCurrency(row.deliveredSalesBdt, true)],
    ["Collections", formatCurrency(row.collectionsBdt, true)],
    ["Activity Score", formatNumber(row.activityScore)],
    ["Target Progress", `${formatNumber(row.progress.overall)}%`]
  ];
  return <section className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-5" aria-label="Employee performance summary">{values.map(([label, value]) => <div className="min-h-20 bg-white p-3" key={label}><span className="block text-[10px] font-bold uppercase leading-4 text-slate-400">{label}</span><strong className={`mt-1 block break-words text-lg ${label === "Overdue Follow-ups" && Number(row.overdueFollowUps) ? "text-rose-700" : "text-slate-950"}`}>{value}</strong></div>)}</section>;
}

export default function EmployeeActivityPerformance({ actor, employeeId, onEmployeeChange, onFieldMap }: { actor: User; employeeId?: string; onEmployeeChange: (employeeId: string) => void; onFieldMap: (employeeId: string) => void }) {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("Today");
  const [customFrom, setCustomFrom] = useState(businessDate());
  const [customTo, setCustomTo] = useState(businessDate());
  const dates = useMemo(() => periodDates(period, customFrom, customTo), [customFrom, customTo, period]);
  const directoryQuery = useQuery({ queryKey: ["employees", "directory", "marketing", actor.id], queryFn: () => employeeService.directory("marketing") });
  const employees = directoryQuery.data ?? [];
  const selectedId = employeeId && employees.some((employee) => employee.id === employeeId) ? employeeId : employees[0]?.id;
  const snapshotQuery = useQuery({ queryKey: ["employees", "activity", selectedId, dates.from, dates.to], queryFn: () => marketingService.employeeSnapshot(selectedId!, dates.from, dates.to), enabled: Boolean(selectedId) });

  useEffect(() => {
    if (selectedId && selectedId !== employeeId) onEmployeeChange(selectedId);
  }, [employeeId, onEmployeeChange, selectedId]);

  if (directoryQuery.isLoading || snapshotQuery.isLoading) return <LoadingBlock label="Loading employee activity and performance" />;
  const error = directoryQuery.error ?? snapshotQuery.error;
  if (error) return <ErrorBlock error={error} onRetry={() => { void directoryQuery.refetch(); void snapshotQuery.refetch(); }} />;
  const snapshot = snapshotQuery.data;
  if (!snapshot || !selectedId) return <Panel title="Activity & Performance" subtitle="No employee is available in your permitted team scope."><p className="p-8 text-center text-sm text-slate-500">Grant Marketing team access or assign active Sales Executive employees.</p></Panel>;

  const today = businessDate();
  const followUps = {
    Today: snapshot.followUps.filter((entry) => entry.status === "PENDING" && businessDate(new Date(entry.dueAt)) === today),
    Overdue: snapshot.followUps.filter((entry) => entry.status === "OVERDUE"),
    Upcoming: snapshot.followUps.filter((entry) => entry.status === "PENDING" && businessDate(new Date(entry.dueAt)) > today)
  };
  const targetRows: Array<[string, string, number, string]> = [
    ["Sales", snapshot.performance.deliveredSalesBdt, Number(snapshot.performance.progress.sales), snapshot.performance.targets.salesTargetBdt],
    ["Visits", String(snapshot.performance.verifiedVisits), Number(snapshot.performance.progress.visits), String(snapshot.performance.targets.visitTarget)],
    ["New Customers", String(snapshot.performance.convertedCustomers), Number(snapshot.performance.progress.customers), String(snapshot.performance.targets.newCustomerTarget)],
    ["Collections", snapshot.performance.collectionsBdt, Number(snapshot.performance.progress.collections), snapshot.performance.targets.collectionTargetBdt]
  ];

  return <div className="grid gap-4" data-testid="employee-activity-performance">
    <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(260px,1fr)_190px_auto] lg:items-end">
      <EmployeePicker employees={employees} value={selectedId} onChange={onEmployeeChange} allowAll={false} />
      <label><span className={labelClass}>Period</span><select className={inputClass} value={period} onChange={(event) => setPeriod(event.target.value as Period)}>{["Today", "Yesterday", "This Week", "Last Week", "This Month", "Last Month", "Custom"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <div className="flex flex-wrap gap-2 lg:justify-end"><Button icon={<MapPinned className="h-4 w-4" />} onClick={() => onFieldMap(selectedId)}>Field Map</Button><Button variant="primary" icon={<FileBarChart className="h-4 w-4" />} disabled={!hasEffectivePermission(actor, "reports", "view")} onClick={() => navigate(`/app/reports?view=marketing&employee=${selectedId}&from=${dates.from}&to=${dates.to}`)}>Full Report</Button></div>
      {period === "Custom" ? <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3"><label><span className={labelClass}>From</span><input className={inputClass} type="date" max={customTo} value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} /></label><label><span className={labelClass}>To</span><input className={inputClass} type="date" min={customFrom} max={businessDate()} value={customTo} onChange={(event) => setCustomTo(event.target.value)} /></label></div> : null}
    </div>

    <div className="flex flex-col gap-3 rounded-md border border-cyan-200 bg-cyan-50 p-4 sm:flex-row sm:items-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-950 text-cyan-300"><UsersRound className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="font-bold text-blue-950">{snapshot.employee.name}</h2><p className="text-xs text-cyan-900">{snapshot.employee.employeeCode} | {snapshot.employee.title} | {snapshot.employee.territory ?? "No territory"}</p></div><span className="text-xs font-semibold text-cyan-900">{dates.from === dates.to ? dates.from : `${dates.from} to ${dates.to}`}</span></div>

    <SummaryGrid row={snapshot.performance} />

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(310px,.65fr)]">
      <Panel title="Employee Activity Timeline" subtitle="Marketing reports, field visits and connected sales transactions in one permitted feed.">
        <TableFrame><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Customer / Lead</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Location / Verification</th><th className="px-4 py-3">Next Follow-up</th><th className="px-4 py-3">Remarks</th></tr></thead><tbody className="divide-y divide-slate-100">{snapshot.recentActivities.map((activity) => <tr key={activity.id}><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{eventDate(activity.occurredAt)}</td><td className="px-4 py-3"><strong>{activityLabel(activity)}</strong><small className="block text-slate-500">{activity.source.replaceAll("_", " ")}</small></td><td className="px-4 py-3 text-slate-600">{activity.subjectName ?? "General activity"}</td><td className="px-4 py-3 text-xs font-semibold text-cyan-800">{activity.referenceNumber ?? "Manual"}</td><td className="px-4 py-3"><StatusBadge status={activity.verification.replaceAll("_", " ")} />{activity.latitude !== undefined ? <small className="mt-1 block text-slate-500">{activity.latitude.toFixed(4)}, {activity.longitude?.toFixed(4)}</small> : null}</td><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{activity.nextFollowUpAt ? eventDate(activity.nextFollowUpAt) : "-"}</td><td className="max-w-64 px-4 py-3 text-xs text-slate-600">{activity.remarks ?? activity.purpose ?? "-"}</td></tr>)}{!snapshot.recentActivities.length ? <tr><td className="px-4 py-10 text-center text-slate-500" colSpan={7}>No activity is recorded in this period.</td></tr> : null}</tbody></table></TableFrame>
      </Panel>
      <div className="grid content-start gap-4">
        <Panel title="Target Progress" subtitle="Actual values come from posted business records."><div className="grid gap-3 p-4">{targetRows.map(([label, actual, percent, target]) => <div key={label}><div className="flex items-end justify-between gap-3 text-xs"><span className="font-semibold text-slate-600">{label}<small className="block font-normal text-slate-400">{["Sales", "Collections"].includes(label) ? `${formatCurrency(actual, true)} / ${formatCurrency(target, true)}` : `${formatNumber(actual)} / ${formatNumber(target)}`}</small></span><b className="text-blue-950">{formatNumber(percent)}%</b></div><div className="mt-1 h-2 overflow-hidden rounded bg-slate-100"><span className={`block h-full ${percent >= 90 ? "bg-emerald-500" : percent >= 60 ? "bg-cyan-600" : "bg-amber-500"}`} style={{ width: `${Math.min(100, percent)}%` }} /></div></div>)}</div></Panel>
        <Panel title="Follow-ups" subtitle="Follow-ups that need action for this employee."><div className="grid grid-cols-3 border-b border-slate-200">{Object.entries(followUps).map(([label, rows]) => <div className="p-3 text-center" key={label}><span className="text-[10px] font-bold uppercase text-slate-400">{label}</span><strong className={`mt-1 block text-xl ${label === "Overdue" && rows.length ? "text-rose-700" : "text-slate-950"}`}>{rows.length}</strong></div>)}</div><div className="divide-y divide-slate-100">{[...followUps.Overdue, ...followUps.Today, ...followUps.Upcoming].slice(0, 6).map((item) => <div className="p-3" key={item.id}><div className="flex items-start justify-between gap-2"><strong className="min-w-0 truncate text-sm">{item.subjectName}</strong><StatusBadge status={item.status} /></div><p className="mt-1 text-xs text-slate-500">{item.purpose}</p><span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5" />{eventDate(item.dueAt)}</span></div>)}</div></Panel>
        {snapshot.dailyPlan ? <Panel title="Daily Plan" subtitle={`${snapshot.dailyPlan.plannedVisits.filter((visit) => visit.completed).length} completed of ${snapshot.dailyPlan.plannedVisits.length}`} actions={<CalendarDays className="h-5 w-5 text-cyan-700" />}><div className="divide-y divide-slate-100">{snapshot.dailyPlan.plannedVisits.map((visit) => <div className="flex gap-3 p-3" key={visit.id}><Activity className={`mt-0.5 h-4 w-4 shrink-0 ${visit.completed ? "text-emerald-600" : "text-amber-600"}`} /><div><strong className="block text-sm">{visit.subjectName}</strong><span className="text-xs text-slate-500">{visit.plannedTime || "Open time"} | {visit.purpose}</span></div></div>)}</div></Panel> : null}
      </div>
    </div>
  </div>;
}
