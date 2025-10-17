/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Modal, Select, type FormInstance } from "antd";
import type { Faculty } from "../../models/locationInterface";

type ClassFormModalProps = {
    form:FormInstance<any>;
    open:boolean,
    faculties:Faculty[],
    onCancel:() =>void,
    onOK:() =>void,
}

export function CreatClasses({open,form,faculties,onCancel,onOK}:ClassFormModalProps){
    return(
        <>
        <Modal
            title="Thêm Lớp Mới"
            open={open}
            onCancel={onCancel}
            onOk={onOK}
            okText="Thêm"
            cancelText="Huỷ"
        >
            <Form form={form} layout="vertical">
            <Form.Item
                name="name"
                label="Tên Lớp"
                rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}
            >
                <Input placeholder="Nhập tên lớp..." />
            </Form.Item>

            <Form.Item
                name="size"
                label="Quy Mô (Số lượng)"
                rules={[{ required: true, message: "Vui lòng nhập quy mô lớp!" }]}
            >
                <Input type="number" placeholder="Nhập số lượng học viên..." min={1} />
            </Form.Item>

            <Form.Item
                name="facultyId"
                label="Khoa"
                rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
            >
                <Select placeholder="Chọn khoa...">
                {faculties.map(fac => (
                    <Select.Option key={fac.id} value={fac.id}>
                    {fac.name}
                    </Select.Option>
                ))}
                </Select>
            </Form.Item>
            </Form>
        </Modal>
        </>
    )
}