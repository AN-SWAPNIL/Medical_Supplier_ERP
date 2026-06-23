import {
  Alert,
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography
} from "antd";
import { Column, Line, Pie } from "@ant-design/plots";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import { StatusBadge } from "../components/StatusTag";
import { useRole } from "../context/RoleContext";
import { useDashboardSummary } from "../services/api";
import { formatCurrency, formatNumber, formatUsd } from "../utils/format";

const processSteps = [
  "Supplier Inquiry",
  "PI Approval",
  "PO",
  "LC / TT",
  "Shipment",
  "Customs",
  "Warehouse"
];

export default function DashboardPage() {
  const { role } = useRole();
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 14 }} />;
  }

  if (error || !data) {
    return <Alert type="error" message="Dashboard data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Executive Control"
        title="Medical Import & Distribution ERP"
        subtitle="A decision dashboard for China procurement, customs clearance, batch-safe warehousing, hospital sales and cash control."
        actions={
          <>
            <Tag color="red">China + Overseas Procurement</Tag>
            <Tag color="blue">Batch and Expiry Traceability</Tag>
          </>
        }
      />

      <section className="industrial-hero">
        <div>
          <Typography.Text className="hero-kicker">Prototype command center</Typography.Text>
          <Typography.Title level={2}>From supplier PI to hospital invoice, every step is visible.</Typography.Title>
          <Typography.Paragraph>
            Built for importers that need LC/TT tracking, shipment documents, landed-cost control and
            real-time stock movement in one operating surface.
          </Typography.Paragraph>
        </div>
        <div className="hero-process">
          <Steps
            size="small"
            current={4}
            orientation="vertical"
            items={processSteps.map((title) => ({ title }))}
          />
        </div>
      </section>

      <Row gutter={[16, 16]}>
        {data.metrics.map((metric) => (
          <Col xs={24} sm={12} xl={8} xxl={4} key={metric.label}>
            <MetricCard {...metric} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {data.trustMetrics.map((metric) => (
          <Col xs={24} sm={12} xl={6} key={metric.label}>
            <Card className="proof-card" variant="borderless">
              <Typography.Text type="secondary">{metric.label}</Typography.Text>
              <strong>{metric.value}</strong>
              <span>{metric.caption}</span>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card title="Sales and Collection Trend" variant="borderless">
            <Line
              height={280}
              data={data.salesTrend.flatMap((item) => [
                { month: item.month, type: "Sales", value: item.sales },
                { month: item.month, type: "Collection", value: item.collection }
              ])}
              xField="month"
              yField="value"
              colorField="type"
              axis={{ y: { labelFormatter: (value: number) => formatCurrency(value, true) } }}
              tooltip={{ items: [{ field: "value", valueFormatter: (value: number) => formatCurrency(value) }] }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="Product Sales Mix" variant="borderless">
            <Pie
              height={280}
              data={data.productMix}
              angleField="value"
              colorField="product"
              radius={0.82}
              label={{ text: "product", position: "outside" }}
              legend={{ color: { position: "bottom" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Import Pipeline Value" variant="borderless">
            <Column
              height={270}
              data={data.pipelineStages}
              xField="stage"
              yField="valueUsd"
              colorField="stage"
              axis={{ y: { labelFormatter: (value: number) => formatUsd(value) } }}
              tooltip={{ items: [{ field: "valueUsd", valueFormatter: (value: number) => formatUsd(value) }] }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Expiry Risk Board" variant="borderless">
            <div className="expiry-list">
              {data.expiryAlerts.map((item) => (
                <div className="expiry-row" key={item.batch}>
                  <div>
                    <Space wrap>
                      <span>{item.product}</span>
                      <StatusBadge status={item.severity === "critical" ? "Critical" : item.severity === "warning" ? "Warning" : "Normal"} />
                    </Space>
                    <Typography.Text type="secondary">
                      {item.batch} - {formatNumber(item.quantity)} pcs - {item.daysLeft} days left
                    </Typography.Text>
                  </div>
                  <Progress
                    type="circle"
                    size={50}
                    percent={Math.max(5, Math.min(100, Math.round((item.daysLeft / 180) * 100)))}
                    strokeColor={item.severity === "critical" ? "#b5121b" : item.severity === "warning" ? "#b87912" : "#2b7a4b"}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="role-note-card">
        <Space orientation="vertical" size={4}>
          <Typography.Text type="secondary">Active permission lens</Typography.Text>
          <Typography.Title level={4}>{role}</Typography.Title>
          <Typography.Paragraph>{data.roleNotes[role]}</Typography.Paragraph>
        </Space>
      </Card>
    </div>
  );
}
