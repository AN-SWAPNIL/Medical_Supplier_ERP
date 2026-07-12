import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ProtectedRoute, RequirePermission } from "./components/layout/RouteGuards";
import AICommandCenterPage from "./features/ai-agents/AICommandCenterPage";
import AuditSecurityPage from "./features/audit-security/AuditSecurityPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import SignupPage from "./features/auth/SignupPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import LandingPage from "./features/landing/LandingPage";
import MobileSalesControlPage from "./features/mobile-sales/MobileSalesControlPage";
import ModulePage from "./features/modules/ModulePage";
import { moduleConfigs } from "./features/modules/moduleConfigs";
import PrintPreviewPage from "./features/print/PrintPreviewPage";
import ReportsCenterPage from "./features/reports/ReportsCenterPage";
import SettingsPage from "./features/settings/SettingsPage";
import ProfilePage from "./features/users/ProfilePage";
import RoleMatrixPage from "./features/users/RoleMatrixPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<RequirePermission permission="dashboard"><DashboardPage /></RequirePermission>} />
          <Route path="roles" element={<RequirePermission permission="roles"><RoleMatrixPage /></RequirePermission>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="reports" element={<RequirePermission permission="reports"><ReportsCenterPage /></RequirePermission>} />
          <Route path="ai" element={<RequirePermission permission="ai"><AICommandCenterPage /></RequirePermission>} />
          <Route path="audit" element={<RequirePermission permission="audit"><AuditSecurityPage /></RequirePermission>} />
          <Route path="settings" element={<RequirePermission permission="settings"><SettingsPage /></RequirePermission>} />
          <Route path="sales/mobile-control" element={<RequirePermission permission="sales"><MobileSalesControlPage /></RequirePermission>} />
          <Route path="print/:template/:moduleKey/:id" element={<RequirePermission permission="print"><PrintPreviewPage /></RequirePermission>} />
          {moduleConfigs.map((config) => (
            <Route
              key={config.key}
              path={config.route.replace("/app/", "")}
              element={
                <RequirePermission permission={config.permission}>
                  <ModulePage config={config} />
                </RequirePermission>
              }
            />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
