/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { Form, Input, Button } from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useOpenNotification } from "../../hooks/Notification/notification";
import { useAuth } from "../../hooks/ThemeContext";
import { useAuthRole } from "../../hooks/useAuth";

export default function StudentLogin() {
  const [form] = Form.useForm();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const { openNotification, contextHolder } = useOpenNotification();
  const {setAuth} = useAuth();
  const {validateAccessCode} = useAuthRole();

  const handleLogin = async (values: { code: string; password: string }) => {
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      toast.error("Vui lòng xác nhận captcha");
      return;
    }

    try {
      const res = await api.post(`${import.meta.env.VITE_BACKEND_URL}`, { ...values, recaptchaToken: token });
      if (res.data.success) {
        localStorage.setItem("phoneNumber",res.data.phoneNumber);
        localStorage.setItem("token",res.data.token);
        openNotification('success','Đăng nhập thành công');
        setAuth(res.data.typeUser, res.data.userName,res.data.id);
        setTimeout(()=>{
            validateAccessCode(res.data.typeUser);
        },1000)
      } else{
        openNotification('error','Login thất bại!!!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login thất bại");
      recaptchaRef.current?.reset(); // reset captcha nếu login fail
    }
  };

  return (
    <>
        {contextHolder}
        <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
        {/* Background ảnh */}
        <div className="absolute inset-0">
            <img
            src="/background-2-9.jpg"
            alt="background"
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        </div>

        {/* Form login */}
        <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center gap-2 mb-6">
            <p className="font-medium text-gray-800 text-3xl">Welcome</p>
            <p className="uppercase text-gray-800 font-medium text-lg">Login</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item name="code" label="Mã số sinh viên" rules={[{ required: true }]}>
                <Input placeholder="Nhập mã số sinh viên" />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            />

            <Button type="primary" className="w-full mt-4" onClick={() => form.submit()}>
                Login
            </Button>
            </Form>

            {/* Lựa chọn đăng nhập khác */}
            <div className="mt-4 text-center">
            <Button
                type="link"
                onClick={() => navigate("/login")} // đường dẫn sang trang Login Email/SMS
            >
                Đăng nhập bằng Email/SMS
            </Button>

            <p className="uppercase text-gray-700 text-sm font-medium underline cursor-pointer text-center mt-4">
              <Link to="/forgetpassword" className="underline text-gray-700 text-sm font-medium">
                  Quên mật khẩu?
              </Link>
            </p>
            
            </div>
        </div>
        </div>
    </>
  );
}


