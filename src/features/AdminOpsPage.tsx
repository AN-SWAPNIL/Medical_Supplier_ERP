import {
  AppstoreAddOutlined,
  CarOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExperimentOutlined,
  MobileOutlined,
  PlusOutlined,
  ShopOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Space, Statistic, Table, Tabs, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { formatCurrency, formatDate } from "../utils/format";

type SupplierRow = {
  id: string;
  company: string;
  country: string;
  contact: string;
  terms: string;
  category: string;
  status: string;
};

type TransportRow = {
  id: string;
  vehicle: string;
  driver: string;
  route: string;
  fuel: number;
  tripCost: number;
  deliveryCost: number;
  status: string;
};

type ExpenseRow = {
  id: string;
  date: string;
  head: string;
  amount: number;
  owner: string;
  status: string;
};

const suppliers: SupplierRow[] = [
  {
    id: "SUP-CN-001",
    company: "Guangzhou Renhe Medical Technology",
    country: "China",
    contact: "Ms. Lily Chen",
    terms: "LC at sight",
    category: "Dialyzer / Blood Line",
    status: "Approved"
  },
  {
    id: "SUP-CN-002",
    company: "Ningbo Kanghua Healthcare",
    country: "China",
    contact: "Mr. Alan Zhou",
    terms: "30% TT + 70% BL",
    category: "IV Set / Burette Set",
    status: "Approved"
  },
  {
    id: "SUP-IN-003",
    company: "MedSure Global Devices",
    country: "India",
    contact: "Mr. Arjun Patel",
    terms: "LC 60 days",
    category: "AV Fistula Needle",
    status: "Review"
  }
];

const transports: TransportRow[] = [
  {
    id: "TRP-2601",
    vehicle: "Covered Van DHA-14-8821",
    driver: "Jalal Uddin",
    route: "Warehouse to Dhaka North",
    fuel: 7800,
    tripCost: 18500,
    deliveryCost: 32000,
    status: "In Transit"
  },
  {
    id: "TRP-2602",
    vehicle: "Refrigerated Van CTG-11-7002",
    driver: "Sohail Rana",
    route: "Port to Central Warehouse",
    fuel: 12400,
    tripCost: 28600,
    deliveryCost: 51000,
    status: "Completed"
  },
  {
    id: "TRP-2603",
    vehicle: "Pickup DHA-19-2217",
    driver: "Nazmul Hasan",
    route: "Warehouse to Dealer Channel",
    fuel: 4300,
    tripCost: 9600,
    deliveryCost: 17800,
    status: "Scheduled"
  }
];

const expenses: ExpenseRow[] = [
  { id: "EXP-901", date: "2026-06-23", head: "Fuel", amount: 37500, owner: "Transport", status: "Posted" },
  { id: "EXP-902", date: "2026-06-22", head: "TA/DA", amount: 56000, owner: "Sales", status: "Approved" },
  { id: "EXP-903", date: "2026-06-21", head: "Marketing", amount: 148000, owner: "Sales Manager", status: "Review" },
  { id: "EXP-904", date: "2026-06-20", head: "Internet", amount: 17500, owner: "Admin", status: "Posted" }
];

export default function AdminOpsPage() {
  const [supplierRows, setSupplierRows] = useState<SupplierRow[]>(suppliers);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRow | null>(null);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierForm] = Form.useForm<SupplierRow>();

  const openSupplierModal = (record?: SupplierRow) => {
    setEditingSupplier(record ?? null);
    supplierForm.setFieldsValue(
      record ?? {
        id: `SUP-DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        company: "Demo Medical Supplier",
        country: "China",
        contact: "Ms. Demo Contact",
        terms: "LC at sight",
        category: "Medical Consumables",
        status: "Review"
      }
    );
    setSupplierModalOpen(true);
  };

  const saveSupplier = (values: SupplierRow) => {
    if (editingSupplier) {
      setSupplierRows((rows) => rows.map((row) => (row.id === editingSupplier.id ? values : row)));
    } else {
      setSupplierRows((rows) => [values, ...rows]);
    }
    setSupplierModalOpen(false);
  };

  const supplierColumns: ColumnsType<SupplierRow> = [
    {
      title: "Supplier",
      dataIndex: "company",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.contact}</Typography.Text>
        </Space>
      )
    },
    { title: "Country", dataIndex: "country" },
    { title: "Payment Terms", dataIndex: "terms" },
    { title: "Category", dataIndex: "category" },
    { title: "Status", dataIndex: "status", render: (value: string) => <StatusTag status={value} /> },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openSupplierModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this demo supplier?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setSupplierRows((rows) => rows.filter((row) => row.id !== record.id))}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const transportColumns: ColumnsType<TransportRow> = [
    {
      title: "Vehicle",
      dataIndex: "vehicle",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.driver}</Typography.Text>
        </Space>
      )
    },
    { title: "Route", dataIndex: "route" },
    { title: "Fuel", dataIndex: "fuel", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Trip Cost", dataIndex: "tripCost", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Delivery Cost", dataIndex: "deliveryCost", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Status", dataIndex: "status", render: (value: string) => <Tag color="blue">{value}</Tag> }
  ];

  const expenseColumns: ColumnsType<ExpenseRow> = [
    { title: "Date", dataIndex: "date", render: (value: string) => formatDate(value) },
    { title: "Expense Head", dataIndex: "head" },
    { title: "Amount", dataIndex: "amount", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Owner", dataIndex: "owner" },
    { title: "Status", dataIndex: "status", render: (value: string) => <StatusTag status={value} /> }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin & Operations"
        title="Supplier, Transport, Expense and Mobile App Scope"
        subtitle="Prototype coverage for the remaining ERP plan modules: supplier database, transport cost, expense heads, approvals, mobile team workflows and product master readiness."
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openSupplierModal()}>
              New Supplier
            </Button>
            <Tag color="blue">Supplier master</Tag>
            <Tag color="red">Transport + expense</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Approved Suppliers" value={2} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Active Vehicles" value={3} prefix={<CarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card danger">
            <Statistic title="Open Expenses" value={1} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card success">
            <Statistic title="Mobile Roles" value={2} prefix={<MobileOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless">
        <Tabs
          items={[
            {
              key: "suppliers",
              label: (
                <Space>
                  <ShopOutlined />
                  Supplier Database
                </Space>
              ),
              children: (
                <Table rowKey="id" columns={supplierColumns} dataSource={supplierRows} pagination={false} scroll={{ x: 1040 }} />
              )
            },
            {
              key: "transport",
              label: (
                <Space>
                  <CarOutlined />
                  Transport Management
                </Space>
              ),
              children: (
                <Table rowKey="id" columns={transportColumns} dataSource={transports} pagination={false} scroll={{ x: 1000 }} />
              )
            },
            {
              key: "expenses",
              label: (
                <Space>
                  <DollarOutlined />
                  Expense Management
                </Space>
              ),
              children: (
                <Table rowKey="id" columns={expenseColumns} dataSource={expenses} pagination={false} scroll={{ x: 780 }} />
              )
            }
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" title="Mobile App Prototype Scope">
            <div className="mobile-scope-grid">
              <div>
                <MobileOutlined />
                <strong>Sales Team</strong>
                <span>Order entry, customer visit, GPS check-in and collection entry.</span>
              </div>
              <div>
                <TeamOutlined />
                <strong>Manager</strong>
                <span>Dashboard, approval queue, sales target and team monitoring.</span>
              </div>
              <div>
                <ExperimentOutlined />
                <strong>Warehouse Scan</strong>
                <span>Batch/LOT lookup, expiry alert and GRN handover readiness.</span>
              </div>
              <div>
                <AppstoreAddOutlined />
                <strong>Future API</strong>
                <span>Same `/api/v1` DTO contract can support mobile app endpoints.</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" title="Prototype Completeness Map">
            <Timeline
              items={[
                { color: "green", content: "Company profile and supplier-style landing page" },
                { color: "green", content: "Import management: supplier, PI, PO, LC/TT, shipment, customs" },
                { color: "green", content: "Warehouse and inventory: GRN, BIN, batch, LOT, expiry" },
                { color: "green", content: "Sales, CRM, target, invoice and collection" },
                { color: "green", content: "Accounts, expense, reports, HR/payroll, audit and security" },
                { color: "blue", content: "Mobile app scope represented for sales and manager workflows" }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingSupplier ? "Edit Supplier" : "New Supplier"}
        open={supplierModalOpen}
        onCancel={() => setSupplierModalOpen(false)}
        onOk={() => supplierForm.submit()}
        okText={editingSupplier ? "Save Changes" : "Create Demo Supplier"}
      >
        <Form form={supplierForm} layout="vertical" onFinish={saveSupplier}>
          <Form.Item name="id" label="Supplier ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact Person" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="terms" label="Payment Terms" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Product Category" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
