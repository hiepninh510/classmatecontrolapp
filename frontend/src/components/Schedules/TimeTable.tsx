/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Schedule } from "../../models/locationInterface";
import { parse, format, addDays } from "date-fns";
import { useMemo } from "react";

interface TimetableProps {
  schedules: Schedule[];
  weekStart: string; // YYYY-MM-DD Thứ 2
}

export default function Timetable({ schedules, weekStart }: TimetableProps) {

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parse(weekStart, "yyyy-MM-dd", new Date()), i), "yyyy-MM-dd")
  );

  const weekStartDate = parse(weekStart,"yyyy-MM-dd",new Date());
  const weekEndDate = addDays(weekStartDate,6)
  const parseScheduleDate = (dateStr: string) => parse(dateStr, "yyyy-MM-dd", new Date());

  const fillteredSchedules = schedules.filter(s=>{
    const startDate = parseScheduleDate(s.startDate);
    const endDate = parseScheduleDate(s.endDate);

    // return isWithinInterval(startDate, { start: weekStartDate, end: weekEndDate }) ||
    // isWithinInterval(endDate, { start: weekStartDate, end: weekEndDate })

    return (startDate <= weekEndDate && endDate >= weekStartDate);
  })


  const periods = [
    { id: 1, label: "Ca 1", time: "07:00-08:30" },
    { id: 2, label: "Ca 2", time: "08:35-10:05" },
    { id: 3, label: "Ca 3", time: "10:10-11:40" },
    { id: 4, label: "Ca 4", time: "13:00-14:30" },
    { id: 5, label: "Ca 5", time: "14:35-16:05" },
    { id: 6, label: "Ca 6", time: "16:10-17:40" },
  ];

  // Columns cho Ant Design Table
  const columns: ColumnsType<any> = useMemo(()=>[
    { title: "Ca / Thời gian", dataIndex: "period", key: "period", width: 120 },
    ...daysOfWeek.map(day => ({
      title: format(parse(day, "yyyy-MM-dd", new Date()), "EEE dd/MM"),
      dataIndex: day,
      key: day,
      render: (_text: any, record: any) => {
        const cell: Schedule | undefined = record[day];
        return cell ? (
          <div style={{ backgroundColor: "#dff0d8", padding: 4, borderRadius: 4 }}>
            <div>Môn: {cell.subjectName}</div>
            <div>Lớp: {cell.className}</div>
            <div>Phòng: {cell.roomName}</div>
            <div style={{ fontSize: 10 }}>Thời gian: {cell.timeFrame}</div>
          </div>
        ) : null;
      }, 
    })),
  ],[daysOfWeek]);

  // Dữ liệu rows: mỗi row = 1 ca
  const dataSource = useMemo(()=>periods.map(p => {
    const row: any = { key: p.id, period: `${p.label} (${p.time})` };

    daysOfWeek.forEach(day => {
      const dayIndex = daysOfWeek.indexOf(day) + 1;
      const cell = fillteredSchedules.find(
        s =>s.dayOfWeek.includes(dayIndex) && s.timeFrame === p.time
      );
      row[day] = cell || null;
    });

    return row;
  }),[periods, daysOfWeek, fillteredSchedules]) ;

  return <Table columns={columns} dataSource={dataSource} pagination={false} bordered />;
}
