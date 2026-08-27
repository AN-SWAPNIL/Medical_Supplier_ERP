import { useQuery } from "@tanstack/react-query";
import { Printer, Stamp } from "lucide-react";
import { createPortal } from "react-dom";
import { useState, type ReactNode } from "react";
import Button from "../../components/ui/Button";
import { Segmented } from "../components";
import type { PrintConfiguration, PrintIdentity } from "../erp.types";
import { printService } from "../services";

export type LetterheadMode = "digital" | "preprinted";

export const letterheadModeOptions = [
  { value: "digital" as const, label: "With Background" },
  { value: "preprinted" as const, label: "Without Background" }
];

export function useLetterheadPrint() {
  const configurationQuery = useQuery({ queryKey: ["print", "configuration"], queryFn: printService.configuration });
  const [mode, setMode] = useState<LetterheadMode | "">("");
  const [identityId, setIdentityId] = useState("");
  const configuration = configurationQuery.data;
  const effectiveMode: LetterheadMode = mode || (configuration?.defaultLetterheadMode === "Preprinted" ? "preprinted" : "digital");
  const identity = configuration?.identities.find((entry) => entry.id === (identityId || configuration.defaultIdentityId)) ?? configuration?.identities[0];

  return {
    configurationQuery,
    configuration,
    identity,
    identityId,
    setIdentityId,
    mode: effectiveMode,
    setMode
  };
}

export type LetterheadPrintController = ReturnType<typeof useLetterheadPrint>;

export function LetterheadPrintControls({ controller, title = "Print setup", className = "" }: { controller: LetterheadPrintController; title?: string; className?: string }) {
  const { configurationQuery, configuration, identity, setIdentityId, mode, setMode } = controller;
  return (
    <section className={`no-print grid min-w-0 gap-3 rounded-md border border-blue-200 bg-blue-50/60 p-3 shadow-sm lg:grid-cols-[minmax(210px,1fr)_minmax(190px,.7fr)_minmax(300px,1fr)_auto] lg:items-end ${className}`} data-testid="letterhead-print-controls">
      <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-blue-950 text-cyan-300"><Printer className="h-5 w-5" /></span><div className="min-w-0"><strong className="block text-sm text-blue-950">{title}</strong><p className="text-xs leading-5 text-slate-600">Use the background for PDF, or omit it when printing on company letterhead.</p></div></div>
      <label className="min-w-0"><span className="mb-1 block text-xs font-bold uppercase text-blue-900">Company Identity</span><span className="relative block"><Stamp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-700" /><select aria-label="Print identity" className="h-10 w-full rounded-md border border-blue-200 bg-white pl-9 pr-3 text-sm text-blue-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" disabled={!configuration || configurationQuery.isError} value={identity?.id ?? ""} onChange={(event) => setIdentityId(event.target.value)}>{configuration?.identities.map((entry) => <option value={entry.id} key={entry.id}>{entry.displayName}</option>)}</select></span></label>
      <div className="min-w-0"><span className="mb-1 block text-xs font-bold uppercase text-blue-900">Letterhead Artwork</span><Segmented value={mode} onChange={setMode} ariaLabel="Letterhead artwork" options={letterheadModeOptions} /></div>
      <Button className="w-full lg:w-auto" variant="primary" icon={<Printer className="h-4 w-4" />} disabled={!identity || configurationQuery.isLoading || configurationQuery.isError} onClick={() => window.print()}>Print / Save PDF</Button>
      {configurationQuery.isError ? <p className="text-xs font-semibold text-red-700 lg:col-span-4">Print configuration could not be loaded. Refresh before printing.</p> : null}
    </section>
  );
}

export function LetterheadSheet({ identity, mode, title, subtitle, reference, date, children, className = "", multiPage = false, repeatFooter = false }: {
  identity: PrintIdentity;
  mode: LetterheadMode;
  title: string;
  subtitle?: string;
  reference: string;
  date: string;
  children: ReactNode;
  className?: string;
  multiPage?: boolean;
  repeatFooter?: boolean;
}) {
  const digital = mode === "digital";
  return (
    <article
      className={`letterhead-sheet relative mx-auto overflow-hidden bg-white text-slate-950 ${className}`}
      data-letterhead-mode={mode}
      data-print-identity={identity.id}
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundImage: digital ? `url(${identity.backgroundImageUrl})` : "none",
        backgroundPosition: "top left",
        backgroundRepeat: digital && multiPage ? "repeat-y" : "no-repeat",
        backgroundSize: "210mm 297mm"
      }}
    >
      {digital && repeatFooter ? <div aria-hidden className="report-letterhead-fixed-footer" style={{ height: `${identity.safeArea.bottomMm}mm`, backgroundImage: `url(${identity.backgroundImageUrl})` }} /> : null}
      <div style={{ paddingTop: `${identity.safeArea.topMm}mm`, paddingRight: `${identity.safeArea.rightMm}mm`, paddingBottom: `${identity.safeArea.bottomMm}mm`, paddingLeft: `${identity.safeArea.leftMm}mm` }}>
        {!digital ? <div className="no-print absolute left-2 top-2 border border-dashed border-cyan-400 bg-cyan-50 p-2 text-[9px] text-cyan-900">Preprinted {identity.displayName}: background artwork omitted.</div> : null}
        <header className="flex items-start justify-between gap-8 border-b border-blue-900 pb-3">
          <div><h1 className="text-[18px] font-black text-blue-950">{title}</h1>{subtitle ? <p className="mt-1 max-w-[120mm] text-[9px] leading-4 text-slate-600">{subtitle}</p> : null}<div className="mt-2 h-1 w-14 bg-cyan-500" /></div>
          <dl className="grid shrink-0 gap-1 text-right text-[9px]"><div><dt className="inline text-slate-500">Reference: </dt><dd className="inline font-bold">{reference}</dd></div><div><dt className="inline text-slate-500">Date: </dt><dd className="inline font-bold">{date}</dd></div></dl>
        </header>
        <div className="mt-5">{children}</div>
      </div>
    </article>
  );
}

export function LetterheadReportPortal(props: Parameters<typeof LetterheadSheet>[0]) {
  if (typeof document === "undefined") return null;
  return createPortal(<div className="report-print-portal"><style>{"@page report-letterhead { size: A4; margin: 0; }"}</style><LetterheadSheet {...props} repeatFooter className={`report-letterhead-sheet ${props.className ?? ""}`} /></div>, document.body);
}

export function printModeFromConfiguration(configuration: PrintConfiguration, mode: LetterheadMode | "") {
  return mode || (configuration.defaultLetterheadMode === "Digital" ? "digital" : "preprinted");
}
