/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import type { Faculty, Classes } from "../../models/locationInterface";
import { adminAPI } from "../AdminServices";
import { useOpenNotification } from "../../hooks/Notification/notification";
import { Button, Card, Form, Popconfirm, Spin, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { CreatClasses } from "../modal/CreatClass";

export function Classes(){
    const [classes,setClasses] = useState<Classes[]>([]);
    const { openNotification, contextHolder } = useOpenNotification();
    const { Title, Text } = Typography;
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [faculties,setFacuties] = useState<Faculty[]>([]);

//     const mockClasses: Classes[] = [
//   {
//     id: "C001",
//     name: "Lớp CNTT 1",
//     size: 40,
//     classSize: 38,
//     faculty: { id: "F001", name: "Khoa Công Nghệ Thông Tin" },
//   },
//   {
//     id: "C002",
//     name: "Lớp CNTT 2",
//     size: 45,
//     classSize: 43,
//     faculty: { id: "F001", name: "Khoa Công Nghệ Thông Tin" },
//   },
//   {
//     id: "C003",
//     name: "Lớp CNTT 3",
//     size: 50,
//     classSize: 49,
//     faculty: { id: "F001", name: "Khoa Công Nghệ Thông Tin" },
//   },
//   {
//     id: "C004",
//     name: "Lớp Kinh Tế 1",
//     size: 55,
//     classSize: 50,
//     faculty: { id: "F002", name: "Khoa Kinh Tế" },
//   },
//   {
//     id: "C005",
//     name: "Lớp Kinh Tế 2",
//     size: 60,
//     classSize: 58,
//     faculty: { id: "F002", name: "Khoa Kinh Tế" },
//   },
//   {
//     id: "C006",
//     name: "Lớp Du Lịch 1",
//     size: 40,
//     classSize: 39,
//     faculty: { id: "F003", name: "Khoa Du Lịch" },
//   },
//   {
//     id: "C007",
//     name: "Lớp Du Lịch 2",
//     size: 45,
//     classSize: 42,
//     faculty: { id: "F003", name: "Khoa Du Lịch" },
//   },
//   {
//     id: "C008",
//     name: "Lớp Kỹ Thuật 1",
//     size: 35,
//     classSize: 34,
//     faculty: { id: "F004", name: "Khoa Kỹ Thuật" },
//   },
//   {
//     id: "C009",
//     name: "Lớp Kỹ Thuật 2",
//     size: 40,
//     classSize: 39,
//     faculty: { id: "F004", name: "Khoa Kỹ Thuật" },
//   },
//   {
//     id: "C010",
//     name: "Lớp Ngoại Ngữ 1",
//     size: 30,
//     classSize: 28,
//     faculty: { id: "F005", name: "Khoa Ngoại Ngữ" },
//   },
// ];


    const fetchClasses = async()=>{
        try {
            setLoading(true);
            const res = await adminAPI.getAllClass();
            if(res.data.success) {
                setClasses(res.data.classes);
            } else openNotification("error",res.data.message);
        } catch (error) {
            console.log(error);
            openNotification("error","Lỗi khi tải danh sách lớp!");
        } finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchClasses();
    },[])


    const groupedByFaculty = classes.reduce<Record<string,Classes[]>> ((acc,curr)=>{
        const facutlyName = curr.faculty?.name || "Khác";
        if(!acc[facutlyName]) acc[facutlyName] = [];
        acc[facutlyName].push(curr);
        return acc;
    }, {} as Record<string, Classes[]>);

    const handleAddClass = async()=>{
        const res = await adminAPI.getAllFaculties();
        if(res.data.success) setFacuties(res.data.facultys);
        setIsModalOpen(true);
    }

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            console.log("í=d",id)
            const res = await adminAPI.deleteClass(id);
            if (res.data.success) {
            openNotification("success", "Đã xoá lớp thành công!");
            fetchClasses(); // reload lại danh sách
            } else {
            openNotification("error", res.data.message || "Xoá thất bại!");
            }
        } catch (error) {
            console.error(error);
            openNotification("error", "Lỗi khi xoá lớp!");
        } finally {
            setLoading(false);
        }
    };


    const handelCancel =()=>{
        form.resetFields()
        setIsModalOpen(false);
    }

    const handleOK = async()=>{
        const values = await form.validateFields();
        if(!values || Object.keys(values).length === 0) openNotification("error","Nhập thông tin đầy đủ");
        const res = await adminAPI.addClass(values);
        if(res.data.success) {
            form.resetFields();
            setIsModalOpen(false);
            openNotification("success",res.data.message);
        }else openNotification("warning",res.data.message);
    }

    return(
        <>
        {contextHolder}
         <div className="p-6">
             <div className="flex justify-end mb-6">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClass}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Thêm Lớp Mới
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          Object.entries(groupedByFaculty).map(([facultyName, classList]: any) => (
            <div key={facultyName} className="mb-10">
              <Title level={3} className="mb-4">
                {facultyName}
              </Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {classList.map((cls: Classes) => (
                  <Card
                    key={cls.id}
                    title={cls.name}
                    className="rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                  >
                      <Popconfirm
                      title="Xác nhận xoá lớp này?"
                      okText="Xoá"
                      cancelText="Huỷ"
                      onConfirm={() => handleDelete(cls.id)}
                    >
                      <DeleteOutlined
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 cursor-pointer"
                        style={{ fontSize: "18px", color: "#ff4d4f" }}
                      />
                    </Popconfirm>
                    <Text strong>Mã lớp:</Text> <Text>{cls.id}</Text> <br />
                    <Text strong>Sĩ số:</Text> <Text>{cls.classSize}</Text> <br />
                    <Text strong>Quy mô:</Text> <Text>{cls.size}</Text>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <CreatClasses
        form={form}
        faculties={faculties}
        open={isModalOpen}
        onOK={handleOK}
        onCancel={handelCancel}
      />


    </>
    )
}