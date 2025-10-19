/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button, Input, Select, Space, Typography } from "antd";
import { PlusOutlined, SearchOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useOpenNotification } from "../../../hooks/Notification/notification";
import { adminAPI } from "../../AdminServices";
import type { Faculty, ScheduleAddInstructorName } from "../../../models/locationInterface";
import { startOfWeek, addWeeks, format, endOfWeek } from "date-fns";
import TimeTableAdmin from "./TimeTableAdmin";
import ScheduleFormModal from "../../modal/ScheduleFormModal";
import { useForm } from "antd/es/form/Form";

const { Option } = Select;
const { Title } = Typography;

export function SchedulesAdmin() {
    const [searchCode, setSearchCode] = useState<string | null>(null);
    const [facultyFilter, setFacultyFilter] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<ScheduleAddInstructorName[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleAddInstructorName | null>(null);
    const { openNotification, contextHolder } = useOpenNotification();
    const [faculties,setFaculties] = useState<Faculty[]>([]);
//   const [form] = ScheduleFormModal.useForm ? ScheduleFormModal.useForm() : (Form as any).useForm();
    const [form] = useForm()

    const [currentWeek, setCurrentWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const weekStart = format(currentWeek, "yyyy-MM-dd");

    const fetchFaculties = async ()=>{
        const res = await adminAPI.getAllFaculties();
        if(res.data.success) setFaculties(res.data.facultys);
    }

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleSearch = async () => {
        try {
            if (!searchCode && !facultyFilter) return openNotification("warning", "Vui lòng nhập mã giảng viên");
            if(searchCode && !facultyFilter){
                const res = await adminAPI.getSchedule(searchCode as string);
                if (res.data.success) setSchedules(res.data.scheduleData);
                else openNotification("warning", res.data.message);
            } else if(!searchCode && facultyFilter){
                const res = await adminAPI.getScheduleWithFacultyId(facultyFilter);
                if(res.data.success) setSchedules(res.data.schedules);
                else openNotification("warning", res.data.message);
            } else if(searchCode && faculties){
                const res = await adminAPI.getScheduleWitCodeFacultyId(searchCode,facultyFilter as string);
                if(res.data.success){
                    setSchedules(res.data.schedules);
                } 
                else openNotification("warning", res.data.message);
            }
        } catch (error:any) {
            console.log(error)
            openNotification("error", error.response.data.message);
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setEditingSchedule(null);
        setOpenModal(true);
    };

    const handleEdit = (record: ScheduleAddInstructorName) => {
        form.setFieldsValue(record);
        setEditingSchedule(record);
        setOpenModal(true);
    };

    const handleDelete = async (record: ScheduleAddInstructorName) => {
        try {
            const data = {
                classId:record.classId,
                subjectId:record.subjectId,
                dayOfWeek:record.dayOfWeek
            }
            const res = await adminAPI.deleteSchedule(record.id,data);
            if (res.data.success) {
                setSchedules(prev => prev.filter(s => s.id !== record.id));
                openNotification("success", "Xóa lịch thành công");
            }
        } catch (error:any) {
        openNotification("error", error.response.data.message);
        }
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        try {
        if (editingSchedule) {
            const res = await adminAPI.updateSchedule(editingSchedule.idS, values);
            if (res.data.success) {
                console.log("valueUpdate",res.data.valueUpdate);
            setSchedules(prev =>
                prev.map(s => (s.idS === editingSchedule.idS ? res.data.valuesForUI  : s))
            );
            openNotification("success", "Cập nhật thành công");
            }
        } else {
            const res = await adminAPI.addSchedule(values);
            if (res.data.success) {
            setSchedules(prev => [...prev, res.data.values]);
            openNotification("success", "Thêm lịch thành công");
            } else openNotification("warning",res.data.message);
        }
        setOpenModal(false);
        } catch(error:any) {
        openNotification("error", error.response.data.message);
        }
    };

    return (
        <>
            <div style={{ padding: 24 }}>
            {contextHolder}

            <Space style={{ marginBottom: 16 }}>
                <Input
                placeholder="Nhập mã giảng viên"
                value={searchCode || ""}
                onChange={e => setSearchCode(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                />
                <Select
                placeholder="Lọc theo khoa"
                allowClear
                style={{ width: 200 }}
                onChange={value => setFacultyFilter(value)}
                value={facultyFilter || undefined}
                >
                {faculties.map(f => (
                    <Option key={f.id} value={f.id}>
                    {f.name}
                    </Option>
                ))}
                </Select>
                <Button type="primary" onClick={handleSearch}>
                Tìm kiếm
                </Button>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
                Thêm lịch mới
                </Button>
            </Space>

            {/* Điều hướng tuần */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
                <Button icon={<LeftOutlined />} onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}>
                Tuần trước
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                Tuần: {format(currentWeek, "dd/MM")} -{" "}
                {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy")}
                </Title>
                <Button icon={<RightOutlined />} onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                Tuần kế tiếp
                </Button>
            </div>

            <TimeTableAdmin
                schedules={schedules}
                weekStart={weekStart}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ScheduleFormModal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onSubmit={handleSubmit}
                form={form}
                editingSchedule={editingSchedule}
            />
            </div>
        </>
    );
    }
