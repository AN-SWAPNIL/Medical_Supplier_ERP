import {
  CameraOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  message
} from "antd";
import type { UploadProps } from "antd";
import PageHeader from "../components/PageHeader";
import { useAuth, type AuthUser } from "../context/AuthContext";
import { roleOptions } from "../context/RoleContext";

type ProfileFormValues = Required<Pick<AuthUser, "name" | "email" | "role">> &
  Pick<AuthUser, "title" | "phone" | "department" | "avatarUrl">;

const defaultAvatar =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm<ProfileFormValues>();

  if (!user) {
    return null;
  }

  const avatarUrl = Form.useWatch("avatarUrl", form) ?? user.avatarUrl ?? defaultAvatar;

  const saveProfile = (values: ProfileFormValues) => {
    updateUser({
      ...user,
      ...values,
      role: user.role
    });
    message.success("Profile settings saved for this demo session.");
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        form.setFieldValue("avatarUrl", String(reader.result));
      };
      reader.readAsDataURL(file);
      return false;
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="User Profile"
        title="Profile & Security Settings"
        subtitle="Edit the signed-in user's profile photo, contact details, department and demo role for permission testing."
        actions={
          <>
            <Tag color="blue">Avatar edit</Tag>
            <Tag color="red">Role-aware access</Tag>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card variant="borderless" className="profile-card">
            <Space orientation="vertical" size={16} className="full-width profile-summary">
              <div className="profile-avatar-wrap">
                <img className="profile-photo" src={avatarUrl} alt={`${user.name} profile`} />
                <Upload {...uploadProps}>
                  <Button icon={<CameraOutlined />}>Change Image</Button>
                </Upload>
              </div>
              <div>
                <Typography.Title level={3}>{user.name}</Typography.Title>
                <Typography.Text type="secondary">{user.title ?? "ERP Demo User"}</Typography.Text>
              </div>
              <div className="profile-chip-grid">
                <span>
                  <IdcardOutlined />
                  {user.role}
                </span>
                <span>
                  <MailOutlined />
                  {user.email}
                </span>
                <span>
                  <PhoneOutlined />
                  {user.phone ?? "+880 1700 000000"}
                </span>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card variant="borderless" title="Edit Profile Settings">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: user.name,
                email: user.email,
                role: user.role,
                title: user.title ?? "Managing Director",
                phone: user.phone ?? "+880 1711 223344",
                department: user.department ?? "Executive Office",
                avatarUrl: user.avatarUrl ?? defaultAvatar
              }}
              onFinish={saveProfile}
            >
              <Row gutter={14}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                    <Select disabled options={roleOptions.map((role) => ({ label: role, value: role }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="title" label="Job Title">
                    <Input prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="department" label="Department">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="avatarUrl" label="Avatar Image URL">
                    <Input prefix={<CameraOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Profile
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="profile-security-card">
            <SafetyCertificateOutlined />
            <strong>Two-Factor Authentication</strong>
            <span>Recommended for production login. Prototype shows readiness state.</span>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="profile-security-card">
            <LockOutlined />
            <strong>Invoice Visibility</strong>
            <span>Sales users see owned customers and invoices only.</span>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="profile-security-card">
            <IdcardOutlined />
            <strong>Audit Identity</strong>
            <span>Role, IP address and action history are captured in security logs.</span>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
