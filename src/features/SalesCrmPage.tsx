import { ContactsOutlined, DeleteOutlined, DollarOutlined, EditOutlined, PlusOutlined, RiseOutlined, TeamOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import type { ColumnsType } from "antd/es/table";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useRole } from "../context/RoleContext";
import { useCustomers, useSalesOrders } from "../services/api";
import type { Customer, SalesOrder } from "../shared/schemas";
import { formatCurrency, formatDate, formatNumber } from "../utils/format";

export default function SalesCrmPage() {
  const { role } = useRole();
  const ordersQuery = useSalesOrders();
  const customersQuery = useCustomers();
  const isSalesExecutive = role === "Sales Executive";
  const currentSalesUser = "Rafiq Ahmed";
  const [orderRows, setOrderRows] = useState<SalesOrder[]>([]);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm] = Form.useForm<SalesOrder>();

  useEffect(() => {
    if (ordersQuery.data) {
      setOrderRows(ordersQuery.data);
    }
  }, [ordersQuery.data]);

  const openOrderModal = (record?: SalesOrder) => {
    setEditingOrder(record ?? null);
    orderForm.setFieldsValue(
      record ?? {
        customer: "Demo Hospital",
        customerType: "Hospital",
        territory: "Dhaka North",
        product: "Dialyzer FX-80",
        quantity: 100,
        quotationNo: `QT-DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        orderNo: "Pending",
        challanNo: "Pending",
        invoiceNo: "Pending",
        amount: 52000,
        outstanding: 52000,
        status: "Quotation",
        owner: isSalesExecutive ? currentSalesUser : "Rafiq Ahmed"
      }
    );
    setOrderModalOpen(true);
  };

  const saveOrder = (values: SalesOrder) => {
    const normalized = {
      ...values,
      owner: isSalesExecutive ? currentSalesUser : values.owner
    };

    if (editingOrder) {
      setOrderRows((rows) =>
        rows.map((row) => (row.id === editingOrder.id ? { ...editingOrder, ...normalized } : row))
      );
    } else {
      setOrderRows((rows) => [{ ...normalized, id: `SO-DEMO-${Date.now()}` }, ...rows]);
    }
    setOrderModalOpen(false);
  };

  const visibleOrders = useMemo(() => {
    return isSalesExecutive ? orderRows.filter((order) => order.owner === currentSalesUser) : orderRows;
  }, [orderRows, isSalesExecutive]);

  const visibleCustomers = useMemo(() => {
    const customers = customersQuery.data ?? [];
    return isSalesExecutive
      ? customers.filter((customer) => customer.owner === currentSalesUser)
      : customers;
  }, [customersQuery.data, isSalesExecutive]);

  const salesSummary = useMemo(() => {
    const totalSales = visibleOrders.reduce((sum, order) => sum + order.amount, 0);
    const outstanding = visibleOrders.reduce((sum, order) => sum + order.outstanding, 0);
    const collected = totalSales - outstanding;
    const target = isSalesExecutive ? 4200000 : 52000000;

    return { totalSales, outstanding, collected, target };
  }, [visibleOrders, isSalesExecutive]);

  const orderColumns: ColumnsType<SalesOrder> = [
    {
      title: "Customer",
      dataIndex: "customer",
      fixed: "left",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.customerType} / {record.territory}</Typography.Text>
        </Space>
      )
    },
    { title: "Product", dataIndex: "product" },
    {
      title: "Qty",
      dataIndex: "quantity",
      align: "right",
      render: (value: number) => formatNumber(value)
    },
    { title: "Quotation", dataIndex: "quotationNo" },
    { title: "Challan", dataIndex: "challanNo" },
    { title: "Invoice", dataIndex: "invoiceNo" },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    {
      title: "Outstanding",
      dataIndex: "outstanding",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: string) => <StatusTag status={value} />
    },
    { title: "Owner", dataIndex: "owner" },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openOrderModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this demo sales row?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setOrderRows((rows) => rows.filter((row) => row.id !== record.id))}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const customerColumns: ColumnsType<Customer> = [
    {
      title: "Customer",
      dataIndex: "name",
      fixed: "left",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.contactPerson}</Typography.Text>
        </Space>
      )
    },
    { title: "Type", dataIndex: "type", render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "Territory", dataIndex: "territory" },
    {
      title: "Monthly Purchase",
      dataIndex: "monthlyPurchase",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    {
      title: "Dues",
      dataIndex: "outstandingDues",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    { title: "Last Visit", dataIndex: "lastVisit", render: (value: string) => formatDate(value) },
    { title: "Next Visit", dataIndex: "nextVisit", render: (value: string) => formatDate(value) },
    { title: "Owner", dataIndex: "owner" }
  ];

  if (ordersQuery.isLoading || customersQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (ordersQuery.error || customersQuery.error) {
    return <Alert type="error" message="Sales and CRM data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Sales Management"
        title="Quotation, Delivery, Invoice and Collection"
        subtitle="A single view for hospital, clinic, dealer and pharmacy relationships with sales target and outstanding dues visibility."
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openOrderModal()}>
              New Quotation
            </Button>
            <Tag color="blue">CRM</Tag>
            <Tag color="red">Collection control</Tag>
          </>
        }
      />

      {isSalesExecutive ? (
        <Alert
          type="info"
          showIcon
          message={`Sales Executive lens: showing only records owned by ${currentSalesUser}.`}
        />
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Visible Sales" value={salesSummary.totalSales} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Collected" value={salesSummary.collected} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card danger">
            <Statistic title="Outstanding" value={salesSummary.outstanding} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Target Progress" value={(salesSummary.totalSales / salesSummary.target) * 100} suffix="%" precision={1} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card variant="borderless" title="Sales Flow">
            <Steps
              current={3}
              items={["Quotation", "Sales Order", "Delivery Challan", "Invoice", "Collection"].map((title) => ({ title }))}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card variant="borderless" title="Target and Commission">
            <Space orientation="vertical" className="full-width" size={12}>
              <Progress
                percent={Math.min(100, Math.round((salesSummary.totalSales / salesSummary.target) * 100))}
                strokeColor="#b5121b"
              />
              <Space size={18} wrap>
                <Tag icon={<RiseOutlined />} color="green">Quarterly target</Tag>
                <Tag icon={<DollarOutlined />} color="gold">Auto commission rule</Tag>
                <Tag icon={<TeamOutlined />} color="blue">Team monitoring</Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless">
        <Tabs
          items={[
            {
              key: "orders",
              label: "Sales Pipeline",
              children: (
                <Table
                  rowKey="id"
                  columns={orderColumns}
                  dataSource={visibleOrders}
                  scroll={{ x: 1450 }}
                  pagination={false}
                  className="data-table"
                />
              )
            },
            {
              key: "customers",
              label: (
                <Space>
                  <ContactsOutlined />
                  Customer CRM
                </Space>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={customerColumns}
                  dataSource={visibleCustomers}
                  scroll={{ x: 1050 }}
                  pagination={false}
                  className="data-table"
                />
              )
            },
            {
              key: "territory",
              label: "Territory View",
              children: (
                <Column
                  height={300}
                  data={visibleCustomers.map((customer) => ({
                    territory: customer.territory,
                    monthlyPurchase: customer.monthlyPurchase
                  }))}
                  xField="territory"
                  yField="monthlyPurchase"
                  colorField="territory"
                  axis={{ y: { labelFormatter: (value: number) => formatCurrency(value, true) } }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingOrder ? "Edit Sales Pipeline" : "New Sales Quotation"}
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        onOk={() => orderForm.submit()}
        okText={editingOrder ? "Save Changes" : "Create Demo Quotation"}
        width={840}
      >
        <Form form={orderForm} layout="vertical" onFinish={saveOrder}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="customerType" label="Type" rules={[{ required: true }]}>
                <Select
                  options={["Hospital", "Clinic", "Dealer", "Pharmacy"].map((value) => ({ label: value, value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="territory" label="Territory" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="product" label="Product" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                <InputNumber min={1} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="outstanding" label="Outstanding" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select
                  options={["Quotation", "Sales Order", "Delivered", "Invoiced", "Collected"].map((value) => ({
                    label: value,
                    value
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="quotationNo" label="Quotation" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="orderNo" label="Sales Order" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="challanNo" label="Challan" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="invoiceNo" label="Invoice" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
                <Input disabled={isSalesExecutive} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
