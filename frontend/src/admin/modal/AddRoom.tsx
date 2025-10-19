/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Modal, Form, Input, Switch } from "antd";
import type { Rooms } from "../../models/locationInterface";
import { adminAPI } from "../AdminServices";
import { useOpenNotification } from "../../hooks/Notification/notification";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onAddSuccess: (newRoom: Rooms) => void;
}

export function AddRoomModal({ open, onClose, onAddSuccess}:AddRoomModalProps){
  const [form] = Form.useForm();
  const { openNotification } = useOpenNotification();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await adminAPI.addRoom({
        name: values.name,
        areas: values.areas,
        isVIP: values.isVIP || false,
        active: values.active ?? true,
      });
      if (res.data.success) {
        openNotification("success", "Thêm phòng thành công");
        onAddSuccess(res.data.newRoom); // Truyền room mới lên parent
        form.resetFields();
        onClose();
      } else {
        openNotification("warning", "Thêm phòng thất bại");
      }
    } catch (error:any) {
      console.log(error);
      openNotification("error", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm mới phòng"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên phòng"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
        >
          <Input placeholder="Nhập tên phòng" />
        </Form.Item>

        <Form.Item
          label="Khu vực"
          name="areas"
          rules={[{ required: true, message: "Vui lòng nhập khu vực" }]}
        >
          <Input placeholder="Nhập tên khu vực" />
        </Form.Item>

        <Form.Item label="VIP" name="isVIP" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Active" name="active" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
