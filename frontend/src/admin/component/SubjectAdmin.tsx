/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react"
import type { SubjectForAdmin } from "../../models/locationInterface";
import { useOpenNotification } from "../../hooks/Notification/notification";
import { adminAPI } from "../AdminServices";
import { Button, Input, Popconfirm, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { SubjectForAdminModal } from "../modal/SubjectForAdminModal";

export function SubjectsForAdmin(){
    const [subjects,setSubjects] = useState<SubjectForAdmin[]>([]);
    const [loading,setLoading] = useState<boolean>(false);
    const {openNotification,contextHolder} = useOpenNotification();
    const [editingSubject, setEditingSubject] = useState<SubjectForAdmin | null>(null);
    const [filteredSubjects, setFilteredSubjects] = useState<SubjectForAdmin[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [openModal, setOpenModal] = useState<boolean>(false);
    // const [selectedSubject,setSelectedSubject] = useState<SubjectForAdmin|null>(null);

    const fetchSubjects = async()=>{
        setLoading(true);
        try {
            const res = await adminAPI.getSubjectForAdmin();
            if(res.data.success) {
                setSubjects(res.data.subjects);
                setFilteredSubjects(res.data.subjects);
            }
        } catch (error) {
            console.log(error)
            openNotification("error","Không thể tải danh sách môn học");
        } finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchSubjects()
    },[]);

    useEffect(()=>{
        if(!searchTerm) setFilteredSubjects(subjects);
        else{
            const lower = searchTerm.toLowerCase();
            setFilteredSubjects(subjects.filter((s)=>s.name.toLowerCase().includes(lower)));
        }
    },[searchTerm,subjects]);

    const handleDelete = async (id: string) => {
        try {
        const res = await adminAPI.deleteSubject(id);
        if(res.data.success){
            openNotification("success","Xóa thành công");
            setSubjects(prev => prev.filter(f=>f.id !== id));
        } else openNotification("warning","Không thể xóa");
        //fetchSubjects();
        } catch {
            openNotification("error","Không thể xóa");
        }
  };

 const handleSubmit = async (values: SubjectForAdmin) => {
  try {
    setLoading(true);

    if (!editingSubject) {
      const res = await adminAPI.addSubject(values);
      if (res.data.success) {
        setSubjects(prev => {
          const newSubjects = [res.data.subject, ...prev];
          if (searchTerm) {
            setFilteredSubjects(
              newSubjects.filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
            );
          } else {
            setFilteredSubjects(newSubjects);
          }
          return newSubjects;
        });
      } else openNotification("error", "Thêm môn học thất bại");
    } else {
      const res = await adminAPI.updateSubject(editingSubject.id, values);
      if (res.data.success) {
        setSubjects(prev => {
          // Thay thế môn học cũ bằng môn học mới
          const updatedSubjects = prev.map(s =>
            s.id === editingSubject.id ? res.data.subject : s
          );

          if (searchTerm) {
            setFilteredSubjects(
              updatedSubjects.filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
            );
          } else {
            setFilteredSubjects(updatedSubjects);
          }

          return updatedSubjects;
        });

        openNotification("success", "Cập nhật môn học thành công");
      } else openNotification("error", "Cập nhật môn học thất bại");
    }
  } catch (error) {
    console.log(error);
    openNotification("error", "Thao tác thất bại");
  } finally {
    setLoading(false);
  }
};



    const columns: ColumnsType<SubjectForAdmin> = useMemo(
    () => [
      { title: "Tên môn học", dataIndex: "name", key: "name" },
      { title: "Số tín chỉ", dataIndex: "credits", key: "credits"  },
      { title: "Số giảng viên", dataIndex: "instructorNumber", key: "instructorNumber"},
      { title: "Trạng thái", dataIndex: "active", key: "active",  align: "center", 
        render:(__,record) =>(
          <>
          {record.active ?(
            <CheckCircleOutlined style={{ color: "green", fontSize: 20 }} />
          ):(<CloseCircleOutlined style={{ color: "red", fontSize: 20 }} />)}
          </>
        )
      },
      {
        title: "Hành động",
        key: "action",
        width: 160,
        render: (_, record) => (
          <>
            <Button
              type="link"
              onClick={() => {
                setEditingSubject(record);
                setOpenModal(true);
              }}
            >
              Chỉnh sửa
            </Button>
            <Popconfirm
              title={
              <>
                Bạn có chắc muốn xóa môn học{" "}
                <b style={{ color: "#d4380d" }}>{record.name}</b> không?
              </>
            }
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger type="link">
                Xóa
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ],
    []
  );


    return(
        <>
            {contextHolder}
             <div style={{ padding: 24 }}>
            {/* Thanh tìm kiếm + nút thêm mới */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Input.Search
                placeholder="Tìm kiếm môn học..."
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
                />
                <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                    setEditingSubject(null);
                    setOpenModal(true);
                }}
                >
                Thêm mới
                </Button>
            </div>

            {/* Bảng hiển thị */}
            <Table
                columns={columns}
                dataSource={filteredSubjects}
                rowKey="id"
                loading={loading}
                bordered
            />

            {/* Modal thêm/chỉnh sửa */}
            {openModal && (
                <SubjectForAdminModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={handleSubmit}
                editingSubject={editingSubject}
                />
            )}
    </div>
        </>
    )
}