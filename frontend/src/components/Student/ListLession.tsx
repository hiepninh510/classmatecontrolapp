import { Input, Table } from 'antd';
import type { TableProps } from 'antd';
import { Checkbox } from 'antd';
import type { SearchProps } from 'antd/es/input';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lession } from '../../models/locationInterface';


export default function ListLession(){
    const [laoding,setLoading] = useState(false);
    const [lesions,setLessions] = useState<Lession[]>([]);
    const [filteredLessions, setFilteredLessions] = useState<Lession[]>([])
    const [searchText,setSearchText] = useState<string>("");
    const navigate = useNavigate();
    const { Search } = Input;


    const handleCheck = async (id:string,checked:boolean)=>{
      // console.log("cjecked",checked);
        // setLessions((prev)=>prev.map((item)=>item.id===id?{...item,done:checked}:item));
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          const updateDone = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/student/finishLession`,{id,checked,phoneNumber});
          if(updateDone.status === 200) setLessions(updateDone.data.updateLessionForUI)
        } catch (error) {
          console.log(error);
        }
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
    dataIndex: 'instructorName',
    key: 'instructor',
    render:(text,record) =>(
      <a style={{ cursor: "pointer", color: "#1677ff" }}
      onClick={() => {
          navigate(`/student/messages/${record.instructor}`);
        }}
      >
      {text}
      </a>
    ),
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

const onSearch: SearchProps["onSearch"] = (value)=>{
  setSearchText(value);
  const lower = value.toLowerCase();
  const filtered = lesions.filter((item) => 
    item.title.toLowerCase().includes(lower) ||
    item.description?.toLowerCase().includes(lower) ||
    item.instructorName.toLowerCase().includes(lower)
  )

  setFilteredLessions(filtered);
}

  useEffect(()=>{
    const fetchLessons = async ()=>{
      try {
        setLoading(true);
        const myPhone = localStorage.getItem("phoneNumber");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/myLessions?phone=${myPhone}`);
        setLessions(res.data.myLessions);
        setFilteredLessions(res.data.myLessions);
        
      } catch (error) {
        console.error("Lỗi khi fetch lessons:", error);
      } finally{
        setLoading(false);
      }
    }
    fetchLessons();
  },[])


    return(
        <>
          <Search
            placeholder="Tìm kiếm môn học, chi tiết hoặc giảng viên..."
            enterButton = "Tìm kiếm"
            allowClear
            size="middle"
            value={searchText}
            style={{ marginBottom: 16, width: 400 }}
            onChange={(e) =>onSearch(e.target.value)}
          />
          <Table<Lession> 
            loading={laoding}
            rowKey='id'
            columns={columns} 
            dataSource={Array.isArray(filteredLessions) ? filteredLessions : []} />
        </>
    )
}