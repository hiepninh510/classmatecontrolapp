import { Modal } from "antd";

interface Student{
    id:string,
    name:string
}

interface DeleteStudentProps{
    open:boolean,
    onOk:()=>void,
    onCancel:()=>void,
    student:Student
}

export function DeleletStudentModal({open,onOk,onCancel,student}:DeleteStudentProps){
    return(
        <>
            <Modal
                title="Xác nhận xóa"
                open={open}
                onOk={onOk}
                onCancel={onCancel}
                okText="Xóa"
                cancelText="Hủy"
            >
                <p>Bạn có chắc muốn xóa sinh viên {student?.name}?</p>
            </Modal>
        </>
    )
}