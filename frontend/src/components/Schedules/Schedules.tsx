import axios from "../../api/api.tsx";
import Timetable from "./TimeTable.tsx"
import { startOfWeek, format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import type { Schedule } from "../../models/locationInterface.tsx";
import { useAuth } from "../../hooks/ThemeContext.tsx";

export default function Schedules(){
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const {id,role} = useAuth();
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const fetchSchedules = useCallback( async(id:string,role:string)=>{
    if(role === "instructor"){
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/instructor/getMySchedules/${id}`);
      if(res.data.success){
        // console.log(res.data.scheduleData);
        setSchedules(res.data.scheduleData);
      }
    } if(role === "student"){
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/getMySchedules/${id}`);
      if(res.data.success){
        setSchedules(res.data.scheduleData);
      }
    }
  },[]);

  useEffect(() => {
  fetchSchedules(id as string, role as string);
  }, [fetchSchedules, id, role]);

  return (
    <div>
      <h1>Lịch Trong Tuần</h1>
      <Timetable schedules={schedules} weekStart={weekStart} />
    </div>
  );
}

