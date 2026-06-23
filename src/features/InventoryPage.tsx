import { BarcodeOutlined, DeleteOutlined, EditOutlined, InboxOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
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
  Table,
  Tabs,
  Tag,
  Typography
} from "antd";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useInventoryBatches, useStockMovements } from "../services/api";
import type { InventoryBatch, StockMovement } from "../shared/schemas";
import { formatCurrency, formatDate, formatNumber } from "../utils/format";

export default function InventoryPage() {
  const batchesQuery = useInventoryBatches();
  const movementsQuery = useStockMovements();
  const [batchRows, setBatchRows] = useState<InventoryBatch[]>([]);
  const [editingBatch, setEditingBatch] = useState<InventoryBatch | null>(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchForm] = Form.useForm<InventoryBatch>();

  const batches = batchRows;
  const movements = movementsQuery.data ?? [];

  useEffect(() => {
    if (batchesQuery.data) {
      setBatchRows(batchesQuery.data);
    }
  }, [batchesQuery.data]);

  const openBatchModal = (record?: InventoryBatch) => {
    setEditingBatch(record ?? null);
    batchForm.setFieldsValue(
      record ?? {
        product: "Dialyzer FX-80",
        batchNumber: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        lotNumber: "LOT-DEMO",
        supplier: "Demo Medical Supplier",
        binLocation: "A-01-01",
        expiryDate: "2027-06-30",
        availableQty: 1000,
        reservedQty: 0,
        unit: "pcs",
        purchasePrice: 400,
        salesPrice: 520,
        alertLevel: "Normal"
      }
    );
    setBatchModalOpen(true);
  };

  const saveBatch = (values: InventoryBatch) => {
    if (editingBatch) {
      setBatchRows((rows) => rows.map((row) => (row.id === editingBatch.id ? { ...editingBatch, ...values } : row)));
    } else {
      setBatchRows((rows) => [{ ...values, id: `BAT-DEMO-${Date.now()}` }, ...rows]);
    }
    setBatchModalOpen(false);
  };

  const inventoryTotals = useMemo(() => {
    const availableQty = batches.reduce((sum, batch) => sum + batch.availableQty, 0);
    const reservedQty = batches.reduce((sum, batch) => sum + batch.reservedQty, 0);
    const inventoryValue = batches.reduce((sum, batch) => sum + batch.availableQty * batch.purchasePrice, 0);
    const riskyBatches = batches.filter((batch) => batch.alertLevel !== "Normal").length;

    return { availableQty, reservedQty, inventoryValue, riskyBatches };
  }, [batches]);

  const batchColumns: ColumnsType<InventoryBatch> = [
    {
      title: "Product",
      dataIndex: "product",
      fixed: "left",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.supplier}</Typography.Text>
        </Space>
      )
    },
    { title: "Batch", dataIndex: "batchNumber" },
    { title: "LOT", dataIndex: "lotNumber" },
    {
      title: "BIN",
      dataIndex: "binLocation",
      render: (value: string) => <Tag color="blue">{value}</Tag>
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      render: (value: string, record) => (
        <Space orientation="vertical" size={2}>
          <span>{formatDate(value)}</span>
          <StatusTag status={record.alertLevel} />
        </Space>
      )
    },
    {
      title: "Available",
      dataIndex: "availableQty",
      align: "right",
      render: (value: number, record) => `${formatNumber(value)} ${record.unit}`
    },
    {
      title: "Reserved",
      dataIndex: "reservedQty",
      align: "right",
      render: (value: number) => formatNumber(value)
    },
    {
      title: "Purchase",
      dataIndex: "purchasePrice",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    {
      title: "Sales",
      dataIndex: "salesPrice",
      align: "right",
      render: (value: number) => formatCurrency(value)
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openBatchModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this demo batch?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setBatchRows((rows) => rows.filter((row) => row.id !== record.id))}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const movementColumns: ColumnsType<StockMovement> = [
    { title: "Date", dataIndex: "date", render: (value: string) => formatDate(value) },
    { title: "Product", dataIndex: "product" },
    { title: "Batch", dataIndex: "batchNumber" },
    {
      title: "Type",
      dataIndex: "movementType",
      render: (value: string) => <StatusTag status={value} />
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      align: "right",
      render: (value: number) => formatNumber(value)
    },
    { title: "Reference", dataIndex: "reference" },
    { title: "User", dataIndex: "warehouseUser" }
  ];

  if (batchesQuery.isLoading || movementsQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (batchesQuery.error || movementsQuery.error) {
    return <Alert type="error" message="Inventory data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Warehouse Management"
        title="Batch, LOT, Expiry and BIN Control"
        subtitle="Real-time inventory for medical consumables, with stock in/out, transfer, adjustment and physical count visibility."
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openBatchModal()}>
              Add Batch
            </Button>
            <Tag color="blue">GRN ready</Tag>
            <Tag color="red">Expiry alerts</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Available Stock" value={inventoryTotals.availableQty} suffix="pcs" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Reserved Stock" value={inventoryTotals.reservedQty} suffix="pcs" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Inventory Value" value={inventoryTotals.inventoryValue} prefix="BDT" />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card danger">
            <Statistic title="Risk Batches" value={inventoryTotals.riskyBatches} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless">
        <Tabs
          items={[
            {
              key: "batches",
              label: (
                <Space>
                  <BarcodeOutlined />
                  Batch Stock
                </Space>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={batchColumns}
                  dataSource={batches}
                  scroll={{ x: 1240 }}
                  pagination={false}
                  className="data-table"
                />
              )
            },
            {
              key: "movements",
              label: (
                <Space>
                  <InboxOutlined />
                  Movements
                </Space>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={movementColumns}
                  dataSource={movements}
                  scroll={{ x: 900 }}
                  pagination={false}
                  className="data-table"
                />
              )
            },
            {
              key: "expiry",
              label: (
                <Space>
                  <WarningOutlined />
                  Expiry Alerts
                </Space>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {batches.map((batch) => {
                    const isRisk = batch.alertLevel !== "Normal";
                    const percent = batch.alertLevel === "Critical" ? 18 : batch.alertLevel === "Warning" ? 55 : 92;

                    return (
                      <Col xs={24} md={12} xl={8} key={batch.id}>
                        <Card variant="outlined" className={isRisk ? "expiry-card risk" : "expiry-card"}>
                          <Space orientation="vertical" size={10} className="full-width">
                            <Space wrap>
                              <Typography.Text strong>{batch.product}</Typography.Text>
                              <StatusTag status={batch.alertLevel} />
                            </Space>
                            <Typography.Text type="secondary">
                              {batch.batchNumber} / {batch.lotNumber}
                            </Typography.Text>
                            <Progress percent={percent} strokeColor={isRisk ? "#b5121b" : "#2b7a4b"} />
                            <Typography.Text>{formatDate(batch.expiryDate)}</Typography.Text>
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingBatch ? "Edit Batch Stock" : "Add Batch Stock"}
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        onOk={() => batchForm.submit()}
        okText={editingBatch ? "Save Changes" : "Create Demo Batch"}
        width={780}
      >
        <Form form={batchForm} layout="vertical" onFinish={saveBatch}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="product" label="Product" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="batchNumber" label="Batch" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="lotNumber" label="LOT" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="binLocation" label="BIN" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="expiryDate" label="Expiry Date" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="alertLevel" label="Alert" rules={[{ required: true }]}>
                <Select
                  options={["Critical", "Warning", "Normal"].map((value) => ({ label: value, value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="availableQty" label="Available" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="reservedQty" label="Reserved" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="purchasePrice" label="Purchase Price" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="salesPrice" label="Sales Price" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
