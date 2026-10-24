import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { apiRequest } from "../../lib/api/client";
import { useAuthStore } from "../../lib/auth/session";
import Button from "../../components/ui/Button";
import Toasts from "../../components/ui/Toasts";
import PageHeader from "../../components/ui/PageHeader";
import { canAccessEmployeeHub, hasEffectivePermission } from "../../lib/permissions/effectiveAccess";

export default function BackendWorkspace() {
  const user = useAuthStore((state) => state.session?.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const status = useQuery({ queryKey: ["backend-foundation-status"], queryFn: async () => (await apiRequest<{ phase: string; authentication: string; database: string; privateStorage: string; businessMigration: string }>("/api/system/status")).data });
  return <div className="backend-workspace min-h-screen bg-[#eaf1f7] text-slate-900">
    <Toasts />
    <header className="app-header border-b border-blue-200 border-t-2 border-t-red-600 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/backend" className="mr-auto"><img src="/mipro-logo.png" alt="MIPRO HealthCare" className="h-10 w-36 object-contain" /></Link>
        <span className="text-sm font-semibold">{user?.name}</span>
        <span className="text-xs text-slate-600">{user?.role}</span>
        <Button icon={<LogOut className="h-4 w-4" />} onClick={() => { logout(); navigate("/login"); }}>Sign out</Button>
      </div>
    </header>
    <div className="backend-content-shell mx-auto max-w-[1440px] px-4 py-5">
      <nav className="mb-5 flex flex-wrap gap-x-5 gap-y-3 border-b border-blue-200 pb-3 text-sm font-semibold" aria-label="Backend workspace">
        <Link to="/backend">Overview</Link>
        {hasEffectivePermission(user, "import") ? <Link to="/backend/imports">Imports</Link> : null}
        {hasEffectivePermission(user, "inventory") ? <Link to="/backend/inventory">Inventory</Link> : null}
        {hasEffectivePermission(user, "sales") || hasEffectivePermission(user, "marketing") ? <Link to="/backend/sales">Sales & Marketing</Link> : null}
        {canAccessEmployeeHub(user) ? <Link to="/backend/employees">Employees</Link> : null}
        {hasEffectivePermission(user, "accounts") ? <Link to="/backend/accounts">Expenses & Accounts</Link> : null}
        {hasEffectivePermission(user, "reports") ? <Link to="/backend/reports">Reports</Link> : null}
        {["products", "suppliers", "settings", "accounts"].some((area) => hasEffectivePermission(user, area as "products" | "suppliers" | "settings" | "accounts")) ? <Link to="/backend/settings">Settings</Link> : null}
        <Link to="/backend/profile">Profile & Security</Link>
      </nav>
      {location.pathname === "/backend" ? <>
        <PageHeader eyebrow="Development" title="Operations Workspace" subtitle={user?.email ?? ""} />
        {status.isError ? <p role="alert" className="mt-4 text-red-700">{status.error.message}</p> : null}
        <dl className="mt-5 divide-y divide-blue-100 border-y border-blue-200 bg-white px-4">
          {Object.entries(status.data ?? { phase: "Loading..." }).map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-3 py-4 text-sm"><dt className="font-semibold">{{ phase: "Release stage", authentication: "Authentication", database: "PostgreSQL", privateStorage: "Private Storage", businessMigration: "Business data migration" }[key] ?? key}</dt><dd className={value === "Pending" ? "text-amber-700" : "text-emerald-700"}>{value}</dd></div>)}
        </dl>
      </> : <main className="min-w-0 space-y-5"><Outlet /></main>}
    </div>
  </div>;
}
