/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, type FormInstance, Select, Radio } from "antd";
import type { ClassStudent, Faculty, ListInstructorForAdmin, Subject } from "../../models/locationInterface";
import { useEffect, useMemo, useState } from "react";

const { Option } = Select;

type StudentFormModalProps = {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  form: FormInstance<any>;
  editingInstructor: ListInstructorForAdmin | null;
  classOptions: ClassStudent[] | [];
  subjectOptions: Subject[] | [];
  facultyOptions: Faculty[] | [];
};

export function InstructorFormModal({
  editingInstructor,
  open,
  onOk,
  form,
  onCancel,
  classOptions,
  subjectOptions,
  facultyOptions,
}: StudentFormModalProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  // Khi modal mở (open === true) -> set/reset form dựa trên editingInstructor
useEffect(() => {
  if (open && editingInstructor) {
    const facultyId = editingInstructor.faculty?.id ?? null;
    setSelectedFaculty(facultyId);
    form.setFieldsValue({
      code: editingInstructor.code,
      name: editingInstructor.name,
      phoneNumber: editingInstructor.phoneNumber,
      email: editingInstructor.email,
      classes: editingInstructor.classes?.map((c) => c.id) || [],
      subjects: editingInstructor.subjects?.map((s) => s.id) || [],
    });
  } else if (open && !editingInstructor) {
    form.resetFields();
    setSelectedFaculty(null);
  }
}, [open, editingInstructor, form]);


  const filteredSubject = useMemo(() => {
    if (!selectedFaculty) return subjectOptions;
    return subjectOptions.filter((s) => s.facultyId === selectedFaculty);
  }, [selectedFaculty, subjectOptions]);

  const filteredClass = useMemo(() => {
    if (!selectedFaculty) return classOptions;
    return classOptions.filter((cls) => cls.facultyId === selectedFaculty);
  }, [selectedFaculty, classOptions]);

  return (
    <Modal
      // buộc remount khi edit khác nhau
      title={editingInstructor ? "Chỉnh Sửa Giảng Viên" : "Thêm Giảng Viên"}
      open={open}
      onOk={onOk}
      onCancel={() => {
        // có thể gọi onCancel từ parent để đóng modal
        onCancel();
        // reset form phòng trường hợp parent không reset
        form.resetFields();
      }}
      afterOpenChange={(visible) => {
        if (!visible) form.resetFields();
      }}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="Mã Giảng Viên"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã giảng viên" }]}
        >
          <Input disabled={!!editingInstructor} placeholder="Nhập mã giảng viên" />
        </Form.Item>

        <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Số Điện Thoại" name="phoneNumber" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Khoa" name="faculty">
          <Radio.Group
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            disabled={!!editingInstructor}
          >
            {facultyOptions.map((f) => (
              <Radio key={f.id} value={f.id}>
                {f.name}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Lớp Phụ Trách" name="classes">
          <Select mode="multiple" placeholder="Chọn lớp" allowClear>
            {filteredClass.map((cls) => (
              <Option key={cls.id} value={cls.id}>
                {cls.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Môn Phụ Trách" name="subjects">
          <Select mode="multiple" placeholder="Chọn môn" allowClear>
            {filteredSubject.map((sb) => (
              <Option key={sb.id} value={sb.id}>
                {sb.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
