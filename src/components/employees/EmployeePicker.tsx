import { Check, ChevronDown, Search, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SalespersonEmployee } from "../../domains/erp.types";

type Props = {
  employees: SalespersonEmployee[];
  value: string;
  onChange: (value: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  disabled?: boolean;
  label?: string;
};

export default function EmployeePicker({ employees, value, onChange, allowAll = true, allLabel = "All Sales Employees", disabled, label = "Employee" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = employees.find((employee) => employee.id === value);
  const options = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = employees.filter((employee) => !term || [employee.name, employee.employeeCode ?? employee.id, employee.territory ?? ""].some((entry) => entry.toLowerCase().includes(term)));
    return allowAll ? [{ id: "all", name: allLabel, title: "Team comparison", territory: "All territories", employeeCode: "ALL" }, ...rows] : rows;
  }, [allowAll, allLabel, employees, query]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, options.findIndex((option) => option.id === value)));
      requestAnimationFrame(() => inputRef.current?.focus());
    } else setQuery("");
  }, [open, options, value]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef} data-testid="employee-picker">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <button className="flex min-h-11 w-full items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-left shadow-sm transition hover:border-cyan-500 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100" type="button" onClick={() => setOpen((current) => !current)} disabled={disabled} aria-haspopup="listbox" aria-expanded={open}>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-cyan-50 text-cyan-800">{value === "all" ? <Users className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}</span>
        <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{selected?.name ?? (value === "all" ? allLabel : "Choose employee")}</strong><small className="block truncate text-slate-500">{selected ? `${selected.employeeCode ?? selected.id} · ${selected.territory ?? selected.title}` : value === "all" ? "Compare the permitted team" : "Search name, ID or territory"}</small></span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full min-w-[280px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
          <div className="relative border-b border-slate-200 p-2"><Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input ref={inputRef} className="h-10 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-600" placeholder="Search name / ID / territory" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(options.length - 1, index + 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); }
            if (event.key === "Enter" && options[activeIndex]) { event.preventDefault(); choose(options[activeIndex].id); }
            if (event.key === "Escape") setOpen(false);
          }} /></div>
          <div className="max-h-72 overflow-y-auto p-1" role="listbox" aria-label={label}>
            {options.map((employee, index) => <button className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left ${index === activeIndex ? "bg-cyan-50" : "hover:bg-slate-50"}`} type="button" role="option" aria-selected={value === employee.id} key={employee.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(employee.id)}><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-slate-100 text-slate-600">{employee.id === "all" ? <Users className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{employee.name}</strong><small className="block truncate text-slate-500">{employee.employeeCode ?? employee.id} · {employee.territory ?? employee.title}</small></span>{value === employee.id ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : null}</button>)}
            {!options.length ? <p className="px-3 py-8 text-center text-sm text-slate-500">No permitted employee matches this search.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
