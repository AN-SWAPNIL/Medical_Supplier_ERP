import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  Clock3,
  FileDown,
  MapPinned,
  ReceiptText,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import AIRecommendationCard from "../../components/ai/AIRecommendationCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { ErrorBlock, LoadingBlock, Panel, TableFrame } from "../../domains/components";
import { aiService, dashboardService, fieldTeamService } from "../../domains/services";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { formatCurrency, formatNumber } from "../../utils/format";

const metricIcons = { sales: ShoppingCart, collection: CircleDollarSign, due: Banknote, expense: ReceiptText, stock: Boxes, imports: FileDown, accounts: Banknote, pi: FileDown, shipment: FileDown, costing: CircleDollarSign, receiving: Boxes, batches: Boxes, expiry: AlertTriangle, dispatch: ShoppingCart, pipeline: ShoppingCart, quotes: ReceiptText };
const metricTones = ["border-blue-700", "border-cyan-600", "border-amber-500", "border-rose-500", "border-emerald-600", "border-sky-600"];

export default function DashboardPage() {
  const session = useAuthStore((state) => state.session);
  const role = useEffectiveRole();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const query = useQuery({ queryKey: ["dashboard", session?.user.id], queryFn: dashboardService.get });
  const recommendationsQuery = useQuery({ queryKey: ["ai", "dashboard", session?.user.id], queryFn: () => aiService.recommendations({ route: "/app/dashboard", entityType: "dashboard" }) });
  const fieldTeamQuery = useQuery({ queryKey: ["field-team", "dashboard", session?.user.id], queryFn: fieldTeamService.current, enabled: ["Super Admin", "Managing Director", "Sales Manager"].includes(role) });

  if (query.isLoading) return <LoadingBlock label="Preparing your role dashboard" />;
  if (query.isError || !query.data) return <ErrorBlock error={query.error} onRetry={() => void query.refetch()} />;
  const data = query.data;

  return (
    <>
      <PageHeader
        eyebrow={`${data.role} workspace`}
        title={`Good morning, ${session?.user.name?.split(" ")[0] ?? "User"}`}
        subtitle="Today's operational position, filtered to the records and amounts your role is allowed to see."
        actions={<span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected API</span>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Key performance indicators">
        {data.metrics.slice(0, 6).map((metric, index) => {
          const Icon = metricIcons[metric.id as keyof typeof metricIcons] ?? Boxes;
          const money = metric.unit === "BDT";
          return (
            <article className={`min-w-0 rounded-md border border-l-4 border-slate-200 bg-white p-4 shadow-sm ${metricTones[index]}`} key={metric.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="min-h-9 text-xs font-semibold leading-4 text-slate-500">{metric.label}</p>
                <Icon className="h-5 w-5 shrink-0 text-slate-400" />
              </div>
              <strong className="mt-2 block truncate text-xl text-slate-950" title={metric.value}>
                {money ? formatCurrency(metric.value, true) : formatNumber(metric.value)}
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase text-slate-400">{metric.sensitive ? "Restricted metric" : metric.unit}</span>
            </article>
          );
        })}
      </section>

      {fieldTeamQuery.data ? <section className="rounded-md border border-cyan-200 bg-cyan-50 p-3 shadow-sm" aria-label="Field team summary"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded bg-white text-cyan-800"><MapPinned className="h-5 w-5" /></span><div><strong className="block text-sm text-slate-950">Field Team</strong><p className="text-xs text-slate-600">Active now: <b>{fieldTeamQuery.data.summary.activeNow}</b> · Offline: <b>{fieldTeamQuery.data.summary.offline}</b> · Visits today: <b>{fieldTeamQuery.data.summary.visitsToday}</b></p></div></div><Link className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-blue-950 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900" to="/app/sales?view=field-team"><MapPinned className="h-4 w-4" />Open Live Map</Link></div></section> : null}

      {recommendationsQuery.data?.some((item) => !dismissed.includes(item.id)) ? <section aria-label="Smart operational alerts"><div className="mb-2 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-950">Smart operational alerts</h2><p className="text-xs text-slate-500">Rule-backed priorities from the same records shown below</p></div><Link className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-cyan-800 hover:underline" to="/app/insights">View All Insights <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-3 lg:grid-cols-2">{recommendationsQuery.data.filter((item) => !dismissed.includes(item.id)).slice(0, 2).map((item) => <AIRecommendationCard recommendation={item} onDismiss={() => setDismissed((current) => [...current, item.id])} key={item.id} />)}</div></section> : null}

      {data.importAttention.length || data.expiryAlerts.length ? <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        {data.importAttention.length ? <Panel title="Action queue" subtitle="Records needing the next operational step">
          <div className="divide-y divide-slate-100">
            {data.importAttention.length ? data.importAttention.map((record) => (
              <Link className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50" key={record.id} to={`/app/imports/${record.id}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-blue-50 text-blue-700"><FileDown className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-slate-900">{record.primaryReference}</strong>
                  <small className="block truncate text-xs text-slate-500">{record.supplierName} | {record.items.length} product lines</small>
                </span>
                <StatusBadge status={record.status} />
                <ArrowRight className="hidden h-4 w-4 text-slate-400 sm:block" />
              </Link>
            )) : <p className="p-5 text-sm text-slate-500">No import cases currently need this role's attention.</p>}
          </div>
        </Panel> : null}

        {data.expiryAlerts.length ? <Panel title="Expiry awareness" subtitle="Expiry stays visible while FIFO controls issue sequence">
          <div className="divide-y divide-slate-100">
            {data.expiryAlerts.slice(0, 5).map((batch) => (
              <div className="flex items-center gap-3 px-4 py-3" key={batch.id}>
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-slate-900">{batch.productName}</strong>
                  <span className="block text-xs text-slate-500">Lot {batch.lotNumber} | {formatNumber(batch.quantityAvailable)} units</span>
                </div>
                <div className="text-right"><time className="block text-xs font-bold text-amber-700">{batch.expiryDate}</time><StatusBadge status={batch.expiryStatus} /></div>
              </div>
            ))}
          </div>
        </Panel> : null}
      </div> : null}

      {data.customerDues.length || data.recentCollections.length || data.recentSales.length ? <div className="grid gap-4 xl:grid-cols-2">
        {data.customerDues.length ? <Panel title="Customer dues" subtitle="Highest current balances">
          <TableFrame>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-2.5">Customer</th><th className="px-4 py-2.5">Territory</th><th className="px-4 py-2.5 text-right">Due</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.customerDues.map((customer) => <tr key={customer.id}><td className="px-4 py-3 font-semibold text-slate-900">{customer.name}</td><td className="px-4 py-3 text-slate-500">{customer.territory}</td><td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(customer.currentDue)}</td></tr>)}
              </tbody>
            </table>
          </TableFrame>
        </Panel> : null}

        {data.recentCollections.length || data.recentSales.length ? <Panel title="Recent activity" subtitle="Sales and collection posting">
          <div className="grid divide-y divide-slate-100">
            {data.recentCollections.slice(0, 3).map((collection) => (
              <div className="px-4 py-3 sm:flex sm:items-center sm:gap-3" key={collection.id}>
                <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-emerald-50 text-emerald-700"><Banknote className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{collection.customerName}</strong><span className="text-xs text-slate-500">{collection.receiptNumber} | {collection.paymentMode}</span></div>
                </div>
                <strong className="mt-1 block pl-11 text-xs text-emerald-700 sm:mt-0 sm:shrink-0 sm:pl-0 sm:text-sm">{formatCurrency(collection.amount)}</strong>
              </div>
            ))}
            {data.recentSales.slice(0, 2).map((order) => (
              <div className="px-4 py-3 sm:flex sm:items-center sm:gap-3" key={order.id}>
                <div className="flex min-w-0 items-center gap-3 sm:flex-1">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-blue-50 text-blue-700"><ShoppingCart className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{order.customerName}</strong><span className="text-xs text-slate-500">{order.orderNumber}</span></div>
                </div>
                <strong className="mt-1 block pl-11 text-xs text-slate-900 sm:mt-0 sm:shrink-0 sm:pl-0 sm:text-sm">{formatCurrency(order.total)}</strong>
              </div>
            ))}
          </div>
        </Panel> : null}
      </div> : null}

      {data.recentExpenses.length ? (
        <Panel title="Operating expense pulse" subtitle="These costs remain separate from landed cost">
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.recentExpenses.slice(0, 4).map((expense) => (
              <div className="border-l-2 border-rose-500 pl-3" key={expense.id}>
                <span className="block truncate text-xs text-slate-500">{expense.categoryName}</span>
                <strong className="block text-sm text-slate-900">{formatCurrency(expense.amount)}</strong>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><Clock3 className="h-3 w-3" /> {expense.date}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </>
  );
}
