import { Space, Tag, Typography } from "antd";
import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <section className="page-heading">
      <div>
        <Tag color="red">{eyebrow}</Tag>
        <Typography.Title level={1}>{title}</Typography.Title>
        <Typography.Paragraph>{subtitle}</Typography.Paragraph>
      </div>
      {actions ? <Space wrap>{actions}</Space> : null}
    </section>
  );
}
