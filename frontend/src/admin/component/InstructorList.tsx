/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Form, Table } from "antd";
import type { TableProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Search, { type SearchProps } from "antd/es/input/Search";
import { DeleteOutlined } from "@ant-design/icons";
import { useOpenNotification } from "../../hooks/Notification/notification.tsx";
import { adminAPI } from "../AdminServices.ts";
import { InstructorFormModal } from "../modal/InstructorFormModal.tsx";
import { DeleteInstructorModal } from "../modal/DeleteInstructorModal.tsx";
import { type ClassStudent, type Faculty, type ListInstructorForAdmin, type Subject } from "../../models/locationInterface.tsx";

export default function InstructorList() {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<ListInstructorForAdmin[]>([]);
  const [filtered, setFiltered] = useState<ListInstructorForAdmin[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] =
    useState<ListInstructorForAdmin | null>(null);
  const [form] = Form.useForm();
  const { openNotification, contextHolder } = useOpenNotification();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] =
    useState<ListInstructorForAdmin | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  // Lọc theo lớp và môn học
  const [classFilters, setClassFilters] = useState<{ text: string; value: string }[]>([]);
  const [subjectFilters, setSubjectFilters] = useState<{ text: string; value: string }[]>([]);
  const [facultyFillters,setfacultyFilters] = useState<{text:string,value:string}[]>([]);
  const [classOptions,setClassOptions] = useState<ClassStudent[]>([]);
  const [subjectOptions,setSubjectOptions] = useState<Subject[]>([]);
  const [facultyOptions,setfacultyOptions] = useState<Faculty[]>([])

  const columns: TableProps<ListInstructorForAdmin>["columns"] = useMemo(()=> [
    {
      title: "Tên Giảng Viên",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title:"Khoa",
      dataIndex:'faculty',
      filters:facultyFillters,
      render:(_,record) => record.faculty?.name || "-",
      onFilter:(value, record)=> 
          record.faculty?.name === value
    },
    {
      title: "Lớp Phụ Trách",
      key: "classes",
      filters: classFilters,
      render: (_, record) =>
        record.classes && record.classes.length > 0
          ?  (
          <div>
            {record.classes.map((c) => (
              <div key={c.id}>{c.name}</div>
            ))}
          </div>
        )
          : "—",
      onFilter: (value, record) =>
        record.classes?.some((c) => c.name === value),
    },
    {
      title: "Môn Giảng Dạy",
      key: "subjects",
      filters: subjectFilters,
      render: (_, record) =>
        record.subjects && record.subjects.length > 0
          ?  (
          <div>
            {record.subjects.map((c) => (
              <div key={c.id}>{c.name}</div>
            ))}
          </div>
        )
          : "—",
      onFilter: (value, record) =>
        record.subjects?.some((s) => s.name === value),
    },
    {
      title: "Chức Năng",
      key: "function",
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
            onClick={() => openDeleteModal(record)}
          />
        </div>
      ),
    },
  ],[]);

  const fetchClassAndSubjectAndFacultys = useCallback(async()=>{
    try {
      const resClass = await adminAPI.getAllClass();
      if(resClass.status) setClassOptions(resClass.data.classes);
      const resSubject = await adminAPI.getAllSubject();
      if(resSubject.status) setSubjectOptions(resSubject.data.subjects);
      const resFacultys = await adminAPI.getAllFaculties();
      if(resFacultys.status) setfacultyOptions(resFacultys.data.facultys);
    } catch (error:any) {
      console.log(error);
      openNotification("error",error.response.data.message)
    }
  },[]); 

   const fetchInstructors = useCallback(async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAllInstructors();
        if (!res.data.success) return openNotification("error", "Không thể tải danh sách giảng viên");

        const list: ListInstructorForAdmin[] = res.data.instructorsWithDetails;
        setInstructors(list);
        setFiltered(list);

        // Tạo filters
        const uniqueClasses = Array.from(
          new Set(
            list.flatMap((ins) => ins.classes?.map((c) => c.name) || [])
          )
        ).map((c) => ({ text: c, value: c }));

        const uniqueSubjects = Array.from(
          new Set(
            list.flatMap((ins) => ins.subjects?.map((s) => s.name) || [])
          )
        ).map((s) => ({ text: s, value: s }));

        const uniqueFaculties = Array
        .from(new Set(list.map((ins) => ins.faculty?.name)
        .filter(Boolean)))
        .map((name)=>({text:name,value:name}));

        setfacultyFilters(uniqueFaculties);
        setClassFilters(uniqueClasses);
        setSubjectFilters(uniqueSubjects);
      } catch (error:any) {
        console.error("Lỗi khi fetch instructors:", error);
        openNotification("error",error.response.data.message);
      } finally {
        setLoading(false);
      }
    },[]);

  useEffect(() => {
    fetchInstructors();
    fetchClassAndSubjectAndFacultys();
  }, []);

  const onSearch: SearchProps["onSearch"] = (value) => {
    setSearchText(value);
    const lower = value.toLowerCase();
    const results = instructors.filter(
      (i) =>
        i.name.toLowerCase().includes(lower) ||
        i.email.toLowerCase().includes(lower) ||
        i.phoneNumber.toLowerCase().includes(lower)
    );
    setFiltered(results);
  };

  const openModal = (instructor?: ListInstructorForAdmin) => {
    setEditingInstructor(instructor || null);
    // form.setFieldsValue(instructor || { name: "", phoneNumber: "", email: "" });
    setIsModalOpen(true);
  };

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingInstructor) {
        // Update
        const res = await adminAPI.updateInstructor(editingInstructor.id, values);
        if (res.data.success) {
          setInstructors((prev) =>
            prev.map((i) => (i.id === editingInstructor.id ? res.data.instructor : i))
          );
          openNotification("success", "Cập nhật giảng viên thành công");
        }
      } else {
        // Add
        const res = await adminAPI.addInstructor(values);
        if (res.data.success) {
          setInstructors((prev) => [...prev, res.data.instructor]);
          openNotification("success", "Thêm giảng viên thành công");
        } else openNotification("error", res.data.message);
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error:any) {
      console.error(error);
      openNotification("error",error.response.data.message);
    }
  },[]);

  const openDeleteModal = (instructor: ListInstructorForAdmin) => {
    setInstructorToDelete(instructor);
    setIsDeleteOpen(true);
  };

  const handleDeleteOk = useCallback(async () => {
    if (!instructorToDelete) return;
    try {
      const res = await adminAPI.deleteInstructor(instructorToDelete.id);
      if (res.data.success) {
        setInstructors((prev) => prev.filter((i) => i.id !== instructorToDelete.id));
        openNotification("success", "Xóa giảng viên thành công");
      } else {
        openNotification("error", "Xóa giảng viên thất bại");
      }
    } catch (error:any) {
      console.log(error);
      openNotification("error", error.response.data.message);
    } finally {
      setIsDeleteOpen(false);
    }
  },[]);

  const handleDeleteCancel = () => setIsDeleteOpen(false);

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <Search
          placeholder="Tìm kiếm giảng viên..."
          allowClear
          enterButton="Tìm kiếm"
          size="middle"
          value={searchText}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={() => openModal()}>
          + Thêm Giảng Viên
        </Button>
      </div>

      <Table<ListInstructorForAdmin>
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={Array.isArray(filtered) ? filtered : []}
      />

      <InstructorFormModal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setEditingInstructor(null);
          setIsModalOpen(false);
          form.resetFields();
        }}
        form={form}
        editingInstructor={editingInstructor}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
        facultyOptions={facultyOptions}
      />

      <DeleteInstructorModal
        open={isDeleteOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        instructor={instructorToDelete as ListInstructorForAdmin}
      />
    </>
  );
}
