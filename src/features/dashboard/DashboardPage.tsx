import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, Boxes, Bot, ChartNoAxesCombined, CircleDollarSign, PackageCheck, ReceiptText, ShoppingCart } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { apiClient } from "../../lib/api/client";
import { useEffectiveRole } from "../../lib/auth/session";
import { roleDashboardNotes } from "../../data/seed";
import { formatCurrency, formatNumber } from "../../utils/format";

const icons = [ShoppingCart, ShoppingCart, CircleDollarSign, ChartNoAxesCombined, Banknote, ReceiptText, ReceiptText, Boxes];
const tones = ["teal", "blue", "green", "green", "blue", "amber", "rose", "teal"] as const;
const chartColors = ["#0f766e", "#2563eb", "#16a34a", "#f59e0b", "#e11d48", "#7c3aed"];

export default function DashboardPage() {
  const role = useEffectiveRole();
  const query = useQuery({
    queryKey: ["dashboard", role],
    queryFn: async () => (await apiClient.getDashboard()).data
  });

  if (query.isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-white" />;
  }

  if (!query.data) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">Dashboard failed to load.</div>;
  }

  const data = query.data;
  const isSalesRole = role === "Sales Executive" || role === "Sales Manager";
  const proposalFacts = role === "Sales Executive"
    ? [
        ["Visible scope", "Own records", "Customers, quotations, invoices, visits"],
        ["Privacy rule", "Cost hidden", "Purchase, landed cost and profit are restricted"],
        ["Mobile control", "GPS ready", "Check-in and visit logs prepared"],
        ["AI control rule", "Human approval", "AI recommends, users approve"]
      ]
    : role === "Sales Manager"
      ? [
          ["Visible scope", "Team records", "Targets, collections and approvals"],
          ["Privacy rule", "Cost hidden", "Core purchase cost and profit are restricted"],
          ["Mobile control", "Team GPS", "Visit and route oversight prepared"],
          ["AI control rule", "Human approval", "AI recommends, users approve"]
        ]
      : [
          ["Stock asset value", "BDT 1,286,145", "From Mipro workbook inventory"],
          ["Units in stock", "17,500", "Dialyzer, BTS, AV Fistula Needle"],
          ["Sales revenue", "BDT 3,970,000", "Dhaka Medical, Popular, Labaid"],
          ["AI control rule", "Human approval", "AI recommends, users approve"]
        ];

  return (
    <>
      <PageHeader
        eyebrow={`${role} Dashboard`}
        title="Medical Import & Distribution Command Center"
        subtitle={roleDashboardNotes[role]}
        actions={
          <>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Live mock API</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">AI summary ready</span>
          </>
        }
      />

      <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[1fr_420px]">
        <div className="relative min-h-[300px] p-6 text-white">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80"
            alt="Medical distribution warehouse"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/82 to-teal-950/68" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200">Latest Proposal Alignment</p>
              <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">
                From overseas procurement to hospital delivery, payment collection and executive reporting.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
                The dashboard follows the latest integrated ERP proposal: import management, landed cost, warehouse traceability,
                CRM, finance, reports, security and AI-assisted insights in one command surface.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {["Procurement", "Shipment & Customs", "Warehouse & Inventory", "Sales & Finance"].map((step, index) => (
                <span className="rounded-xl border border-white/15 bg-white/10 p-3 text-sm font-bold backdrop-blur" key={step}>
                  <small className="mb-1 block text-teal-200">0{index + 1}</small>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid content-center gap-3 p-5">
          {proposalFacts.map(([label, value, note]) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={label}>
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <strong className="mt-1 block text-xl text-slate-950">{value}</strong>
              <span className="text-xs text-slate-500">{note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, index) => (
          <StatCard
            key={metric.id}
            label={String(metric.label)}
            value={Number(metric.value)}
            unit={String(metric.unit)}
            trend={Number(metric.trend)}
            icon={icons[index] ?? ChartNoAxesCombined}
            tone={tones[index] ?? "blue"}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">{isSalesRole ? "Sales Workflow Value" : "Import Pipeline Value"}</h2>
              <p className="text-sm text-slate-500">{isSalesRole ? "Quotation to collection sync" : "Supplier inquiry to warehouse receiving"}</p>
            </div>
            <PackageCheck className="h-5 w-5 text-teal-700" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.importPipeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.importPipeline.map((item, index) => (
                    <Cell fill={chartColors[index % chartColors.length]} key={item.id} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-950">Product Sales Mix</h2>
            <p className="text-sm text-slate-500">Revenue by core medical consumable</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesByProduct} layout="vertical" margin={{ left: 18, right: 18 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="product" type="category" width={118} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
                  {data.salesByProduct.map((entry, index) => (
                    <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Target vs Achievement</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.targetVsAchievement}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="rep" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line dataKey="target" stroke="#2563eb" strokeWidth={3} />
                <Line dataKey="achieved" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Expiry & FEFO Alerts</h2>
              <p className="text-sm text-slate-500">Medical stock safety windows</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-4 grid gap-3">
            {data.expiryAlerts.map((alert) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3" key={alert.id}>
                <div>
                  <strong className="block text-slate-950">{String(alert.product)}</strong>
                  <span className="text-sm text-slate-500">
                    {String(alert.batch)} / {formatNumber(Number(alert.daysLeft))} days left
                  </span>
                </div>
                <StatusBadge status={String(alert.status)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-700 text-white">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">{String(data.aiSummary.title)}</h2>
              <StatusBadge status={String(data.aiSummary.status)} />
            </div>
            <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-700">{String(data.aiSummary.summary)}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-teal-700">
              Confidence {String(data.aiSummary.confidence)}% / Human approval required
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
