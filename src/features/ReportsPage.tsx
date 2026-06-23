import { DownloadOutlined, FileTextOutlined, PrinterOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import { Alert, Button, Card, Col, Row, Segmented, Skeleton, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useReportsSummary } from "../services/api";
import { formatCurrency } from "../utils/format";

type ReportScope = "daily" | "weekly" | "monthly";

type ReportRow = {
  report: string;
  value: string;
  status: string;
};

export default function ReportsPage() {
  const [scope, setScope] = useState<ReportScope>("daily");
  const { data, isLoading, error } = useReportsSummary();

  const columns: ColumnsType<ReportRow> = [
    {
      title: "Report",
      dataIndex: "report",
      render: (value: string) => (
        <Space>
          <FileTextOutlined />
          <Typography.Text strong>{value}</Typography.Text>
        </Space>
      )
    },
    { title: "Value", dataIndex: "value" },
    { title: "Status", dataIndex: "status", render: (value: string) => <StatusTag status={value} /> },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button icon={<PrinterOutlined />}>Print</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      )
    }
  ];

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (error || !data) {
    return <Alert type="error" message="Reports data could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Reports & Dashboard"
        title="Daily, Weekly and Monthly Management Reports"
        subtitle="A reporting library for sales, collection, stock, expense, cash flow, inventory valuation and territory performance."
        actions={
          <>
            <Tag color="blue">P&L</Tag>
            <Tag color="red">Inventory valuation</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card
            variant="borderless"
            title="Report Library"
            extra={
              <Segmented
                value={scope}
                onChange={(value) => setScope(value as ReportScope)}
                options={[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" }
                ]}
              />
            }
          >
            <Table
              rowKey="report"
              columns={columns}
              dataSource={data[scope]}
              pagination={false}
              scroll={{ x: 760 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card variant="borderless" title="Report Packs">
            <Space orientation="vertical" size={12} className="full-width">
              <div className="report-pack">
                <strong>Daily Pack</strong>
                <span>Sales, collection, stock and delivery status</span>
              </div>
              <div className="report-pack">
                <strong>Weekly Pack</strong>
                <span>Sales summary, expense summary and collection follow-up</span>
              </div>
              <div className="report-pack">
                <strong>Monthly Pack</strong>
                <span>P&L, balance sheet, cash flow and inventory valuation</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" title="Sales by Territory">
        <Column
          height={340}
          data={data.territorySales}
          xField="territory"
          yField="sales"
          colorField="territory"
          axis={{ y: { labelFormatter: (value: number) => formatCurrency(value, true) } }}
          tooltip={{ items: [{ field: "sales", valueFormatter: (value: number) => formatCurrency(value) }] }}
        />
      </Card>
    </div>
  );
}
