import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Statistic, Tag, Typography } from "antd";
import { formatCurrency, formatNumber } from "../utils/format";

type MetricCardProps = {
  label: string;
  value: number;
  unit: string;
  delta: number;
  intent: "sales" | "stock" | "cash" | "risk" | "profit";
};

const intentClass = {
  sales: "metric-sales",
  stock: "metric-stock",
  cash: "metric-cash",
  risk: "metric-risk",
  profit: "metric-profit"
};

export default function MetricCard({ label, value, unit, delta, intent }: MetricCardProps) {
  const formattedValue = unit === "BDT" ? formatCurrency(value, true) : formatNumber(value);
  const deltaPositive = delta >= 0;

  return (
    <Card className={`metric-card ${intentClass[intent]}`} variant="borderless">
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Statistic value={formattedValue} styles={{ content: { fontSize: 26 } }} />
      <div className="metric-footer">
        <Tag color={deltaPositive ? "green" : "red"} icon={deltaPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {Math.abs(delta).toFixed(1)}%
        </Tag>
        <span>{unit}</span>
      </div>
    </Card>
  );
}
