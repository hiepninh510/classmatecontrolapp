import { Button, Form, Input, Modal, Table } from 'antd';
import type { TableProps } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {useOpenNotification} from '../../hooks/notification.tsx';
import { BookOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/ThemeContext.tsx';
interface Student {
  id: string;
  name:string,
  phoneNumber:string,
  email:string
}


export default function ListStudent(){
    const [laoding,setLoading] = useState(false);
    const [student,setStudent] = useState<Student[]>([]);
    const [isModalOpen,setIsModalOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [editingStudent,setEditingStudent] = useState<Student|null>(null);
    const[form] = Form.useForm();
    const { openNotification, contextHolder } = useOpenNotification();
    const navigate = useNavigate();
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    //const [assignForm] = Form.useForm();
    const {role} = useAuth();

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
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/students`); 
        console.log("Dữ liệu đầu tiên:",res.data.student)
        setStudent(res.data.student);
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
    console.log({phoneNumber,studentId})
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/chats`,{phoneNumber,studentId});

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
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/student/editStudent/${phone}`, values);
            console.log(res.data.student);
        setStudent((prev) =>
          prev.map((s) => (s.id === res.data.student.id ? res.data.student : s))
        );
        openNotification("success",'Cập nhật sinh viên thành công');
      } else {
        console.log("valuse",values);
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/student/addStudent`, values);
        if(res.data.success) openNotification("success",'Thêm sinh viên thành công');
        else openNotification("error",'Thêm sinh viên thất bại');
      }
      setIsModalOpen(false);
      form.resetFields();
        
    } catch (error) {
        console.error(error);
    }
  }

  const openAssignModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      id:student.id,
      name: student.name,
      phoneNumber: student.phoneNumber,
      email: student.email,
      subject: '',
      description: ''
    });
    setIsAssignOpen(true);
  };

  const handleAssignOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        phoneNumber: values.phoneNumber,
        title: values.subject,
        description: values.description,
        phoneInstructor:localStorage.getItem('phoneNumber')
      };
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/student/assignLesson`, payload);
      if (res.data.success) {
        const notification={
          userId:values.id,
          message:'Bạn vừa được giao 1 bài tập mới!',
          isRead:false,
          creatAt:new Date(),
          upDate:new Date(),
          type:"assignment"
        }
        const notifiData = {
            role,
            phone:localStorage.getItem('phoneNumber'),
            notification

        }
        const createNotification = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notification`,notifiData);
        if(createNotification.data.success){
          openNotification("success", "Giao bài thành công");
          setIsAssignOpen(false);
          form.resetFields();
        }
      } else {
        openNotification("error", "Giao bài thất bại");
      }
    } catch (error) {
      console.error(error);
      openNotification("error", "Lỗi khi giao bài");
    }
  };

  const openDeleteModal = (student: Student) => {
  setStudentToDelete(student);
  setIsDeleteOpen(true);
};
const handleDeleteOk = async () => {
  if (!studentToDelete) return;

  try {
    const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/student/deleteStudent/${studentToDelete.phoneNumber}`);
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


const handleDeleteCancel = () => {
  setIsDeleteOpen(false);
};

    return(
        <>
        {contextHolder}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
                + Thêm Sinh Viên
            </Button>

        </div>
            <Table<Student> 
            loading={laoding}
            rowKey='id'
            columns={columns} 
            dataSource={Array.isArray(student) ? student : []} />;

            <Modal
              title={editingStudent ? 'Chỉnh Sửa Sinh Viên' : 'Thêm Sinh Viên'}
              open={isModalOpen}
              onOk={handleOk}
              onCancel={() => setIsModalOpen(false)}
            >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số Điện Thoại"
            name="phoneNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Giao Bài cho ${editingStudent?.name || ''}`}
        open={isAssignOpen}
        onOk={handleAssignOk}
        onCancel={() => setIsAssignOpen(false)}
      >
        
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item label="Tên Sinh Viên" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Số Điện Thoại" name="phoneNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Môn" name="subject" rules={[{ required: true, message: 'Vui lòng nhập môn' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc muốn xóa sinh viên {studentToDelete?.name}?</p>
      </Modal>
        </>
    )
}