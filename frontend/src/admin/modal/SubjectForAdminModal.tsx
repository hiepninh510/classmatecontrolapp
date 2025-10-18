/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Switch } from "antd";
import { useAdminData } from "../useAdminData";
import type { SubjectForAdmin } from "../../models/locationInterface";
interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (values:any) => void;
  editingSubject: SubjectForAdmin | null;
}

export function SubjectForAdminModal({ open, onClose, onSuccess, editingSubject }: Props) {
  const [form] = Form.useForm();
  const {fetchFaculties, faculties} = useAdminData()

  // 🧩 Fetch danh sách khoa khi thêm mới
//   const fetchFaculties = async () => {
//     try {
//       const res = await adminAPI.getAllSubject();
//       if (res.data.success) setFaculties(res.data.data);
//     } catch {
//       message.error("Không thể tải danh sách khoa");
//     }
//   };
  useEffect(() => {
    if (!editingSubject) {
        fetchFaculties();
    };
  }, [editingSubject]);

  useEffect(() => {
    if (editingSubject) {
        fetchFaculties();
        form.setFieldsValue(editingSubject);
    } else {
      form.resetFields();
    }
  }, []);

  const handleSubmit = async () => {
    try {
        const values = await form.validateFields();
        const cleanValues = { ...values };
        delete cleanValues.instructorNumber;
        onSuccess(cleanValues);
        form.resetFields();
        onClose();
    } catch (error: any) {
        console.log(error);
    }
  };

  return (
    <Modal
      title={editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu"
      cancelText="Hủy"
      afterClose={() => form.resetFields()}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Tên môn học"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên môn học" }]}
        >
          <Input placeholder="Nhập tên môn học" />
        </Form.Item>

        <Form.Item
          label="Số tín chỉ"
          name="credits"
          rules={[{ required: true, message: "Vui lòng nhập số tín chỉ" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      {editingSubject ? (

        <Form.Item
          label="Số giảng viên"
          name="instructorNumber"
          rules={[{ required: true, message: "Vui lòng nhập số giảng viên" }]}
        >
          <InputNumber disabled min={0} style={{ width: "100%" }} />
        </Form.Item>

      ):(
        <Form.Item
          label="Số giảng viên"
          name="instructorNumber"
          rules={[{ required: true, message: "Vui lòng nhập số giảng viên" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      )}

        {editingSubject ? (
        <Form.Item label="Khoa">
            <Input disabled 
                value={
                    faculties.find(f => f.id === editingSubject.facultyId)?.name ||
                    "Đang tải..."
                }
            />
        </Form.Item>
        ) : (
            <Form.Item
                label="Khoa"
                name="facultyId"
                rules={[{ required: true, message: "Vui lòng chọn khoa" }]}
            >
                <Select placeholder="Chọn khoa" loading={faculties.length === 0}>
                {faculties.map((f) => (
                    <Select.Option key={f.id} value={f.id}>
                    {f.name}
                    </Select.Option>
                ))}
                </Select>
            </Form.Item>
        )}
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
