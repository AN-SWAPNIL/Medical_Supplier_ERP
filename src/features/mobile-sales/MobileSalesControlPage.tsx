import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Cloud, CreditCard, LocateFixed, MapPin, Navigation, PackageSearch, Route, Smartphone, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api/client";
import { useEffectiveRole } from "../../lib/auth/session";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency, formatNumber } from "../../utils/format";

function sum(rows: { [key: string]: unknown }[], key: string) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function MobileSalesControlPage() {
  const role = useEffectiveRole();
  const pushToast = useToastStore((state) => state.push);
  const customers = useQuery({ queryKey: ["mobile-customers", role], queryFn: async () => (await apiClient.list("/api/customers")).data });
  const visits = useQuery({ queryKey: ["mobile-visits", role], queryFn: async () => (await apiClient.list("/api/sales/visits")).data });
  const orders = useQuery({ queryKey: ["mobile-orders", role], queryFn: async () => (await apiClient.list("/api/sales/orders")).data });
  const collections = useQuery({ queryKey: ["mobile-collections", role], queryFn: async () => (await apiClient.list("/api/sales/collections")).data });
  const stock = useQuery({ queryKey: ["mobile-stock", role], queryFn: async () => (await apiClient.list("/api/inventory/stock")).data });
  const targets = useQuery({ queryKey: ["mobile-targets", role], queryFn: async () => (await apiClient.list("/api/sales/targets")).data });

  const customerRows = customers.data ?? [];
  const visitRows = visits.data ?? [];
  const orderRows = orders.data ?? [];
  const collectionRows = collections.data ?? [];
  const stockRows = stock.data ?? [];
  const targetRows = targets.data ?? [];
  const routeStops = visitRows
    .filter((visit) => visit.gpsLat && visit.gpsLng)
    .sort((a, b) => numberValue(a.routeSequence, 999) - numberValue(b.routeSequence, 999))
    .map((visit, index) => ({
      id: String(visit.id),
      sequence: numberValue(visit.routeSequence, index + 1),
      customer: String(visit.customer ?? "Customer visit"),
      outcome: String(visit.outcome ?? "Visit note"),
      checkInTime: String(visit.checkInTime ?? "-"),
      status: String(visit.status ?? "Planned"),
      lat: numberValue(visit.gpsLat, 23.8103),
      lng: numberValue(visit.gpsLng, 90.4125),
      accuracyMeter: numberValue(visit.accuracyMeter, 20)
    }));
  const activeStop = routeStops[0] ?? {
    id: "fallback",
    sequence: 1,
    customer: "Dhaka North field route",
    outcome: "GPS tracking ready",
    checkInTime: "-",
    status: "Ready",
    lat: 23.8103,
    lng: 90.4125,
    accuracyMeter: 20
  };
  const routeDistanceKm = routeStops.length ? (routeStops.length * 6.8).toFixed(1) : "0.0";
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=90.33%2C23.70%2C90.48%2C23.90&layer=mapnik&marker=${activeStop.lat}%2C${activeStop.lng}`;
  const stats: { label: string; value: string | number; note: string; Icon: LucideIcon }[] = [
    { label: "Visible Customers", value: customerRows.length, note: "Own/customer-team scope", Icon: MapPin },
    { label: "Orders", value: orderRows.length, note: "Ready for warehouse sync", Icon: PackageSearch },
    { label: "Collections", value: formatCurrency(sum(collectionRows, "amount")), note: "Posts to accounts", Icon: CreditCard },
    { label: "Visit Logs", value: visitRows.length, note: "GPS evidence ready", Icon: Navigation },
    { label: "Route KM", value: routeDistanceKm, note: "Today route review", Icon: Route },
    { label: "Stock Available", value: formatNumber(sum(stockRows, "currentStockInHand")), note: "Cost hidden for sales", Icon: CheckCircle2 }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Mobile Sales / GPS Map"
        title="Sales GPS Location Map"
        subtitle="Open this page to show field-staff locations: GPS check-in, OpenStreetMap route view, visit plan, order entry, collection posting, offline sync and manager oversight."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            <Smartphone className="h-4 w-4" />
            Web mock for mobile scope
          </span>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <div className="self-start rounded-[2rem] border-8 border-slate-900 bg-slate-950 p-3 shadow-2xl">
          <div className="rounded-[1.5rem] bg-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{role} App</p>
                <h2 className="text-xl font-bold text-slate-950">Today Field Plan</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-700 text-white">
                <Navigation className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">GPS check-in</span>
                <StatusBadge status="Required" />
              </div>
              <div className="mt-3 rounded-xl bg-teal-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Current location</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {activeStop.customer} / {activeStop.lat.toFixed(4)}, {activeStop.lng.toFixed(4)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Accuracy {formatNumber(activeStop.accuracyMeter)}m at {activeStop.checkInTime}</p>
              </div>
              <Button className="mt-3 w-full" variant="primary" icon={<MapPin className="h-4 w-4" />} onClick={() => pushToast({ kind: "success", title: "GPS check-in recorded" })}>
                Check In
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              {customerRows.slice(0, 3).map((customer) => (
                <div className="rounded-2xl bg-white p-4 shadow-sm" key={customer.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-slate-950">{String(customer.customerName)}</strong>
                      <span className="text-sm text-slate-500">{String(customer.territory)} / {String(customer.type)}</span>
                    </div>
                    <StatusBadge status={String(customer.status ?? "Active")} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-slate-50 p-2">
                      Due
                      <strong className="block text-sm text-slate-950">{formatCurrency(Number(customer.openingDue ?? 0))}</strong>
                    </span>
                    <span className="rounded-lg bg-slate-50 p-2">
                      Credit Limit
                      <strong className="block text-sm text-slate-950">{formatCurrency(Number(customer.creditLimit ?? 0))}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <WifiOff className="h-4 w-4 text-amber-300" />
                Offline queue
              </span>
              <strong>2 drafts</strong>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, note, Icon }) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}>
                <Icon className="h-5 w-5 text-teal-700" />
                <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
                <strong className="mt-1 block text-2xl text-slate-950">{String(value)}</strong>
                <span className="text-xs text-slate-500">{note}</span>
              </div>
            ))}
          </div>

          <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Live Location Map</h2>
                  <p className="text-sm text-slate-500">OpenStreetMap embed for route review, GPS check-in proof and manager visibility.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <LocateFixed className="h-4 w-4" />
                  No API key
                </span>
              </div>
              <div className="relative mt-4 min-h-[320px] overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                <iframe
                  title="OpenStreetMap route tracking"
                  src={mapSrc}
                  className="absolute inset-0 z-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute inset-0 z-10 opacity-70">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.16)_0_12%,transparent_12%_100%),linear-gradient(45deg,transparent_0_44%,rgba(244,63,94,0.34)_44%_47%,transparent_47%_100%),linear-gradient(120deg,transparent_0_58%,rgba(14,165,233,0.32)_58%_61%,transparent_61%_100%)]" />
                  <span className="absolute left-[18%] top-[70%] h-3 w-3 rounded-full bg-teal-600 ring-4 ring-white" />
                  <span className="absolute left-[52%] top-[53%] h-3 w-3 rounded-full bg-rose-500 ring-4 ring-white" />
                  <span className="absolute left-[76%] top-[32%] h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white" />
                </div>
                <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-xs rounded-lg bg-white/95 p-3 shadow-lg ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Active check-in</p>
                  <strong className="mt-1 block text-sm text-slate-950">{activeStop.customer}</strong>
                  <span className="mt-1 block text-xs text-slate-500">
                    {activeStop.lat.toFixed(4)}, {activeStop.lng.toFixed(4)} / {formatNumber(activeStop.accuracyMeter)}m accuracy
                  </span>
                </div>
              </div>
            </div>

            <div className="grid content-start gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Route Review</p>
                <strong className="mt-1 block text-2xl text-slate-950">{routeStops.length} check-ins</strong>
                <span className="text-sm text-slate-500">{routeDistanceKm} km planned field coverage</span>
              </div>
              {routeStops.map((stop) => (
                <div className="rounded-lg border border-slate-200 bg-white p-4" key={stop.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-700">Stop {stop.sequence}</span>
                      <strong className="mt-1 block text-sm text-slate-950">{stop.customer}</strong>
                    </div>
                    <StatusBadge status={stop.status} />
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{stop.outcome}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-slate-50 p-2">
                      Check-in
                      <strong className="block text-sm text-slate-950">{stop.checkInTime}</strong>
                    </span>
                    <span className="rounded-lg bg-slate-50 p-2">
                      Accuracy
                      <strong className="block text-sm text-slate-950">{formatNumber(stop.accuracyMeter)}m</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Manager Sync & Activity Control</h2>
                <p className="text-sm text-slate-500">Sales Manager sees team activity; Sales Executive sees own assigned work only.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Cloud className="h-4 w-4" />
                Live ERP sync mock
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Rep", "Territory", "Target", "Achieved", "Commission", "Status"].map((head) => (
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500" key={head}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {targetRows.map((target) => (
                    <tr key={target.id}>
                      <td className="px-3 py-3 font-semibold text-slate-950">{String(target.salesRep)}</td>
                      <td className="px-3 py-3">{String(target.territory)}</td>
                      <td className="px-3 py-3">{formatCurrency(Number(target.monthlyTarget ?? 0))}</td>
                      <td className="px-3 py-3">{formatCurrency(Number(target.achieved ?? 0))}</td>
                      <td className="px-3 py-3">{String(target.commissionRate ?? 0)}%</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={String(target.status ?? "Ready")} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Order entry", "Create order from field with stock availability and approval routing."],
              ["Collection entry", "Record cash, bank, cheque or MFS collection and sync to accounts."],
              ["Visit remarks", "Capture notes, follow-up date and GPS evidence for manager review."]
            ].map(([title, body]) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={title}>
                <h3 className="font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
                <Button className="mt-4" onClick={() => pushToast({ kind: "info", title: `${title} mock opened` })}>
                  Open Mock
                </Button>
              </div>
            ))}
          </section>
        </div>
      </section>
    </>
  );
}
