import { BellOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Badge, Dropdown, Layout, Menu, Tooltip } from "antd"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/ThemeContext";
import { useNotification } from "../../hooks/Notification/notificationMessage";



interface HeaderProps{
    role:'student'|'instructor',
    userName:string,
}

export function AppHeader({role,userName}:HeaderProps){
    const { notifications, unreadCount, clearNotifications,handleRead,handleDeleteOneNotifiction, markAllNotification } = useNotification();
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
                <div 
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        position: "relative",
                        cursor: "pointer",
                    }}
                >
                    <div 
                    onClick={()=>handleRead(n.id ?? index.toString())} 
                     style={{ flex: 1, zIndex: 1 }}
                    >
                        {!n.isRead && (
                            <div style={{
                                position:"absolute",
                                inset:0,
                                backgroundColor: "rgba(53, 64, 214, 0.2)",
                                borderRadius: 4,
                                pointerEvents: "none",
                                }}
                            />
                            )}
                        <div style={{ position: "relative" }}><strong>{n.senderName} : </strong>{n.message} </div> 
                        </div>
                        <CloseOutlined
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOneNotifiction(n.id ?? index.toString());
                            }}
                            style={{
                                marginLeft: 8,
                                color:"red",
                                opacity:0,
                                transition:"opacity 0.2s",
                            }}
                            className="delete-icon"
                        />
                        <style>
                            {`
                            .ant-dropdown-menu-item:hover .delete-icon {
                                opacity: 1 !important;
                            }
                            `}
                        </style>
                    </div>
            ),
        }))),
        {type:"divider" as const},
        {
            key:"=actions",
            label:(
                <div 
                    style={{
                        display:"flex",
                        justifyContent:"space-between",
                        alignItems:"center",
                        width:"auto"
                    }}
                >
                    <span 
                        onClick={clearNotifications}
                        style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <DeleteOutlined /> Xóa tất cả
                    </span>

                    <span 
                        onClick={markAllNotification}
                        style={{ color: "#1677ff", cursor: "pointer", fontSize: 13 }}>
                        <CheckOutlined/>Đánh dấu đã đọc
                    </span>

                </div>
            ),
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
            <Dropdown menu={{items:menu}} trigger={["click"]} placement="bottomRight" arrow>
                <Badge count={unreadCount} size="small" offset={[-6,0]}>
                <BellOutlined
                    style={{ fontSize: 20, color: "#fff", marginRight: 20, cursor: "pointer"}}
                />
                </Badge>
            </Dropdown>

            <Tooltip title={userName} placement="top">
                <Dropdown
                    menu={{ items: avatarMenu }}
                    placement="bottomRight"
                    trigger={["click"]}
                    arrow
                >
                    <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{ cursor: "pointer" }}
                    />
                </Dropdown>
            </Tooltip>
        </Layout.Header>
        </>
    )
}