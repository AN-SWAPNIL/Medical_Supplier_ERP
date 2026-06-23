import { CalculatorOutlined, DeleteOutlined, EditOutlined, FileSearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
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
  Tag,
  Timeline,
  Typography
} from "antd";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { previewLandedCost, useImportDetail, useImportPipeline } from "../services/api";
import type { CustomsCostRequest, ImportPipelineItem } from "../shared/schemas";
import { formatCurrency, formatDate, formatNumber, formatUsd } from "../utils/format";
import { useEffect, useState } from "react";

const importStages = [
  "Supplier Inquiry",
  "PI Approval",
  "Purchase Order",
  "LC / TT",
  "Production Follow-up",
  "Shipment",
  "Customs",
  "Warehouse Receiving"
];

const initialCostPayload: CustomsCostRequest = {
  product: "Dialyzer FX-80",
  quantity: 24000,
  fobCostPerPiece: 3.2,
  duty: 980000,
  vat: 620000,
  ait: 160000,
  freight: 410000,
  portCharges: 125000,
  cfCharges: 95000,
  transportCharges: 85000,
  exchangeRate: 118
};

export default function ImportPage() {
  const [selectedImportId, setSelectedImportId] = useState<string>();
  const [importRows, setImportRows] = useState<ImportPipelineItem[]>([]);
  const [editingImport, setEditingImport] = useState<ImportPipelineItem | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [form] = Form.useForm<CustomsCostRequest>();
  const [importForm] = Form.useForm<ImportPipelineItem>();
  const { data, isLoading, error } = useImportPipeline();
  const { data: detail, isFetching: detailLoading } = useImportDetail(selectedImportId);
  const landedCostMutation = useMutation({
    mutationFn: previewLandedCost
  });

  useEffect(() => {
    if (data) {
      setImportRows(data);
    }
  }, [data]);

  const openImportModal = (record?: ImportPipelineItem) => {
    setEditingImport(record ?? null);
    importForm.setFieldsValue(
      record ?? {
        poNumber: `PO-DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        supplier: "Demo Medical Supplier",
        country: "China",
        product: "Dialyzer FX-80",
        quantity: 12000,
        valueUsd: 38400,
        currentStage: "Supplier Inquiry",
        progress: 12,
        status: "On Track",
        eta: "2026-08-15",
        owner: "Import Officer"
      }
    );
    setImportModalOpen(true);
  };

  const saveImport = (values: ImportPipelineItem) => {
    if (editingImport) {
      setImportRows((rows) =>
        rows.map((row) => (row.id === editingImport.id ? { ...editingImport, ...values } : row))
      );
    } else {
      setImportRows((rows) => [{ ...values, id: `IMP-DEMO-${Date.now()}` }, ...rows]);
    }
    setImportModalOpen(false);
  };

  const columns: ColumnsType<ImportPipelineItem> = [
    {
      title: "PO",
      dataIndex: "poNumber",
      fixed: "left",
      render: (value: string, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.supplier}</Typography.Text>
        </Space>
      )
    },
    { title: "Country", dataIndex: "country" },
    { title: "Product", dataIndex: "product" },
    {
      title: "Qty",
      dataIndex: "quantity",
      align: "right",
      render: (value: number) => formatNumber(value)
    },
    {
      title: "Value",
      dataIndex: "valueUsd",
      align: "right",
      render: (value: number) => formatUsd(value)
    },
    {
      title: "Stage",
      dataIndex: "currentStage",
      render: (value: string, record) => (
        <Space orientation="vertical" size={4} className="table-progress">
          <Space wrap>
            <span>{value}</span>
            <StatusTag status={record.status} />
          </Space>
          <Progress percent={record.progress} size="small" />
        </Space>
      )
    },
    {
      title: "ETA",
      dataIndex: "eta",
      render: (value: string) => formatDate(value)
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<FileSearchOutlined />} onClick={() => setSelectedImportId(record.id)}>
            Inspect
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openImportModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this demo import?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setImportRows((rows) => rows.filter((row) => row.id !== record.id))}
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
    return <Alert type="error" message="Import pipeline could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Import Management"
        title="China Procurement to Warehouse Receiving"
        subtitle="Track supplier inquiry, PI approval, purchase order, LC/TT, shipment, customs cost and GRN readiness from one place."
        actions={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openImportModal()}>
              New Import
            </Button>
            <Tag color="blue">PI / LC / TT</Tag>
            <Tag color="red">Customs landed cost</Tag>
          </>
        }
      />

      <Card variant="borderless" className="process-card">
        <Typography.Title level={3}>Complete Import Flow</Typography.Title>
        <div className="horizontal-process">
          {importStages.map((stage, index) => (
            <div className="process-node" key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={importRows}
        scroll={{ x: 980 }}
        pagination={false}
        className="data-table"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card
            variant="borderless"
            title={
              <Space>
                <CalculatorOutlined />
                Landed Cost Preview
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={initialCostPayload}
              onFinish={(values) => landedCostMutation.mutate(values)}
            >
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name="product" label="Product" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { label: "Dialyzer FX-80", value: "Dialyzer FX-80" },
                        { label: "Blood Line Set", value: "Blood Line Set" },
                        { label: "IV Set", value: "IV Set" }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                    <InputNumber min={1} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="fobCostPerPiece" label="FOB USD / Piece" rules={[{ required: true }]}>
                    <InputNumber min={0} step={0.01} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="duty" label="Duty">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="vat" label="VAT">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="ait" label="AIT">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="freight" label="Freight">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="portCharges" label="Port Charges">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="cfCharges" label="C&F Charges">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="transportCharges" label="Transport">
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="exchangeRate" label="Exchange Rate">
                    <InputNumber min={1} className="full-width" />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CalculatorOutlined />}
                loading={landedCostMutation.isPending}
              >
                Calculate Landed Cost
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card variant="borderless" title="Cost Result">
            {landedCostMutation.data ? (
              <Space orientation="vertical" size={16} className="full-width">
                <Statistic
                  title="Landed Cost / Piece"
                  value={landedCostMutation.data.landedCostPerPieceBdt}
                  prefix="BDT"
                  precision={2}
                />
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Statistic title="Total Cost" value={formatCurrency(landedCostMutation.data.totalCostBdt)} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Sales Price" value={formatCurrency(landedCostMutation.data.recommendedSalesPriceBdt)} />
                  </Col>
                </Row>
                <Tag color="green">{landedCostMutation.data.marginPercent}% recommended margin</Tag>
              </Space>
            ) : (
              <Typography.Paragraph type="secondary">
                Submit the sample import charges to calculate actual cost per piece and recommended
                sales price.
              </Typography.Paragraph>
            )}
          </Card>
        </Col>
      </Row>

      <Drawer
        size="large"
        open={Boolean(selectedImportId)}
        onClose={() => setSelectedImportId(undefined)}
        title={detail?.poNumber ?? "Import detail"}
      >
        {detailLoading || !detail ? (
          <Skeleton active />
        ) : (
          <Space orientation="vertical" size={18} className="full-width">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Supplier">{detail.supplier}</Descriptions.Item>
              <Descriptions.Item label="Product">{detail.product}</Descriptions.Item>
              <Descriptions.Item label="PI Number">{detail.piNumber}</Descriptions.Item>
              <Descriptions.Item label="LC Number">{detail.lcNumber}</Descriptions.Item>
              <Descriptions.Item label="Bank">{detail.bank}</Descriptions.Item>
              <Descriptions.Item label="BL Number">{detail.blNumber}</Descriptions.Item>
              <Descriptions.Item label="Container">{detail.containerNumber}</Descriptions.Item>
              <Descriptions.Item label="Vessel">{detail.vesselName}</Descriptions.Item>
              <Descriptions.Item label="ETD / ETA">
                {formatDate(detail.etd)} / {formatDate(detail.eta)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Typography.Title level={5}>Uploaded Documents</Typography.Title>
              <Space wrap>
                {detail.documents.map((document) => (
                  <Tag color="blue" key={document}>
                    {document}
                  </Tag>
                ))}
              </Space>
            </div>

            <div>
              <Typography.Title level={5}>Cost Lines</Typography.Title>
              <Table
                size="small"
                pagination={false}
                rowKey="label"
                dataSource={detail.costLines}
                columns={[
                  { title: "Cost", dataIndex: "label" },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    align: "right",
                    render: (value: number) => formatCurrency(value)
                  }
                ]}
              />
            </div>

            <div>
              <Typography.Title level={5}>Operational Notes</Typography.Title>
              <Timeline items={detail.notes.map((note) => ({ content: note }))} />
            </div>
          </Space>
        )}
      </Drawer>

      <Modal
        title={editingImport ? "Edit Import Pipeline" : "New Import Pipeline"}
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        onOk={() => importForm.submit()}
        okText={editingImport ? "Save Changes" : "Create Demo Import"}
        width={760}
      >
        <Form form={importForm} layout="vertical" onFinish={saveImport}>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="poNumber" label="PO Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="product" label="Product" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                <InputNumber min={1} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="valueUsd" label="Value USD" rules={[{ required: true }]}>
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="eta" label="ETA" rules={[{ required: true }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="currentStage" label="Stage" rules={[{ required: true }]}>
                <Select options={importStages.map((stage) => ({ label: stage, value: stage }))} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select
                  options={["On Track", "Attention", "Delayed", "Ready"].map((status) => ({
                    label: status,
                    value: status
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="progress" label="Progress" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} className="full-width" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
