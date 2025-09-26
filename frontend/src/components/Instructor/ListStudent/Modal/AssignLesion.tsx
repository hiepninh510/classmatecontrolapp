import { Form, Input, Modal, Select, type FormInstance } from "antd";

interface Student {
  id: string;
  name:string,
  phoneNumber:string,
  email:string
}
interface Subject {
  id:string,
  name:string
}

interface AssignFormModalProps{
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: FormInstance<any>;
    editingStudent: Student | null;
    subjects:Subject[]|[];
}


export function AssignLessionFormModal({open,onOk,onCancel,form,editingStudent,subjects}:AssignFormModalProps){
    return(
        <>
            <Modal
            title={`Giao Bài cho ${editingStudent?.name || ''}`}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
        >
            
            <Form form={form} layout="vertical">
            <Form.Item name="id" hidden>
                <Input type="hidden" />
            </Form.Item>
            <Form.Item label="Tên Sinh Viên" name="name">
                <Input disabled />
            </Form.Item>
            <Form.Item label="Số Điện Thoại" name="phoneNumber">
                <Input disabled />
            </Form.Item>
            <Form.Item label="Email" name="email">
                <Input disabled />
            </Form.Item>
            <Form.Item label="Môn" name="subject" rules={[{ required: true, message: 'Vui lòng nhập môn' }]}>
                <Select placeholder="Chọn môn học">
                {subjects.map((sub)=>(
                    <Select.Option key={sub.id} value={sub.id}>
                    {sub.name}
                    </Select.Option>
                ))}
                </Select>
            </Form.Item>
            <Form.Item label="Description" name="description">
                <Input.TextArea />
            </Form.Item>
            </Form>
            </Modal>
        </>
    )
}