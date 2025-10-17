/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ScheduleAddInstructorName } from "../../../models/locationInterface";
import { parse, format, addDays } from "date-fns";

interface TimetableProps {
  schedules: ScheduleAddInstructorName[];
  weekStart: string;
  onEdit: (record: ScheduleAddInstructorName) => void;
  onDelete: (record: ScheduleAddInstructorName) => void;
}

export default function TimeTableAdmin({ schedules, weekStart, onEdit, onDelete }: TimetableProps) {
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parse(weekStart, "yyyy-MM-dd", new Date()), i), "yyyy-MM-dd")
  );

  const weekStartDate = parse(weekStart, "yyyy-MM-dd", new Date());
  const weekEndDate = addDays(weekStartDate, 6);
  const parseScheduleDate = (dateStr: string) => parse(dateStr, "yyyy-MM-dd", new Date());

  const filteredSchedules = schedules.filter(s => {
    const startDate = parseScheduleDate(s.startDate);
    const endDate = parseScheduleDate(s.endDate);
    return startDate <= weekEndDate && endDate >= weekStartDate;
  });

  const periods = [
    { id: 1, label: "Ca 1", time: "07:00-08:30" },
    { id: 2, label: "Ca 2", time: "08:35-10:05" },
    { id: 3, label: "Ca 3", time: "10:10-11:40" },
    { id: 4, label: "Ca 4", time: "13:00-14:30" },
    { id: 5, label: "Ca 5", time: "14:35-16:05" },
    { id: 6, label: "Ca 6", time: "16:10-17:40" },
  ];

  const columns: ColumnsType<any> = [
    { title: "Ca / Thời gian", dataIndex: "period", key: "period", width: 140, fixed: "left" },
    ...daysOfWeek.map(day => ({
      title: format(parse(day, "yyyy-MM-dd", new Date()), "EEE dd/MM"),
      dataIndex: day,
      key: day,
      align: "center" as const,
      render: (_text: any, record: any) => {
        const cell:ScheduleAddInstructorName  | undefined = record[day];
         const isActive = cell?.active;
        return cell ? (
          <div
            style={{
              background: "#e6f7ff",
              padding: 6,
              borderRadius: 8,
              position: "relative",
              minHeight: 80,
              textAlign: "left",
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
              opacity: isActive ? 1 : 0.5, // mờ nếu inactive
              border: isActive ? undefined : "1px dashed #ccc", 
            }}
          >
            <div style={{ fontWeight: 600 }}>{cell.subjectName}</div>
            <div>Lớp: {cell.className}</div>
            <div>Phòng: {cell.roomName}</div>
            <div>Giảng Viên: {cell.instructorName}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{cell.timeFrame}</div>

            <div style={{ position: "absolute", top: 4, right: 6, display: "flex", gap: 6 }}>
              <Tooltip title="Chỉnh sửa">
                <EditOutlined
                  style={{ color: "#1890ff", cursor: "pointer" }}
                  onClick={() => onEdit(cell)}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Popconfirm
                  title="Xóa lịch này?"
                  onConfirm={() => onDelete(cell)}
                  okText="Có"
                  cancelText="Không"
                >
                  <DeleteOutlined style={{ color: "#ff4d4f", cursor: "pointer" }} />
                </Popconfirm>
              </Tooltip>
            </div>
          </div>
        ) : null;
      },
    })),
  ];

  const dataSource = periods.map(p => {
    const row: any = { key: p.id, period: `${p.label} (${p.time})` };
    daysOfWeek.forEach(day => {
       const dayIndex = daysOfWeek.indexOf(day) + 1;
      const cell = filteredSchedules.find(
        s => s.dayOfWeek.includes(dayIndex) && s.timeFrame === p.time
      );
      row[day] = cell || null;
    });
    return row;
  });

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      bordered
      scroll={{ x: "max-content" }}
      style={{ background: "white", borderRadius: 12 }}
    />
  );
}
