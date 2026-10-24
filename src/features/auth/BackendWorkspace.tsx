import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../lib/auth/session";
import Button from "../../components/ui/Button";
import Toasts from "../../components/ui/Toasts";
import { canAccessEmployeeHub, hasEffectivePermission } from "../../lib/permissions/effectiveAccess";

export default function BackendWorkspace() {
  const user = useAuthStore((state) => state.session?.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
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
        {hasEffectivePermission(user, "dashboard") ? <Link to="/backend">Dashboard</Link> : null}
        {hasEffectivePermission(user, "import") ? <Link to="/backend/imports">Imports</Link> : null}
        {hasEffectivePermission(user, "inventory") ? <Link to="/backend/inventory">Inventory</Link> : null}
        {hasEffectivePermission(user, "sales") || hasEffectivePermission(user, "marketing") ? <Link to="/backend/sales">Sales & Marketing</Link> : null}
        {canAccessEmployeeHub(user) ? <Link to="/backend/employees">Employees</Link> : null}
        {hasEffectivePermission(user, "accounts") ? <Link to="/backend/accounts">Expenses & Accounts</Link> : null}
        {hasEffectivePermission(user, "reports") ? <Link to="/backend/reports">Reports</Link> : null}
        {["products", "suppliers", "settings", "accounts"].some((area) => hasEffectivePermission(user, area as "products" | "suppliers" | "settings" | "accounts")) ? <Link to="/backend/settings">Settings</Link> : null}
        <Link to="/backend/profile">Profile & Security</Link>
      </nav>
      <main className="min-w-0 space-y-5"><Outlet /></main>
    </div>
  </div>;
}
