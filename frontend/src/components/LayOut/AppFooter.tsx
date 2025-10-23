import { Layout, Row, Col, Typography, Space } from "antd";
import {
  FacebookFilled,
  TwitterSquareFilled,
  InstagramFilled,
  GithubFilled,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text, Link } = Typography;

export function AppFooter() {
  return (
    <Layout.Footer style={{ background: "#001529", color: "#fff", padding: "50px 80px" }}>
      <Row gutter={[32, 32]}>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
            Class Management App
          </Title>
          <Text style={{ color: "#ccc" }}>
            Because a bright future awaits us. Let's work together.
          </Text>
        </Col>


        <Col xs={12} sm={8} md={6} lg={4}>
          <Title level={5} style={{ color: "#fff" }}>Quick Links</Title>
          <Space direction="vertical">
            <Link href="#" style={{ color: "#bbb" }}>Home</Link>
            <Link href="#" style={{ color: "#bbb" }}>About</Link>
            <Link href="#" style={{ color: "#bbb" }}>Services</Link>
            <Link href="#" style={{ color: "#bbb" }}>Contact</Link>
          </Space>
        </Col>


        <Col xs={12} sm={8} md={6} lg={4}>
          <Title level={5} style={{ color: "#fff" }}>Contact</Title>
          <Space direction="vertical">
            <Text style={{ color: "#bbb" }}><PhoneOutlined style={{ marginRight: 8 }} /> Go Vap HCM City</Text>
            <Text style={{ color: "#bbb" }}> <EnvironmentOutlined style={{ marginRight: 8 }} /> +84 382028892</Text>
            <Text style={{ color: "#bbb" }}><MailOutlined style={{ marginRight: 8 }} /> classmg@gmail.com</Text>
          </Space>
        </Col>

        <Col xs={24} sm={24} md={6} lg={4}>
          <Title level={5} style={{ color: "#fff" }}>Follow Us</Title>
          <Space size="large">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FacebookFilled style={{ fontSize: 22, color: "#1777ff" }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <TwitterSquareFilled style={{ fontSize: 22, color: "#1DA1F2" }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <InstagramFilled style={{ fontSize: 22, color: "#E1306C" }} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <GithubFilled style={{ fontSize: 22, color: "#fff" }} />
            </a>
          </Space>
        </Col>
      </Row>

      <div
        style={{
          borderTop: "1px solid #333",
          marginTop: 40,
          paddingTop: 16,
          textAlign: "center",
          color: "#888",
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </div>
    </Layout.Footer>
  );
}
