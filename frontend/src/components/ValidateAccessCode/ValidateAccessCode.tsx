import { Button, Form, Input } from 'antd'
import api from '../../api/api.tsx'
import { useForm } from 'antd/es/form/Form';
import React, { useState } from 'react';
import type { LocationState } from '../../models/locationInterface.tsx';
import { useLocation } from 'react-router-dom';
import { useAuthRole } from '../../hooks/useAuth.tsx';
import {useAuth} from '../../hooks/ThemeContext.tsx'
import {useOpenNotification} from '../../hooks/notification.tsx';


export default function ValidateAccessCode(){
    const [form] = useForm();
    const [code,setCode] = useState("");
    const location = useLocation() as {state:LocationState};
    const phoneNumber = location.state?.phoneNumber;
    const {validateAccessCode} = useAuthRole();
    const {setAuth} = useAuth()
    const { openNotification, contextHolder } = useOpenNotification();
    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        const value = e.target.value.replace(/\D/g,"").slice(0,6);
        setCode(value);
        form.setFieldsValue({accessCode:value});
    }

    const handleSubmit = async (value:{accessCode:string})=>{
        try {
         const values = {
            phoneNumber,
            ...value
        }
        const res = await api.post(`${import.meta.env.VITE_BACKEND_URL}/validateAccessCode`,values)
        if(res.data.success){
          localStorage.setItem("phoneNumber",res.data.phoneNumber);
            openNotification('success','Xác thực thành công');
            setAuth(res.data.typeUser, res.data.userName,res.data.id);
            setTimeout(()=>{
                validateAccessCode(res.data.typeUser);
                // return <AppDashBoard role={res.data.typeUser}/>
            },1000)
        } else {
            openNotification('error','Mã xác thực không tồn tại')
        }
        } catch (error) {
            console.log(error);
        }
        
    }
    return(
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

      {/* Form nhập mã */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="font-medium text-gray-800 text-3xl">Nhập mã xác nhận</p>
          <p className="text-gray-700 text-sm text-center">
            Vui lòng nhập mã 6 chữ số được gửi đến số điện thoại/email của bạn
          </p>
        </div>

        <Form form={form} onFinish={handleSubmit} className="w-full">
          <Form.Item
            name="accessCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã xác nhận" },
              { len: 6, message: "Mã xác nhận phải đủ 6 chữ số" },
            ]}
          >
            <Input
              placeholder="Nhập mã"
              value={code}
              onChange={handleInputChange}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="uppercase font-medium w-full mt-4"
            disabled={code.length < 6} // Chỉ bật khi đủ 6 số
          >
            Xác nhận
          </Button>
        </Form>
      </div>
    </div>
        
        
        </>
    )
}