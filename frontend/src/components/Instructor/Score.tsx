/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { ScoreStudent, ClassStudent, Subject, Score } from "../../models/locationInterface";
import { studentAPI } from "./ListStudent/InstructorAPI";
import { Button, Input, Select, Table } from "antd";
import { useAuth } from "../../hooks/ThemeContext";
import { useOpenNotification } from "../../hooks/Notification/notification";
const { Option } = Select;

// ---------------- ScoreInput Component ----------------
type ScoreInputProps = {
  backendValue?: string; // giá trị *thô* từ backend (đúng là backend hay không)
  editedValue?: string; // giá trị local khi backend không có
  studentId: string;
  index: number;
  field: keyof Score;
  handleChangeScore: (studentId: string, index: number, field: keyof Score, value: string) => void;
  handleBlurScore: (studentId: string) => void;
};

function ScoreInput({
  backendValue,
  editedValue,
  studentId,
  index,
  field,
  handleChangeScore,
  handleBlurScore,
}: ScoreInputProps) {
  // chỉ dựa vào backendValue để quyết định disable (backend có dữ liệu => disabled)
  const isLocked = backendValue !== undefined && backendValue !== null && backendValue !== "";

  // value hiển thị: nếu backend có dữ liệu thì show backend, ngược lại show editedValue
  const displayedValue = isLocked ? (backendValue ?? "") : (editedValue ?? "");

  const [value, setValue] = useState<string>(displayedValue);

  useEffect(() => {
    setValue(displayedValue);
  }, [displayedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setValue(val);
      // chỉ cập nhật edited state khi không locked (tức backend không có dữ liệu)
      if (!isLocked) {
        handleChangeScore(studentId, index, field, val);
      }
    }
  };

  return (
    <Input
      value={value}
      placeholder="Nhập số"
      disabled={isLocked}
      onChange={handleInputChange}
      onBlur={() => handleBlurScore(studentId)}
    />
  );
}


// ---------------- Main Score Component ----------------
export default function Score() {
  const [classRoom, setClassRoom] = useState<ClassStudent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [scoreStudent, setScoreStudent] = useState<ScoreStudent[]>([]);
  const { openNotification, contextHolder } = useOpenNotification();
  const { id } = useAuth();

  // editedScores lưu riêng các input người dùng nhập (không đụng trực tiếp vào scoreStudent)
  // shape: { [studentId]: { midterm?: string, final?: string, total?: string, ... } }
  const [editedScores, setEditedScores] = useState<Record<string, Partial<Score>>>({});

  // Fetch data
  const fetchSubject = async (id: string) => {
    try {
      const res = await studentAPI.getSubjects(id);
      if (res.data.success) setSubjects(res.data.dataSubjects);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchClass = async (id: string) => {
    try {
      const res = await studentAPI.getAllClass(id);
      if (res.data.success) setClassRoom(res.data.dataClass);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSroce = async () => {
    try {
      const data = { classId: selectedClass, subjectId: selectedSubject, id };
      const res = await studentAPI.getListStudentToEnterScore(data);
      if (res.data.success) {
        const sorted = [...res.data.students].sort((a: ScoreStudent, b: ScoreStudent) =>
          a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
        );
        setScoreStudent(sorted);
        // khi load list mới, reset editedScores để tránh dữ liệu cũ vương lại
        setEditedScores({});
      } else console.log("Get data is failure!!!");
    } catch (error) {
      console.log(error);
    }
  };

  // Chỉ cập nhật editedScores (không tính total ở đây — tính ở blur)
  const handleChangeScore = (
    studentId: string,
    _index: number,
    field: keyof Score,
    value: string
  ) => {
    setEditedScores((prev) => {
      const current = prev[studentId] || {};
      const updated = { ...current, [field]: value };
      return { ...prev, [studentId]: updated };
    });
  };

  // Khi input blur: tính total dựa trên edited (nếu có) hoặc fallback backend
  const handleBlurScore = (studentId: string) => {
    setEditedScores((prev) => {
      const current = { ...(prev[studentId] || {}) }; // clone
      // lấy giá trị từ edited nếu có, nếu không thì fallback sang backend
      const backend:Partial<Score> = scoreStudent.find((s) => s.id === studentId)?.score?.[0] ?? {};
      const midStr = current.midterm !== undefined ? current.midterm : backend.midterm ?? "";
      const finalStr = current.final !== undefined ? current.final : backend.final ?? "";

      const mid = midStr === "" ? NaN : Number(midStr);
      const final = finalStr === "" ? NaN : Number(finalStr);

      if (!Number.isNaN(mid) && !Number.isNaN(final)) {
        current.total = (mid * 0.4 + final * 0.6).toFixed(2);
      } else {
        // nếu không đủ 2 giá trị thì clear total (tuỳ ý: mình để là không đổi)
        // current.total = current.total ?? backend.total ?? "";
      }

      return { ...prev, [studentId]: current };
    });
  };

  // Save score: merge editedScores vào payload (edited override backend)
  const handleSaveScore = async () => {
    try {
      const payload = scoreStudent.map((s) => {
        const backendScore = s.score?.[0] ?? { midterm: "", final: "", total: "", phase: "", subjectId: s.subjectId };
        const edited = editedScores[s.id] ?? {};

        const finalScore = {
          midterm: edited.midterm !== undefined ? edited.midterm : backendScore.midterm,
          final: edited.final !== undefined ? edited.final : backendScore.final,
          total: edited.total !== undefined ? edited.total : backendScore.total,
          phase: backendScore.phase,
          subjectId: backendScore.subjectId,
        };

        return {
          id: s.id,
          name: s.name,
          className: s.className,
          classId: s.classId,
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          score: [finalScore],
        };
      });

      const res = await studentAPI.saveScore(payload);
      if (res.data.success) {
        openNotification("success", "Đã lưu điểm thành công");
        // reload hoặc fetch lại danh sách để reflect backend state
        setTimeout(() => {
          handleSroce();
        },700);

        setTimeout(()=>{
          window.location.reload();
        },1000)
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Columns
  const columns = [
    { title: "STT", key: "stt", render: (_: any, __: any, index: number) => index + 1, width: 70 },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Lớp", dataIndex: "className", key: "className" },
    { title: "Môn học", dataIndex: "subjectName", key: "subjectName" },
    {
      title: "Điểm",
      children: [
        {
          title: "Giữa kỳ",
          dataIndex: "midterm",
          key: "midterm",
          render: (_: any, record: ScoreStudent) => {
            const backendMid = record.score?.[0]?.midterm ?? "";
            const editedMid = editedScores[record.id]?.midterm ?? "";
            return (
              <ScoreInput
                backendValue={backendMid}
                editedValue={editedMid}
                studentId={record.id}
                index={0}
                field="midterm"
                handleChangeScore={handleChangeScore}
                handleBlurScore={handleBlurScore}
              />
            );
          },
        },
        {
          title: "Cuối kỳ",
          dataIndex: "final",
          key: "final",
          render: (_: any, record: ScoreStudent) => {
            const backendFinal = record.score?.[0]?.final ?? "";
            const editedFinal = editedScores[record.id]?.final ?? "";
            return (
              <ScoreInput
                backendValue={backendFinal}
                editedValue={editedFinal}
                studentId={record.id}
                index={0}
                field="final"
                handleChangeScore={handleChangeScore}
                handleBlurScore={handleBlurScore}
              />
            );
          },
        },
        {
          title: "Tổng",
          dataIndex: "total",
          key: "total",
          render: (_: any, record: ScoreStudent) => {
            const backendTotal = record.score?.[0]?.total ?? "";
            const editedTotal = editedScores[record.id]?.total ?? "";
            return <Input value={editedTotal || backendTotal} disabled />;
          },
        },
      ],
    },
  ];

  useEffect(() => {
    fetchSubject(id as string);
    fetchClass(id as string);
  }, [id]);

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
        <Select style={{ width: 200 }} placeholder="Chọn lớp" value={selectedClass} onChange={setSelectedClass}>
          {classRoom.map((cls) => (
            <Option key={cls.id} value={cls.id}>{cls.name}</Option>
          ))}
        </Select>

        <Select style={{ width: 200 }} placeholder="Chọn môn" value={selectedSubject} onChange={setSelectedSubject}>
          {subjects.map((sub) => (
            <Option key={sub.id} value={sub.id}>{sub.name}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleSroce}>Nhập điểm</Button>
      </div>

      <Table dataSource={scoreStudent} columns={columns} rowKey="id" pagination={false} bordered />

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button type="primary" onClick={handleSaveScore}>Lưu điểm</Button>
      </div>
    </>
  );
}
