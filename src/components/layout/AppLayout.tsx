import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, Search, ShieldCheck, UserCircle2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import FloatingAIChat from "../ai/FloatingAIChat";
import Button from "../ui/Button";
import Toasts from "../ui/Toasts";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { demoCompanies, getStoredCompanyId, setStoredCompanyId } from "../../lib/company/scope";
import { hasPermission, navSections } from "../../lib/permissions/matrix";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyId, setCompanyId] = useState(getStoredCompanyId);
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const role = useEffectiveRole();
  const navigate = useNavigate();

  const visibleSections = useMemo(() => {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasPermission(role, item.permission, "view"))
      }))
      .filter((section) => section.items.length > 0);
  }, [role]);

  const side = (
    <aside
      className={clsx(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all",
        collapsed ? "w-[84px]" : "w-[288px]"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <button className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white" type="button" onClick={() => navigate("/app/dashboard")}>
          <ShieldCheck className="h-5 w-5" />
        </button>
        {!collapsed ? (
          <div className="min-w-0">
            <strong className="block truncate text-base text-slate-950">Mipro ERP</strong>
            <span className="block truncate text-xs text-slate-500">Medical import & distribution</span>
          </div>
        ) : null}
        <button className="ml-auto hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block" type="button" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleSections.map((section) => (
          <div className="mb-5" key={section.label}>
            {!collapsed ? <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{section.label}</p> : null}
            <div className="grid gap-1">
              {section.items.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    clsx(
                      "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                      isActive ? "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )
                  }
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4 flex-none" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="hidden h-24 shrink-0 lg:block" />
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Toasts />
      <FloatingAIChat />
      <div className="hidden fixed inset-y-0 left-0 z-30 lg:block">{side}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/40" type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0">{side}</div>
          <button className="absolute right-4 top-4 rounded-lg bg-white p-2 text-slate-700" type="button" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className={clsx("min-h-screen transition-all", collapsed ? "lg:pl-[84px]" : "lg:pl-[288px]")}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" type="button" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden min-w-0 flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                placeholder="Search products, customers, PO, invoice..."
              />
            </div>

            {["Super Admin", "Managing Director", "Accounts"].includes(role) ? (
              <select
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setStoredCompanyId(event.target.value);
                  queryClient.invalidateQueries();
                }}
                className="hidden h-10 max-w-56 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:block"
                aria-label="Company scope"
              >
                {demoCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            ) : null}

            <span className="hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 sm:inline-flex">{role}</span>
            <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" type="button" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left hover:bg-slate-50" type="button" onClick={() => navigate("/app/profile")}>
              <img className="h-8 w-8 rounded-full object-cover" src={session?.user.avatarUrl} alt={session?.user.name ?? "User"} />
              <span className="hidden leading-tight xl:block">
                <strong className="block max-w-32 truncate text-sm text-slate-950">{session?.user.name}</strong>
                <small className="block max-w-32 truncate text-xs text-slate-500">{session?.user.title}</small>
              </span>
              <UserCircle2 className="h-4 w-4 text-slate-400" />
            </button>
            <Button
              icon={<LogOut className="h-4 w-4" />}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="mx-auto grid w-full max-w-[1800px] gap-5 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
