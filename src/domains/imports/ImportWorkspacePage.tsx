import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Boxes,
  Calculator,
  Check,
  FileText,
  LockKeyhole,
  PackagePlus,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Ship,
  Trash2,
  Upload,
  Warehouse
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  ErrorBlock,
  KeyValue,
  LoadingBlock,
  Modal,
  ProductThumb,
  SectionAccordion,
  TableFrame,
  inputClass,
  labelClass,
  textareaClass
} from "../components";
import type {
  AllocationMethod,
  ImportCase,
  ImportCostLine,
  ImportItem,
  LandedCostPreview,
  Product,
  WarehouseReceipt
} from "../erp.types";
import { importService, settingsService } from "../services";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { hasCapability } from "../../lib/permissions/matrix";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency, formatNumber, formatUsd } from "../../utils/format";

const milestones = ["Draft", "PI Received", "LC/TT Opened", "In Production", "Shipped", "At Port", "Costing", "Cost Finalized", "Partially Received", "Received"];
const allStatuses = [...milestones, "Closed", "Cancelled"];

function milestoneIndex(status: string) {
  if (status === "Closed") return milestones.length - 1;
  if (status === "Cancelled") return -1;
  return Math.max(0, milestones.indexOf(status));
}

type ActionTask = { run: () => Promise<unknown>; success: string };

export default function ImportWorkspacePage() {
  const { importId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const session = useAuthStore((state) => state.session);
  const role = useEffectiveRole();
  const [modal, setModal] = useState<"commercial" | "shipment" | "item" | "cost" | "document" | "receive" | "reopen" | null>(null);
  const [editingItem, setEditingItem] = useState<ImportItem | undefined>();
  const [editingCost, setEditingCost] = useState<ImportCostLine | undefined>();
  const [deleteItem, setDeleteItem] = useState<ImportItem | null>(null);
  const [deleteCost, setDeleteCost] = useState<ImportCostLine | null>(null);
  const [preview, setPreview] = useState<LandedCostPreview | null>(null);

  const recordQuery = useQuery({ queryKey: ["import", importId], queryFn: () => importService.get(importId), enabled: Boolean(importId) });
  const receiptsQuery = useQuery({ queryKey: ["import-receipts", importId], queryFn: () => importService.receipts(importId), enabled: Boolean(importId) });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: settingsService.products });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["import", importId] });
    void queryClient.invalidateQueries({ queryKey: ["import-receipts", importId] });
    void queryClient.invalidateQueries({ queryKey: ["imports"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };
  const action = useMutation({
    mutationFn: (task: ActionTask) => task.run(),
    onSuccess: (_data, task) => {
      refresh();
      setModal(null);
      setEditingItem(undefined);
      setEditingCost(undefined);
      setPreview(null);
      pushToast({ kind: "success", title: task.success });
    },
    onError: (error) => pushToast({ kind: "error", title: "Action could not be completed", message: error instanceof Error ? error.message : undefined })
  });
  const previewMutation = useMutation({
    mutationFn: () => importService.preview(importId),
    onSuccess: (data) => setPreview(data),
    onError: (error) => pushToast({ kind: "error", title: "Cost preview failed", message: error instanceof Error ? error.message : undefined })
  });

  if (recordQuery.isLoading || productsQuery.isLoading) return <LoadingBlock label="Opening connected import workspace" />;
  if (recordQuery.isError || !recordQuery.data) return <ErrorBlock error={recordQuery.error} onRetry={() => void recordQuery.refetch()} />;
  const record = recordQuery.data;
  const products = productsQuery.data ?? [];
  const receipts = receiptsQuery.data ?? [];
  const locked = Boolean(record.snapshot);
  const canEdit = ["Super Admin", "Import Officer"].includes(role) && !locked;
  const canSeeCost = hasCapability(session?.user, "view_sensitive_cost");
  const canEditCost = hasCapability(session?.user, "edit_sensitive_cost") && !locked;
  const canFinalize = hasCapability(session?.user, "finalize_landed_cost") && !locked;
  const canReopen = hasCapability(session?.user, "reopen_landed_cost") && locked;
  const canReceive = ["Super Admin", "Warehouse Manager"].includes(role) && record.costingStatus === "Finalized" && record.warehouseStatus !== "Received";
  const result = record.snapshot ?? preview;
  const currentMilestone = milestoneIndex(record.status);

  return (
    <>
      <PageHeader
        eyebrow="Import case workspace"
        title={record.primaryReference}
        subtitle={record.supplierName + " · " + record.poNumber + " · " + record.items.length + " product lines"}
        actions={
          <>
            <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/app/imports")}>Register</Button>
            {canSeeCost && result ? <Button icon={<Printer className="h-4 w-4" />} onClick={() => navigate("/app/print/import-cost/" + record.id)}>Print Cost</Button> : null}
            <StatusBadge status={record.status} />
          </>
        }
      />

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white px-3 py-4 shadow-sm">
        <div className="flex min-w-[980px] items-start">
          {milestones.map((step, index) => {
            const complete = currentMilestone >= index && record.status !== "Cancelled";
            const current = currentMilestone === index;
            return (
              <div className="relative flex min-w-24 flex-1 flex-col items-center text-center" key={step}>
                {index ? <span className={"absolute right-1/2 top-3 h-0.5 w-full " + (complete ? "bg-red-600" : "bg-slate-200")} /> : null}
                <span className={"relative z-10 grid h-6 w-6 place-items-center rounded-full border-2 text-[10px] font-bold " + (complete ? "border-red-600 bg-red-600 text-white" : "border-slate-300 bg-white text-slate-400")}>
                  {complete && !current ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className={"mt-2 text-[10px] font-semibold " + (current ? "text-red-700" : "text-slate-500")}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {locked ? (
        <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>Immutable landed-cost snapshot v{record.snapshot?.version}.</strong> Commercial, product and cost values are locked. Reopening requires owner capability, a reason and an audit event.</p>
        </div>
      ) : null}

      <SectionAccordion
        title="1. Commercial & Products"
        subtitle="PO and PI details with canonical product variants"
        icon={PackagePlus}
        status={<span className="text-xs font-bold text-slate-500">{record.items.length} lines</span>}
        actions={canEdit ? <Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => setModal("commercial")} aria-label="Edit commercial data" title="Edit commercial data" /> : undefined}
      >
        <dl className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <KeyValue label="Draft Reference" value={record.draftReference} />
          <KeyValue label="Supplier" value={record.supplierName} />
          <KeyValue label="Purchase Order" value={record.poNumber + " · " + record.poDate} />
          <KeyValue label="Proforma Invoice" value={record.piNumber + " · " + record.piDate} />
        </dl>
        <div className="border-t border-slate-200">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div><h3 className="text-sm font-bold text-slate-900">Imported products</h3><p className="text-xs text-slate-500">FOB, quantity and CBM are allocation bases.</p></div>
            {canEdit ? <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingItem(undefined); setModal("item"); }}>Add Product</Button> : null}
          </div>
          <div className="grid gap-2 border-t border-slate-100 p-3 md:hidden">
            {record.items.map((item) => {
              const master = products.find((product) => product.id === item.productId);
              return (
                <article className="rounded-md border border-slate-200 p-3" key={item.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumb src={master?.imageUrl} name={item.productName} />
                    <div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{item.productName}</strong><span className="block text-xs text-slate-500">{item.productCode} | HS {item.hsCode ?? "-"}</span></div>
                    {canEdit ? <div className="flex shrink-0"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingItem(item); setModal("item"); }} aria-label="Edit product" title="Edit product" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteItem(item)} aria-label="Delete product" title="Delete product" /></div> : null}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <KeyValue label="Quantity" value={formatNumber(item.quantity) + " " + item.unit} />
                    <KeyValue label="FOB / unit" value={formatUsd(item.fobUnitForeign)} />
                    <KeyValue label="FOB total" value={canSeeCost ? formatCurrency(item.fobTotalBdt) : "Restricted"} />
                    <KeyValue label="Cartons / CBM" value={formatNumber(item.cartonCount) + " / " + item.totalCbm} />
                  </dl>
                </article>
              );
            })}
          </div>
          <div className="hidden md:block"><TableFrame>
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5 text-right">Quantity</th><th className="px-4 py-2.5 text-right">FOB / unit</th><th className="px-4 py-2.5 text-right">FOB BDT</th><th className="px-4 py-2.5 text-right">Cartons</th><th className="px-4 py-2.5 text-right">CBM</th>{canEdit ? <th className="px-4 py-2.5 text-right">Actions</th> : null}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {record.items.map((item) => {
                  const master = products.find((product) => product.id === item.productId);
                  return <tr key={item.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><ProductThumb src={master?.imageUrl} name={item.productName} /><div><strong className="block text-slate-900">{item.productName}</strong><small className="text-slate-500">{item.productCode} · HS {item.hsCode ?? "-"}</small></div></div></td><td className="px-4 py-3 text-right font-semibold">{formatNumber(item.quantity)} {item.unit}</td><td className="px-4 py-3 text-right">{formatUsd(item.fobUnitForeign)}</td><td className="px-4 py-3 text-right font-semibold">{canSeeCost ? formatCurrency(item.fobTotalBdt) : "Restricted"}</td><td className="px-4 py-3 text-right">{formatNumber(item.cartonCount)}</td><td className="px-4 py-3 text-right">{item.totalCbm}</td>{canEdit ? <td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingItem(item); setModal("item"); }} aria-label="Edit product" title="Edit product" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteItem(item)} aria-label="Delete product" title="Delete product" /></div></td> : null}</tr>;
                })}
              </tbody>
            </table>
          </TableFrame></div>
        </div>
      </SectionAccordion>

      <SectionAccordion
        title="2. LC / TT & Shipment"
        subtitle="Payment and physical shipment milestones on the same import case"
        icon={Ship}
        actions={canEdit ? <Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => setModal("shipment")} aria-label="Edit shipment" title="Edit shipment" /> : undefined}
      >
        <dl className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <KeyValue label="Payment Mode" value={record.paymentMode} accent />
          <KeyValue label={record.paymentMode === "LC" ? "LC Number" : "TT Reference"} value={record.paymentMode === "LC" ? record.lcNumber : record.ttReference} />
          <KeyValue label="Bank" value={record.bank} />
          <KeyValue label="Rate Snapshot" value={record.currency + " 1 = BDT " + record.exchangeRate + " · " + record.rateDate} />
          <KeyValue label="Bill of Lading" value={record.blNumber} />
          <KeyValue label="Container" value={[record.containerNumber, record.containerType].filter(Boolean).join(" · ")} />
          <KeyValue label="Vessel" value={record.vesselName} />
          <KeyValue label="ETD / ETA" value={(record.etd ?? "-") + " / " + (record.eta ?? record.expectedShipmentDate ?? "-")} />
        </dl>
      </SectionAccordion>

      <SectionAccordion
        title="3. Documents"
        subtitle="Metadata-ready document archive for PI, LC, BL and assessed customs documents"
        icon={FileText}
        status={<span className="text-xs font-bold text-slate-500">{record.documents.length} files</span>}
        actions={<Button variant="ghost" icon={<Upload className="h-4 w-4" />} onClick={() => setModal("document")} aria-label="Attach document" title="Attach document" />}
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {record.documents.map((document) => (
            <div className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 p-3" key={document.id}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-blue-50 text-blue-700"><Paperclip className="h-4 w-4" /></span>
              <div className="min-w-0"><strong className="block truncate text-sm text-slate-900" title={document.name}>{document.name}</strong><span className="block text-xs text-slate-500">{document.type} · {document.uploadedAt.slice(0, 10)}</span></div>
            </div>
          ))}
          {!record.documents.length ? <p className="text-sm text-slate-500">No documents attached yet.</p> : null}
        </div>
      </SectionAccordion>

      <SectionAccordion
        title="4. Costs & Allocation"
        subtitle="Dynamic cost rows with an explicit allocation basis"
        icon={Banknote}
        status={<StatusBadge status={record.costingStatus} />}
        actions={canEditCost ? <Button variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditingCost(undefined); setModal("cost"); }}>Add Cost</Button> : undefined}
      >
        {!canSeeCost ? (
          <div className="flex items-start gap-3 bg-amber-50 p-4 text-sm text-amber-900"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Sensitive cost values are restricted for {role}.</strong> Shipment and receiving status remain available without exposing supplier price, landed cost or profit.</p></div>
        ) : (
          <>
            <div className="grid gap-2 p-3 md:hidden">
              {record.costs.map((cost) => (
                <article className="rounded-md border border-slate-200 p-3" key={cost.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><strong className="block text-sm text-slate-900">{cost.name}</strong><span className="block text-xs text-slate-500">{cost.category}{cost.vendor ? " | " + cost.vendor : ""}</span></div>
                    {canEditCost ? <div className="flex shrink-0"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingCost(cost); setModal("cost"); }} aria-label="Edit cost" title="Edit cost" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteCost(cost)} aria-label="Delete cost" title="Delete cost" /></div> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                    <div><span className="block text-xs text-slate-500">{cost.currency} {formatNumber(cost.amountForeign)}</span><strong className="block text-sm text-slate-900">{formatCurrency(cost.amountBdt)}</strong></div>
                    <span className="rounded bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800">{cost.allocationMethod.replace("_", " ")}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                    <span><b className="block text-slate-700">Scope</b>{cost.appliesToItemIds.length ? cost.appliesToItemIds.map((id) => record.items.find((item) => item.id === id)?.productCode).filter(Boolean).join(", ") : "All products"}</span>
                    <span><b className="block text-slate-700">Payment</b>{cost.paymentDate ?? "Not recorded"}<small className="block">{cost.accountId ?? "-"}</small></span>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden md:block"><TableFrame>
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-2.5">Cost</th><th className="px-4 py-2.5">Foreign / BDT</th><th className="px-4 py-2.5">Allocation</th><th className="px-4 py-2.5">Scope</th><th className="px-4 py-2.5">Payment</th>{canEditCost ? <th className="px-4 py-2.5 text-right">Actions</th> : null}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {record.costs.map((cost) => <tr key={cost.id}><td className="px-4 py-3"><strong className="block text-slate-900">{cost.name}</strong><small className="text-slate-500">{cost.category}{cost.vendor ? " · " + cost.vendor : ""}</small></td><td className="px-4 py-3"><span className="block">{cost.currency} {formatNumber(cost.amountForeign)}</span><strong className="text-slate-900">{formatCurrency(cost.amountBdt)}</strong></td><td className="px-4 py-3"><span className="rounded bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-800">{cost.allocationMethod.replace("_", " ")}</span></td><td className="px-4 py-3 text-slate-600">{cost.appliesToItemIds.length ? cost.appliesToItemIds.map((id) => record.items.find((item) => item.id === id)?.productCode).filter(Boolean).join(", ") : "All products"}</td><td className="px-4 py-3 text-slate-600">{cost.paymentDate ?? "Not recorded"}<small className="block text-slate-400">{cost.accountId ?? "-"}</small></td>{canEditCost ? <td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" icon={<Pencil className="h-4 w-4" />} onClick={() => { setEditingCost(cost); setModal("cost"); }} aria-label="Edit cost" title="Edit cost" /><Button variant="ghost" icon={<Trash2 className="h-4 w-4 text-red-600" />} onClick={() => setDeleteCost(cost)} aria-label="Delete cost" title="Delete cost" /></div></td> : null}</tr>)}
                </tbody>
              </table>
            </TableFrame></div>
            {!record.costs.length ? <p className="p-4 text-sm text-slate-500">No landed-cost rows entered. Operating rent, salary, utilities and TA/DA belong in Expenses & Accounts.</p> : null}
          </>
        )}
      </SectionAccordion>

      <SectionAccordion
        title="5. Landed-Cost Result"
        subtitle="Deterministic two-decimal allocation with exact reconciliation"
        icon={Calculator}
        status={record.snapshot ? <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Snapshot v{record.snapshot.version}</span> : undefined}
        actions={canSeeCost ? <Button variant="ghost" icon={<Calculator className="h-4 w-4" />} onClick={() => previewMutation.mutate()} disabled={previewMutation.isPending || !record.items.length || !record.costs.length}>Preview</Button> : undefined}
      >
        {!canSeeCost ? (
          <div className="p-4 text-sm text-slate-600">Finalization state: <strong>{record.costingStatus}</strong>. Detailed costs and product margins are owner-only.</div>
        ) : result ? (
          <div>
            {result.validationErrors.length ? <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{result.validationErrors.map((error) => <p key={error}>• {error}</p>)}</div> : null}
            <dl className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-3">
              <KeyValue label="FOB Product Value" value={formatCurrency(result.totalProductValueBdt)} />
              <KeyValue label="Allocated Import Costs" value={formatCurrency(result.totalAdditionalCostBdt)} />
              <KeyValue label="Final Shipment Cost" value={formatCurrency(result.totalShipmentCostBdt)} accent />
            </dl>
            <div className="grid gap-2 p-3 md:hidden">
              {result.products.map((product) => (
                <article className="rounded-md border border-slate-200 p-3" key={product.importItemId}>
                  <div className="flex items-start justify-between gap-3"><strong className="text-sm text-slate-900">{product.productName}</strong><strong className="shrink-0 text-right text-sm text-red-700">{formatCurrency(product.finalPerUnitBdt)}<small className="block font-normal text-slate-500">per unit</small></strong></div>
                  <dl className="mt-3 grid grid-cols-2 gap-2">
                    <KeyValue label="Quantity" value={formatNumber(product.quantity)} />
                    <KeyValue label="Final total" value={formatCurrency(product.finalTotalBdt)} />
                    <KeyValue label="FOB / unit" value={formatCurrency(product.fobPerUnitBdt)} />
                    <KeyValue label="Added / unit" value={formatCurrency(product.additionalPerUnitBdt)} />
                  </dl>
                  <details className="mt-3 border-t border-slate-100 pt-2"><summary className="cursor-pointer text-xs font-semibold text-cyan-700">Explain {product.components.length} allocations</summary><div className="mt-2 grid gap-1 rounded bg-slate-50 p-2">{product.components.map((component) => <p className="text-xs leading-5 text-slate-600" key={component.costLineId}>{component.explanation}</p>)}</div></details>
                </article>
              ))}
            </div>
            <div className="hidden md:block"><TableFrame>
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5 text-right">Qty</th><th className="px-4 py-2.5 text-right">FOB / unit</th><th className="px-4 py-2.5 text-right">Added / unit</th><th className="px-4 py-2.5 text-right">Landed / unit</th><th className="px-4 py-2.5 text-right">Final total</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{result.products.map((product) => <tr key={product.importItemId}><td className="px-4 py-3"><strong>{product.productName}</strong><details className="mt-1"><summary className="cursor-pointer text-xs font-semibold text-cyan-700">Explain {product.components.length} allocations</summary><div className="mt-2 grid gap-1 rounded bg-slate-50 p-2">{product.components.map((component) => <p className="text-xs leading-5 text-slate-600" key={component.costLineId}>{component.explanation}</p>)}</div></details></td><td className="px-4 py-3 text-right">{formatNumber(product.quantity)}</td><td className="px-4 py-3 text-right">{formatCurrency(product.fobPerUnitBdt)}</td><td className="px-4 py-3 text-right">{formatCurrency(product.additionalPerUnitBdt)}</td><td className="px-4 py-3 text-right font-bold text-red-700">{formatCurrency(product.finalPerUnitBdt)}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(product.finalTotalBdt)}</td></tr>)}</tbody>
              </table>
            </TableFrame></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4">
              <p className="max-w-2xl text-xs leading-5 text-slate-500">Customs duty is entered as the final assessed amount for each product. The ERP does not invent HS-code duty, VAT or AIT formulas.</p>
              <div className="flex gap-2">
                {canReopen ? <Button icon={<RotateCcw className="h-4 w-4" />} onClick={() => setModal("reopen")}>Reopen with Reason</Button> : null}
                {canFinalize ? <Button variant="primary" icon={<LockKeyhole className="h-4 w-4" />} disabled={Boolean(result.validationErrors.length) || action.isPending} onClick={() => action.mutate({ run: () => importService.finalize(record.id), success: "Landed cost finalized and locked" })}>Finalize Snapshot</Button> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center p-5 text-center"><div><Calculator className="mx-auto h-8 w-8 text-slate-300" /><strong className="mt-2 block text-sm text-slate-800">Generate a landed-cost preview</strong><p className="mt-1 text-sm text-slate-500">Add product and cost lines, then preview the reconciled allocation before finalizing.</p></div></div>
        )}
      </SectionAccordion>

      <SectionAccordion
        title="6. Warehouse Receipt & Activity"
        subtitle="Receiving is unlocked only after landed-cost finalization"
        icon={Warehouse}
        status={<StatusBadge status={record.warehouseStatus} />}
        actions={canReceive ? <Button variant="primary" icon={<Boxes className="h-4 w-4" />} onClick={() => setModal("receive")}>Receive to Warehouse</Button> : undefined}
      >
        {record.costingStatus !== "Finalized" ? <div className="flex items-start gap-3 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>Warehouse receiving remains locked until the authorized owner finalizes landed cost.</p></div> : null}
        <div className="grid gap-3 p-4">
          {receipts.map((receipt) => (
            <article className="rounded-md border border-slate-200" key={receipt.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2"><div><strong className="text-sm text-slate-900">{receipt.id}</strong><span className="ml-2 text-xs text-slate-500">{receipt.receivedDate} · {receipt.receivedBy}</span></div><StatusBadge status={receipt.status} /></div>
              <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">{receipt.lines.map((line) => <div className="border-l-2 border-emerald-500 pl-3 text-sm" key={line.importItemId + line.batchNumber}><strong className="block text-slate-900">{line.productName}</strong><span className="block text-xs text-slate-500">Received {formatNumber(line.quantityReceived)} · Rejected {formatNumber(line.quantityRejected)}</span><span className="block text-xs text-slate-500">Lot {line.lotNumber} · {line.location}</span></div>)}</div>
            </article>
          ))}
          {!receipts.length ? <p className="text-sm text-slate-500">No warehouse receipt has been posted against this import case.</p> : null}
        </div>
      </SectionAccordion>

      {modal === "commercial" ? <Modal open title="Edit commercial data" subtitle="Update the header without creating another import record." onClose={() => setModal(null)}><CommercialEditor record={record} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => importService.update(record.id, payload), success: "Commercial data updated" })} /></Modal> : null}
      {modal === "shipment" ? <Modal open title="LC / TT and shipment" subtitle="The primary visible reference updates automatically after LC or TT entry." onClose={() => setModal(null)}><ShipmentEditor record={record} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => importService.update(record.id, payload), success: "Payment and shipment details updated" })} /></Modal> : null}
      {modal === "item" ? <Modal open title={editingItem ? "Edit imported product" : "Add imported product"} subtitle="Use a canonical product variant and enter its own FOB, quantity and CBM basis." onClose={() => { setModal(null); setEditingItem(undefined); }} width="max-w-3xl"><ItemEditor record={record} products={products} item={editingItem} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingItem ? importService.updateItem(record.id, editingItem.id, payload) : importService.addItem(record.id, payload), success: editingItem ? "Product line updated" : "Product line added" })} /></Modal> : null}
      {modal === "cost" ? <Modal open title={editingCost ? "Edit cost row" : "Add import cost"} subtitle="Every common or transport cost requires an explicit allocation decision." onClose={() => { setModal(null); setEditingCost(undefined); }} width="max-w-4xl"><CostEditor record={record} cost={editingCost} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => editingCost ? importService.updateCost(record.id, editingCost.id, payload) : importService.addCost(record.id, payload), success: editingCost ? "Cost row updated" : "Cost row added" })} /></Modal> : null}
      {modal === "document" ? <Modal open title="Attach import document" subtitle="The prototype stores upload metadata; a real file service can replace this boundary." onClose={() => setModal(null)}><DocumentEditor busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => importService.addDocument(record.id, payload), success: "Document metadata attached" })} /></Modal> : null}
      {modal === "receive" ? <Modal open title="Receive to warehouse" subtitle="Product and finalized cost are inherited. Enter batch traceability and accepted/rejected quantities." onClose={() => setModal(null)} width="max-w-5xl"><ReceiptEditor record={record} receipts={receipts} busy={action.isPending} onSubmit={(payload) => action.mutate({ run: () => importService.receive(record.id, payload), success: "Warehouse receipt posted and stock batches created" })} /></Modal> : null}
      {modal === "reopen" ? <ReopenModal busy={action.isPending} onClose={() => setModal(null)} onSubmit={(reason) => action.mutate({ run: () => importService.reopen(record.id, reason), success: "Landed cost reopened with an audit reason" })} /> : null}

      <ConfirmDialog open={Boolean(deleteItem)} title="Remove product line?" message="Any cost scoped to this product will also be removed. This is allowed only before landed-cost finalization." confirmLabel="Remove product" onCancel={() => setDeleteItem(null)} onConfirm={() => deleteItem && action.mutate({ run: () => importService.removeItem(record.id, deleteItem.id), success: "Product line removed" })} />
      <ConfirmDialog open={Boolean(deleteCost)} title="Remove cost row?" message="The next landed-cost preview will be recalculated without this cost." confirmLabel="Remove cost" onCancel={() => setDeleteCost(null)} onConfirm={() => deleteCost && action.mutate({ run: () => importService.removeCost(record.id, deleteCost.id), success: "Cost row removed" })} />
    </>
  );
}

function CommercialEditor({ record, busy, onSubmit }: { record: ImportCase; busy: boolean; onSubmit: (payload: Partial<ImportCase>) => void }) {
  const [form, setForm] = useState({ supplierName: record.supplierName, poNumber: record.poNumber, poDate: record.poDate, piNumber: record.piNumber, piDate: record.piDate, expectedShipmentDate: record.expectedShipmentDate ?? "", notes: record.notes ?? "", status: record.status });
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, milestone: form.status }); }}><label className="sm:col-span-2"><span className={labelClass}>Supplier</span><input className={inputClass} value={form.supplierName} onChange={(event) => change("supplierName", event.target.value)} required /></label><label><span className={labelClass}>PO Number</span><input className={inputClass} value={form.poNumber} onChange={(event) => change("poNumber", event.target.value)} required /></label><label><span className={labelClass}>PO Date</span><input className={inputClass} type="date" value={form.poDate} onChange={(event) => change("poDate", event.target.value)} required /></label><label><span className={labelClass}>PI Number</span><input className={inputClass} value={form.piNumber} onChange={(event) => change("piNumber", event.target.value)} required /></label><label><span className={labelClass}>PI Date</span><input className={inputClass} type="date" value={form.piDate} onChange={(event) => change("piDate", event.target.value)} required /></label><label><span className={labelClass}>Expected Shipment</span><input className={inputClass} type="date" value={form.expectedShipmentDate} onChange={(event) => change("expectedShipmentDate", event.target.value)} /></label><label><span className={labelClass}>Current Status</span><select className={inputClass} value={form.status} onChange={(event) => change("status", event.target.value)}>{allStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="sm:col-span-2"><span className={labelClass}>Notes</span><textarea className={textareaClass} value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label><div className="flex justify-end sm:col-span-2"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Commercial Data</Button></div></form>;
}

function ShipmentEditor({ record, busy, onSubmit }: { record: ImportCase; busy: boolean; onSubmit: (payload: Partial<ImportCase>) => void }) {
  const [form, setForm] = useState({ paymentMode: record.paymentMode, lcNumber: record.lcNumber ?? "", ttReference: record.ttReference ?? "", bank: record.bank ?? "", currency: record.currency, exchangeRate: record.exchangeRate, rateDate: record.rateDate, rateSource: record.rateSource, blNumber: record.blNumber ?? "", containerNumber: record.containerNumber ?? "", containerType: record.containerType ?? "", vesselName: record.vesselName ?? "", etd: record.etd ?? "", eta: record.eta ?? "", status: record.status });
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, milestone: form.status }); }}><label><span className={labelClass}>Payment Mode</span><select className={inputClass} value={form.paymentMode} onChange={(event) => change("paymentMode", event.target.value)}><option value="LC">LC</option><option value="TT">TT</option></select></label><label><span className={labelClass}>{form.paymentMode === "LC" ? "LC Number" : "TT Reference"}</span><input className={inputClass} value={form.paymentMode === "LC" ? form.lcNumber : form.ttReference} onChange={(event) => change(form.paymentMode === "LC" ? "lcNumber" : "ttReference", event.target.value)} required /></label><label><span className={labelClass}>Bank</span><input className={inputClass} value={form.bank} onChange={(event) => change("bank", event.target.value)} /></label><label><span className={labelClass}>Currency</span><select className={inputClass} value={form.currency} onChange={(event) => change("currency", event.target.value)}><option>USD</option><option>CNY</option><option>EUR</option></select></label><label><span className={labelClass}>Exchange Rate</span><input className={inputClass} type="number" min="0.0001" step="0.0001" value={form.exchangeRate} onChange={(event) => change("exchangeRate", event.target.value)} required /></label><label><span className={labelClass}>Rate Date</span><input className={inputClass} type="date" value={form.rateDate} onChange={(event) => change("rateDate", event.target.value)} required /></label><label><span className={labelClass}>Rate Source</span><input className={inputClass} value={form.rateSource} onChange={(event) => change("rateSource", event.target.value)} /></label><label><span className={labelClass}>Bill of Lading</span><input className={inputClass} value={form.blNumber} onChange={(event) => change("blNumber", event.target.value)} /></label><label><span className={labelClass}>Container Number</span><input className={inputClass} value={form.containerNumber} onChange={(event) => change("containerNumber", event.target.value)} /></label><label><span className={labelClass}>Container Type</span><select className={inputClass} value={form.containerType} onChange={(event) => change("containerType", event.target.value)}><option value="">Select</option><option>20 FT</option><option>40 FT</option><option>40 HQ</option><option>LCL</option></select></label><label><span className={labelClass}>Vessel</span><input className={inputClass} value={form.vesselName} onChange={(event) => change("vesselName", event.target.value)} /></label><label><span className={labelClass}>ETD</span><input className={inputClass} type="date" value={form.etd} onChange={(event) => change("etd", event.target.value)} /></label><label><span className={labelClass}>ETA</span><input className={inputClass} type="date" value={form.eta} onChange={(event) => change("eta", event.target.value)} /></label><label><span className={labelClass}>Milestone</span><select className={inputClass} value={form.status} onChange={(event) => change("status", event.target.value)}>{allStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="flex justify-end sm:col-span-2 lg:col-span-3"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Payment & Shipment</Button></div></form>;
}

function ItemEditor({ record, products, item, busy, onSubmit }: { record: ImportCase; products: Product[]; item?: ImportItem; busy: boolean; onSubmit: (payload: Omit<ImportItem, "id">) => void }) {
  const [form, setForm] = useState({ productId: item?.productId ?? "", quantity: item?.quantity ?? "", fobUnitForeign: item?.fobUnitForeign ?? "", exchangeRate: item?.exchangeRate ?? record.exchangeRate, cartonCount: item?.cartonCount ?? "", cbmPerCarton: item?.cbmPerCarton ?? "", grossWeight: item?.grossWeight ?? "", netWeight: item?.netWeight ?? "" });
  const product = products.find((entry) => entry.id === form.productId);
  const fob = Number(form.quantity || 0) * Number(form.fobUnitForeign || 0) * Number(form.exchangeRate || 0);
  const cbm = Number(form.cartonCount || 0) * Number(form.cbmPerCarton || 0);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!product) return; onSubmit({ productId: product.id, productCode: product.code, productName: product.name, quantity: form.quantity, unit: product.unit, currency: record.currency, fobUnitForeign: form.fobUnitForeign, exchangeRate: form.exchangeRate, fobTotalBdt: fob.toFixed(2), cbmPerCarton: form.cbmPerCarton || "0", cartonCount: form.cartonCount || "0", totalCbm: cbm.toFixed(4), grossWeight: form.grossWeight, netWeight: form.netWeight, hsCode: product.hsCode }); };
  return <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}><label className="sm:col-span-2"><span className={labelClass}>Canonical Product</span><select className={inputClass} value={form.productId} onChange={(event) => change("productId", event.target.value)} required><option value="">Select variant</option>{products.map((entry) => <option value={entry.id} key={entry.id}>{entry.code} · {entry.name}</option>)}</select></label><div className="row-span-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"><ProductThumb src={product?.imageUrl} name={product?.name ?? "Product"} size="lg" /><div className="min-w-0"><strong className="block truncate text-sm">{product?.name ?? "Choose a product"}</strong><small className="text-slate-500">{product?.family} {product?.variant}</small></div></div><label><span className={labelClass}>Quantity</span><input className={inputClass} type="number" min="1" step="1" value={form.quantity} onChange={(event) => change("quantity", event.target.value)} required /></label><label><span className={labelClass}>FOB / Unit ({record.currency})</span><input className={inputClass} type="number" min="0.0001" step="0.0001" value={form.fobUnitForeign} onChange={(event) => change("fobUnitForeign", event.target.value)} required /></label><label><span className={labelClass}>Exchange Rate</span><input className={inputClass} type="number" min="0.0001" step="0.0001" value={form.exchangeRate} onChange={(event) => change("exchangeRate", event.target.value)} required /></label><label><span className={labelClass}>Cartons</span><input className={inputClass} type="number" min="0" step="1" value={form.cartonCount} onChange={(event) => change("cartonCount", event.target.value)} required /></label><label><span className={labelClass}>CBM / Carton</span><input className={inputClass} type="number" min="0" step="0.0001" value={form.cbmPerCarton} onChange={(event) => change("cbmPerCarton", event.target.value)} required /></label><label><span className={labelClass}>Gross Weight</span><input className={inputClass} type="number" min="0" step="0.01" value={form.grossWeight} onChange={(event) => change("grossWeight", event.target.value)} /></label><label><span className={labelClass}>Net Weight</span><input className={inputClass} type="number" min="0" step="0.01" value={form.netWeight} onChange={(event) => change("netWeight", event.target.value)} /></label><div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 sm:col-span-2 lg:col-span-3"><span className="text-xs text-cyan-800">Calculated: <strong>{formatCurrency(fob)}</strong> FOB · <strong>{cbm.toFixed(4)} CBM</strong></span></div><div className="flex justify-end sm:col-span-2 lg:col-span-3"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Product Line</Button></div></form>;
}

function CostEditor({ record, cost, busy, onSubmit }: { record: ImportCase; cost?: ImportCostLine; busy: boolean; onSubmit: (payload: Omit<ImportCostLine, "id" | "enteredBy" | "createdAt">) => void }) {
  const [form, setForm] = useState({ name: cost?.name ?? "", category: cost?.category ?? "Freight", amountForeign: cost?.amountForeign ?? "", currency: cost?.currency ?? "BDT", exchangeRate: cost?.exchangeRate ?? "1", allocationMethod: (cost?.allocationMethod ?? "") as AllocationMethod | "", scope: cost?.appliesToItemIds.length ? "SELECTED" : "ALL", selected: cost?.appliesToItemIds ?? [], vendor: cost?.vendor ?? "", paymentDate: cost?.paymentDate ?? "", accountId: cost?.accountId ?? "", notes: cost?.notes ?? "", attachmentName: cost?.attachmentName ?? "" });
  const initialManual = Object.fromEntries(record.items.map((item) => [item.id, cost?.manualSplits?.find((split) => split.importItemId === item.id)?.amountBdt ?? ""]));
  const [manual, setManual] = useState<Record<string, string>>(initialManual);
  const [error, setError] = useState("");
  const change = (key: keyof typeof form, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const eligibleIds = form.scope === "ALL" ? record.items.map((item) => item.id) : form.selected;
  const converted = form.currency === "BDT" ? Number(form.amountForeign || 0) : Number(form.amountForeign || 0) * Number(form.exchangeRate || 0);
  const manualTotal = eligibleIds.reduce((sum, id) => sum + Number(manual[id] || 0), 0);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.allocationMethod) return setError("Select an allocation method explicitly.");
    if (!eligibleIds.length) return setError("Select at least one product in scope.");
    if (form.allocationMethod === "PRODUCT_SPECIFIC" && eligibleIds.length !== 1) return setError("Product-specific allocation requires exactly one product.");
    if (form.allocationMethod === "MANUAL" && Math.abs(manualTotal - converted) > 0.005) return setError("Manual splits must equal the converted BDT amount exactly.");
    setError("");
    onSubmit({ name: form.name, category: form.category, amountForeign: form.amountForeign, currency: form.currency, exchangeRate: form.currency === "BDT" ? "1" : form.exchangeRate, amountBdt: converted.toFixed(2), allocationMethod: form.allocationMethod, appliesToItemIds: form.scope === "ALL" ? [] : form.selected, manualSplits: form.allocationMethod === "MANUAL" ? eligibleIds.map((id) => ({ importItemId: id, amountBdt: Number(manual[id] || 0).toFixed(2) })) : undefined, vendor: form.vendor, paymentDate: form.paymentDate, accountId: form.accountId, notes: form.notes, attachmentName: form.attachmentName });
  };
  return <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={submit}>{error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 md:col-span-2 xl:col-span-3">{error}</div> : null}<label><span className={labelClass}>Cost Name</span><input className={inputClass} value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="e.g. Ocean Freight" required /></label><label><span className={labelClass}>Category</span><select className={inputClass} value={form.category} onChange={(event) => change("category", event.target.value)}>{["Freight", "Customs Duty", "Bank Charge", "Insurance", "Port / C&F", "Local Transport", "Labour", "Other Import Cost"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className={labelClass}>Allocation Method</span><select className={inputClass} value={form.allocationMethod} onChange={(event) => change("allocationMethod", event.target.value)} required><option value="">Choose explicitly</option><option value="CBM">CBM</option><option value="FOB_VALUE">FOB Value</option><option value="QUANTITY">Quantity</option><option value="PRODUCT_SPECIFIC">Product-specific</option><option value="MANUAL">Manual split</option></select></label><label><span className={labelClass}>Amount</span><input className={inputClass} type="number" min="0.01" step="0.01" value={form.amountForeign} onChange={(event) => change("amountForeign", event.target.value)} required /></label><label><span className={labelClass}>Currency</span><select className={inputClass} value={form.currency} onChange={(event) => change("currency", event.target.value)}><option>BDT</option><option>USD</option><option>CNY</option><option>EUR</option></select></label><label><span className={labelClass}>Exchange Rate Snapshot</span><input className={inputClass} type="number" min="0.0001" step="0.0001" value={form.currency === "BDT" ? "1" : form.exchangeRate} onChange={(event) => change("exchangeRate", event.target.value)} disabled={form.currency === "BDT"} required /></label><div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 md:col-span-2 xl:col-span-3"><span className="text-xs text-cyan-800">Converted amount: <strong>{formatCurrency(converted)}</strong>. Final allocations reconcile to this amount to the poisha.</span></div><fieldset className="rounded-md border border-slate-200 p-3 md:col-span-2 xl:col-span-3"><legend className="px-1 text-xs font-bold uppercase text-slate-500">Product Scope</legend><div className="flex flex-wrap gap-4"><label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name="scope" checked={form.scope === "ALL"} onChange={() => change("scope", "ALL")} /> All products</label><label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name="scope" checked={form.scope === "SELECTED"} onChange={() => change("scope", "SELECTED")} /> Selected products</label></div>{form.scope === "SELECTED" ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{record.items.map((item) => <label className="flex items-center gap-2 rounded bg-slate-50 p-2 text-sm" key={item.id}><input type="checkbox" checked={form.selected.includes(item.id)} onChange={(event) => change("selected", event.target.checked ? [...form.selected, item.id] : form.selected.filter((id) => id !== item.id))} /> {item.productCode} · {item.productName}</label>)}</div> : null}</fieldset>{form.allocationMethod === "MANUAL" ? <fieldset className="rounded-md border border-amber-200 bg-amber-50 p-3 md:col-span-2 xl:col-span-3"><legend className="px-1 text-xs font-bold uppercase text-amber-800">Manual BDT Split</legend><div className="grid gap-3 sm:grid-cols-2">{record.items.filter((item) => eligibleIds.includes(item.id)).map((item) => <label key={item.id}><span className={labelClass}>{item.productCode} · {item.productName}</span><input className={inputClass} type="number" min="0" step="0.01" value={manual[item.id] ?? ""} onChange={(event) => setManual((current) => ({ ...current, [item.id]: event.target.value }))} /></label>)}</div><p className="mt-2 text-xs font-semibold text-amber-800">Split total {formatCurrency(manualTotal)} / required {formatCurrency(converted)}</p></fieldset> : null}<label><span className={labelClass}>Vendor</span><input className={inputClass} value={form.vendor} onChange={(event) => change("vendor", event.target.value)} /></label><label><span className={labelClass}>Payment Date</span><input className={inputClass} type="date" value={form.paymentDate} onChange={(event) => change("paymentDate", event.target.value)} /></label><label><span className={labelClass}>Payment Account / Ref</span><input className={inputClass} value={form.accountId} onChange={(event) => change("accountId", event.target.value)} /></label><label><span className={labelClass}>Attachment</span><input className={inputClass + " pt-2"} type="file" onChange={(event) => change("attachmentName", event.target.files?.[0]?.name ?? "")} /></label><label className="md:col-span-2"><span className={labelClass}>Notes</span><textarea className={textareaClass} value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label><div className="flex justify-end md:col-span-2 xl:col-span-3"><Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={busy}>Save Cost Row</Button></div></form>;
}

function DocumentEditor({ busy, onSubmit }: { busy: boolean; onSubmit: (payload: { type: string; name: string }) => void }) {
  const [type, setType] = useState("PI");
  const [name, setName] = useState("");
  return <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ type, name }); }}><label><span className={labelClass}>Document Type</span><select className={inputClass} value={type} onChange={(event) => setType(event.target.value)}>{["PI", "PO", "LC", "TT Advice", "Bill of Lading", "Packing List", "Commercial Invoice", "Customs Assessment", "Insurance", "Other"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className={labelClass}>Select File</span><input className={inputClass + " pt-2"} type="file" required onChange={(event) => setName(event.target.files?.[0]?.name ?? "")} /></label><p className="text-xs leading-5 text-slate-500">Prototype behavior: file name and metadata are retained temporarily. The file service interface is ready for object storage integration.</p><div className="flex justify-end"><Button type="submit" variant="primary" icon={<Upload className="h-4 w-4" />} disabled={busy || !name}>Attach Document</Button></div></form>;
}

function ReceiptEditor({ record, receipts, busy, onSubmit }: { record: ImportCase; receipts: WarehouseReceipt[]; busy: boolean; onSubmit: (payload: Omit<WarehouseReceipt, "id" | "importId" | "reference" | "status" | "receivedBy">) => void }) {
  const processed = useMemo(() => Object.fromEntries(record.items.map((item) => [item.id, receipts.flatMap((receipt) => receipt.lines).filter((line) => line.importItemId === item.id).reduce((sum, line) => sum + Number(line.quantityReceived) + Number(line.quantityRejected), 0)])), [record.items, receipts]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState(() => Object.fromEntries(record.items.map((item) => [item.id, { received: "", rejected: "0", lot: "", batch: "", manufacturing: "", expiry: "", warehouse: "MIPRO Main Warehouse", location: "" }])));
  const update = (id: string, key: string, value: string) => setRows((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const lines = record.items.flatMap((item) => {
      const row = rows[item.id];
      if (Number(row.received || 0) + Number(row.rejected || 0) <= 0) return [];
      return [{ importItemId: item.id, productId: item.productId, productName: item.productName, quantityReceived: row.received || "0", quantityRejected: row.rejected || "0", lotNumber: row.lot || "REJECTED", batchNumber: row.batch || "REJECTED", manufacturingDate: row.manufacturing, expiryDate: row.expiry, warehouse: row.warehouse, location: row.location, landedCostPerUnit: "0.00" }];
    });
    if (!lines.length) return;
    onSubmit({ receivedDate: date, lines });
  };
  return <form className="grid gap-4" onSubmit={submit}><label className="max-w-xs"><span className={labelClass}>Receiving Date</span><input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><div className="grid gap-3">{record.items.map((item) => { const row = rows[item.id]; const remaining = Math.max(0, Number(item.quantity) - Number(processed[item.id] ?? 0)); return <fieldset className="rounded-md border border-slate-200 p-3" key={item.id} disabled={remaining <= 0}><legend className="px-1 text-sm font-bold text-slate-900">{item.productCode} · {item.productName} <span className="font-normal text-slate-500">({formatNumber(remaining)} remaining)</span></legend><div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label><span className={labelClass}>Received Qty</span><input className={inputClass} type="number" min="0" max={remaining} step="1" value={row.received} onChange={(event) => update(item.id, "received", event.target.value)} /></label><label><span className={labelClass}>Rejected Qty</span><input className={inputClass} type="number" min="0" max={remaining} step="1" value={row.rejected} onChange={(event) => update(item.id, "rejected", event.target.value)} /></label><label><span className={labelClass}>Lot Number</span><input className={inputClass} value={row.lot} onChange={(event) => update(item.id, "lot", event.target.value)} required={Number(row.received) > 0} /></label><label><span className={labelClass}>Batch Number</span><input className={inputClass} value={row.batch} onChange={(event) => update(item.id, "batch", event.target.value)} required={Number(row.received) > 0} /></label><label><span className={labelClass}>Manufacturing Date</span><input className={inputClass} type="date" value={row.manufacturing} onChange={(event) => update(item.id, "manufacturing", event.target.value)} required={Number(row.received) + Number(row.rejected) > 0} /></label><label><span className={labelClass}>Expiry Date</span><input className={inputClass} type="date" value={row.expiry} onChange={(event) => update(item.id, "expiry", event.target.value)} required={Number(row.received) + Number(row.rejected) > 0} /></label><label><span className={labelClass}>Warehouse</span><input className={inputClass} value={row.warehouse} onChange={(event) => update(item.id, "warehouse", event.target.value)} required /></label><label><span className={labelClass}>Rack / Location</span><input className={inputClass} value={row.location} onChange={(event) => update(item.id, "location", event.target.value)} required={Number(row.received) > 0} /></label></div></fieldset>; })}</div><div className="flex justify-end"><Button type="submit" variant="primary" icon={<Warehouse className="h-4 w-4" />} disabled={busy}>Post Warehouse Receipt</Button></div></form>;
}

function ReopenModal({ busy, onClose, onSubmit }: { busy: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return <Modal open title="Reopen finalized landed cost" subtitle="The immutable snapshot stays in history. State why a correction is required." onClose={onClose}><form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit(reason); }}><label><span className={labelClass}>Required Reason</span><textarea className={textareaClass} minLength={10} required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Describe the source document or amount that must be corrected" /></label><div className="flex justify-end"><Button type="submit" variant="primary" icon={<RotateCcw className="h-4 w-4" />} disabled={busy || reason.trim().length < 10}>Reopen for Correction</Button></div></form></Modal>;
}
