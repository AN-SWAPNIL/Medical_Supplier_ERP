import {
  AlertOutlined,
  AuditOutlined,
  AppstoreAddOutlined,
  BankOutlined,
  BarChartOutlined,
  DashboardOutlined,
  InboxOutlined,
  MedicineBoxOutlined,
  PoweroffOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Badge, Button, Card, Dropdown, Layout, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext, useAuth, type AuthUser } from "./context/AuthContext";
import { RoleContext, useRole } from "./context/RoleContext";
import AccountsPage from "./features/AccountsPage";
import AdminOpsPage from "./features/AdminOpsPage";
import DashboardPage from "./features/DashboardPage";
import HomePage from "./features/HomePage";
import HrSecurityPage from "./features/HrSecurityPage";
import ImportPage from "./features/ImportPage";
import InventoryPage from "./features/InventoryPage";
import ProductCatalogPage from "./features/ProductCatalogPage";
import ProfilePage from "./features/ProfilePage";
import ReportsPage from "./features/ReportsPage";
import SalesCrmPage from "./features/SalesCrmPage";
import SignInPage from "./features/SignInPage";
import type { Role } from "./shared/schemas";

const { Header, Content } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "CEO Dashboard" },
  { key: "/imports", icon: <SwapOutlined />, label: "Import Command" },
  { key: "/products", icon: <MedicineBoxOutlined />, label: "Products" },
  { key: "/inventory", icon: <InboxOutlined />, label: "Warehouse Stock" },
  { key: "/sales", icon: <ShoppingCartOutlined />, label: "Sales & CRM" },
  { key: "/accounts", icon: <BankOutlined />, label: "Accounts" },
  { key: "/reports", icon: <BarChartOutlined />, label: "Reports" },
  { key: "/hr-security", icon: <SafetyCertificateOutlined />, label: "HR & Security" },
  { key: "/admin-ops", icon: <AppstoreAddOutlined />, label: "Admin & Ops" }
];

const roleAccess: Record<Role, string[]> = {
  "Super Admin": [
    "/dashboard",
    "/imports",
    "/products",
    "/inventory",
    "/sales",
    "/accounts",
    "/reports",
    "/hr-security",
    "/admin-ops"
  ],
  "Managing Director": ["/dashboard", "/imports", "/products", "/inventory", "/sales", "/accounts", "/reports"],
  Accounts: ["/dashboard", "/products", "/accounts", "/reports", "/hr-security", "/admin-ops"],
  "Import Officer": ["/dashboard", "/imports", "/products", "/inventory", "/reports", "/admin-ops"],
  "Warehouse Manager": ["/dashboard", "/products", "/inventory", "/imports", "/reports"],
  "Sales Manager": ["/dashboard", "/sales", "/products", "/inventory", "/reports"],
  "Sales Executive": ["/sales", "/products", "/inventory"]
};

const authStorageKey = "medical-supplier-auth";

function readStoredUser(): AuthUser | null {
  const value = window.localStorage.getItem(authStorageKey);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => readStoredUser());
  const [role, setRole] = useState<Role>(() => readStoredUser()?.role ?? "Managing Director");

  useEffect(() => {
    if (authUser) {
      setRole(authUser.role);
    }
  }, [authUser]);

  const signIn = (user: AuthUser) => {
    const completeUser = {
      avatarUrl:
        user.avatarUrl ??
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      department: user.department ?? roleDepartment(user.role),
      phone: user.phone ?? "+880 1711 223344",
      title: user.title ?? user.role,
      ...user
    };
    setAuthUser(completeUser);
    setRole(user.role);
    window.localStorage.setItem(authStorageKey, JSON.stringify(completeUser));
  };

  const updateUser = (user: AuthUser) => {
    setAuthUser(user);
    setRole(user.role);
    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  };

  const signOut = () => {
    setAuthUser(null);
    window.localStorage.removeItem(authStorageKey);
  };

  return (
    <AuthContext.Provider value={{ user: authUser, signIn, updateUser, signOut }}>
      <RoleContext.Provider value={{ role, setRole }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route element={<ProtectedRoute user={authUser} />}>
            <Route element={<ErpLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/imports" element={<ImportPage />} />
              <Route path="/products" element={<ProductCatalogPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/sales" element={<SalesCrmPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/hr-security" element={<HrSecurityPage />} />
              <Route path="/admin-ops" element={<AdminOpsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RoleContext.Provider>
    </AuthContext.Provider>
  );
}

function roleDepartment(role: Role) {
  const departments: Record<Role, string> = {
    "Super Admin": "System Administration",
    "Managing Director": "Executive Office",
    Accounts: "Finance & Accounts",
    "Import Officer": "Import Management",
    "Warehouse Manager": "Warehouse",
    "Sales Manager": "Sales",
    "Sales Executive": "Field Sales"
  };

  return departments[role];
}

function ProtectedRoute({ user }: { user: AuthUser | null }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function ErpLayout() {
  const { user, signOut } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const allowedMenuItems = useMemo(() => {
    const allowedRoutes = roleAccess[role] ?? [];
    return menuItems.filter((item) => allowedRoutes.includes(item.key));
  }, [role]);

  const selectedKey = useMemo(() => {
    const match = menuItems.find((item) => location.pathname.startsWith(item.key));
    return match?.key ?? roleAccess[role][0];
  }, [location.pathname]);

  const isProfileRoute = location.pathname.startsWith("/profile");
  const routeAllowed = isProfileRoute || (roleAccess[role] ?? []).includes(selectedKey);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <Layout className="app-shell erp-shell">
      <Header className="erp-header">
        <div className="erp-header-top">
          <button className="erp-brand" type="button" onClick={() => navigate("/dashboard")}>
            <span className="brand-mark small">
              <MedicineBoxOutlined />
            </span>
            <span>
              <strong>SinoMed ERP</strong>
              <small>Medical import and distribution</small>
            </span>
          </button>

          <div className="erp-header-actions">
            <Badge status="processing" text="Mock API online" />
            <Tag icon={<AuditOutlined />} color="red">
              {role}
            </Tag>
            <select
              className="mobile-route-select"
              value={selectedKey}
              onChange={(event) => navigate(event.target.value)}
            >
              {allowedMenuItems.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: "Profile & Settings",
                    onClick: () => navigate("/profile")
                  },
                  {
                    key: "logout",
                    icon: <PoweroffOutlined />,
                    label: "Logout",
                    danger: true,
                    onClick: handleSignOut
                  }
                ]
              }}
            >
              <button className="profile-menu-button compact" type="button" aria-label="Open profile settings">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                <SettingOutlined />
              </button>
            </Dropdown>
          </div>
        </div>

        <nav className="erp-nav" aria-label="ERP modules">
          {allowedMenuItems.map((item) => (
            <button
              className={selectedKey === item.key ? "active" : ""}
              key={item.key}
              type="button"
              onClick={() => navigate(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </Header>

      <Content className="app-content">
        {routeAllowed ? <Outlet /> : <AccessDenied role={role} />}
      </Content>
    </Layout>
  );
}

function AccessDenied({ role }: { role: Role }) {
  const navigate = useNavigate();
  const defaultRoute = roleAccess[role][0] ?? "/profile";

  return (
    <Card variant="borderless" className="access-denied-card">
      <Space orientation="vertical" size={14}>
        <AlertOutlined />
        <Typography.Title level={2}>Access restricted for {role}</Typography.Title>
        <Typography.Paragraph>
          This role can only access the modules assigned in the ERP security plan. Sign out and choose
          another demo role to review a different permission set.
        </Typography.Paragraph>
        <Button type="primary" onClick={() => navigate(defaultRoute)}>
          Go to allowed module
        </Button>
      </Space>
    </Card>
  );
}

export default App;
