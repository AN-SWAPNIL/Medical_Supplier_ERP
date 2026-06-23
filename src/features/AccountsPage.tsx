import { BankOutlined, DeleteOutlined, EditOutlined, FileDoneOutlined, PlusOutlined, WalletOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/plots";
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
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useFinanceSummary } from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";
import { useEffect, useState } from "react";

type CashRow = {
  date: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
};

type BankRow = {
  bank: string;
  accountNo: string;
  balance: number;
  lastReconciled: string;
};

type VoucherRow = {
  id: string;
  type: string;
  party: string;
  amount: number;
  status: string;
};

export default function AccountsPage() {
  const { data, isLoading, error } = useFinanceSummary();
  const [voucherRows, setVoucherRows] = useState<VoucherRow[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRow | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherForm] = Form.useForm<VoucherRow>();

  useEffect(() => {
    if (data) {
      setVoucherRows(data.vouchers);
    }
  }, [data]);

  const openVoucherModal = (record?: VoucherRow) => {
    setEditingVoucher(record ?? null);
    voucherForm.setFieldsValue(
      record ?? {
        id: `JV-DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        type: "Journal",
        party: "Demo Party",
        amount: 10000,
        status: "Draft"
      }
    );
    setVoucherModalOpen(true);
  };

  const saveVoucher = (values: VoucherRow) => {
    if (editingVoucher) {
      setVoucherRows((rows) => rows.map((row) => (row.id === editingVoucher.id ? values : row)));
    } else {
      setVoucherRows((rows) => [values, ...rows]);
    }
    setVoucherModalOpen(false);
  };

  const cashColumns: ColumnsType<CashRow> = [
    { title: "Date", dataIndex: "date", render: (value: string) => formatDate(value) },
    { title: "Narration", dataIndex: "narration" },
    { title: "Debit", dataIndex: "debit", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Credit", dataIndex: "credit", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Balance", dataIndex: "balance", align: "right", render: (value: number) => formatCurrency(value) }
  ];

  const bankColumns: ColumnsType<BankRow> = [
    {
      title: "Bank",
      dataIndex: "bank",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.accountNo}</Typography.Text>
        </Space>
      )
    },
    { title: "Balance", dataIndex: "balance", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Last Reconciled", dataIndex: "lastReconciled", render: (value: string) => formatDate(value) }
  ];

  const voucherColumns: ColumnsType<VoucherRow> = [
    { title: "Voucher", dataIndex: "id" },
    { title: "Type", dataIndex: "type", render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: "Party", dataIndex: "party" },
    { title: "Amount", dataIndex: "amount", align: "right", render: (value: number) => formatCurrency(value) },
    { title: "Status", dataIndex: "status", render: (value: string) => <StatusTag status={value} /> },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openVoucherModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this demo voucher?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setVoucherRows((rows) => rows.filter((row) => row.id !== record.id))}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (error || !data) {
    return <Alert type="error" message="Finance data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Accounts Module"
        title="Cash, Bank, Ledger and Voucher Control"
        subtitle="Finance users can review liquidity, receivable, payable, vouchers and monthly profit with an audit-ready posting workflow."
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openVoucherModal()}>
              New Voucher
            </Button>
            <Tag color="blue">Cash book</Tag>
            <Tag color="red">Receivable / payable</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={5}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Cash" value={data.cashBalance} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={5}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Bank" value={data.bankBalance} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={5}>
          <Card variant="borderless" className="summary-card danger">
            <Statistic title="Receivable" value={data.receivable} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={5}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Payable" value={data.payable} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={4}>
          <Card variant="borderless" className="summary-card success">
            <Statistic title="Profit" value={data.profit} prefix="BDT" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" title="Profit & Loss Snapshot">
            <Column
              height={320}
              data={data.profitLoss}
              xField="label"
              yField="amount"
              colorField="label"
              axis={{ y: { labelFormatter: (value: number) => formatCurrency(value, true) } }}
              tooltip={{ items: [{ field: "amount", valueFormatter: (value: number) => formatCurrency(value) }] }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" title="Posting Workflow">
            <Space orientation="vertical" size={14} className="full-width">
              <div className="finance-step">
                <WalletOutlined />
                <span>Receipt and payment vouchers enter review queue.</span>
              </div>
              <div className="finance-step">
                <BankOutlined />
                <span>Bank and cash positions reconcile daily.</span>
              </div>
              <div className="finance-step">
                <FileDoneOutlined />
                <span>Approved entries post into general ledger and reports.</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless">
        <Tabs
          items={[
            {
              key: "cash",
              label: "Cash Book",
              children: (
                <Table
                  rowKey={(record) => `${record.date}-${record.narration}`}
                  columns={cashColumns}
                  dataSource={data.cashBook}
                  pagination={false}
                  scroll={{ x: 780 }}
                />
              )
            },
            {
              key: "bank",
              label: "Bank Book",
              children: (
                <Table
                  rowKey="accountNo"
                  columns={bankColumns}
                  dataSource={data.bankBook}
                  pagination={false}
                  scroll={{ x: 640 }}
                />
              )
            },
            {
              key: "vouchers",
              label: "Vouchers",
              children: (
                <Table
                  rowKey="id"
                  columns={voucherColumns}
                  dataSource={voucherRows}
                  pagination={false}
                  scroll={{ x: 900 }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingVoucher ? "Edit Voucher" : "New Voucher"}
        open={voucherModalOpen}
        onCancel={() => setVoucherModalOpen(false)}
        onOk={() => voucherForm.submit()}
        okText={editingVoucher ? "Save Changes" : "Create Demo Voucher"}
      >
        <Form form={voucherForm} layout="vertical" onFinish={saveVoucher}>
          <Form.Item name="id" label="Voucher No" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={["Journal", "Contra", "Payment", "Receipt"].map((value) => ({ label: value, value }))} />
          </Form.Item>
          <Form.Item name="party" label="Party / Narration" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={["Draft", "Approved", "Posted"].map((value) => ({ label: value, value }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
