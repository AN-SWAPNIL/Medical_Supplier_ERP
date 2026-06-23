import { Badge, Tag } from "antd";

type StatusTagProps = {
  status: string;
};

const statusColor: Record<string, string> = {
  "On Track": "blue",
  Attention: "gold",
  Delayed: "red",
  Ready: "green",
  Critical: "red",
  Warning: "gold",
  Normal: "green",
  Quotation: "purple",
  "Sales Order": "blue",
  Delivered: "cyan",
  Invoiced: "orange",
  Collected: "green",
  Draft: "default",
  Approved: "blue",
  Posted: "green",
  Info: "blue",
  Active: "green",
  Review: "gold",
  Inactive: "default"
};

export default function StatusTag({ status }: StatusTagProps) {
  return <Tag color={statusColor[status] ?? "default"}>{status}</Tag>;
}

export function StatusBadge({ status }: StatusTagProps) {
  const badgeStatus = status === "Critical" || status === "Delayed" ? "error" : status === "Warning" || status === "Attention" ? "warning" : "success";
  return <Badge status={badgeStatus} text={status} />;
}
