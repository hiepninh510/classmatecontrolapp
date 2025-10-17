/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MyScores } from "../../models/locationInterface";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

interface RowData extends MyScores {
  key: string;
}

export default function ResultTable({ myScores }: { myScores: MyScores[] }) {
  // Sắp xếp theo phaseName
  const sortedData = [...myScores].sort((a, b) => a.phaseName.localeCompare(b.phaseName));

  // Tạo mảng row với rowSpan cho phaseName
  const rows: RowData[] = [];
  const phaseCount: Record<string, number> = {};

  sortedData.forEach((item) => {
    if (phaseCount[item.phaseName!]) {
      phaseCount[item.phaseName!] += 1;
    } else {
      phaseCount[item.phaseName!] = 1;
    }
    rows.push({ ...item, key: item.subjectId! });
  });

  // Tạo columns
  const columns: ColumnsType<RowData> = [
    {
      title: "Học kỳ",
      dataIndex: "phaseName",
      key: "phaseName",
      render: (text, record, index) => {
        // Tính toán rowSpan
        const prevIndex = rows.findIndex((r) => r.phaseName === record.phaseName);
        if (prevIndex === index) {
          return {
            children: text,
            props: { rowSpan: phaseCount[record.phaseName!] },
          };
        }
        return { children: null, props: { rowSpan: 0 } };
      },
    },
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
    },
    {
        title:"Tín chỉ",
        dataIndex:"credits",
        key:"credits",
    },
    {
      title: "Giữa kỳ",
      dataIndex: "midterm",
      key: "midterm",
    },
    {
      title: "Cuối kỳ",
      dataIndex: "final",
      key: "final",
    },
    {
      title: "Tổng",
      dataIndex: "total",
      key: "total",
    },
    {
      title:"Trạng thái",
      dataIndex:"pass",
      key:"pass",
      render:(_: any, record: any)=>{
        const  previousTotal = record.total;
        if(previousTotal === "") return null;
            return record.pass ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#ff4d4f" />
            );
      }
    }
  ];

  return <Table dataSource={rows} columns={columns} pagination={false} bordered />;
}
