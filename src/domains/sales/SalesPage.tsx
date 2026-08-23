import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  FileText,
  Pencil,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  Truck
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  ErrorBlock,
  LoadingBlock,
  Modal,
  Panel,
  Segmented,
  TableFrame,
  inputClass,
  labelClass,
  textareaClass
} from "../components";
import type { Customer, Quotation } from "../erp.types";
import { inventoryService, salesService, settingsService } from "../services";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { hasCapability } from "../../lib/permissions/matrix";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency, formatNumber } from "../../utils/format";
import { CollectionForm, CustomerForm, DeliveryForm, QuotationForm } from "./SalesForms";

type View = "customers" | "orders" | "deliveries" | "collections";
type ModalType = "customer" | "quotation" | "convert" | "delivery" | "collection" | null;
type Task = { run: () => Promise<unknown>; success: string };

export default function SalesPage() {
  const role = useEffectiveRole();
  const session = useAuthStore((state) => state.session);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const defaultView: View = role === "Accounts" ? "collections" : role === "Warehouse Manager" ? "deliveries" : "customers";
  const requested = params.get("view") as View | null;
  const [view, setViewState] = useState<View>(requested ?? defaultView);
  const [modal, setModal] = useState<ModalType>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>();
  const [converting, setConverting] = useState<Quotation | undefined>();
  const [deliveryInstruction, setDeliveryInstruction] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "customer" | "quotation"; id: string; label: string } | null>(null);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canCreateQuote = ["Super Admin", "Sales Manager", "Sales Executive"].includes(role);
  const canDispatch = ["Super Admin", "Warehouse Manager", "Sales Manager"].includes(role);
  const canCollect = ["Super Admin", "Accounts", "Sales Manager", "Sales Executive"].includes(role);
  const canEditCustomer = ["Super Admin", "Sales Manager", "Sales Executive"].includes(role);

  const customersQuery = useQuery({ queryKey: ["sales", "customers", session?.user.id], queryFn: salesService.customers });
  const quotationsQuery = useQuery({ queryKey: ["sales", "quotations", session?.user.id], queryFn: salesService.quotations });
  const ordersQuery = useQuery({ queryKey: ["sales", "orders", session?.user.id], queryFn: salesService.orders });
  const deliveriesQuery = useQuery({ queryKey: ["sales", "deliveries", session?.user.id], queryFn: salesService.deliveries });
  const collectionsQuery = useQuery({ queryKey: ["sales", "collections", session?.user.id], queryFn: salesService.collections });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: settingsService.products });
  const batchesQuery = useQuery({ queryKey: ["inventory", "batches"], queryFn: inventoryService.batches, enabled: canDispatch });
  const accountsQuery = useQuery({ queryKey: ["sales", "payment-accounts"], queryFn: salesService.paymentAccounts, enabled: canCollect });

  const queries = [customersQuery, quotationsQuery, ordersQuery, deliveriesQuery, collectionsQuery, productsQuery];
  const error = queries.find((query) => query.error)?.error ?? batchesQuery.error ?? accountsQuery.error;
  const loading = queries.some((query) => query.isLoading) || (canDispatch && batchesQuery.isLoading) || (canCollect && accountsQuery.isLoading);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };
  const action = useMutation({
    mutationFn: (task: Task) => task.run(),
    onSuccess: (_data, task) => {
      refresh();
      setModal(null);
      setEditingCustomer(undefined);
      setEditingQuotation(undefined);
      setConverting(undefined);
      setDeleteTarget(null);
      pushToast({ kind: "success", title: task.success });
    },
    onError: (error) => pushToast({ kind: "error", title: "Sales action failed", message: error instanceof Error ? error.message : undefined })
  });

  const setView = (next: View) => {
    setViewState(next);
    setParams({ view: next }, { replace: true });
  };
  const visibleOptions = useMemo(() => {
    if (role === "Accounts") return [{ value: "customers" as const, label: "Customer Dues", count: customersQuery.data?.length }, { value: "collections" as const, label: "Collections", count: collectionsQuery.data?.length }];
    if (role === "Warehouse Manager") return [{ value: "deliveries" as const, label: "Deliveries", count: deliveriesQuery.data?.length }];
    if (role === "Sales Executive") return [{ value: "customers" as const, label: "My Customers", count: customersQuery.data?.length }, { value: "orders" as const, label: "My Quotes & Orders", count: quotationsQuery.data?.length }, { value: "collections" as const, label: "Collections", count: collectionsQuery.data?.length }];
    return [{ value: "customers" as const, label: "Customers", count: customersQuery.data?.length }, { value: "orders" as const, label: "Quotations & Orders", count: quotationsQuery.data?.length }, { value: "deliveries" as const, label: "Deliveries", count: deliveriesQuery.data?.length }, { value: "collections" as const, label: "Collections", count: collectionsQuery.data?.length }];
  }, [role, customersQuery.data, collectionsQuery.data, deliveriesQuery.data, quotationsQuery.data]);

  if (loading) return <LoadingBlock label="Loading connected sales workspace" />;
  if (error) return <ErrorBlock error={error} onRetry={() => queries.forEach((query) => void query.refetch())} />;

  const customers = customersQuery.data ?? [];
  const quotations = quotationsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const deliveries = deliveriesQuery.data ?? [];
  const collections = collectionsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const term = search.toLowerCase();
  const filteredCustomers = customers.filter((customer) => [customer.name, customer.territory, customer.phone, customer.type].some((value) => value.toLowerCase().includes(term)));
  const totalDue = customers.reduce((sum, customer) => sum + Number(customer.currentDue), 0);
  const totalCollections = collections.reduce((sum, collection) => sum + Number(collection.amount), 0);

  return (
    <>
      <PageHeader
        eyebrow={role === "Sales Executive" ? "Own-record sales workspace" : "Commercial operations"}
        title="Sales"
        subtitle="Customer ledger, quotation, order, actual batch delivery and collection remain connected without re-entering line items."
        actions={
          <>
            {view === "customers" && canEditCustomer ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingCustomer(undefined); setModal("customer"); }}>New Customer</Button> : null}
            {view === "orders" && canCreateQuote ? <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingQuotation(undefined); setModal("quotation"); }}>New Quotation</Button> : null}
            {view === "deliveries" && canDispatch ? <Button variant="primary" icon={<Truck className="h-4 w-4" />} onClick={() => setModal("delivery")}>New Delivery</Button> : null}
            {view === "collections" && canCollect ? <Button variant="primary" icon={<Banknote className="h-4 w-4" />} onClick={() => setModal("collection")}>Post Collection</Button> : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs text-slate-500">Visible customers</span><strong className="mt-1 block text-2xl">{formatNumber(customers.length)}</strong><small className="text-slate-400">{role === "Sales Executive" ? "assigned to you" : "normalized ledger"}</small></div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs text-slate-500">Outstanding due</span><strong className="mt-1 block text-2xl text-red-700">{formatCurrency(totalDue, true)}</strong><small className="text-slate-400">current visible balance</small></div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs text-slate-500">Open orders</span><strong className="mt-1 block text-2xl">{formatNumber(orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length)}</strong><small className="text-slate-400">awaiting or in delivery</small></div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs text-slate-500">Collections shown</span><strong className="mt-1 block text-2xl text-emerald-700">{formatCurrency(totalCollections, true)}</strong><small className="text-slate-400">cash and banking channels</small></div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Segmented value={visibleOptions.some((option) => option.value === view) ? view : visibleOptions[0].value} onChange={setView} ariaLabel="Sales views" options={visibleOptions} />
        {view === "customers" ? <div className="relative w-full xl:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass + " pl-9"} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer ledger" /></div> : null}
      </div>

      {view === "customers" ? (
        <Panel title="Customer ledger" subtitle="Spreadsheet customer tabs are normalized into one searchable customer and balance table.">
          <TableFrame>
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Type / Territory</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3 text-right">Sales</th><th className="px-4 py-3 text-right">Collected</th><th className="px-4 py-3 text-right">Due</th><th className="px-4 py-3">Collection</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{filteredCustomers.map((customer) => {
                const percent = Number(customer.totalSales) ? Math.min(100, Number(customer.totalCollected) / Number(customer.totalSales) * 100) : 0;
                return <tr key={customer.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-blue-50 text-blue-700"><Building2 className="h-5 w-5" /></span><div><strong className="block max-w-64 truncate text-slate-900">{customer.name}</strong><small className="text-slate-500">{customer.paymentTerms} · limit {formatCurrency(customer.creditLimit)}</small></div></div></td><td className="px-4 py-3 text-slate-600">{customer.type}<small className="block">{customer.territory}</small></td><td className="px-4 py-3 text-slate-600">{customer.contactPerson}<small className="block">{customer.phone}</small></td><td className="px-4 py-3 text-right">{formatCurrency(customer.totalSales)}</td><td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(customer.totalCollected)}</td><td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(customer.currentDue)}</td><td className="px-4 py-3"><div className="h-1.5 w-24 rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-500" style={{ width: percent + "%" }} /></div><small className="text-slate-400">{percent.toFixed(0)}% collected</small></td><td className="px-4 py-3"><div className="flex justify-end gap-1">{canEditCustomer ? <Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingCustomer(customer); setModal("customer"); }} aria-label="Edit customer" title="Edit customer" /> : null}{["Super Admin", "Sales Manager"].includes(role) ? <Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "customer", id: customer.id, label: customer.name })} aria-label="Delete customer" title="Delete customer" /> : null}</div></td></tr>;
              })}</tbody>
            </table>
          </TableFrame>
        </Panel>
      ) : null}

      {view === "orders" ? (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-4">
            {[["Quotation", FileText], ["Order", ShoppingCart], ["Delivery Challan", Truck], ["Collection", Banknote]].map(([label, Icon], index) => <div className="relative flex items-center gap-2 rounded bg-slate-50 p-3" key={String(label)}><span className="grid h-8 w-8 place-items-center rounded bg-red-50 text-red-700"><Icon className="h-4 w-4" /></span><strong className="text-xs sm:text-sm">{label as string}</strong>{index < 3 ? <ArrowRight className="absolute -right-2 z-10 hidden h-4 w-4 text-slate-400 sm:block" /> : null}</div>)}
          </div>
          <Panel title="Quotations" subtitle="Digital and preprinted letterhead modes use this same record.">
            <TableFrame>
              <table className="min-w-[1020px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Quotation</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Lines</th><th className="px-4 py-3">Terms</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{quotations.map((quote) => <tr key={quote.id}><td className="px-4 py-3"><strong>{quote.quotationNumber}</strong><small className="block text-slate-500">{quote.date} · {quote.validityDays} days</small></td><td className="max-w-72 px-4 py-3"><span className="block truncate font-semibold">{quote.customerName}</span></td><td className="px-4 py-3">{quote.lines.length}<small className="block text-slate-500">{formatNumber(quote.lines.reduce((sum, line) => sum + Number(line.quantity), 0))} units</small></td><td className="px-4 py-3 text-slate-600">{quote.paymentTerms}</td><td className="px-4 py-3 text-right font-bold">{formatCurrency(quote.total)}</td><td className="px-4 py-3"><StatusBadge status={quote.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => navigate("/app/print/quotation/" + quote.id)} aria-label="Print quotation" title="Print quotation" />{canCreateQuote && !["Converted", "Rejected"].includes(quote.status) ? <Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingQuotation(quote); setModal("quotation"); }} aria-label="Edit quotation" title="Edit quotation" /> : null}{canCreateQuote && quote.status !== "Converted" ? <Button variant="ghost" icon={<CheckCircle2 className="h-4 w-4 text-emerald-700" />} onClick={() => { setConverting(quote); setDeliveryInstruction(""); setModal("convert"); }}>Convert</Button> : null}{canCreateQuote && ["Draft", "Rejected"].includes(quote.status) ? <Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteTarget({ type: "quotation", id: quote.id, label: quote.quotationNumber })} aria-label="Delete quotation" title="Delete quotation" /> : null}</div></td></tr>)}</tbody>
              </table>
            </TableFrame>
          </Panel>
          <Panel title="Sales orders" subtitle="Converted quotation lines are carried forward without re-entry. Invoice remains pending client confirmation.">
            <TableFrame>
              <table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Instruction</th><th className="px-4 py-3 text-right">Value</th><th className="px-4 py-3 text-right">Posted Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Print</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => <tr key={order.id}><td className="px-4 py-3"><strong>{order.orderNumber}</strong><small className="block text-slate-500">{order.date}</small></td><td className="px-4 py-3 font-semibold">{order.customerName}</td><td className="max-w-72 px-4 py-3 text-slate-600"><span className="block truncate">{order.deliveryInstruction}</span></td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.total)}</td><td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(order.due)}</td><td className="px-4 py-3"><StatusBadge status={order.status} /></td><td className="px-4 py-3 text-right"><Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => navigate("/app/print/order/" + order.id)} aria-label="Print order" title="Print order" /></td></tr>)}</tbody></table>
            </TableFrame>
          </Panel>
        </>
      ) : null}

      {view === "deliveries" ? (
        <Panel title="Delivery challans" subtitle="Actual batch selection posts stock-out movements; a newer batch triggers a controlled FIFO warning.">
          <TableFrame>
            <table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Challan</th><th className="px-4 py-3">Order / Customer</th><th className="px-4 py-3">Products & Batches</th><th className="px-4 py-3">Receiver</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Print</th></tr></thead><tbody className="divide-y divide-slate-100">{deliveries.map((delivery) => <tr key={delivery.id}><td className="px-4 py-3"><strong>{delivery.challanNumber}</strong><small className="block text-slate-500">{delivery.date}</small></td><td className="px-4 py-3"><strong className="block">{orders.find((order) => order.id === delivery.orderId)?.orderNumber ?? delivery.orderId}</strong><small className="text-slate-500">{delivery.customerName}</small></td><td className="px-4 py-3">{delivery.lines.map((line) => <span className="mb-1 block text-xs" key={line.id}>{line.productCode} · {formatNumber(line.quantity)} · <b>{line.batchNumber}</b></span>)}</td><td className="px-4 py-3 text-slate-600">{delivery.receiverName ?? "-"}</td><td className="px-4 py-3"><StatusBadge status={delivery.status} />{delivery.overrideReason ? <small className="mt-1 block max-w-48 text-amber-700">Override: {delivery.overrideReason}</small> : null}</td><td className="px-4 py-3 text-right"><Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => navigate("/app/print/challan/" + delivery.id)} aria-label="Print challan" title="Print challan" /></td></tr>)}</tbody></table>
          </TableFrame>
        </Panel>
      ) : null}

      {view === "collections" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Panel title="Collection register" subtitle="Posting updates customer due and the selected cash or bank ledger.">
            <TableFrame>
              <table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Mode / Reference</th><th className="px-4 py-3">Order</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Print</th></tr></thead><tbody className="divide-y divide-slate-100">{collections.map((collection) => <tr key={collection.id}><td className="px-4 py-3"><strong>{collection.receiptNumber}</strong><small className="block text-slate-500">{collection.date}</small></td><td className="px-4 py-3 font-semibold">{collection.customerName}</td><td className="px-4 py-3 text-slate-600">{collection.paymentMode}<small className="block">{collection.referenceNumber ?? "-"}</small></td><td className="px-4 py-3 text-slate-600">{orders.find((order) => order.id === collection.orderId)?.orderNumber ?? "Customer ledger"}</td><td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(collection.amount)}</td><td className="px-4 py-3 text-right"><Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => navigate("/app/print/receipt/" + collection.id)} aria-label="Print receipt" title="Print receipt" /></td></tr>)}</tbody></table>
            </TableFrame>
          </Panel>
          <Panel title="Due concentration" subtitle="Largest visible balances">
            <div className="divide-y divide-slate-100">{[...customers].sort((a, b) => Number(b.currentDue) - Number(a.currentDue)).slice(0, 6).map((customer) => <div className="px-4 py-3" key={customer.id}><div className="flex items-center justify-between gap-3"><strong className="min-w-0 truncate text-sm">{customer.name}</strong><span className="shrink-0 text-sm font-bold text-red-700">{formatCurrency(customer.currentDue)}</span></div><div className="mt-2 h-1.5 rounded bg-slate-100"><span className="block h-full rounded bg-red-500" style={{ width: Math.min(100, Number(customer.currentDue) / Math.max(1, totalDue) * 300) + "%" }} /></div></div>)}</div>
          </Panel>
        </div>
      ) : null}

      {modal === "customer" ? <Modal open title={editingCustomer ? "Edit customer" : "Add customer"} subtitle="All customer-specific spreadsheet histories are represented by one normalized ledger record." onClose={() => { setModal(null); setEditingCustomer(undefined); }}><CustomerForm customer={editingCustomer} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingCustomer ? salesService.updateCustomer(editingCustomer.id, payload) : salesService.createCustomer(payload), success: editingCustomer ? "Customer updated" : "Customer created" })} /></Modal> : null}
      {modal === "quotation" ? <Modal open title={editingQuotation ? "Edit quotation" : "New quotation"} subtitle="Choose canonical variants; conversion carries every line into the sales order." onClose={() => { setModal(null); setEditingQuotation(undefined); }} width="max-w-5xl"><QuotationForm quotation={editingQuotation} customers={customers} products={products} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingQuotation ? salesService.updateQuotation(editingQuotation.id, payload) : salesService.createQuotation(payload), success: editingQuotation ? "Quotation updated" : "Quotation created" })} /></Modal> : null}
      {modal === "convert" && converting ? <Modal open title={"Convert " + converting.quotationNumber + " to order"} subtitle="Products, quantities, prices, discount and customer carry forward without re-entry." onClose={() => { setModal(null); setConverting(undefined); }}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); action.mutate({ run: () => salesService.convertQuotation(converting.id, deliveryInstruction), success: "Quotation converted to sales order" }); }}><div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><strong>{converting.lines.length} product lines · {formatCurrency(converting.total)}</strong><p className="mt-1">The original quotation becomes locked and linked to the new order.</p></div><label><span className={labelClass}>Delivery Instruction</span><textarea className={textareaClass} required value={deliveryInstruction} onChange={(event) => setDeliveryInstruction(event.target.value)} /></label><div className="flex justify-end"><Button type="submit" variant="primary" icon={<ArrowRight className="h-4 w-4" />} disabled={action.isPending || !deliveryInstruction.trim()}>Create Sales Order</Button></div></form></Modal> : null}
      {modal === "delivery" ? <Modal open title="Create delivery challan" subtitle="Choose actual batches. The API validates FIFO and posts stock-out only after confirmation." onClose={() => setModal(null)} width="max-w-5xl"><DeliveryForm orders={orders} deliveries={deliveries} batches={batchesQuery.data ?? []} canOverride={hasCapability(session?.user, "approve_stock_override")} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => salesService.createDelivery(payload), success: "Delivery posted and stock reduced" })} /></Modal> : null}
      {modal === "collection" ? <Modal open title="Post customer collection" subtitle="Cash, mobile banking, bank, cheque and outstanding credit are supported." onClose={() => setModal(null)}><CollectionForm customers={customers} orders={orders} accounts={accountsQuery.data ?? []} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => salesService.createCollection(payload), success: "Collection posted and dues updated" })} /></Modal> : null}

      <ConfirmDialog open={Boolean(deleteTarget)} title={"Delete " + (deleteTarget?.type ?? "record") + "?"} message={(deleteTarget?.label ?? "") + " can be removed only when no protected transaction history exists."} confirmLabel="Delete" onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && action.mutate({ run: () => deleteTarget.type === "customer" ? salesService.removeCustomer(deleteTarget.id) : salesService.removeQuotation(deleteTarget.id), success: "Draft record removed" })} />
    </>
  );
}
