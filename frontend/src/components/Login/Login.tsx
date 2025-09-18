import { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { FaUserEdit } from "react-icons/fa";
import { MdDone } from "react-icons/md";
import api from '../../api/api.tsx'
import { toast } from "react-toastify";
// import { toast } from "react-toastify";
// import { login, register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuthRole } from "../../hooks/useAuth.tsx";
import {useOpenNotification} from '../../hooks/notification.tsx'

export default function Login() {
    const [form] = useForm();
    const [formSign] = useForm();
    const navigate = useNavigate();
    const {isEmail,isPhoneNumber} = useAuthRole();
    const { openNotification, contextHolder } = useOpenNotification();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalSuccess, setIsModalSuccess] = useState(false);

//   // Xử lý Login
  const handleSubmit = async (values: { phoneNumber: string;}) => {
    try {
        let endpoint ="";
        // console.log(values.phoneNumber)
       if(isPhoneNumber(values.phoneNumber))  endpoint = `${import.meta.env.VITE_BACKEND_URL}`;
        else if(isEmail(values.phoneNumber)) endpoint = `${import.meta.env.VITE_BACKEND_URL}/student/loginEmail`;
        else{
            openNotification("warning","Nhập số điện thoại hoặc email");
            return;
        }
        const res = await api.post(endpoint,values);
        // console.log(res.data)
      if (res.status === 200) {
        localStorage.setItem("phoneNumber", res.data.phoneNumber);
        // console.log("Thành công")
        navigate("/validateAccessCode",{state:{phoneNumber:values.phoneNumber}});
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

//   // Xử lý Đăng ký
//   const handleSign = async (values: { email: string }) => {
//     try {
//       const res = await register(values);
//       if (res.status === 201) {
//         setIsModalSuccess(true);
//         setIsModalVisible(false);
//         formSign.resetFields();
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Đăng ký thất bại!");
//     }
//   };

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
      {/* Lớp phủ sáng */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
    </div>

    {/* Form login ở giữa */}
    <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
      {/* Title */}
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

        {/* <Form.Item
          name="password"
          rules={[{ required: true, type: "string", message: "Vui lòng nhập mật khẩu" }]}
          style={{ margin: "0px" }}
        >
          <Input.Password
            placeholder="Mật khẩu"
            onKeyDown={(e) => {
              if (e.key === "Enter") form.submit();
            }}
          />
        </Form.Item> */}
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
        <Button
          className="uppercase"
          type="primary"
          icon={<FaUserEdit />}
          onClick={() => setIsModalVisible(true)}
        />
      </div>

      <p className="uppercase text-gray-700 text-sm font-medium underline cursor-pointer text-center mt-4">
        Quên mật khẩu?
      </p>
    </div>

    {/* Modal đăng ký */}
    <Modal
      title="Đăng ký"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={"100%"}
      style={{ maxWidth: "320px" }}
    >
      <Form layout="vertical" form={formSign}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "string", message: "Vui lòng nhập email" }]}
        >
          <Input placeholder="Email của bạn" />
        </Form.Item>
      </Form>
      <div className="flex justify-end w-full mt-4">
        <Button type="primary" onClick={() => formSign.submit()}>
          Đăng ký
        </Button>
      </div>
    </Modal>

    {/* Modal thành công */}
    <Modal
      open={isModalSuccess}
      onCancel={() => setIsModalSuccess(false)}
      footer={null}
      width={"100%"}
      style={{ maxWidth: "320px" }}
    >
      <div className="flex justify-center items-center flex-col">
        <div className="p-16 w-fit rounded-full border-2 border-blue-600 mb-2">
          <MdDone className="text-6xl text-green-500" />
        </div>
        <p className="font-semibold text-3xl">Gửi đơn đăng ký thành công</p>
      </div>
    </Modal>
  </div>
    </>
);




}
