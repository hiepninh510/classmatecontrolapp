/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, Switch, Select } from "antd";
import type { FacultiesForAdmin } from "../component/Faculties";
import { useEffect } from "react";
import { useAdminData } from "../useAdminData";

interface FacultyFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  faculty?: FacultiesForAdmin | null;
  loading?: boolean;
}

export default function FacultyFormModal({
  open,
  onCancel,
  onSave,
  faculty,
  loading,
}: FacultyFormModalProps) {
  const [form] = Form.useForm();
    const {instructors,fetchInstructors} = useAdminData();

  useEffect(() => {
    fetchInstructors();
    if (faculty) form.setFieldsValue(faculty);
    else form.resetFields();
  }, [form,faculty]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
      form.resetFields();
    } catch (err) {
      console.log("Validate error:", err);
    }
  };

  return (
    <Modal
      title={faculty ? "Chỉnh sửa khoa" : "Thêm khoa mới"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="code"
          label="Mã khoa"
          rules={[{ required: true, message: "Vui lòng nhập mã khoa" }]}
        >
          <Input placeholder="Ví dụ: CNTT" 
            disabled={!!faculty}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên khoa"
          rules={[{ required: true, message: "Vui lòng nhập tên khoa" }]}
        >
          <Input placeholder="Ví dụ: Khoa Công nghệ thông tin" />
        </Form.Item>

        <Form.Item name="deanId" label="Trưởng khoa">
          <Select
            showSearch
            placeholder = "Chọn trưởng khoa"
             optionFilterProp="children"
             allowClear
             filterOption = {(input,option)=>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())

             }
            options={instructors.map((ins: any) => ({
              label: ins.name,
              value: ins.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="credits"
          label="Số tín chỉ"
          rules={[{ required: true, message: "Vui lòng nhập số tín chỉ" }]}
        >
          <Input     
          type="number"
          placeholder="Ví dụ: 120"
          min={0} />
        </Form.Item>

        <Form.Item
          name="active"
          label="Trạng thái hoạt động"
          valuePropName="checked"
        >
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
