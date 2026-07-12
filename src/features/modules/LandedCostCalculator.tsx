import { useMutation } from "@tanstack/react-query";
import { Calculator, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api/client";
import { useToastStore } from "../../lib/ui/toast";
import { formatCurrency } from "../../utils/format";
import type { EntityRecord } from "../../types";

const fields = [
  ["quantity", "Quantity", 100],
  ["productImportValue", "Product Import Value", 39360],
  ["freight", "Freight", 723],
  ["insurance", "Insurance", 140],
  ["duty", "Duty", 4970],
  ["vat", "VAT", 0],
  ["ait", "AIT", 0],
  ["portCharges", "Port Charges", 0],
  ["cfCharges", "C&F Charges", 238],
  ["transportCharges", "Transport", 100],
  ["otherApprovedExpenses", "Other Approved Expenses", 0]
] as const;

export default function LandedCostCalculator() {
  const pushToast = useToastStore((state) => state.push);
  const [values, setValues] = useState<EntityRecord>(() =>
    Object.fromEntries(fields.map(([key, , value]) => [key, value])) as EntityRecord
  );
  const mutation = useMutation({
    mutationFn: async () => (await apiClient.landedCostPreview(values)).data,
    onSuccess: () => pushToast({ kind: "success", title: "Landed cost preview calculated" }),
    onError: (error) => pushToast({ kind: "error", title: "Calculation failed", message: error.message })
  });
  const result = mutation.data;

  return (
    <section className="grid gap-4 rounded-xl border border-teal-200 bg-white p-5 shadow-sm xl:grid-cols-[1.25fr_0.75fr]">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-700 text-white">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Calculator</p>
            <h2 className="text-lg font-bold text-slate-950">Landed Cost Preview</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {fields.map(([key, label]) => (
            <label className="grid gap-1" key={key}>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
              <input
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                type="number"
                value={Number(values[key] ?? 0)}
                onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))}
              />
            </label>
          ))}
        </div>
        <Button className="mt-4" variant="primary" icon={<Calculator className="h-4 w-4" />} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Calculate Preview
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-teal-700" />
          <h3 className="font-bold text-slate-950">Formula Result</h3>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Landed Cost</p>
            <strong className="mt-1 block text-2xl text-slate-950">{formatCurrency(Number(result?.totalLandedCost ?? 0))}</strong>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Per Unit Landed Cost</p>
            <strong className="mt-1 block text-2xl text-teal-800">{formatCurrency(Number(result?.perUnitLandedCost ?? 0))}</strong>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {String(result?.formula ?? "Product Import Value + Freight + Insurance + Duty + VAT + AIT + Port + C&F + Transport + Other Approved Expenses")}
          </p>
        </div>
      </div>
    </section>
  );
}
