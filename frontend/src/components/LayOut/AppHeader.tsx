import { BellOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Badge, Dropdown, Layout, Menu, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/ThemeContext";
import { useNotification } from "../../hooks/notificationMessage";



interface HeaderProps{
    role:'student'|'instructor',
    userName:string,
}

export function AppHeader({role,userName}:HeaderProps){
    const { notifications, unreadCount, clearNotifications } = useNotification();
    const navigate = useNavigate();
    const {clearAuth} =  useAuth();
    
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

    const avatarMenu = [
        {
        key: "logout",
        label: "Log out",
        icon: <LogoutOutlined />,
        onClick: () => {
            console.log("User logged out");
            localStorage.removeItem('phoneNumber');
            clearAuth();
            navigate("/");
        },
        },
    ];

    const menu = [
        ...(notifications.length === 0 ? [
            {
                key:"empty",
                label:"Không có thông báo"
            },
        ] : notifications.map((n,index)=>({
            key:n.id ?? index.toString(),
            label: (
                <div><strong>{n.senderName} : </strong>{n.message}</div>
            ),
        }))),
        {type:"divider" as const},
        {
            key:"clear",
            label:"Xóa tất cả",
            onClick:clearNotifications,
        },
    ];

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
            <Dropdown menu={{items:menu}} trigger={["click"]}>
                <Badge count={unreadCount} size="small" offset={[0,6]}>
                <BellOutlined
                    style={{ fontSize: 20, color: "#fff", marginRight: 20 }}
                />
                </Badge>
            </Dropdown>

            <Dropdown menu={{ items: avatarMenu }} placement="bottomRight" trigger={["click"]} arrow>
                <Tooltip title={userName}>
                    <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{ cursor: "pointer" }}
                    />
                </Tooltip>
            </Dropdown>
        </Layout.Header>
        </>
    )
}