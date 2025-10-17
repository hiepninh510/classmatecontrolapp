import { useState } from "react";
import { adminAPI } from "./AdminServices";
import { useOpenNotification } from "../hooks/Notification/notification";
import type { ListInstructorForAdmin, Classes, Subject, timeFrames, Faculty, Rooms } from "../models/locationInterface";

export function useAdminData() {
  const [classes, setClasses] = useState<Classes[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeFrams,setTimeFrames] = useState<timeFrames[]>([]);
  const [instructors,setIntructors] = useState<ListInstructorForAdmin[]>([])
  const [faculties,setFaculties] = useState<Faculty[]>([]);
  const [rooms,setRooms] = useState<Rooms[]>([])
  const { openNotification, contextHolder } = useOpenNotification();

  const fetchClasses = async () => {
    try {
      const res = await adminAPI.getAllClass();
      if (res.data.success) setClasses(res.data.classes);
      else openNotification("warning", res.data.message);
    } catch (err) {
        console.log(err)
        openNotification("error", "Không thể tải danh sách lớp học");
    }
  };

  const fetchSubjects = async () => {
    try {
        const res = await adminAPI.getAllSubject();
        if (res.data.success) setSubjects(res.data.subjects);
        else openNotification("warning", res.data.message);
    } catch (err) {
        console.log(err)
        openNotification("error", "Không thể tải danh sách môn học");
    }
  };

  const fetchTimeFrame = async()=>{
    try {
        const res = await adminAPI.getAllTimeFrames();
        if(res.data.success) setTimeFrames(res.data.timeFrames);
        else openNotification("warning", res.data.message)
    } catch (error) {
        console.log(error)
        openNotification("error", "Không thể tải danh sách ca học");
    }
  }

  const fetchInstructors = async ()=>{
    try {
        const res = await adminAPI.getAllInstructors();
        if(res.data.success) setIntructors(res.data.instructorsWithDetails);
        else openNotification("warning", res.data.message)
    } catch (error) {
        console.log(error)
        openNotification("error", "Không thể tải danh sách ca học");
    }
  }

  const fetchFaculties = async()=>{
    try {
        const res = await adminAPI.getAllFaculties();
        if(res.data.success) setFaculties(res.data.facultys);
        else openNotification("warning", res.data.message);
    } catch (error) {
        console.log(error)
        openNotification("error", "Không thể tải danh sách ca học");     
    }
  }

  const fetchRooms = async()=>{
    try {
      const res = await adminAPI.getAllRoom();
      if(res.data.success) setRooms(res.data.rooms);
      else openNotification("warning", res.data.message);
    } catch (error) {
      console.log(error);
      openNotification("error", "Không thể tải danh sách phòng học");
    }
  }

  return {
    classes,
    subjects,
    timeFrams,
    instructors,
    faculties,
    rooms,
    fetchRooms,
    fetchInstructors,
    fetchFaculties,
    fetchClasses,
    fetchSubjects,
    fetchTimeFrame,
    contextHolder,
  };
}
