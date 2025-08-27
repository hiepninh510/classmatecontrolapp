import { Avatar, Badge, Layout, Menu, theme, Tooltip } from 'antd';
import { useState } from 'react';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import ListStudent from "./ListStudent.tsx"
import MessageWithStudent from './Message.tsx';


export default function DashboardInstructor(){

const { Header, Content, Footer } = Layout;
const [selectKey, setSelectKey] = useState('1');

const items = [
  {key:'1', label:"Danh sách bài học"},
  {key:'2', label:"Message"},
]

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const renderCOntext = ()=>{
    switch(selectKey){
      case "1":
        return (<><ListStudent/></>)
      case "2":
        return(<><MessageWithStudent/></>)
    }
  }

    return (
        <>
      <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectKey]}
          items={items}
          style={{ flex: 1, minWidth: 0 }}
          onClick={(e) => setSelectKey(e.key)}
        />
         {/* Icon chuông thông báo */}
        <Badge count={5} size="small">
          <BellOutlined
            style={{ fontSize: 20, color: "#fff", marginRight: 20 }}
          />
        </Badge>

        {/* Avatar + tooltip hiển thị tên */}
        <Tooltip title="Nguyễn Văn A">
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{ cursor: "pointer" }}
          />
        </Tooltip>
      </Header>
      <Content style={{ padding: '0 48px' }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderCOntext()}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
        </>
    )
}