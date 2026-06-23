import {
  GlobalOutlined,
  HomeOutlined,
  LoginOutlined,
  MedicineBoxOutlined,
  PoweroffOutlined
} from "@ant-design/icons";
import { Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../shared/schemas";

const roleHome: Record<Role, string> = {
  "Super Admin": "/dashboard",
  "Managing Director": "/dashboard",
  Accounts: "/accounts",
  "Import Officer": "/imports",
  "Warehouse Manager": "/inventory",
  "Sales Manager": "/sales",
  "Sales Executive": "/sales"
};

export default function PublicTopNav({ active = "home" }: { active?: "home" | "signin" }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleAuthAction = () => {
    if (user) {
      navigate(roleHome[user.role]);
      return;
    }

    navigate("/signin");
  };

  return (
    <header className="public-header">
      <div className="public-top-strip">
        <span>ISO / CE ready workflows</span>
        <span>China procurement</span>
        <span>Batch and expiry traceability</span>
        <span>Bangladesh distribution</span>
      </div>
      <nav className="public-nav">
        <button className="public-brand" type="button" onClick={() => navigate("/")}>
          <span className="brand-mark">
            <MedicineBoxOutlined />
          </span>
          <span>
            <strong>SinoMed ERP</strong>
            <small>Medical Import & Distribution</small>
          </span>
        </button>
        <div className="public-links">
          <a className={active === "home" ? "active" : ""} href="/#home">
            Home
          </a>
          <a href="/#solutions">Solutions</a>
          <a href="/#products">Products</a>
          <a href="/#projects">Projects</a>
          <a href="/#contact">Contact</a>
        </div>
        <Space className="public-actions">
          {user ? (
            <Button icon={<PoweroffOutlined />} onClick={signOut}>
              Logout
            </Button>
          ) : null}
          <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Home
          </Button>
          <Button
            type="primary"
            icon={user ? <GlobalOutlined /> : <LoginOutlined />}
            onClick={handleAuthAction}
          >
            {user ? "Enter ERP" : "Sign In"}
          </Button>
        </Space>
      </nav>
    </header>
  );
}
