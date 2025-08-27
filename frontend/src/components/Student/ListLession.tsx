import { Table } from 'antd';
import type { TableProps } from 'antd';
import { Checkbox } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface Lession {
  id: string;
  title: string;
  description?: string;
  instructor: string;
  createAt: Date;
  done:boolean
}


export default function ListLession(){
    const [laoding,setLoading] = useState(false);
    const [lesions,setLessions] = useState<Lession[]>([]);


    const handleCheck = (id:string,checked:boolean)=>{
        setLessions((prev)=>prev.map((item)=>item.id===id?{...item,done:checked}:item));
    }

const columns: TableProps<Lession>['columns'] = [
  {
    title: 'Tên Môn Học',
    dataIndex: 'title',
    key: 'title',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Chi Tiết',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Giảng viên',
    dataIndex: 'instructor',
    key: 'instructor',
  },
  {
    title: 'Ngày Giao',
    key: 'createAt',
    dataIndex: 'createAt',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (value: any) => {
    if (!value?._seconds) return "";
    const date = new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
  }
  },
  {
    title: 'Hoàn Thành',
    key: 'done',
    render: (_,record) => (
    <Checkbox
        checked={record.done}
        onChange={(e)=>(handleCheck(record.id,e.target.checked))}>{record.done?"Đã Hoàn Thành":"Chưa Hoàn Thành"}</Checkbox>
    ),
  },
];

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const myPhone = localStorage.getItem("phoneNumber");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/myLessions?phone=${myPhone}`); 
        // URL backend của bạn (bạn đổi cho đúng)
        console.log(res.data.myLessions)
        setLessions(res.data.myLessions);
      } catch (error) {
        console.error("Lỗi khi fetch lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);


    return(
        <>
            <Table<Lession> 
            loading={laoding}
            rowKey='id'
            columns={columns} 
            dataSource={Array.isArray(lesions) ? lesions : []} />;
        </>
    )
}