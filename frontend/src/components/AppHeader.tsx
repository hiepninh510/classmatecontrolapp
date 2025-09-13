import { BellOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Badge, Layout, Menu, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"


interface HeaderProps{
    role:'student'|'instructor',
    userName:string,
}

export function AppHeader({role,userName}:HeaderProps){

    const navigate = useNavigate();

    
const menuConfig:Record<"student"|"instructor",{key:string,label:string,path:string}[]> = {
    student:[
        {key:'1',label:"Danh sách bài học",path:"/student/dashboard"},
        {key:'2',label:"Message",path:"/student/messages"},
        {key:'3', label:"Tài khoản",path:"/student/profile"}
    ],
    instructor:[
        {key:'1',label:"Danh sách sinh viên",path:"/instructor/dashboard"},
        {key:'2',label:"Message",path:"/instructor/messages"}
    ]

}

const currentKey = menuConfig[role].find((item)=>location.pathname.startsWith(item.path))?.key||'1';

    return (
        <>
        <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="demo-logo" />
            <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentKey]}
            items={menuConfig[role].map((item) => ({
                key: item.key,
                label: item.label,
                onClick: () => navigate(item.path)}))}
            style={{ flex: 1, minWidth: 0 }}
            />
            {/* Icon chuông thông báo */}
            <Badge count={5} size="small">
            <BellOutlined
                style={{ fontSize: 20, color: "#fff", marginRight: 20 }}
            />
            </Badge>

            <Tooltip title={userName}>
            <Avatar
                size="large"
                icon={<UserOutlined />}
                style={{ cursor: "pointer" }}
            />
            </Tooltip>
        </Layout.Header>
        </>
    )
}