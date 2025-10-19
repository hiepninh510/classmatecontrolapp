/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Table } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import {useOpenNotification} from '../../hooks/Notification/notification.tsx';
import { DeleteOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/ThemeContext.tsx';
import Search, { type SearchProps } from 'antd/es/input/Search';
import { studentAPI } from '../../components/Instructor/ListStudent/StudentAPI.ts';
import { StudentFormModal } from '../modal/StudentFromModal.tsx';
import { DeleletStudentModal } from '../modal/DeleteModal.tsx';
import { type Student} from '../../models/locationInterface.tsx';
import { adminAPI } from '../AdminServices.ts';

interface StudentWithClassAndFaculty extends Omit<Student,'classRoom'>{
    classId: string; 
    className: string;
    facultyId: string;
    facultyName: string;
}


export default function StudentList(){
    const [laoding,setLoading] = useState(false);
    const [student,setStudent] = useState<StudentWithClassAndFaculty[]>([]);
    const [isModalOpen,setIsModalOpen] = useState(false);
    const [editingStudent,setEditingStudent] = useState<StudentWithClassAndFaculty|null>(null);
    const [form] = Form.useForm();
    const { openNotification, contextHolder } = useOpenNotification();
    const [studentToDelete, setStudentToDelete] = useState<StudentWithClassAndFaculty | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    // const {id} = useAuth();
    const [filteredStudent, setFilteredStudent] = useState<StudentWithClassAndFaculty[]>([]);
    const [searchText,setSearchText] = useState<string>("");
    const [classFilters,setClassFillter] = useState< {text: string; value: string}[]>([]);
    const [facultyFilters,setfacultyFilters] = useState<{text:string; value:string}[]>([]);
    const columns: TableProps<StudentWithClassAndFaculty>['columns'] = [
      {
        title: 'Tên Sinh Viên',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
      },
      {
        title: 'Số Điện Thoại',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title:"Lớp",
        dataIndex:"classId",
        filters:classFilters,
        render:(_,record)=>record.className,
        onFilter:(value,record) => record.classId === value,
      },
      {
        title:"Khoa",
        dataIndex:"facultyId",
        key:"facultyId",
        filters:facultyFilters,
        render:(_,record) => record.facultyName,
        onFilter:(value,record) => record.facultyId === value
      },
      {
        title: 'Chức Năng',
        key: 'function',
        render: (_,record) => (
          <div>
            <Button type='link' onClick={()=>{openModal(record)}}>Edit</Button>
            {/* <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => onOpenChat(record.id)}
            /> */}
            <Button type="link" icon={<DeleteOutlined />} danger onClick={() => openDeleteModal(record)} />
          </div>
        
        ),
      },
    ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAllStudent();
        if(!res.data.success) console.log("Hello")
        setStudent(res.data.result);
        setFilteredStudent(res.data.result);
        const fillterClass = Array.from<string>(new Set(res.data.result.map((s: { className: string; })=>s.className)))
        .map(c=>({
          text:c,
          value:c
        }));
        setClassFillter(fillterClass);

        const fillterfacultys = Array.from<string>(new Set(res.data.result.map((s:{facultyName:string;})=> s.facultyName)))
        .map(c=>({
          text:c,
          value:c
        }));

        setfacultyFilters(fillterfacultys);
      } catch (error:any) {
        console.error("Lỗi khi fetch lessons:", error);
        openNotification("error",error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

//   const onOpenChat = async (studentId: string) => {
//   try {
//     const phoneNumber = localStorage.getItem('phoneNumber');
//     const res = await studentAPI.chats({phoneNumber,studentId});
//     if (res.data.success) {
//       navigate(`/instructor/messages/${studentId}`);
//     } else {
//       openNotification("error", "Không thể mở phòng chat");
//     }
//   } catch (error) {
//     console.error(error);
//     openNotification("error", "Lỗi khi mở phòng chat");
//   }
// };

  const openModal = (student?:StudentWithClassAndFaculty) =>{
    setEditingStudent(student|| null);
    form.setFieldsValue(student || { name: '', phoneNumber: '', email: '' });
    setIsModalOpen(true);
  }

  const handleOk = async ()=>{
    try {
        const values = await form.validateFields();
        if(editingStudent){
          const phone = editingStudent.phoneNumber
          const res = await studentAPI.update(phone,values);
        setStudent((prev) =>
          prev.map((s) => (s.id === res.data.student.id ? res.data.student : s))
        );
        openNotification("success",'Cập nhật sinh viên thành công');
      } else {
        const res = await studentAPI.add(values);
        if(res.data.success) openNotification("success",'Thêm sinh viên thành công');
        else openNotification("error",'Thêm sinh viên thất bại');
      }
      setIsModalOpen(false);
      form.resetFields();
        
    } catch (error:any) {
        console.error(error);
        openNotification('error',error.response.data.message)
    }
  }


  const openDeleteModal = (student: StudentWithClassAndFaculty) => {
  setStudentToDelete(student);
  setIsDeleteOpen(true);
};
  const handleDeleteOk = async () => {
    if (!studentToDelete) return;

    try {
      const res = await studentAPI.delete(studentToDelete.phoneNumber);
      //axios.delete(`${import.meta.env.VITE_BACKEND_URL}/student/deleteStudent/${studentToDelete.phoneNumber}`);
      if (res.data.success) {
        setStudent(prev => prev.filter(s => s.id !== studentToDelete.id));
        openNotification('success', 'Xóa sinh viên thành công');
      } else {
        openNotification('error', 'Xóa sinh viên thất bại');
      }
    } catch (error:any) {
      console.error(error);
      openNotification('error', error.response.data.message);
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const onSearch:SearchProps['onSearch'] = (value)=>{
    setSearchText(value);
    const lower = value.toLowerCase();
    const students = student.filter((item)=>
      item.name.toLowerCase().includes(lower) ||
      item.email.toLowerCase().includes(lower) ||
      item.phoneNumber.toLowerCase().includes(lower)
    );
    setFilteredStudent(students);
  }


  const handleDeleteCancel = () => {
    setIsDeleteOpen(false);
  };

    return(
        <>
        {contextHolder}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16,  alignItems: "center", }}>
             <Search
                placeholder="Tìm kiếm sinh viên..."
                allowClear
                enterButton="Tìm kiếm"
                size="middle"
                value={searchText}
                onChange={(e) => onSearch(e.target.value)}
                style={{ width: 300 }}
              />
            <div style={{ display: "flex", gap: 8 }}>
              <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
                  + Thêm Sinh Viên
              </Button>
            </div>

        </div>
            <Table<StudentWithClassAndFaculty> 
            loading={laoding}
            rowKey='id'
            columns={columns} 
            dataSource={Array.isArray(filteredStudent) ? filteredStudent : []} />;

            <StudentFormModal
              open={isModalOpen}
              onOk={handleOk}
              onCancel={() => setIsModalOpen(false)}
              form={form}
              editingStudent={editingStudent}
            />

        <DeleletStudentModal
          open={isDeleteOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          student={studentToDelete as StudentWithClassAndFaculty}
        />
       </>


    )
}