import {
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  ContainerOutlined,
  FileProtectOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import PublicTopNav from "../components/PublicTopNav";

const proofCounters = [
  { value: "14+", label: "ERP Modules", caption: "Import, sales, inventory, finance and HR" },
  { value: "7-Step", label: "Import Pipeline", caption: "PI, PO, LC/TT, shipment, customs and GRN" },
  { value: "100%", label: "Batch Traceability", caption: "Batch, LOT, supplier, expiry and BIN mapped" },
  { value: "9 Roles", label: "Permission Model", caption: "Admin, MD, accounts, import, warehouse and sales" }
];

const solutions = [
  {
    title: "China Procurement Control",
    text: "Supplier database, PI approval, purchase order, LC/TT payment, shipment and document tracking.",
    icon: <ContainerOutlined />,
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Medical Batch Warehouse",
    text: "GRN, BIN location, stock in/out, physical count, batch number, LOT and expiry alert management.",
    icon: <MedicineBoxOutlined />,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Hospital Sales & CRM",
    text: "Quotation, sales order, delivery challan, invoice, return, collection and customer visit history.",
    icon: <ShoppingCartOutlined />,
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Finance & Audit Control",
    text: "Cash book, bank book, general ledger, voucher posting, receivable/payable and secured audit log.",
    icon: <BankOutlined />,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80"
  }
];

const products = [
  {
    name: "Dialyzer",
    sign: "CE / COA",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Blood Line",
    sign: "Batch",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "AV Fistula Needle",
    sign: "Sterile",
    image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Foley Catheter",
    sign: "Expiry",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "IV Set",
    sign: "ISO",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Burette Set",
    sign: "DGDA",
    image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "ET Tube",
    sign: "LOT",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Medical Consumables",
    sign: "Stock",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=500&q=80"
  }
];

const projectCards = [
  {
    title: "Import Pipeline Ready",
    metric: "USD 1.15M",
    caption: "Active procurement value tracked through customs and warehouse receiving"
  },
  {
    title: "Hospital Channel",
    metric: "126",
    caption: "Hospitals, clinics, dealers and pharmacies organized by territory"
  },
  {
    title: "Stock Safety",
    metric: "6/3/1",
    caption: "Expiry alerts at six months, three months and one month"
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="public-page">
      <PublicTopNav />

      <main id="home">
        <section className="landing-hero">
          <div className="landing-hero-overlay" />
          <div className="landing-hero-content">
            <Tag color="red">Medical Import & Distribution ERP</Tag>
            <Typography.Title>
              Enterprise software for China procurement, customs, warehouse and hospital sales.
            </Typography.Title>
            <Typography.Paragraph>
              A high-credibility ERP prototype for medical device importers handling dialyzer,
              blood line, IV set, catheter and disposable consumable distribution.
            </Typography.Paragraph>
            <Space wrap size={12}>
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate("/signin")}>
                Enter Role-Based Demo
              </Button>
              <Button size="large" onClick={() => navigate("/#solutions")}>
                Explore Modules
              </Button>
            </Space>
          </div>
          <div className="landing-hero-panel">
            <div className="panel-title">
              <CloudServerOutlined />
              Live ERP Control Board
            </div>
            <div className="panel-count-grid">
              <span>
                <strong>BDT 48M</strong>
                Monthly Sales
              </span>
              <span>
                <strong>143K</strong>
                Stock Units
              </span>
              <span>
                <strong>22.7M</strong>
                Bank Balance
              </span>
              <span>
                <strong>1,842</strong>
                Audit Events
              </span>
            </div>
          </div>
        </section>

        <section className="landing-section counter-band">
          {proofCounters.map((counter) => (
            <div className="counter-item" key={counter.label}>
              <strong>{counter.value}</strong>
              <span>{counter.label}</span>
              <p>{counter.caption}</p>
            </div>
          ))}
        </section>

        <section className="landing-section split-intro">
          <div>
            <Tag color="blue">Based on the ERP plan</Tag>
            <Typography.Title level={2}>A prototype that follows the complete medical supplier flow.</Typography.Title>
            <Typography.Paragraph>
              Supplier inquiry flows into PI approval, purchase order, LC/TT payment, production
              follow-up, shipment, customs clearance, GRN, stock availability, sales, collection and
              accounts closing.
            </Typography.Paragraph>
          </div>
          <div className="flow-strip">
            {["Inquiry", "PI", "PO", "LC/TT", "Shipment", "Customs", "GRN", "Invoice"].map((step, index) => (
              <span key={step}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {step}
              </span>
            ))}
          </div>
        </section>

        <section className="landing-section" id="solutions">
          <div className="section-heading">
            <Tag color="red">Solutions</Tag>
            <Typography.Title level={2}>Operational modules for importer and supplier control</Typography.Title>
          </div>
          <Row gutter={[18, 18]}>
            {solutions.map((solution) => (
              <Col xs={24} md={12} xl={6} key={solution.title}>
                <Card
                  className="solution-card"
                  cover={<img src={solution.image} alt={solution.title} />}
                >
                  <div className="solution-icon">{solution.icon}</div>
                  <Typography.Title level={4}>{solution.title}</Typography.Title>
                  <Typography.Paragraph>{solution.text}</Typography.Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="landing-section product-section" id="products">
          <div className="section-heading compact">
            <Tag color="blue">Product Tracking</Tag>
            <Typography.Title level={2}>Medical consumables supported in the prototype</Typography.Title>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <div className="product-pill" key={product.name}>
                <img src={product.image} alt={product.name} />
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.sign}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section proof-layout" id="projects">
          <div className="factory-image-panel">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1100&q=80"
              alt="Modern distribution warehouse"
            />
          </div>
          <div className="project-proof">
            <Tag color="red">Project References</Tag>
            <Typography.Title level={2}>Designed to win confidence in the first client demo.</Typography.Title>
            <div className="project-card-list">
              {projectCards.map((card) => (
                <Card key={card.title} variant="borderless">
                  <strong>{card.metric}</strong>
                  <span>{card.title}</span>
                  <p>{card.caption}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section certificate-band">
          <div>
            <SafetyCertificateOutlined />
            <span>Role Based Access</span>
          </div>
          <div>
            <FileProtectOutlined />
            <span>Daily Backup Ready</span>
          </div>
          <div>
            <CheckCircleOutlined />
            <span>Invoice Visibility Rules</span>
          </div>
          <div>
            <ClockCircleOutlined />
            <span>Audit Log Trail</span>
          </div>
          <div>
            <TeamOutlined />
            <span>Sales Team Mobile Scope</span>
          </div>
        </section>

        <section className="landing-section news-grid" id="contact">
          <Card variant="borderless">
            <Tag color="blue">Demo News</Tag>
            <Typography.Title level={4}>Import dashboard highlights LC/TT delays before shipment.</Typography.Title>
            <Typography.Paragraph>
              Managers can inspect delayed PI, payment and shipment stages before stock-out risk.
            </Typography.Paragraph>
          </Card>
          <Card variant="borderless">
            <Tag color="red">Warehouse Update</Tag>
            <Typography.Title level={4}>Expiry alerts support six, three and one month control windows.</Typography.Title>
            <Typography.Paragraph>
              Batch-level expiry rules are visible from the dashboard and warehouse module.
            </Typography.Paragraph>
          </Card>
          <Card variant="borderless" className="cta-card">
            <Typography.Title level={4}>Ready to review the ERP prototype?</Typography.Title>
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate("/signin")}>
              Open Sign In
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
}
