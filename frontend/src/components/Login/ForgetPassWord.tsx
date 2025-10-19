/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Form, Input, Button } from "antd";
import api from "../../api/api";
import { useOpenNotification } from "../../hooks/Notification/notification";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [form] = Form.useForm();
  const { openNotification, contextHolder } = useOpenNotification();
  const navigate = useNavigate();


  const handleSendEmail = async (values: { email: string }) => {
    try {
      const res = await api.post(`${import.meta.env.VITE_BACKEND_URL}/forgot-password`, values);
      if (res.status === 200) {
        setEmail(values.email);
        setStep(2);
        setTimeLeft(60);
        openNotification("success", "Mã xác nhận đã được gửi đến email của bạn");
      }
    } catch (error: any) {
      openNotification("error", error.response?.data?.message);
    }
  };


  const handleVerifyCode = async (values: { code: string }) => {
    try {
      const res = await api.post(`${import.meta.env.VITE_BACKEND_URL}/forgetPassWord`, {
        email,
        accessCode: values.code,
      });
      if (res.status === 200) {
        setStep(3);
        openNotification("success", "Mã xác thực hợp lệ, vui lòng đặt lại mật khẩu");
      }
    } catch (error: any) {
      openNotification("error", error.response?.data?.message);
    }
  };


  const handleResetPassword = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      openNotification("warning", "Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      const res = await api.put(`${import.meta.env.VITE_BACKEND_URL}/changePassWord`, {
        email,
        password: values.password,
      });
      if (res.status === 200) {
        const data = {
          type:"update",
          email,
          message:"Bạn vừa cập nhật mật khẩu mới"
        }
        const res = await api.post(`${import.meta.env.VITE_BACKEND_URL}/notification/createNotificationFromAdmin`,data);
        if(res.status === 200){
          openNotification("success", "Đổi mật khẩu thành công!");
          navigate("/");
        }
      }
    } catch (error: any) {
      openNotification("error", error.response?.data?.message);
    }
  };

  useEffect(() => {
    if (step !== 2) return;

    if (timeLeft <= 0) {
      (async () => {
        try {
          await api.delete(`${import.meta.env.VITE_BACKEND_URL}/deleteAccode`,  {data: { email },} );
          openNotification("warning", "Mã xác nhận đã hết hạn, vui lòng yêu cầu mã mới");
          setStep(1);
          form.resetFields();
        } catch(error:any) {
          openNotification("error", error.response.data.message);
        }
      })();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, step, email, openNotification, form]);

  // Format thời gian 60s → mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {contextHolder}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {step === 1 && "Quên mật khẩu"}
          {step === 2 && "Nhập mã xác nhận"}
          {step === 3 && "Đặt lại mật khẩu"}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <Form form={form} onFinish={handleSendEmail}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email của bạn" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Gửi mã xác nhận
            </Button>
          </Form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p className="text-center text-gray-600 mb-3">
              Mã sẽ hết hạn sau:{" "}
              <span className="text-red-500 font-semibold">{formatTime(timeLeft)}</span>
            </p>
            <Form form={form} onFinish={handleVerifyCode}>
              <Form.Item
                name="code"
                rules={[{ required: true, message: "Vui lòng nhập mã xác nhận" }]}
              >
                <Input placeholder="Nhập mã xác nhận" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Xác nhận
              </Button>
              <Button type="link" className="w-full mt-2" onClick={() => setStep(1)}>
                Quay lại nhập email
              </Button>
            </Form>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Form form={form} onFinish={handleResetPassword}>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: "Nhập lại mật khẩu" }]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Xác nhận đổi mật khẩu
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
