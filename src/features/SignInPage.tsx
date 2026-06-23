import { LockOutlined, LoginOutlined, SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, Space, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PublicTopNav from "../components/PublicTopNav";
import { useAuth } from "../context/AuthContext";
import { roleOptions } from "../context/RoleContext";
import type { Role } from "../shared/schemas";

type SignInValues = {
  email: string;
  password: string;
  role: Role;
};

const demoUsers: Array<{ role: Role; name: string; email: string; caption: string }> = [
  {
    role: "Super Admin",
    name: "System Admin",
    email: "admin@sinomed.demo",
    caption: "Full access to all ERP modules and security settings"
  },
  {
    role: "Managing Director",
    name: "M. Rahman",
    email: "md@sinomed.demo",
    caption: "Dashboard, profit/loss, bank and approvals"
  },
  {
    role: "Accounts",
    name: "Sadia Akter",
    email: "accounts@sinomed.demo",
    caption: "Voucher, bank, cash, expenses, payroll and reports"
  },
  {
    role: "Import Officer",
    name: "A. Chowdhury",
    email: "import@sinomed.demo",
    caption: "PI, LC, shipment, documents and customs"
  },
  {
    role: "Warehouse Manager",
    name: "N. Jahan",
    email: "warehouse@sinomed.demo",
    caption: "GRN, stock transfer, batch and BIN control"
  },
  {
    role: "Sales Manager",
    name: "Anika Rahman",
    email: "sales.manager@sinomed.demo",
    caption: "Sales target, CRM, team monitoring and reports"
  },
  {
    role: "Sales Executive",
    name: "Rafiq Ahmed",
    email: "sales@sinomed.demo",
    caption: "Own customers, quotation, invoice and collection"
  }
];

const roleHome: Record<Role, string> = {
  "Super Admin": "/dashboard",
  "Managing Director": "/dashboard",
  Accounts: "/accounts",
  "Import Officer": "/imports",
  "Warehouse Manager": "/inventory",
  "Sales Manager": "/sales",
  "Sales Executive": "/sales"
};

export default function SignInPage() {
  const [form] = Form.useForm<SignInValues>();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/dashboard";
  }, [location.state]);

  const submit = (values: SignInValues) => {
    const demoUser = demoUsers.find((user) => user.role === values.role);

    signIn({
      name: demoUser?.name ?? values.role,
      email: values.email,
      role: values.role
    });
    navigate(redirectTo === "/dashboard" ? roleHome[values.role] : redirectTo);
  };

  const applyDemoUser = (role: Role) => {
    const demoUser = demoUsers.find((user) => user.role === role);

    if (!demoUser) {
      return;
    }

    form.setFieldsValue({
      role,
      email: demoUser.email,
      password: "demo123"
    });
  };

  return (
    <div className="public-page auth-page">
      <PublicTopNav active="signin" />

      <main className="auth-layout">
        <section className="auth-visual">
          <Tag color="red">Role Based ERP Access</Tag>
          <Typography.Title>Sign in as the exact user the client wants to evaluate.</Typography.Title>
          <Typography.Paragraph>
            The demo includes role-specific visibility for MD, Accounts, Import Officer, Warehouse
            Manager, Sales Manager and Sales Executive.
          </Typography.Paragraph>
          <div className="auth-proof-grid">
            <span>
              <SafetyCertificateOutlined />
              2FA ready
            </span>
            <span>
              <LockOutlined />
              Invoice restrictions
            </span>
            <span>
              <UserOutlined />
              User audit trail
            </span>
          </div>
        </section>

        <section className="auth-card-wrap">
          <Card className="signin-card" variant="borderless">
            <Typography.Title level={3}>ERP Demo Sign In</Typography.Title>
            <Typography.Paragraph type="secondary">
              Select a role and enter the prototype. Password is demo-only for presentation.
            </Typography.Paragraph>

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                role: "Managing Director",
                email: "md@sinomed.demo",
                password: "demo123"
              }}
              onFinish={submit}
            >
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select
                  options={roleOptions.map((role) => ({ label: role, value: role }))}
                  onChange={(role) => applyDemoUser(role)}
                />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<LoginOutlined />} block size="large">
                Sign In to ERP Demo
              </Button>
            </Form>
          </Card>

          <Row gutter={[12, 12]} className="demo-user-grid">
            {demoUsers.map((user) => (
              <Col xs={24} sm={12} key={user.role}>
                <button className="demo-user-card" type="button" onClick={() => applyDemoUser(user.role)}>
                  <Space orientation="vertical" size={2}>
                    <strong>{user.role}</strong>
                    <span>{user.name}</span>
                    <small>{user.caption}</small>
                  </Space>
                </button>
              </Col>
            ))}
          </Row>
        </section>
      </main>
    </div>
  );
}
