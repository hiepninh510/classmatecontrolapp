import { Form, Input, Modal, Select, type FormInstance } from "antd";

// interface Student {
//   id: string;
//   name:string,
//   phoneNumber:string,
//   email:string
// }
interface Subject {
  id:string,
  name:string
}

interface AssignLessionForClass{
  id:string,
  name:string
}

interface AssignFormModalProps{
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: FormInstance<any>;
    subjects:Subject[]|[];
    assignLession:AssignLessionForClass[]|[]
}
 
export function AssignLessinClassFormModal({open,onOk,onCancel,form,subjects,assignLession}:AssignFormModalProps){
    return(
        <>
        <Modal 
            title = {"Giao Bài Tập"}
            open = {open}
            onOk={onOk}
            onCancel={onCancel}
            >
                <Form form={form} layout="vertical">
                <Form.Item label="Lớp" name="name">
                    <Select placeholder="Chọn lớp">
                    {assignLession.map((item)=>(
                        <Select.Option key={item.id} value={item.id}>
                        {item.name}
                        </Select.Option>
                    ))}
                    </Select>
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
                    <Input.TextArea/>
                </Form.Item>
                </Form>

        </Modal>
        </>
    )
}