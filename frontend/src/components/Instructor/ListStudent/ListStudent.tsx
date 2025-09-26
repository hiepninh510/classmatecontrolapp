import { Button, Form, Table } from 'antd';
import type { TableProps } from 'antd';
import { useEffect, useState } from 'react';
import {useOpenNotification} from '../../../hooks/Notification/notification.tsx';
import { BookOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/ThemeContext.tsx';
import Search, { type SearchProps } from 'antd/es/input/Search';
import { studentAPI } from './StudentAPI.ts';
import { StudentFormModal } from './Modal/StudentFromModal.tsx';
import { AssignLessionFormModal } from './Modal/AssignLesion.tsx';
import { AssignLessinClassFormModal } from './Modal/AssignLessionForClas.tsx';
import { DeleletStudentModal } from './Modal/DeleteModal.tsx';
import type { AssignLessionForClass, Notifi, Student, Subject } from '../../../models/locationInterface.tsx';
import { notificationService } from '../../../hooks/Notification/notificationService.ts';


export default function ListStudent(){
    const [laoding,setLoading] = useState(false);
    const [student,setStudent] = useState<Student[]>([]);
    const [isModalOpen,setIsModalOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isAssigForClassOpen,setIsAssigForClassOpen] = useState(false);
    const [editingStudent,setEditingStudent] = useState<Student|null>(null);
    const[form] = Form.useForm();
    const { openNotification, contextHolder } = useOpenNotification();
    const navigate = useNavigate();
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    //const [assignForm] = Form.useForm();
    const {role, id} = useAuth();
    const [filteredStudent, setFilteredStudent] = useState<Student[]>([]);
    const [searchText,setSearchText] = useState<string>("");
    const [subjects,setSubjects] = useState<Subject[]>([]);
    const [assignForClass,setassignForClass] = useState<AssignLessionForClass[]>([]);


    const columns: TableProps<Student>['columns'] = [
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
        title: 'Chức Năng',
        key: 'function',
        render: (_,record) => (
          <div>
            <Button type='link' onClick={()=>{openModal(record)}}>Edit</Button>
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => onOpenChat(record.id)}
              //onClick={()=>onMessageClick(record.id)}
            />
            <Button type="link" icon={<BookOutlined />} onClick={() => openAssignModal(record)} />
            <Button type="link" icon={<DeleteOutlined />} danger onClick={() => openDeleteModal(record)} />
          </div>
        
        ),
      },
    ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getAll();
        setStudent(res.data.student);
        setFilteredStudent(res.data.student);
      } catch (error) {
        console.error("Lỗi khi fetch lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  const onOpenChat = async (studentId: string) => {
  try {
    const phoneNumber = localStorage.getItem('phoneNumber');
    const res = await studentAPI.chats({phoneNumber,studentId});
    if (res.data.success) {
      navigate(`/instructor/messages/${studentId}`);
    } else {
      openNotification("error", "Không thể mở phòng chat");
    }
  } catch (error) {
    console.error(error);
    openNotification("error", "Lỗi khi mở phòng chat");
  }
};

  const openModal = (student?:Student) =>{
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
            //axios.put(`${import.meta.env.VITE_BACKEND_URL}/student/editStudent/${phone}`, values);
            // console.log(res.data.student);
        setStudent((prev) =>
          prev.map((s) => (s.id === res.data.student.id ? res.data.student : s))
        );
        openNotification("success",'Cập nhật sinh viên thành công');
      } else {
        // console.log("valuse",values);
        const res = await studentAPI.add(values);
        //axios.post(`${import.meta.env.VITE_BACKEND_URL}/student/addStudent`, values);
        if(res.data.success) openNotification("success",'Thêm sinh viên thành công');
        else openNotification("error",'Thêm sinh viên thất bại');
      }
      setIsModalOpen(false);
      form.resetFields();
        
    } catch (error) {
        console.error(error);
    }
  }

  const openAssignModal = async (student: Student) => {
    if(id){
      const res = await studentAPI.getSubjects(id);
      //axios.get(`${import.meta.env.VITE_BACKEND_URL}/instructor/getSubjects/${id}`);
      if(res.data.success){
        setSubjects(res.data.dataSubjects);
      }
    }
    setEditingStudent(student);
    form.setFieldsValue({
      id:student.id,
      name: student.name,
      phoneNumber: student.phoneNumber,
      email: student.email,
      subject: subjects,
      description: ''
    });
    setIsAssignOpen(true);
  };

  const handleAssignOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        phoneNumber: values.phoneNumber,
        // title: values.subject,
        description: values.description,
        subjectId:values.subject,
        phoneInstructor:localStorage.getItem('phoneNumber')
      };
      const res = await studentAPI.assignLesson(payload);
      if (res.data.success) {

        const data:Notifi = {
          userId:values.id,
          role,
          type:"assignment"
        }
        const createNotification = await notificationService.creatNotification(data);
        if(createNotification.success){
          openNotification("success", "Giao bài thành công");
          setIsAssignOpen(false);
          form.resetFields();
        }
      } else {
        openNotification("error", "Giao bài thất bại");
      }
    }catch (error) {
      console.error(error);
      openNotification("error", "Lỗi khi giao bài");
    }
  };

  const openAssignForClass = async ()=>{
    try {
      if(id){
      const res = await studentAPI.getSubjects(id);
      //axios.get(`${import.meta.env.VITE_BACKEND_URL}/instructor/getSubjects/${id}`);
      if(res.data.success){
        setSubjects( res.data.dataSubjects);
      }
      
      const resClass = await studentAPI.getAllClass(id);
      //axios.get(`${import.meta.env.VITE_BACKEND_URL}/instructor/getAllClass/${id}`);
      if(res.data.success) {
        setassignForClass(resClass.data.dataClass);
      }
    }
    form.setFieldsValue({
      name:assignForClass,
      subject: subjects,
      description: ''
    });
    setIsAssigForClassOpen(true);
    } catch (error) {
      console.log(error);
    }
  }

  const handelOkAssignForClass = async()=>{
    try {
      const values = await form.validateFields();
      const payload ={
        instructorId : id,
        subjectId: values.subject,
        classId: values.name,
        description:values.description
      }
      const res = await studentAPI.assignLessionForClass(payload);
      //axios.post(`${import.meta.env.VITE_BACKEND_URL}/instructor/assignLessionForClass`,payload);
      if(res.data.success) {
        setIsAssigForClassOpen(false);
        openNotification("success", "Giao bài thành công");}
    } catch (error) {
      console.log(error);
    }
  }


  const openDeleteModal = (student: Student) => {
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
    } catch (error) {
      console.error(error);
      openNotification('error', 'Lỗi khi xóa sinh viên');
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
              <Button
                type="primary"
                style={{ marginBottom: 16 }}
                onClick={() =>openAssignForClass()}
              >
                <BookOutlined /> Giao Bài
              </Button>
              <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
                  + Thêm Sinh Viên
              </Button>
            </div>

        </div>
            <Table<Student> 
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

        <AssignLessionFormModal
          open={isAssignOpen}
          onOk={handleAssignOk}
          onCancel={() => setIsAssignOpen(false)}
          form={form}
          editingStudent={editingStudent}
          subjects={subjects}
        />

        <AssignLessinClassFormModal
        open={isAssigForClassOpen}
        onOk={handelOkAssignForClass}
        onCancel={()=>setIsAssigForClassOpen(false)}
        subjects={subjects}
        assignLession={assignForClass}
        form={form}
        />

        <DeleletStudentModal
          open={isDeleteOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          student={studentToDelete as Student}
        />
       </>


    )
}