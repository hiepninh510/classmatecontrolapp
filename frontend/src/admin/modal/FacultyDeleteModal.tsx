import { Modal } from "antd";
import type { FacultiesForAdmin } from "../component/Faculties";

interface FacultyDeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  faculty?: FacultiesForAdmin | null;
  loading?: boolean;
}

export default function FacultyDeleteModal({
  open,
  onCancel,
  onConfirm,
  faculty,
  loading,
}: FacultyDeleteModalProps) {
  return (
    <Modal
      title="Xác nhận xoá khoa"
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Xoá"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      confirmLoading={loading}
    >
      <p>
        Bạn có chắc chắn muốn xoá khoa <b>{faculty?.name}</b> không?
      </p>
    </Modal>
  );
}
