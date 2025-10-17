/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, Select, Checkbox } from "antd";
import type { FormInstance } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAdminData } from "../useAdminData";
import type { ScheduleAddInstructorName } from "../../models/locationInterface";

const { Option } = Select;


interface Props {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  form: FormInstance<any>;
  editingSchedule: ScheduleAddInstructorName | null;
}

const weekDays = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

export default function ScheduleFormModal({
  open,
  onCancel,
  onSubmit,
  form,
  editingSchedule,
}: Props) {
  const {
    classes,
    subjects,
    timeFrams,
    instructors,
    faculties,
    rooms,
    fetchRooms,
    fetchFaculties,
    fetchInstructors,
    fetchTimeFrame,
    fetchClasses,
    fetchSubjects,
    contextHolder,
  } = useAdminData();

  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchInstructors();
    fetchFaculties();
    fetchSubjects();
    fetchTimeFrame();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!editingSchedule) {
      form.resetFields();
      setSelectedFaculty(null);
      return;
    }

    const foundInstructor = instructors.find(
      (i) => i.id === editingSchedule.instructorId
    );
    const facultyId =
      foundInstructor?.faculty?.id || editingSchedule.facultyId || null;

    setSelectedFaculty(facultyId);

    requestAnimationFrame(() => {
      form.setFieldsValue({
        facultyId,
        instructorId: editingSchedule.instructorId,
        subjectId: editingSchedule.subjectId,
        classId: editingSchedule.classId,
        roomId: editingSchedule.roomId,
        timeFrame: editingSchedule.timeId,
        dayOfWeek: editingSchedule.dayOfWeek,
        startDate: editingSchedule.startDate,
        endDate: editingSchedule.endDate,
        active:editingSchedule.active
      });
    });
  }, [editingSchedule, instructors]);

  const filteredInstructors = useMemo(
    () => instructors.filter((i) => i.faculty.id === selectedFaculty),
    [selectedFaculty, instructors]
  );
  const filteredClasses = useMemo(
    () => classes.filter((c) => c.facultyId === selectedFaculty),
    [selectedFaculty, classes]
  );
  const filteredSubjects = useMemo(
    () => subjects.filter((s) => s.facultyId === selectedFaculty),
    [selectedFaculty, subjects]
  );

  const renderOptions = (data: any[]) =>
    data.map((item) => (
      <Option key={item.id} value={item.id}>
        {item.name || item.timeFrame}
      </Option>
    ));

  return (
    <>
      {contextHolder}
      <Modal
        title={editingSchedule ? "Chỉnh sửa lịch giảng dạy" : "Thêm lịch giảng dạy mới"}
        open={open}
        onCancel={onCancel}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Khoa"
            name="facultyId"
            rules={[{ required: true, message: "Vui lòng chọn khoa" }]}
          >
            <Select
              placeholder="Chọn khoa"
              disabled={!!editingSchedule}
              onChange={(val) => {
                setSelectedFaculty(val);
                form.resetFields(["instructorId", "subjectId", "classId"]);
              }}
            >
              {renderOptions(faculties)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giảng viên"
            name="instructorId"
            rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              disabled={!selectedFaculty}
              showSearch
              optionFilterProp="children"
            >
              {renderOptions(filteredInstructors)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="subjectId"
            rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
          >
            <Select
              placeholder="Chọn môn học"
              disabled={!selectedFaculty}
              showSearch
              optionFilterProp="children"
            >
              {renderOptions(filteredSubjects)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Lớp học"
            name="classId"
            rules={[{ required: true, message: "Vui lòng chọn lớp học" }]}
          >
            <Select
              placeholder="Chọn lớp học"
              disabled={!selectedFaculty}
              showSearch
              optionFilterProp="children"
            >
              {renderOptions(filteredClasses)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phòng học"
            name="roomId"
            rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
          >
            <Select placeholder="Chọn phòng học" showSearch optionFilterProp="children">
              {renderOptions(rooms)}
            </Select>
          </Form.Item>

          <Form.Item
            name="active"
            valuePropName="checked" // quan trọng để checkbox trả về true/false
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>

          <Form.Item
            label="Ca học"
            name="timeFrame"
            rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
          >
            <Select placeholder="Chọn ca học">
              {timeFrams.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.timeFrame}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày trong tuần"
            name="dayOfWeek"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 ngày" }]}
          >
            <Select mode="multiple" placeholder="Chọn ngày trong tuần">
              {weekDays.map((d) => (
                <Option key={d.value} value={d.value}>
                  {d.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
