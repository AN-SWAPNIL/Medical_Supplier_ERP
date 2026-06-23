import {
  BarcodeOutlined,
  DeleteOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  PictureOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TagsOutlined,
  UploadOutlined
} from "@ant-design/icons";
import type { UploadProps } from "antd";
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
  Typography,
  Upload
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusTag from "../components/StatusTag";
import { useRole } from "../context/RoleContext";
import { useProducts } from "../services/api";
import type { ProductMaster } from "../shared/schemas";
import { formatCurrency, formatNumber } from "../utils/format";

type ProductFormValues = Omit<ProductMaster, "id"> & Partial<Pick<ProductMaster, "id">>;

const defaultProductImage =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=80";

const categoryOptions = [
  "Hemodialysis",
  "Dialysis Consumable",
  "Dialysis Access",
  "Infusion",
  "Urology",
  "Respiratory",
  "Medical Consumable"
];

const certificateOptions = ["CE", "ISO 13485", "COA", "Free Sale", "DGDA Ready", "Sterile"];

const productManagers = ["Super Admin", "Import Officer", "Warehouse Manager"];

export default function ProductCatalogPage() {
  const productsQuery = useProducts();
  const { role } = useRole();
  const [products, setProducts] = useState<ProductMaster[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm] = Form.useForm<ProductFormValues>();
  const productImageUrl = Form.useWatch("imageUrl", productForm);
  const canManageProducts = productManagers.includes(role);

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data);
    }
  }, [productsQuery.data]);

  const productTotals = useMemo(() => {
    const activeProducts = products.filter((product) => product.status === "Active").length;
    const batchControlled = products.filter((product) => product.batchControlled).length;
    const expiryControlled = products.filter((product) => product.expiryControlled).length;
    const stockValue = products.reduce((sum, product) => sum + product.stockQty * product.purchasePrice, 0);

    return { activeProducts, batchControlled, expiryControlled, stockValue };
  }, [products]);

  const openProductModal = (record?: ProductMaster) => {
    setEditingProduct(record ?? null);
    productForm.setFieldsValue(
      record ?? {
        sku: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
        name: "Demo Medical Consumable",
        category: "Medical Consumable",
        imageUrl: defaultProductImage,
        originCountry: "China",
        supplier: "Demo Certified Supplier",
        batchControlled: true,
        expiryControlled: true,
        certificates: ["CE", "ISO 13485"],
        stockQty: 1000,
        unit: "pcs",
        purchasePrice: 100,
        salesPrice: 135,
        status: "Active",
        riskTag: "Expiry Safe"
      }
    );
    setProductModalOpen(true);
  };

  const saveProduct = (values: ProductFormValues) => {
    if (editingProduct) {
      setProducts((rows) => rows.map((row) => (row.id === editingProduct.id ? { ...editingProduct, ...values } : row)));
    } else {
      setProducts((rows) => [{ ...values, id: `PRD-DEMO-${Date.now()}` } as ProductMaster, ...rows]);
    }
    setProductModalOpen(false);
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        productForm.setFieldValue("imageUrl", String(reader.result));
      };
      reader.readAsDataURL(file);
      return false;
    }
  };

  const productColumns: ColumnsType<ProductMaster> = [
    {
      title: "Product",
      dataIndex: "name",
      fixed: "left",
      render: (value: string, record) => (
        <Space>
          <img className="table-product-thumb" src={record.imageUrl} alt={value} />
          <Space orientation="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.sku}</Typography.Text>
          </Space>
        </Space>
      )
    },
    { title: "Category", dataIndex: "category" },
    { title: "Supplier", dataIndex: "supplier" },
    {
      title: "Controls",
      key: "controls",
      render: (_, record) => (
        <Space wrap size={4}>
          {record.batchControlled && (
            <Tag icon={<BarcodeOutlined />} color="blue">
              Batch
            </Tag>
          )}
          {record.expiryControlled && (
            <Tag icon={<SafetyCertificateOutlined />} color="red">
              Expiry
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: "Certificates",
      dataIndex: "certificates",
      render: (values: string[]) => (
        <Space wrap size={4}>
          {values.map((certificate) => (
            <Tag key={certificate}>{certificate}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: "Stock",
      dataIndex: "stockQty",
      align: "right",
      render: (value: number, record) => `${formatNumber(value)} ${record.unit}`
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
      title: "Status",
      dataIndex: "status",
      render: (value: string) => <StatusTag status={value} />
    },
    ...(canManageProducts
      ? [
          {
            title: "Action",
            key: "action",
            fixed: "right" as const,
            render: (_: unknown, record: ProductMaster) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => openProductModal(record)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this demo product?"
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => setProducts((rows) => rows.filter((row) => row.id !== record.id))}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            )
          }
        ]
      : [])
  ];

  if (productsQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 12 }} />;
  }

  if (productsQuery.error) {
    return <Alert type="error" message="Product catalog could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Product Master"
        title="Medical Consumable Catalog"
        subtitle="Image-backed product master with SKU, certificates, batch/expiry controls, pricing and stock value prepared for backend integration."
        actions={
          <>
            {canManageProducts ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openProductModal()}>
                New Product
              </Button>
            ) : (
              <Tag color="blue">Read-only for {role}</Tag>
            )}
            <Tag color="red">Demo images</Tag>
            <Tag color="blue">Batch signs</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Active Products" value={productTotals.activeProducts} prefix={<MedicineBoxOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card">
            <Statistic title="Batch Controlled" value={productTotals.batchControlled} prefix={<BarcodeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card danger">
            <Statistic title="Expiry Controlled" value={productTotals.expiryControlled} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card variant="borderless" className="summary-card success">
            <Statistic title="Stock Value" value={productTotals.stockValue} prefix="BDT" />
          </Card>
        </Col>
      </Row>

      <Card variant="borderless">
        <Tabs
          items={[
            {
              key: "catalog",
              label: (
                <Space>
                  <PictureOutlined />
                  Catalog Cards
                </Space>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  {products.map((product) => (
                    <Col xs={24} md={12} xl={8} xxl={6} key={product.id}>
                      <Card
                        variant="outlined"
                        className="product-master-card"
                        cover={
                          <div className="product-image-wrap">
                            <img src={product.imageUrl} alt={product.name} />
                            <span>{product.riskTag}</span>
                          </div>
                        }
                      >
                        <Space orientation="vertical" size={12} className="full-width">
                          <div>
                            <Space wrap size={6}>
                              <StatusTag status={product.status} />
                              <Tag color="blue">{product.originCountry}</Tag>
                            </Space>
                            <Typography.Title level={4}>{product.name}</Typography.Title>
                            <Typography.Text type="secondary">
                              {product.sku} / {product.category}
                            </Typography.Text>
                          </div>

                          <div className="product-sign-row">
                            {product.batchControlled && (
                              <Tag icon={<BarcodeOutlined />} color="blue">
                                Batch
                              </Tag>
                            )}
                            {product.expiryControlled && (
                              <Tag icon={<SafetyCertificateOutlined />} color="red">
                                Expiry
                              </Tag>
                            )}
                            {product.certificates.map((certificate) => (
                              <Tag key={certificate}>{certificate}</Tag>
                            ))}
                          </div>

                          <div className="product-price-grid">
                            <span>
                              <small>Stock</small>
                              <strong>
                                {formatNumber(product.stockQty)} {product.unit}
                              </strong>
                            </span>
                            <span>
                              <small>Purchase</small>
                              <strong>{formatCurrency(product.purchasePrice)}</strong>
                            </span>
                            <span>
                              <small>Sales</small>
                              <strong>{formatCurrency(product.salesPrice)}</strong>
                            </span>
                          </div>

                          <Typography.Text type="secondary">{product.supplier}</Typography.Text>

                          {canManageProducts && (
                            <Space wrap>
                              <Button icon={<EditOutlined />} onClick={() => openProductModal(product)}>
                                Edit
                              </Button>
                              <Popconfirm
                                title="Delete this demo product?"
                                okText="Delete"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => setProducts((rows) => rows.filter((row) => row.id !== product.id))}
                              >
                                <Button danger icon={<DeleteOutlined />}>
                                  Delete
                                </Button>
                              </Popconfirm>
                            </Space>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )
            },
            {
              key: "table",
              label: (
                <Space>
                  <TagsOutlined />
                  Master Table
                </Space>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={productColumns}
                  dataSource={products}
                  scroll={{ x: canManageProducts ? 1360 : 1180 }}
                  pagination={false}
                  className="data-table"
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingProduct ? "Edit Product Master" : "Add Demo Product"}
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        onOk={() => productForm.submit()}
        okText={editingProduct ? "Save Changes" : "Create Demo Product"}
        width={960}
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div className="product-form-preview">
              <img src={productImageUrl || defaultProductImage} alt="Product preview" />
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Demo Image</Button>
              </Upload>
              <Typography.Text type="secondary">
                Uploaded images stay in the browser for this demo session only.
              </Typography.Text>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Form form={productForm} layout="vertical" onFinish={saveProduct}>
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                    <Input prefix={<MedicineBoxOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                    <Input prefix={<BarcodeOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                    <Select options={categoryOptions.map((value) => ({ label: value, value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="originCountry" label="Origin Country" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
                    <Input prefix={<PictureOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="batchControlled" label="Batch Control" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { label: "Batch controlled", value: true },
                        { label: "No batch control", value: false }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="expiryControlled" label="Expiry Control" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { label: "Expiry controlled", value: true },
                        { label: "No expiry control", value: false }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="certificates" label="Certificates / Product Signs" rules={[{ required: true }]}>
                    <Select mode="tags" options={certificateOptions.map((value) => ({ label: value, value }))} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="stockQty" label="Stock" rules={[{ required: true }]}>
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="purchasePrice" label="Purchase" rules={[{ required: true }]}>
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="salesPrice" label="Sales" rules={[{ required: true }]}>
                    <InputNumber min={0} className="full-width" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select options={["Active", "Review", "Inactive"].map((value) => ({ label: value, value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="riskTag" label="Shelf / Demand Sign" rules={[{ required: true }]}>
                    <Select
                      options={["Expiry Safe", "Expiry Watch", "High Demand"].map((value) => ({
                        label: value,
                        value
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
