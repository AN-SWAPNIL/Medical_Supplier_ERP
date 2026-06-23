import { AuditOutlined, ClockCircleOutlined, SafetyCertificateOutlined, UserSwitchOutlined } from "@ant-design/icons";
import {
  Alert,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useRole } from "../context/RoleContext";
import { useAuditLog } from "../services/api";
import type { AuditLog } from "../shared/schemas";

type EmployeeRow = {
  id: string;
  name: string;
  department: string;
  attendance: string;
  leaveBalance: number;
  salaryStatus: string;
};

const employees: EmployeeRow[] = [
  {
    id: "EMP-001",
    name: "Sadia Akter",
    department: "Accounts",
    attendance: "Present",
    leaveBalance: 8,
    salaryStatus: "Ready"
  },
  {
    id: "EMP-002",
    name: "Nusrat Jahan",
    department: "Warehouse",
    attendance: "Present",
    leaveBalance: 11,
    salaryStatus: "Ready"
  },
  {
    id: "EMP-003",
    name: "Rafiq Ahmed",
    department: "Sales",
    attendance: "Field Visit",
    leaveBalance: 6,
    salaryStatus: "Commission Pending"
  },
  {
    id: "EMP-004",
    name: "Tanvir Islam",
    department: "Sales",
    attendance: "Present",
    leaveBalance: 9,
    salaryStatus: "Ready"
  }
];

const roleMatrix = [
  { module: "Dashboard", admin: "Full", md: "Full", accounts: "View", importOfficer: "View", warehouse: "View", sales: "Team", executive: "Own" },
  { module: "Import", admin: "Full", md: "Approve", accounts: "Payment", importOfficer: "Full", warehouse: "Receive", sales: "View", executive: "No" },
  { module: "Inventory", admin: "Full", md: "View", accounts: "Value", importOfficer: "View", warehouse: "Full", sales: "Stock", executive: "Stock" },
  { module: "Sales", admin: "Full", md: "View", accounts: "Invoice", importOfficer: "No", warehouse: "Delivery", sales: "Full", executive: "Own" },
  { module: "Accounts", admin: "Full", md: "View", accounts: "Full", importOfficer: "Import Cost", warehouse: "No", sales: "Dues", executive: "Own Dues" }
];

export default function HrSecurityPage() {
  const { role } = useRole();
  const { data, isLoading, error } = useAuditLog();

  const auditColumns: ColumnsType<AuditLog> = [
    { title: "Time", dataIndex: "time" },
    {
      title: "Actor",
      dataIndex: "actor",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.role}</Typography.Text>
        </Space>
      )
    },
    { title: "Module", dataIndex: "module" },
    { title: "Action", dataIndex: "action" },
    { title: "IP", dataIndex: "ipAddress" },
    { title: "Severity", dataIndex: "severity", render: (value: string) => <StatusTag status={value} /> }
  ];

  const employeeColumns: ColumnsType<EmployeeRow> = [
    { title: "Employee", dataIndex: "name" },
    { title: "Department", dataIndex: "department" },
    { title: "Attendance", dataIndex: "attendance", render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "Leave Balance", dataIndex: "leaveBalance", align: "right" },
    { title: "Salary Status", dataIndex: "salaryStatus" }
  ];

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (error || !data) {
    return <Alert type="error" message="Security audit data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Security Control"
        title="Role Access, Audit Log and Payroll Readiness"
        subtitle="A controlled ERP surface with role-based access, IP restriction, 2FA readiness, daily backup and staff attendance visibility."
        actions={
          <>
            <Tag color="blue">2FA ready</Tag>
            <Tag color="red">Audit trail</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Active Role" value={role} prefix={<UserSwitchOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Audit Events" value={1842} prefix={<AuditOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card success">
            <Statistic title="Backup Status" value="Daily" prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Attendance" value="96%" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card variant="borderless" title="Role Permission Matrix">
            <Table
              rowKey="module"
              dataSource={roleMatrix}
              pagination={false}
              scroll={{ x: 1050 }}
              columns={[
                { title: "Module", dataIndex: "module", fixed: "left" },
                { title: "Super Admin", dataIndex: "admin" },
                { title: "MD", dataIndex: "md" },
                { title: "Accounts", dataIndex: "accounts" },
                { title: "Import Officer", dataIndex: "importOfficer" },
                { title: "Warehouse", dataIndex: "warehouse" },
                { title: "Sales Manager", dataIndex: "sales" },
                { title: "Sales Executive", dataIndex: "executive" }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card variant="borderless" title="Security Standards">
            <Timeline
              items={[
                { color: "green", content: "Role-based access control" },
                { color: "green", content: "Invoice visibility restrictions" },
                { color: "blue", content: "Two-factor authentication readiness" },
                { color: "blue", content: "IP restriction for office and warehouse" },
                { color: "green", content: "Daily backup and audit log retention" }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" title="Audit Log">
            <Table
              rowKey="id"
              columns={auditColumns}
              dataSource={data}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" title="HR & Payroll">
            <Table
              rowKey="id"
              columns={employeeColumns}
              dataSource={employees}
              pagination={false}
              scroll={{ x: 680 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
