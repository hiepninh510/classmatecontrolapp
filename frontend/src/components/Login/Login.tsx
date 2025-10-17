import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import api from '../../api/api.tsx'
import { toast } from "react-toastify";
// import { toast } from "react-toastify";
// import { login, register } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuthRole } from "../../hooks/useAuth.tsx";
import {useOpenNotification} from '../../hooks/Notification/notification.tsx'

export default function Login() {
    const [form] = useForm();
    const navigate = useNavigate();
    const {isEmail,isPhoneNumber} = useAuthRole();
    const { openNotification, contextHolder } = useOpenNotification();


//   // Xử lý Login
  const handleSubmit = async (values: { phoneNumber: string;}) => {
    try {
        let endpoint ="";
       if(isPhoneNumber(values.phoneNumber))  endpoint = `${import.meta.env.VITE_BACKEND_URL}/login`;
        else if(isEmail(values.phoneNumber)) endpoint = `${import.meta.env.VITE_BACKEND_URL}/student/loginEmail`;
        else{
            openNotification("warning","Nhập số điện thoại hoặc email");
            return;
        }
        const res = await api.post(endpoint,values);
      if (res.status === 200) {
        localStorage.setItem("phoneNumber", res.data.phoneNumber);
        navigate("/validateAccessCode",{state:{phoneNumber:values.phoneNumber}});
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
    }
  };


return (
    <>
    {contextHolder}
  <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0">
      <img
        src="/background-2-9.jpg"
        alt="background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
    </div>

    <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
      <div className="flex flex-col items-center gap-2 mb-6">
        <p className="font-medium text-gray-800 text-3xl">Welcome</p>
        <p className="uppercase text-gray-800 font-medium text-lg">Login</p>
      </div>

      {/* Form */}
      <Form className="w-full" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="phoneNumber"
          rules={[{ required: true, type: "string", message: "Vui lòng nhập tài khoản" }]}
          style={{ marginBottom: "6px" }}
        >
          <Input placeholder="Tài khoản" />
        </Form.Item>

      </Form>

      {/* Buttons */}
      <div className="flex gap-2 w-full mt-4">
        <Button
          className="uppercase font-medium bg-[#ED8A21] flex-1"
          type="primary"
          onClick={() => form.submit()}
        >
          Login
        </Button>
      </div>

      <p className="uppercase text-gray-700 text-sm font-medium underline cursor-pointer text-center mt-4">
        <Link to="/forgetpassword" className="underline text-gray-700 text-sm font-medium">
            Quên mật khẩu?
        </Link>
      </p>
    </div>


  </div>
    </>
);




}
