import type { ReactNode } from "react";
import { useEffectiveRole } from "../../lib/auth/session";
import { hasPermission } from "../../lib/permissions/matrix";
import type { PermissionAction, PermissionKey } from "../../types";

type PermissionGateProps = {
  permission: PermissionKey;
  action?: PermissionAction;
  fallback?: ReactNode;
  children: ReactNode;
};

export default function PermissionGate({ permission, action = "view", fallback = null, children }: PermissionGateProps) {
  const role = useEffectiveRole();
  return hasPermission(role, permission, action) ? <>{children}</> : <>{fallback}</>;
}
