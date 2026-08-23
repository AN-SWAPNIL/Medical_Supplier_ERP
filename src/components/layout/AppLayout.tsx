import clsx from "clsx";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import Toasts from "../ui/Toasts";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { hasPermission, navSections } from "../../lib/permissions/matrix";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const role = useEffectiveRole();
  const navigate = useNavigate();

  const visibleItems = useMemo(
    () => navSections.flatMap((section) => section.items).filter((item) => item.roles.includes(role) && hasPermission(role, item.permission)),
    [role]
  );

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const side = (
    <aside className={clsx("flex h-full flex-col border-r border-slate-200 bg-white transition-[width]", collapsed ? "w-[72px]" : "w-[248px]")}>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-3">
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-red-700 text-white shadow-sm"
          type="button"
          onClick={() => navigate("/app/dashboard")}
          aria-label="Open dashboard"
        >
          <ShieldCheck className="h-5 w-5" />
        </button>
        {!collapsed ? (
          <div className="min-w-0 leading-tight">
            <strong className="block truncate text-[15px] text-slate-950">Mipro ERP</strong>
            <span className="block truncate text-[11px] text-slate-500">Medical supply operations</span>
          </div>
        ) : null}
        <button
          className="ml-auto hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:block"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary navigation">
        <p className={clsx("mb-2 px-2 text-[10px] font-bold uppercase text-slate-400", collapsed && "sr-only")}>Workspace</p>
        <div className="grid gap-1">
          {visibleItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "flex h-10 items-center gap-3 rounded-md border-l-2 px-3 text-sm font-semibold transition",
                  isActive
                    ? "border-red-700 bg-red-50 text-red-800"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                )
              }
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-2">
        <div className={clsx("rounded-md bg-slate-50 p-2", collapsed ? "text-center" : "flex items-center gap-2")}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-slate-900 text-[10px] font-bold text-white">MH</span>
          {!collapsed ? (
            <div className="min-w-0">
              <strong className="block truncate text-xs text-slate-800">Mipro HealthCare</strong>
              <span className="block truncate text-[10px] text-slate-500">Single company · Main warehouse</span>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Toasts />
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{side}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/45" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <div className="absolute inset-y-0 left-0">{side}</div>
          <button className="absolute right-4 top-4 rounded-md bg-white p-2 text-slate-700 shadow" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className={clsx("min-h-screen transition-[padding]", collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5">
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden min-w-0 flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-full max-w-lg rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                placeholder="Search LC, product, customer or challan"
                aria-label="Global search"
              />
            </div>
            <span className="ml-auto hidden rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 sm:inline-flex md:ml-0">{role}</span>
            <button className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100" type="button" aria-label="Notifications" title="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />
            </button>
            <div className="relative">
              <button
                className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-1.5 pr-2 text-left hover:bg-slate-50"
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
              >
                <Avatar className="h-7 w-7 rounded object-cover" src={session?.user.avatarUrl} name={session?.user.name ?? "User"} />
                <span className="hidden min-w-0 leading-tight xl:block">
                  <strong className="block max-w-32 truncate text-xs text-slate-950">{session?.user.name}</strong>
                  <small className="block max-w-32 truncate text-[10px] text-slate-500">{session?.user.title}</small>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="border-b border-slate-100 px-2 py-2 text-xs text-slate-500">Signed in as <strong className="block truncate text-slate-900">{session?.user.email}</strong></div>
                  <button className="mt-1 flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => { setProfileOpen(false); navigate("/app/profile"); }}>
                    <UserRound className="h-4 w-4" /> Profile & settings
                  </button>
                  <button className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" type="button" onClick={signOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
            <Button className="hidden sm:inline-flex" variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={signOut} aria-label="Sign out" title="Sign out" />
          </div>
        </header>
        <main className="mx-auto grid w-full min-w-0 max-w-[1680px] grid-cols-[minmax(0,1fr)] gap-4 p-3 sm:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
