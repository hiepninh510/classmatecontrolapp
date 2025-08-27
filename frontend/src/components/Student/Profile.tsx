import { useEffect, useState } from "react";
import { Card, Input, Button, Avatar } from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import {useOpenNotification} from '../../hooks/notification.tsx'

interface Profile{
    phoneNumber:string,
    name:string,
    email:string,
    avatar:string
}
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
  name: "",
  email: "",
  phoneNumber: "",
  avatar: ""
});

    const { openNotification, contextHolder } = useOpenNotification();

  const [editing, setEditing] = useState<{[key:string]: boolean}>({
    name: false,
    email: false,
    phoneNumber: false,
  });

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  useEffect(()=>{
    const fetchProfile = async()=>{
        try {
            console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
            const phoneNumber = localStorage.getItem("phoneNumber");
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/${phoneNumber}`);
            const formatProfile = {
                name:res.data.data.name,
                phoneNumber:res.data.data.phoneNumber,
                email:res.data.data.email,
                avatar: "https://i.pravatar.cc/150?img=3"
            }
            setProfile(formatProfile);
        } catch (error) {
             console.error("Lỗi khi fetch lessons:", error);
        }
    }
    fetchProfile();
  },[])

  const handleEditToggle = (field: string) => {
    setEditing({ ...editing, [field]: !editing[field] });
  };

  const handleUpdate = async () => {
    try {
        const updateProfile = {
            phoneNumber:profile.phoneNumber,
            name:profile.name,
            email:profile.email
        }
        const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/student/editProfile`,updateProfile);
        if(res.data.success) openNotification("success","Cập nhật thành công!");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <>
        {contextHolder}
        <div className="w-full h-screen flex justify-center items-start p-10 bg-gray-50">
        <Card className="w-[700px] shadow-xl rounded-xl">
            <div className="flex items-center gap-6 mb-8">
            <Avatar src={profile?.avatar||"#"} size={120} />

            <div>
                {editing.name ? (
                <Input
                    value={profile?.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onPressEnter={() => handleEditToggle("name")}
                />
                ) : (
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
                )}
                <Button
                type="link"
                icon={editing.name ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => handleEditToggle("name")}
                >
                {editing.name ? "Save" : "Edit"}
                </Button>
            </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold"><MailOutlined/> Email:</span>
            {editing.email ? (
                <Input
                value={profile?.email}
                onChange={(e) => handleChange("email", e.target.value)}
                />
            ) : (
                <span>{profile?.email}</span>
            )}
            <Button
                type="link"
                icon={editing.email ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => handleEditToggle("email")}
            >
                {editing.email ? "Save" : "Edit"}
            </Button>
            </div>


            <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold"><PhoneOutlined/> Phone:</span>
            {editing.phone ? (
                <Input
                value={profile?.phoneNumber}
                onChange={(e) => handleChange("phone", e.target.value)}
                />
            ) : (
                <span>{profile?.phoneNumber}</span>
            )}
            <Button
                type="link"
                icon={editing.phoneNumber ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => handleEditToggle("phone")}
            >
                {editing.phoneNumber ? "Save" : "Edit"}
            </Button>
            </div>


            <div className="flex justify-end mt-8">
            <Button type="primary" onClick={handleUpdate}>
                Cập nhật
            </Button>
            </div>
        </Card>
        </div>
    </>
  );
}
