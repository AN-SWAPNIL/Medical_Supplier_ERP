import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuthStore, useEffectiveRole } from "../../lib/auth/session";
import { hasPermission } from "../../lib/permissions/matrix";
import type { PermissionKey } from "../../types";

export function ProtectedRoute() {
  const session = useAuthStore((state) => state.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequirePermission({ permission, children }: { permission: PermissionKey; children: ReactNode }) {
  const role = useEffectiveRole();

  if (!hasPermission(role, permission, "view")) {
    return <AccessDenied permission={permission} />;
  }

  return <>{children}</>;
}

export function AccessDenied({ permission }: { permission?: PermissionKey }) {
  const navigate = useNavigate();
  const role = useEffectiveRole();

  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-rose-50 text-rose-700">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-950">Access denied</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {role} cannot view {permission ? permission.replace("-", " ") : "this module"} under the ERP permission plan.
        Sign in with an authorized demo user or use Super Admin view-as mode.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Button variant="primary" onClick={() => navigate("/app/dashboard")}>
          Go to dashboard
        </Button>
        <Button onClick={() => navigate("/login")}>Switch user</Button>
      </div>
    </div>
  );
}
