import { BellOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Badge, Layout, Menu, Tooltip } from "antd"


interface HeaderProps{
    role:'student'|'instructor',
    userName:string,
    selectKey:string,
    onSelectKey:(key:string) => void
}

export function AppHeader({role,userName,selectKey,onSelectKey}:HeaderProps){

    
const menuConfig:Record<"student"|"instructor",{key:string,label:string}[]> = {
    student:[
        {key:'1',label:"Danh sách bài học"},
        {key:'2',label:"Message"},
        {key:'3', label:"Tài khoản"}
    ],
    instructor:[
        {key:'1',label:"Danh sách sinh viên"},
        {key:'2',label:"Message"}
    ]

}

    return (
        <>
        <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
            <div className="demo-logo" />
            <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectKey]}
            items={menuConfig[role]}
            style={{ flex: 1, minWidth: 0 }}
            onClick={(e) => onSelectKey(e.key)}
            />
            {/* Icon chuông thông báo */}
            <Badge count={5} size="small">
            <BellOutlined
                style={{ fontSize: 20, color: "#fff", marginRight: 20 }}
            />
            </Badge>

            {/* Avatar + tooltip hiển thị tên */}
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