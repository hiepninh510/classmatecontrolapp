/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, type FormInstance } from "antd";

interface Student {
  id: string;
  name:string,
  phoneNumber:string,
  email:string
}

type StudentFormModalProps = {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  form: FormInstance<any>;
  editingStudent: Student | null;
};

export function StudentFormModal({editingStudent,open,onOk,form,onCancel}:StudentFormModalProps){
    return(
        <>
            <Modal
              title={editingStudent ? 'Chỉnh Sửa Sinh Viên' : 'Thêm Sinh Viên'}
              open={open}
              onOk={onOk}
              onCancel={onCancel}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Số Điện Thoại"
                  name="phoneNumber"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </Modal>
        
        </>
    )

}
