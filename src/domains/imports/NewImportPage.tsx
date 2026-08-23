import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorBlock, LoadingBlock, Panel, ProductThumb, inputClass, labelClass, textareaClass } from "../components";
import { importService, settingsService } from "../services";
import type { PaymentMode } from "../erp.types";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency } from "../../utils/format";

export default function NewImportPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.push);
  const suppliersQuery = useQuery({ queryKey: ["suppliers"], queryFn: settingsService.suppliers });
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: settingsService.products });
  const [form, setForm] = useState({
    supplierId: "",
    poNumber: "",
    poDate: new Date().toISOString().slice(0, 10),
    piNumber: "",
    piDate: new Date().toISOString().slice(0, 10),
    paymentMode: "LC" as PaymentMode,
    currency: "USD",
    exchangeRate: "122.50",
    rateDate: new Date().toISOString().slice(0, 10),
    rateSource: "Bank quote",
    expectedShipmentDate: "",
    productId: "",
    quantity: "",
    fobUnitForeign: "",
    cartonCount: "",
    cbmPerCarton: "",
    notes: ""
  });

  const product = productsQuery.data?.find((entry) => entry.id === form.productId);
  const supplier = suppliersQuery.data?.find((entry) => entry.id === form.supplierId);
  const fobTotal = useMemo(() => Number(form.quantity || 0) * Number(form.fobUnitForeign || 0) * Number(form.exchangeRate || 0), [form.quantity, form.fobUnitForeign, form.exchangeRate]);
  const totalCbm = useMemo(() => Number(form.cartonCount || 0) * Number(form.cbmPerCarton || 0), [form.cartonCount, form.cbmPerCarton]);
  const mutation = useMutation({
    mutationFn: () => {
      if (!supplier || !product || Number(form.quantity) <= 0 || Number(form.fobUnitForeign) <= 0 || Number(form.exchangeRate) <= 0) {
        throw new Error("Select a supplier and product, then enter positive quantity, FOB and exchange-rate values.");
      }
      return importService.create({
        supplierId: supplier.id,
        supplierName: supplier.name,
        poNumber: form.poNumber,
        poDate: form.poDate,
        piNumber: form.piNumber,
        piDate: form.piDate,
        paymentMode: form.paymentMode,
        currency: form.currency,
        exchangeRate: form.exchangeRate,
        rateDate: form.rateDate,
        rateSource: form.rateSource,
        expectedShipmentDate: form.expectedShipmentDate,
        notes: form.notes,
        items: [{
          id: "new-item-" + Date.now(),
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          quantity: form.quantity,
          unit: product.unit,
          currency: form.currency,
          fobUnitForeign: form.fobUnitForeign,
          exchangeRate: form.exchangeRate,
          fobTotalBdt: fobTotal.toFixed(2),
          cbmPerCarton: form.cbmPerCarton || "0",
          cartonCount: form.cartonCount || "0",
          totalCbm: totalCbm.toFixed(4),
          hsCode: product.hsCode
        }]
      });
    },
    onSuccess: (record) => {
      pushToast({ kind: "success", title: "Import case created", message: record.draftReference + " is ready for continuation." });
      navigate("/app/imports/" + record.id);
    },
    onError: (error) => pushToast({ kind: "error", title: "Could not create import", message: error instanceof Error ? error.message : undefined })
  });

  if (suppliersQuery.isLoading || productsQuery.isLoading) return <LoadingBlock label="Loading supplier and product masters" />;
  if (suppliersQuery.isError || productsQuery.isError) return <ErrorBlock error={suppliersQuery.error ?? productsQuery.error} />;
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <>
      <PageHeader
        eyebrow="New import case"
        title="Start with PI and commercial data"
        subtitle="A draft IMP reference is generated now. The LC number will automatically become the primary visible reference after LC opening."
        actions={<Button icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/app/imports")}>Back</Button>}
      />
      <Panel title="Commercial header" subtitle="The record remains one consignment through every later stage.">
        <form className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <label className="xl:col-span-2"><span className={labelClass}>Supplier</span><select className={inputClass} required value={form.supplierId} onChange={(event) => change("supplierId", event.target.value)}><option value="">Select supplier</option>{suppliersQuery.data?.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · {entry.country}</option>)}</select></label>
          <label><span className={labelClass}>PO Number</span><input className={inputClass} required value={form.poNumber} onChange={(event) => change("poNumber", event.target.value)} placeholder="PO-2026-..." /></label>
          <label><span className={labelClass}>PO Date</span><input className={inputClass} type="date" required value={form.poDate} onChange={(event) => change("poDate", event.target.value)} /></label>
          <label><span className={labelClass}>PI Number</span><input className={inputClass} required value={form.piNumber} onChange={(event) => change("piNumber", event.target.value)} placeholder="Supplier PI reference" /></label>
          <label><span className={labelClass}>PI Date</span><input className={inputClass} type="date" required value={form.piDate} onChange={(event) => change("piDate", event.target.value)} /></label>
          <label><span className={labelClass}>Payment Mode</span><select className={inputClass} value={form.paymentMode} onChange={(event) => change("paymentMode", event.target.value)}><option value="LC">Letter of Credit (LC)</option><option value="TT">Telegraphic Transfer (TT)</option></select></label>
          <label><span className={labelClass}>Expected Shipment</span><input className={inputClass} type="date" value={form.expectedShipmentDate} onChange={(event) => change("expectedShipmentDate", event.target.value)} /></label>
          <label><span className={labelClass}>Currency</span><select className={inputClass} value={form.currency} onChange={(event) => change("currency", event.target.value)}><option>USD</option><option>CNY</option><option>EUR</option></select></label>
          <label><span className={labelClass}>Exchange Rate to BDT</span><input className={inputClass} type="number" min="0.0001" step="0.0001" required value={form.exchangeRate} onChange={(event) => change("exchangeRate", event.target.value)} /></label>
          <label><span className={labelClass}>Rate Date</span><input className={inputClass} type="date" required value={form.rateDate} onChange={(event) => change("rateDate", event.target.value)} /></label>
          <label><span className={labelClass}>Rate Source</span><input className={inputClass} required value={form.rateSource} onChange={(event) => change("rateSource", event.target.value)} /></label>

          <div className="border-t border-slate-200 pt-4 md:col-span-2 xl:col-span-4">
            <h3 className="text-sm font-bold text-slate-950">First product line</h3>
            <p className="mt-1 text-xs text-slate-500">Additional products can be added inside the case workspace.</p>
          </div>
          <label className="md:col-span-2"><span className={labelClass}>Canonical Product Variant</span><select className={inputClass} required value={form.productId} onChange={(event) => change("productId", event.target.value)}><option value="">Select product</option>{productsQuery.data?.map((entry) => <option key={entry.id} value={entry.id}>{entry.code} · {entry.name}</option>)}</select></label>
          <label><span className={labelClass}>Quantity</span><input className={inputClass} type="number" min="1" step="1" required value={form.quantity} onChange={(event) => change("quantity", event.target.value)} /></label>
          <label><span className={labelClass}>FOB per unit ({form.currency})</span><input className={inputClass} type="number" min="0.0001" step="0.0001" required value={form.fobUnitForeign} onChange={(event) => change("fobUnitForeign", event.target.value)} /></label>
          <label><span className={labelClass}>Cartons</span><input className={inputClass} type="number" min="0" step="1" value={form.cartonCount} onChange={(event) => change("cartonCount", event.target.value)} /></label>
          <label><span className={labelClass}>CBM per carton</span><input className={inputClass} type="number" min="0" step="0.0001" value={form.cbmPerCarton} onChange={(event) => change("cbmPerCarton", event.target.value)} /></label>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
            <ProductThumb src={product?.imageUrl} name={product?.name ?? "Product"} size="lg" />
            <div><span className="block text-xs text-slate-500">Calculated product value</span><strong className="text-lg text-slate-950">{formatCurrency(fobTotal)}</strong><small className="block text-slate-500">{totalCbm.toFixed(4)} total CBM</small></div>
          </div>
          <label className="md:col-span-2 xl:col-span-4"><span className={labelClass}>Notes</span><textarea className={textareaClass} value={form.notes} onChange={(event) => change("notes", event.target.value)} placeholder="Commercial notes, production instruction or follow-up" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 md:col-span-2 xl:col-span-4">
            <Button type="button" onClick={() => navigate("/app/imports")}>Cancel</Button>
            <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Import Case"}</Button>
          </div>
        </form>
      </Panel>
    </>
  );
}
