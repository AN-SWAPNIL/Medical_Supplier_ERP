import assert from "node:assert/strict";
import test from "node:test";
import type { User } from "../../types/index.js";
import { canAssignRole, canGrantCapability, canManageTargetUser, hasEffectivePermission, normalizePermissionOverrides } from "./effectiveAccess.js";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "test-user",
    name: "Test User",
    email: "test@mipro.local",
    role: "Import Officer",
    title: "Officer",
    department: "Import",
    phone: "",
    avatarUrl: "",
    status: "Active",
    capabilities: [],
    permissionOverrides: [],
    ...overrides
  };
}

test("role defaults are used when no override exists", () => {
  const officer = user();
  assert.equal(hasEffectivePermission(officer, "import", "view"), true);
  assert.equal(hasEffectivePermission(officer, "reports", "view"), false);
});

test("Managing Director can open the connected Sales customer view", () => {
  const director = user({ role: "Managing Director" });
  assert.equal(hasEffectivePermission(director, "sales", "view"), true);
  assert.equal(hasEffectivePermission(director, "customers", "view"), true);
});

test("marketing role defaults separate employee work, management review and export", () => {
  const executive = user({ role: "Sales Executive" });
  const manager = user({ role: "Sales Manager" });
  const director = user({ role: "Managing Director" });
  const accounts = user({ role: "Accounts" });
  assert.equal(hasEffectivePermission(executive, "marketing", "create"), true);
  assert.equal(hasEffectivePermission(executive, "marketing", "export"), false);
  assert.equal(hasEffectivePermission(manager, "marketing", "approve"), true);
  assert.equal(hasEffectivePermission(manager, "marketing", "export"), true);
  assert.equal(hasEffectivePermission(director, "marketing", "view"), true);
  assert.equal(hasEffectivePermission(director, "marketing", "create"), false);
  assert.equal(hasEffectivePermission(accounts, "marketing", "view"), false);
});

test("ALLOW adds access and DENY removes role-default access", () => {
  const officer = user({ permissionOverrides: [{ permission: "reports", action: "view", effect: "ALLOW" }] });
  const manager = user({ role: "Sales Manager", permissionOverrides: [{ permission: "reports", action: "export", effect: "DENY" }] });
  assert.equal(hasEffectivePermission(officer, "reports", "view"), true);
  assert.equal(hasEffectivePermission(manager, "reports", "view"), true);
  assert.equal(hasEffectivePermission(manager, "reports", "export"), false);
});

test("DENY wins malformed duplicates and normalization is deterministic", () => {
  const duplicate = [
    { permission: "reports", action: "view", effect: "ALLOW" as const },
    { permission: "reports", action: "view", effect: "DENY" as const }
  ];
  const normalized = normalizePermissionOverrides(duplicate);
  assert.deepEqual(normalized, [{ permission: "reports", action: "view", effect: "DENY" }]);
  assert.equal(hasEffectivePermission(user({ permissionOverrides: duplicate }), "reports", "view"), false);
});

test("inactive users never retain effective access", () => {
  assert.equal(hasEffectivePermission(user({ status: "Inactive" }), "import", "view"), false);
});

test("delegated employee managers can manage lower roles but not self or administrators", () => {
  const manager = user({ id: "manager", role: "Sales Manager", capabilities: ["manage_users"], permissionOverrides: [
    { permission: "users", action: "view", effect: "ALLOW" },
    { permission: "users", action: "create", effect: "ALLOW" },
    { permission: "users", action: "edit", effect: "ALLOW" }
  ] });
  assert.equal(canManageTargetUser(manager, user({ id: "employee", role: "Sales Executive" })), true);
  assert.equal(canManageTargetUser(manager, manager), false);
  assert.equal(canManageTargetUser(manager, user({ id: "owner", role: "Super Admin" })), false);
  assert.equal(canManageTargetUser(manager, user({ id: "peer", role: "Sales Manager" })), false);
});

test("access authority cannot be propagated by a non-Super-Admin", () => {
  const accessManager = user({ role: "Managing Director", capabilities: ["manage_user_access", "manage_users"] });
  assert.equal(canGrantCapability(accessManager, "manage_user_access"), false);
  assert.equal(canAssignRole(accessManager, "Super Admin"), false);
});
