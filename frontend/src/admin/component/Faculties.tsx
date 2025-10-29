/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Faculty } from "../../models/locationInterface";
import { useOpenNotification } from "../../hooks/Notification/notification";
import { adminAPI } from "../AdminServices";
import FacultyFormModal from "../modal/FacultyFormModal";
import FacultyDeleteModal from "../modal/FacultyDeleteModal";

export interface FacultiesForAdmin extends Faculty {
  code: string;
  dean: string;
  instructorNumber: number;
  classNumber: string;
  active: boolean;
  credits:number
}

export function Faculties() {
  const [faculties, setFaculties] = useState<FacultiesForAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] =
    useState<FacultiesForAdmin | null>(null);
  const { openNotification, contextHolder } = useOpenNotification();

  const fetchFacultiesForAdmin = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getFacultiesForAdmin();
      if (res.data.success) setFaculties(res.data.faculties);
      else openNotification("warning", res.data.message);
    } catch (error:any) {
      console.log(error);
      openNotification("warning", error.response.data.message);
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    fetchFacultiesForAdmin();
  }, []);

  const handleEdit = (record?: FacultiesForAdmin) => {
    setSelectedFaculty(record || null);
    setOpenFormModal(true);
  };

  const handleSave = useCallback(async (values: any) => {
    try {
      setModalLoading(true);
      if (selectedFaculty) {
        const res = await adminAPI.updateFaculty( values.code,values);
        if(res.data.success){
          setFaculties(prev =>[...prev,res.data.values])
          openNotification("success", "Cập nhật khoa thành công");
        } else openNotification("warning", "Cập nhật khoa thất bại");
      } else {
        const res = await adminAPI.addFaculty(values);
        if(res.data.success){
          setFaculties(prev=>[res.data.values,...prev]);
          openNotification("success", "Thêm khoa mới thành công");
        } else openNotification("warning", "Thêm khoa mới thất bại");
      }
      setOpenFormModal(false);
      fetchFacultiesForAdmin();
    } catch (err:any) {
      console.log(err);
      openNotification("error",err.response.data.message)
    } finally {
      setModalLoading(false);
    }
  },[]);

  const handleOpenDelete = (record: FacultiesForAdmin) => {
    setSelectedFaculty(record);
    setOpenDeleteModal(true);
  };

  const handleDelete = useCallback(async () => {
    try {
      setModalLoading(true);
      const res = await adminAPI.deleteFaculty(selectedFaculty?.id as string);
      if(res.data.success){
        openNotification("success", "Xoá khoa thành công");
        setOpenDeleteModal(false);
        setFaculties(prev => prev.filter(fac => fac.id !== selectedFaculty?.id)); 
        setSelectedFaculty(null);
      } else openNotification("warning", "Xoá khoa thất bại");
    } catch (err:any) {
        console.log(err);
        openNotification("error", err.response.data.message);
    } finally {
      setModalLoading(false);
    }
  },[]);

  const columns: ColumnsType<FacultiesForAdmin> = useMemo(()=> [
    { title: "Mã khoa", dataIndex: "code", key: "code", width: 120 },
    { title: "Tên khoa", dataIndex: "name", key: "name", width: 200 },
    { title: "Trưởng khoa", dataIndex: "dean", key: "dean", render: (dean) => dean || <i>Chưa có</i> },
    { title: "Số giảng viên", dataIndex: "instructorNumber", key: "instructorNumber", align: "center" },
    { title: "Số lớp", dataIndex: "classNumber", key: "classNumber", align: "center" },
    {title:"Số tín chỉ", dataIndex:"credits", key:"credits",align: "center"},
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      align: "center",
      render: (active) => (active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Chỉnh sửa</Button>
          <Button type="link" danger onClick={() => handleOpenDelete(record)}>Xoá</Button>
        </Space>
      ),
    },
  ],[]);

  return (
    <>
      {contextHolder}

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" onClick={() => handleEdit()}>
          + Thêm khoa
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={faculties}
        bordered
        loading={loading}
        pagination={{ pageSize: 10 }}
        title={() => <b>Danh Sách Khoa</b>}
      />


      <FacultyFormModal
        open={openFormModal}
        onCancel={() => setOpenFormModal(false)}
        onSave={handleSave}
        faculty={selectedFaculty}
        loading={modalLoading}
      />


      <FacultyDeleteModal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        faculty={selectedFaculty}
        loading={modalLoading}
      />
    </>
  );
}
