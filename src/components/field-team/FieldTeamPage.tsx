import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, Clock3, Crosshair, History, ListFilter, MapPin, Navigation, Route, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { CurrentEmployeeLocation, TrackingStatus } from "../../domains/erp.types";
import { fieldTeamService } from "../../domains/services";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { businessDate } from "../../lib/date";
import { ErrorBlock, LoadingBlock, Panel, Segmented, inputClass, labelClass } from "../../domains/components";
import Button from "../ui/Button";
import EmployeePicker from "../employees/EmployeePicker";
import { LiveTeamMap, RouteHistoryMap } from "./LiveTeamMap";
import TrackingStatusBadge from "./TrackingStatusBadge";

type Mode = "live" | "history";

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
}

export default function FieldTeamPage() {
  const role = useEffectiveRole();
  const user = useAuthStore((state) => state.session?.user);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get("mode") === "history" ? "history" : "live";
  const [search, setSearch] = useState("");
  const [territory, setTerritory] = useState("");
  const [status, setStatus] = useState<TrackingStatus | "">("");
  const [historyDate, setHistoryDate] = useState(businessDate());
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const currentQuery = useQuery({ queryKey: ["field-team", "current", user?.id], queryFn: fieldTeamService.current, refetchInterval: 15_000 });
  const data = currentQuery.data;
  const requestedEmployee = params.get("employee");
  const selectedId = requestedEmployee ?? (role === "Sales Executive" ? user?.id : data?.employees[0]?.id);
  const historyQuery = useQuery({ queryKey: ["field-team", "history", selectedId, historyDate], queryFn: () => fieldTeamService.history(selectedId!, historyDate), enabled: mode === "history" && Boolean(selectedId) });

  useEffect(() => {
    if (!requestedEmployee && selectedId) setParams((current) => { const next = new URLSearchParams(current); next.set("view", "field-team"); next.set("employee", selectedId); return next; }, { replace: true });
  }, [requestedEmployee, selectedId, setParams]);

  const setMode = (nextMode: Mode) => setParams((current) => { const next = new URLSearchParams(current); next.set("view", "field-team"); next.set("mode", nextMode); return next; }, { replace: true });
  const selectEmployee = useCallback((location: CurrentEmployeeLocation) => {
    setParams((current) => { const next = new URLSearchParams(current); next.set("view", "field-team"); next.set("employee", location.userId); return next; }, { replace: true });
    setMobileListOpen(false);
  }, [setParams]);
  const selectEmployeeId = (id: string) => {
    const location = data?.locations.find((entry) => entry.userId === id);
    if (location) selectEmployee(location);
  };

  const visibleLocations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.locations ?? []).filter((location) => {
      const matchesSearch = !term || [location.employee.name, location.employee.employeeCode, location.employee.territory ?? ""].some((entry) => entry.toLowerCase().includes(term));
      return matchesSearch && (!territory || location.employee.territory === territory) && (!status || location.status === status);
    });
  }, [data?.locations, search, status, territory]);
  const territories = [...new Set((data?.employees ?? []).map((employee) => employee.territory).filter(Boolean))].sort() as string[];
  const selected = data?.locations.find((location) => location.userId === selectedId);

  if (currentQuery.isLoading) return <LoadingBlock label="Loading role-scoped field team feed" />;
  if (currentQuery.isError) return <ErrorBlock error={currentQuery.error} onRetry={() => void currentQuery.refetch()} />;
  if (!data) return <ErrorBlock error={new Error("Field team data is unavailable.")} />;
  const summaryCards: Array<{ label: string; value: number; color: string; Icon: typeof Activity }> = [
    { label: "Active now", value: data.summary.activeNow, color: "text-emerald-700", Icon: Activity },
    { label: "Recent / stale", value: data.summary.recent, color: "text-amber-700", Icon: Clock3 },
    { label: "Offline", value: data.summary.offline, color: "text-slate-700", Icon: MapPin },
    { label: "Not tracking", value: data.summary.notTracking, color: "text-red-700", Icon: Crosshair },
    { label: "Visits today", value: data.summary.visitsToday, color: "text-cyan-800", Icon: CalendarDays }
  ];

  return <section className="grid gap-4" data-testid="field-team-workspace">
    <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white text-amber-700"><Navigation className="h-4 w-4" /></span><div><strong className="block text-sm text-amber-950">{data.feedLabel}</strong><p className="text-xs leading-5 text-amber-800">Coordinates and movement are realistic mock records for management UAT. They are not production employee tracking.</p></div></div><span className="text-xs font-semibold text-amber-800">Refreshed {relativeTime(data.generatedAt)} · 15 sec polling</span></div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{summaryCards.map(({ label, value, color, Icon }) => <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm" key={label}><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div><strong className={`mt-1 block text-xl ${color}`}>{value}</strong></article>)}</div>

    <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-end xl:justify-between">
      <Segmented value={mode} onChange={setMode} ariaLabel="Field Team modes" options={[{ value: "live", label: "Live Map" }, { value: "history", label: "Route / Visit History" }]} />
      <div className="grid w-full gap-2 sm:grid-cols-3 xl:max-w-3xl"><label><span className={labelClass}>Search Employee</span><input className={inputClass} placeholder="Name / ID / territory" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label><span className={labelClass}>Territory</span><select className={inputClass} value={territory} onChange={(event) => setTerritory(event.target.value)}><option value="">All territories</option>{territories.map((entry) => <option key={entry}>{entry}</option>)}</select></label><label><span className={labelClass}>Tracking Status</span><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as TrackingStatus | "")}><option value="">All statuses</option>{["LIVE", "RECENT", "STALE", "OFFLINE", "NOT_TRACKING"].map((entry) => <option key={entry}>{entry}</option>)}</select></label></div>
    </div>

    {mode === "live" ? <>
      <div className="relative grid min-h-[540px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden overflow-y-auto border-r border-slate-200 bg-white md:block"><EmployeeList locations={visibleLocations} selectedId={selectedId} onSelect={selectEmployee} /></aside>
        <div className="relative min-h-[540px]"><LiveTeamMap locations={visibleLocations} selectedId={selectedId} onSelect={selectEmployee} /><Button className="absolute left-3 top-3 z-[500] md:hidden" icon={<ListFilter className="h-4 w-4" />} onClick={() => setMobileListOpen(true)}>Field Staff</Button>{mobileListOpen ? <div className="absolute inset-y-0 left-0 z-[600] w-[86%] max-w-80 overflow-y-auto border-r border-slate-200 bg-white shadow-2xl md:hidden"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2"><strong className="text-sm">Field Staff</strong><button className="rounded p-2 hover:bg-slate-100" onClick={() => setMobileListOpen(false)} aria-label="Close field staff list"><X className="h-4 w-4" /></button></div><EmployeeList locations={visibleLocations} selectedId={selectedId} onSelect={selectEmployee} /></div> : null}</div>
      </div>
      {selected ? <EmployeeDetail location={selected} onHistory={() => setMode("history")} onReport={() => navigate(`/app/reports?view=sales&table=salesperson-performance&employee=${selected.userId}`)} /> : null}
    </> : <>
      <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(260px,1fr)_220px_auto] md:items-end"><EmployeePicker employees={data.employees} value={selectedId ?? ""} onChange={selectEmployeeId} allowAll={false} /><label><span className={labelClass}>Activity Date</span><input className={inputClass} type="date" max={businessDate()} value={historyDate} onChange={(event) => setHistoryDate(event.target.value)} /></label><Button icon={<Users className="h-4 w-4" />} onClick={() => navigate(`/app/reports?view=sales&table=salesperson-performance&employee=${selectedId}`)} disabled={!selectedId}>Open Employee Report</Button></div>
      {historyQuery.isLoading ? <LoadingBlock label="Loading route and visit history" /> : historyQuery.isError ? <ErrorBlock error={historyQuery.error} onRetry={() => void historyQuery.refetch()} /> : historyQuery.data ? <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,.7fr)]"><div className="min-h-[440px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><RouteHistoryMap points={historyQuery.data.points} visits={historyQuery.data.visits} /></div><VisitTimeline history={historyQuery.data} /></div> : null}
    </>}
  </section>;
}

function EmployeeList({ locations, selectedId, onSelect }: { locations: CurrentEmployeeLocation[]; selectedId?: string; onSelect: (location: CurrentEmployeeLocation) => void }) {
  return <div><div className="border-b border-slate-200 px-4 py-3"><strong className="block text-sm">Field Staff</strong><small className="text-slate-500">{locations.length} matching employees</small></div><div className="divide-y divide-slate-100">{locations.map((location) => <button className={`w-full px-4 py-3 text-left transition hover:bg-cyan-50 ${selectedId === location.userId ? "bg-cyan-50 ring-1 ring-inset ring-cyan-200" : ""}`} type="button" key={location.userId} onClick={() => onSelect(location)}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm">{location.employee.name}</strong><small className="block truncate text-slate-500">{location.employee.employeeCode} · {location.employee.territory}</small></div><TrackingStatusBadge status={location.status} /></div><span className="mt-2 block text-xs text-slate-500">Last updated: {relativeTime(location.recordedAt)}</span>{location.currentVisit ? <span className="mt-1 block truncate text-xs font-semibold text-cyan-800">At {location.currentVisit.customerName}</span> : null}</button>)}{!locations.length ? <p className="p-8 text-center text-sm text-slate-500">No employee matches these filters.</p> : null}</div></div>;
}

function EmployeeDetail({ location, onHistory, onReport }: { location: CurrentEmployeeLocation; onHistory: () => void; onReport: () => void }) {
  return <Panel title={location.employee.name} subtitle={`${location.employee.employeeCode} · ${location.employee.territory ?? location.employee.title}`} actions={<TrackingStatusBadge status={location.status} />}><div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr_auto]"><div className="grid gap-2 text-sm"><span className="text-slate-500">Last updated <b className="block text-slate-900">{new Date(location.recordedAt).toLocaleString()} ({relativeTime(location.recordedAt)})</b></span><span className="text-slate-500">GPS accuracy <b className="block text-slate-900">{location.accuracyMeters} m · {location.source.replace("_", " ")}</b></span></div><div className="grid gap-2 text-sm"><span className="text-slate-500">Current / last visit <b className="block text-slate-900">{location.currentVisit?.customerName ?? "No active visit"}</b></span><span className="text-slate-500">Check-in <b className="block text-slate-900">{location.currentVisit?.checkInAt ? new Date(location.currentVisit.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</b></span></div><div className="flex flex-wrap items-end gap-2 lg:flex-col lg:justify-end"><Button icon={<History className="h-4 w-4" />} onClick={onHistory}>View Today Activity</Button><Button variant="primary" icon={<Users className="h-4 w-4" />} onClick={onReport}>Open Employee Report</Button></div></div></Panel>;
}

function VisitTimeline({ history }: { history: Awaited<ReturnType<typeof fieldTeamService.history>> }) {
  const events = [
    ...history.points.filter((point) => point.event && point.event !== "LOCATION").map((point) => ({ id: point.id, at: point.recordedAt, title: point.event!.replaceAll("_", " "), detail: `${point.accuracyMeters} m accuracy` })),
    ...history.visits.flatMap((visit) => [visit.checkInAt ? { id: `${visit.id}-in`, at: visit.checkInAt, title: `${visit.customerName} · Check In`, detail: visit.purpose } : null, visit.checkOutAt ? { id: `${visit.id}-out`, at: visit.checkOutAt, title: `${visit.customerName} · Check Out`, detail: visit.outcome ?? "Visit completed" } : null]).filter(Boolean) as Array<{ id: string; at: string; title: string; detail: string }>
  ].sort((a, b) => a.at.localeCompare(b.at));
  return <Panel title="Visit timeline" subtitle={`${history.employee.name} · ${history.date}`}><div className="p-4"><div className="mb-4 grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-xs"><span>Session<strong className="block text-sm text-slate-900">{history.session?.status ?? "Not recorded"}</strong></span><span>Route points<strong className="block text-sm text-slate-900">{history.points.length}</strong></span></div><ol className="relative ml-2 border-l border-cyan-200 pl-5">{events.map((event) => <li className="relative pb-5" key={event.id}><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-700 ring-1 ring-cyan-300" /><time className="text-[11px] font-bold text-cyan-800">{new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time><strong className="block text-sm text-slate-900">{event.title}</strong><p className="text-xs leading-5 text-slate-500">{event.detail}</p></li>)}{!events.length ? <li className="pb-4 text-sm text-slate-500">No tracking or visit events are recorded for this date.</li> : null}</ol><div className="mt-2 flex items-start gap-2 rounded bg-cyan-50 p-3 text-xs leading-5 text-cyan-900"><Route className="mt-0.5 h-4 w-4 shrink-0" />The line connects stored coordinates in timestamp order. No synthetic distance is calculated.</div></div></Panel>;
}
