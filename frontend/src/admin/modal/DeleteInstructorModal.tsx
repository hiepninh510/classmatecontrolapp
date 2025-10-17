import { Modal } from "antd";
import type { ListInstructorForAdmin } from "../../models/locationInterface";


interface DeleteStudentProps{
    open:boolean,
    onOk:()=>void,
    onCancel:()=>void,
    instructor:ListInstructorForAdmin
}

export function DeleteInstructorModal({open,onOk,onCancel,instructor}:DeleteStudentProps){
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
                <p>Bạn có chắc muốn xóa giảng viên {instructor?.name}?</p>
            </Modal>
        </>
    )
}